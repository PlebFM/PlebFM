const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function loadHook(env = {}) {
  const effects = [];
  const calls = [];
  const handlers = {};
  const channel = {
    bind: (event, handler) => {
      handlers[event] = handler;
    },
    unbind_all: () => calls.push(['unbind']),
  };
  class Pusher {
    constructor(key, options) {
      calls.push(['connect', key, options.cluster]);
    }
    subscribe(name) {
      calls.push(['subscribe', name]);
      return channel;
    }
    unsubscribe(name) {
      calls.push(['unsubscribe', name]);
    }
    disconnect() {
      calls.push(['disconnect']);
    }
  }
  const mocks = {
    'pusher-js': { default: Pusher },
    react: {
      useEffect: effect => effects.push(effect),
      useState: () => [[], () => {}],
    },
  };
  const exports = {};
  const code = ts.transpileModule(
    fs.readFileSync('components/hooks/usePusher.ts', 'utf8'),
    {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    },
  ).outputText;
  vm.runInNewContext(code, {
    exports,
    process: { env },
    console,
    require: name => {
      assert.ok(name in mocks, `Unexpected dependency: ${name}`);
      return mocks[name];
    },
  });
  return { ...exports, effects, calls, handlers };
}
const env = {
  NEXT_PUBLIC_PUSHER_APP_KEY: 'SYNTHETIC_KEY',
  NEXT_PUBLIC_PUSHER_APP_CLUSTER: 'SYNTHETIC_CLUSTER',
  NEXT_PUBLIC_PUSHER_CHANNEL: 'SYNTHETIC_CHANNEL',
};
test('server import and render do not create a Pusher connection', () => {
  const hook = loadHook();
  hook.usePusher(() => {}, 'fixture');
  assert.equal(hook.calls.length, 0);
});
test('missing preview configuration skips the browser connection safely', () => {
  for (const key of Object.keys(env)) {
    const missing = { ...env };
    delete missing[key];
    const hook = loadHook(missing);
    hook.usePusher(() => {}, 'fixture');
    assert.equal(hook.effects[0](), undefined);
    assert.equal(hook.calls.length, 0);
  }
});
test('configured browser effect subscribes and refreshes on bids; cleanup disconnects', () => {
  const hook = loadHook(env);
  let refreshes = 0;
  hook.usePusher(() => refreshes++, 'fixture');
  assert.equal(hook.calls.length, 0);
  const cleanup = hook.effects[0]();
  assert.deepEqual(hook.calls, [
    [
      'connect',
      env.NEXT_PUBLIC_PUSHER_APP_KEY,
      env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
    ],
    ['subscribe', 'SYNTHETIC_CHANNEL-fixture'],
  ]);
  hook.handlers.bid({
    isBoost: false,
    song: { songName: 'Fixture', songArtist: 'Fixture' },
  });
  assert.equal(refreshes, 1);
  cleanup();
  assert.deepEqual(hook.calls.slice(-3), [
    ['unbind'],
    ['unsubscribe', 'SYNTHETIC_CHANNEL-fixture'],
    ['disconnect'],
  ]);
});
