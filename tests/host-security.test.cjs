const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, mocks = {}, globals = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React },
  }).outputText;
  const exports = {};
  vm.runInNewContext(
    code,
    {
      exports,
      require: name => {
        assert.ok(name in mocks, `Unexpected dependency: ${name}`);
        return mocks[name];
      },
      process: { env: { NEXT_PUBLIC_BASE_URL: 'https://fixture.invalid' } },
      ...globals,
    },
    { filename: file },
  );
  return exports;
}
const publicHost = load('lib/publicHost.ts');
const fixture = {
  hostName: 'Fixture venue',
  shortName: 'fixture',
  spotifyId: 'fixture-owner',
  hostId: 'fixture-owner',
  spotifyRefreshToken: 'SYNTHETIC_REFRESH_SENTINEL',
  futureSecret: 'SYNTHETIC_FUTURE_SENTINEL',
  _id: 'internal',
};
const expected = {
  hostName: fixture.hostName,
  shortName: fixture.shortName,
  spotifyId: fixture.spotifyId,
  hostId: fixture.hostId,
};
const plain = value => JSON.parse(JSON.stringify(value));
function response() {
  return {
    code: 200,
    status(code) {
      this.code = code;
      return this;
    },
    json(body) {
      this.body = plain(body);
      return this;
    },
    send(body) {
      return this.json(body);
    },
  };
}
function routes() {
  const calls = [];
  const models = {
    default: {
      find: async (...args) => {
        calls.push(['find', ...plain(args)]);
        return [fixture];
      },
      findOne: async (...args) => {
        calls.push(['findOne', ...plain(args)]);
        return fixture;
      },
      findOneAndUpdate: async (...args) => {
        calls.push(['update', ...plain(args)]);
        return fixture;
      },
      create: async (...args) => {
        calls.push(['create', ...plain(args)]);
        return fixture;
      },
    },
  };
  return {
    calls,
    list: load('pages/api/hosts.ts', {
      '../../middleware/mongodb': { default: h => h },
      '../../models/Host': models,
      '../../lib/publicHost': publicHost,
    }).handler,
    detail: load('pages/api/hosts/[shortName].ts', {
      '../../../middleware/mongodb': { default: h => h },
      '../../../models/Host': models,
      '../../../lib/publicHost': publicHost,
    }).handler,
  };
}
test('allowlist excludes existing and future private fields', () => {
  assert.deepEqual(plain(publicHost.toPublicHost(fixture)), expected);
});
test('real Mongoose document is safely serialized without database access', () => {
  const mongoose = require('mongoose');
  const { default: Hosts } = load('models/Host.ts', { mongoose });
  const doc = new Hosts(fixture);
  assert.deepEqual(plain(publicHost.toPublicHost(doc)), expected);
});
test('public list preserves query behavior and projects/sanitizes hosts', async () => {
  const r = routes();
  const res = response();
  const query = { spotifyId: 'fixture-owner', shortName: 'fixture' };
  await r.list({ method: 'GET', query }, res);
  assert.equal(res.code, 200);
  assert.deepEqual(res.body, { success: true, hosts: [expected] });
  assert.deepEqual(r.calls[0], [
    'find',
    query,
    plain(publicHost.PUBLIC_HOST_PROJECTION),
  ]);
});
test('detail lookup preserves filter and sanitizes host', async () => {
  const r = routes();
  const res = response();
  await r.detail({ method: 'GET', query: { shortName: 'fixture' } }, res);
  assert.equal(res.code, 200);
  assert.deepEqual(res.body, { success: true, host: expected });
  assert.deepEqual(r.calls[0], [
    'findOne',
    { shortName: 'fixture' },
    plain(publicHost.PUBLIC_HOST_PROJECTION),
  ]);
});
test('public registration still stores submitted credential but returns public fields', async () => {
  const r = routes();
  const res = response();
  await r.detail(
    {
      method: 'POST',
      query: { shortName: 'fixture' },
      body: {
        hostName: fixture.hostName,
        shortName: fixture.shortName,
        spotifyId: fixture.spotifyId,
        refreshToken: fixture.spotifyRefreshToken,
      },
    },
    res,
  );
  assert.equal(res.code, 200);
  assert.deepEqual(r.calls[0], [
    'create',
    {
      ...expected,
      spotifyRefreshToken: fixture.spotifyRefreshToken,
    },
  ]);
  assert.deepEqual(res.body, { success: true, host: expected });
});
test('PATCH preserves update behavior and sanitizes returned document', async () => {
  const r = routes();
  const res = response();
  const body = {
    spotifyId: fixture.spotifyId,
    hostName: 'Updated',
    shortName: 'updated',
    refreshToken: 'SYNTHETIC_UPDATE_SENTINEL',
  };
  await r.list({ method: 'PATCH', body }, res);
  assert.equal(res.code, 200);
  assert.deepEqual(r.calls[0], [
    'update',
    { spotifyId: body.spotifyId },
    { ...body, hostId: body.spotifyId },
    { new: true, projection: plain(publicHost.PUBLIC_HOST_PROJECTION) },
  ]);
  assert.deepEqual(res.body, { success: true, data: expected });
});
test('homepage serializes only public host fields even from unsafe upstream', async () => {
  const source = fs.readFileSync('pages/index.tsx', 'utf8');
  const deps = [...source.matchAll(/from '([^']+)'/g)].map(m => m[1]);
  const mocks = Object.fromEntries(deps.map(d => [d, {}]));
  mocks['../lib/publicHost'] = publicHost;
  const featured = { ...fixture, hostName: 'Atlanta BitDevs' };
  const page = load('pages/index.tsx', mocks, {
    fetch: async () => ({
      json: async () => ({
        success: true,
        hosts: [featured, fixture],
      }),
    }),
  });
  assert.deepEqual(plain(await page.getServerSideProps()), {
    props: { hosts: [{ ...expected, hostName: featured.hostName }] },
  });
});
