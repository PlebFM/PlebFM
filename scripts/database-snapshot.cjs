// Application-data snapshot and LOCAL restore/migration rehearsal. No remote
// restore destination is accepted. Secrets and document contents never print.
const fs = require('node:fs');
const path = require('node:path');
const { parseEnv } = require('node:util');
const { spawn } = require('node:child_process');
const { MongoClient } = require('mongodb');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const {
  takeSnapshot,
  restoreAndVerify,
} = require('./lib/database-snapshot.cjs');

async function main() {
  const args = process.argv.slice(2);
  const option = name =>
    args.find(a => a.startsWith(`--${name}=`))?.slice(name.length + 3);
  const envFile = option('env-file');
  const output = option('output');
  const existing = option('verify');
  if ((!existing && (!envFile || !output)) || (existing && output))
    throw Error(
      'Use --env-file=PATH --output=NEW_DIRECTORY or --verify=DIRECTORY',
    );
  const directory = path.resolve(existing || output);
  const repo = path.resolve(__dirname, '..');
  if (directory === repo || directory.startsWith(repo + path.sep))
    throw Error('Store backups outside the repository');
  if (!existing) {
    const config = parseEnv(fs.readFileSync(envFile, 'utf8'));
    if (!config.MONGODB_URI) throw Error('MONGODB_URI missing');
    const client = new MongoClient(config.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    try {
      await client.connect();
      const manifest = await takeSnapshot(client, directory);
      console.log('Consistent application-data snapshot saved:', {
        collections: manifest.collections.length,
        documents: manifest.collections.reduce((n, c) => n + c.documents, 0),
      });
    } finally {
      await client.close();
    }
  }
  const repl = await MongoMemoryReplSet.create({
    binary: { version: '7.0.14' },
    replSet: { count: 1 },
  });
  const uri = repl.getUri('restore_rehearsal');
  const local = new MongoClient(uri);
  try {
    await local.connect();
    console.log(
      'Local restore verified:',
      await restoreAndVerify(local.db(), directory),
    );
    if (args.includes('--rehearse-migration')) {
      // Pass an explicit, empty env file so preflight cannot load .env.local.
      const emptyEnv = path.join(directory, 'rehearsal.env');
      fs.writeFileSync(emptyEnv, '', { mode: 0o600 });
      const code = await new Promise((resolve, reject) => {
        const child = spawn(
          process.execPath,
          [
            '--import',
            'tsx',
            'scripts/preflight.ts',
            '--database-only',
            '--apply-schema',
            `--env-file=${emptyEnv}`,
          ],
          {
            cwd: repo,
            env: {
              PATH: process.env.PATH,
              HOME: process.env.HOME,
              MONGODB_URI: uri,
            },
            stdio: 'inherit',
          },
        );
        child.on('error', reject);
        child.on('exit', resolve);
      });
      if (code !== 0) throw Error('Local migration rehearsal failed');
      console.log('Local migration rehearsal passed.');
    }
    fs.writeFileSync(
      path.join(directory, 'verification.json'),
      JSON.stringify(
        {
          verifiedAt: new Date().toISOString(),
          localRestore: true,
          migrationRehearsed: args.includes('--rehearse-migration'),
        },
        null,
        2,
      ),
      { mode: 0o600 },
    );
  } finally {
    await local.close();
    await repl.stop();
  }
}
main().catch(error => {
  console.error('Database snapshot/rehearsal failed:', error.name);
  process.exitCode = 1;
});
