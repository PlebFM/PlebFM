import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { afterAll, beforeAll, expect, it } from 'vitest';
import * as BSON from 'mongodb';
import { MongoClient } from 'mongodb';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
const { takeSnapshot, restoreAndVerify } = createRequire(import.meta.url)(
  '../../scripts/lib/database-snapshot.cjs',
);
let repl: MongoMemoryReplSet;
let client: MongoClient;
let directory: string;
beforeAll(async () => {
  directory = fs.mkdtempSync(path.join(os.tmpdir(), 'plebfm-snapshot-test-'));
  repl = await MongoMemoryReplSet.create({
    binary: { version: '7.0.14' },
    replSet: { count: 1 },
  });
  client = new MongoClient(repl.getUri('source'));
  await client.connect();
  await client.db().createCollection('empty');
  const collection = client.db().collection('records');
  await collection.createIndex({ name: 1 }, { unique: true });
  await collection.insertOne({
    name: 'fixture',
    count: new BSON.Int32(7),
    big: BSON.Long.fromString('9007199254740993'),
    amount: BSON.Decimal128.fromString('12.30'),
    at: new Date(),
    bytes: new BSON.Binary(Buffer.from('fixture')),
    nested: { a: null },
  });
}, 120000);
afterAll(async () => {
  await client?.close();
  await repl?.stop();
  fs.rmSync(directory, { recursive: true, force: true });
});

it('restores exact BSON values, empty collections and unique indexes', async () => {
  const backup = path.join(directory, 'good');
  await takeSnapshot(client, backup);
  const restored = client.db('restored');
  expect(await restoreAndVerify(restored, backup)).toEqual({
    collections: 2,
    documents: 1,
  });
  await expect(
    restored.collection('records').insertOne({ name: 'fixture' }),
  ).rejects.toMatchObject({ code: 11000 });
  expect(fs.statSync(path.join(backup, 'manifest.json')).mode & 0o777).toBe(
    0o600,
  );
});

it('rejects a corrupt snapshot before writing any destination collection', async () => {
  const backup = path.join(directory, 'corrupt');
  await takeSnapshot(client, backup);
  fs.appendFileSync(path.join(backup, '1.bson'), 'corruption');
  const restored = client.db('corrupt_destination');
  await expect(restoreAndVerify(restored, backup)).rejects.toThrow('checksum');
  expect(await restored.listCollections().toArray()).toHaveLength(0);
});

it('refuses to overwrite a backup or restore over an existing database', async () => {
  const backup = path.join(directory, 'existing');
  await takeSnapshot(client, backup);
  await expect(takeSnapshot(client, backup)).rejects.toThrow();
  await expect(restoreAndVerify(client.db(), backup)).rejects.toThrow('empty');
});
