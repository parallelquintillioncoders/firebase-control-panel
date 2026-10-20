'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'pqc-logout-test-'));
const config = path.join(temp, 'configstore', 'firebase-tools.json');
fs.mkdirSync(path.dirname(config), { recursive: true });
const preload = path.join(temp, 'stub.cjs');
// Isolate all credentials; stub only the remote revoke request.
fs.writeFileSync(preload, `
const api = require(${JSON.stringify(require.resolve('firebase-tools/lib/apiv2'))});
api.Client.prototype.get = async function(url) {
  if (url !== '/o/oauth2/revoke') throw new Error('Unexpected network request');
  return {status:200};
};
if (process.env.TEST_LEAVE_ACCOUNT === '1') {
  require(${JSON.stringify(require.resolve('firebase-tools/lib/commands/logout'))}).logoutAction = async () => {};
}
`);
const env = { ...process.env, XDG_CONFIG_HOME: temp, APPDATA: temp, FIREBASE_TOKEN: '',
  GOOGLE_APPLICATION_CREDENTIALS: '', CI: '1', FORCE_COLOR: '0' };
function run() {
  const result = spawnSync(process.execPath, ['--require', preload, 'server/logout-worker.js'],
    { cwd: root, env, windowsHide: true, encoding: 'utf8', timeout: 20000 });
  assert.ifError(result.error);
  return result;
}
function seed() {
  fs.writeFileSync(config, JSON.stringify({
    user: {email:'default@example.test'}, tokens:{refresh_token:'fake-default'},
    additionalAccounts:[{user:{email:'other@example.test'},tokens:{refresh_token:'fake-other'}}],
    activeAccounts:{'/test':'default@example.test'}, unrelatedSetting:'preserved'
  }));
}
try {
  assert.equal(run().status, 0, 'Already logged out succeeds');
  seed();
  let result = run();
  assert.equal(result.status, 0, result.stderr);
  const saved = JSON.parse(fs.readFileSync(config, 'utf8'));
  assert.equal(saved.user, undefined);
  assert.equal(saved.tokens, undefined);
  assert.deepEqual(saved.additionalAccounts, []);
  assert.deepEqual(saved.activeAccounts, {});
  assert.equal(saved.unrelatedSetting, 'preserved');
  seed();
  env.TEST_LEAVE_ACCOUNT = '1';
  result = run();
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Logout could not be verified/);
  delete env.TEST_LEAVE_ACCOUNT;
  // Verify the dashboard wrapper selects the worker and drains naturally too.
  fs.writeFileSync(config, '{}');
  result = spawnSync(process.execPath, ['-e',
    "require('./server/firebase-cli').execFirebase(['logout','--non-interactive']).catch(e=>{console.error(e.message);process.exitCode=1})"],
    {cwd:root, env, windowsHide:true, encoding:'utf8', timeout:20000});
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr);
  console.log('Logout passed: empty session, multiple accounts, credential removal, retained settings, failed verification, dashboard wrapper.');
} finally {
  // mkdtemp created this exact directory inside the OS temporary directory.
  assert.equal(path.dirname(temp), path.resolve(os.tmpdir()));
  fs.rmSync(temp, {recursive:true, force:true});
}
