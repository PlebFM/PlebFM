const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { BSON } = require('mongodb');

const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const metadata = async db => {
  const collections = await db.listCollections().toArray();
  return Promise.all(
    collections
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(async c => {
        if (
          c.type !== 'collection' ||
          c.options?.timeseries ||
          c.options?.capped
        )
          throw Error('Snapshot supports ordinary collections only');
        return { ...c, indexes: await db.collection(c.name).indexes() };
      }),
  );
};

// All documents are read in one snapshot transaction. Catalog stability is
// checked separately because listCollections/listIndexes cannot run in it.
async function takeSnapshot(client, outputDirectory) {
  fs.mkdirSync(outputDirectory, { mode: 0o700 }); // Refuse an existing backup.
  const db = client.db();
  const before = await metadata(db);
  const session = client.startSession();
  const collections = [];
  try {
    session.startTransaction({
      readConcern: { level: 'snapshot' },
      writeConcern: { w: 'majority' },
    });
    for (const [index, collection] of before.entries()) {
      const docs = await db
        .collection(collection.name)
        .find({}, { session, raw: true })
        .sort({ _id: 1 })
        .toArray();
      if (docs.some(doc => !Buffer.isBuffer(doc)))
        throw Error('Raw BSON required');
      const bytes = Buffer.concat(docs);
      const filename = `${index}.bson`;
      fs.writeFileSync(path.join(outputDirectory, filename), bytes, {
        mode: 0o600,
        flag: 'wx',
      });
      collections.push({
        name: collection.name,
        options: collection.options,
        indexes: collection.indexes,
        filename,
        documents: docs.length,
        sha256: digest(bytes),
      });
    }
    await session.commitTransaction();
    if (JSON.stringify(before) !== JSON.stringify(await metadata(db)))
      throw Error('Catalog changed during snapshot; take a new backup');
    const manifest = {
      version: 1,
      createdAt: new Date().toISOString(),
      database: db.databaseName,
      collections,
    };
    // The manifest exists only for a completed snapshot.
    fs.writeFileSync(
      path.join(outputDirectory, 'manifest.json'),
      JSON.stringify(manifest, null, 2),
      { mode: 0o600, flag: 'wx' },
    );
    return manifest;
  } finally {
    if (session.inTransaction()) await session.abortTransaction();
    await session.endSession();
  }
}

function readSnapshot(directory) {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(directory, 'manifest.json'), 'utf8'),
  );
  if (manifest.version !== 1 || !Array.isArray(manifest.collections))
    throw Error('Unsupported snapshot');
  const collections = manifest.collections.map(c => {
    if (!/^\d+\.bson$/.test(c.filename))
      throw Error('Invalid snapshot filename');
    const bytes = fs.readFileSync(path.join(directory, c.filename));
    if (digest(bytes) !== c.sha256) throw Error('Snapshot checksum mismatch');
    const docs = [];
    for (let offset = 0; offset < bytes.length; ) {
      const length = bytes.readInt32LE(offset);
      if (length < 5 || offset + length > bytes.length)
        throw Error('Invalid BSON length');
      docs.push(
        BSON.deserialize(bytes.subarray(offset, offset + length), {
          promoteValues: false,
        }),
      );
      offset += length;
    }
    if (docs.length !== c.documents) throw Error('Snapshot count mismatch');
    return { ...c, docs };
  });
  return { ...manifest, collections };
}

// Restore only to a caller-owned EMPTY scratch database. The CLI only passes a
// newly started local MongoMemoryReplSet; it has no remote restore option.
async function restoreAndVerify(db, directory) {
  if ((await db.listCollections().toArray()).length)
    throw Error('Restore database must be empty');
  const snapshot = readSnapshot(directory); // Validate every file before writing.
  for (const c of snapshot.collections) {
    const collection = await db.createCollection(c.name, c.options);
    if (c.docs.length) await collection.insertMany(c.docs);
    for (const { v, ns, ...index } of c.indexes) {
      if (index.name !== '_id_') await collection.createIndexes([index]);
    }
    const restored = await collection
      .find({}, { raw: true })
      .sort({ _id: 1 })
      .toArray();
    if (
      restored.length !== c.documents ||
      digest(Buffer.concat(restored)) !== c.sha256
    )
      throw Error('Restored data verification failed');
    const indexes = await collection.indexes();
    if (indexes.length !== c.indexes.length)
      throw Error('Restored index count mismatch');
  }
  return {
    collections: snapshot.collections.length,
    documents: snapshot.collections.reduce((n, c) => n + c.documents, 0),
  };
}

module.exports = { takeSnapshot, readSnapshot, restoreAndVerify };
