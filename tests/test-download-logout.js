'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const { spawn } = require('node:child_process');
const AdmZip = require('adm-zip');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-test-'));
process.env.PANEL_DATA_DIR = path.join(temp, 'data');
const { localArchive, liveArchive, archiveName } = require('../server/download');
const { stageUpload } = require('../server/stage');
let child;
const hash = content => crypto.createHash('sha256').update(zlib.gzipSync(content, { level: 9 })).digest('hex');
(async () => {
  const root = path.join(temp, 'site'); fs.mkdirSync(path.join(root, 'assets'), { recursive: true });
  fs.writeFileSync(path.join(root, 'index.html'), '<h1>Export test</h1>');
  fs.writeFileSync(path.join(root, 'assets', 'logo.bin'), Buffer.from([0, 255, 12, 90]));
  const zip = new AdmZip(localArchive(root));
  assert.equal(zip.readAsText('index.html'), '<h1>Export test</h1>');
  assert.deepEqual(zip.readFile('assets/logo.bin'), Buffer.from([0, 255, 12, 90]));
  for (const bad of ['../secret', '/../../secret', 'a\\b', 'C:/secret', 'a/../b']) assert.throws(() => archiveName(bad));
  const content = Buffer.from('<h1>Live</h1>');
  const version = 'sites/demo-site/versions/release-one';
  let pages = 0;
  const client = { get: async (url, opts) => {
    if (url.endsWith('/files')) {
      pages++;
      return { body: opts.queryParams.pageToken ? { files: [{ path: '/assets/app.js', hash: hash(content) }] } : { files: [{ path: '/index.html', hash: hash(content) }], nextPageToken: 'page-two' } };
    }
    return { body: { release: { version: { name: version } } } };
  } };
  const live = new AdmZip(await liveArchive('demo-project', 'demo-site', client, async () => new Response(content)));
  assert.equal(pages, 2); assert.deepEqual(live.readFile('assets/app.js'), content);
  const reservedClient = { get: async url => url.endsWith('/files') ? { body: { files: [
    { path: '/__/firebase/init.js', hash: hash(Buffer.from('original hidden file')) },
    { path: '/__/auth/handler', hash: hash(content) },
    { path: '/index.html', hash: hash(content) },
    { path: '/LAUNCHPAD-EXPORT-NOTES.txt', hash: hash(content) }
  ] } } : { body: { release: { version: { name: version } } } } };
  const recovered = new AdmZip(await liveArchive('demo-project', 'demo-site', reservedClient, async url => {
    assert.ok(!url.pathname.startsWith('/__/'), 'Reserved URLs must not be fetched as static files');
    return new Response(content);
  }));
  assert.equal(recovered.getEntry('__/firebase/init.js'), null);
  assert.deepEqual(recovered.readFile('index.html'), content);
  assert.deepEqual(recovered.readFile('LAUNCHPAD-EXPORT-NOTES.txt'), content);
  assert.match(recovered.readAsText('LAUNCHPAD-LAUNCHPAD-EXPORT-NOTES.txt'), /\/__\/firebase\/init.js/);
  await assert.rejects(liveArchive('demo-project', 'demo-site', reservedClient, async () => new Response('wrong static file')), /Could not verify/);
  await assert.rejects(liveArchive('demo-project', 'demo-site', client, async () => new Response('wrong page')), /Could not verify/);
  await assert.rejects(liveArchive('demo-project', 'demo-site', client, async () => new Response('', { status: 302, headers: { location: 'https://other.example/secret' } })), /redirected file/);
  await assert.rejects(liveArchive('demo-project', 'demo-site', client, async () => new Response('', { status: 404 })), /HTTP 404/);
  await assert.rejects(liveArchive('demo-project', 'demo-site', { get: async () => ({ body: {} }) }), /no active live release/);
  let calls = 0;
  const changing = { get: async (url, opts) => url.endsWith('/channels/live') && ++calls > 1 ? { body: { release: { version: { name: 'changed' } } } } : client.get(url, opts) };
  await assert.rejects(liveArchive('demo-project', 'demo-site', changing, async () => new Response(content)), /changed during download/);
  const upload = path.join(temp, 'upload.zip'); zip.writeZip(upload);
  await stageUpload({ projectId: 'demo-project', siteId: 'demo-site', files: [{ fieldname: 'archive', originalname: 'site.zip', path: upload }], spa: true });
  const preload = path.join(temp, 'stub.cjs');
  fs.writeFileSync(preload, `const cli = require(${JSON.stringify(path.resolve('server/firebase-cli.js'))}); cli.execFirebase = async args => { if (args[0] !== 'logout') throw new Error('Unexpected CLI command'); return {stdout:'Logged out'}; };`);
  fs.appendFileSync(preload, `\nconst http = require('http'); const listen = http.Server.prototype.listen; http.Server.prototype.listen = function(...args) { this.on('listening', () => console.log('TEST_PORT=' + this.address().port)); return listen.apply(this,args); };`);
  child = spawn(process.execPath, ['--require', preload, 'server/index.js'], { cwd: path.resolve('.'), windowsHide: true, env: { ...process.env, PORT: '0', HOST: '127.0.0.1', DASHBOARD_TOKEN: 'test-password-only', GOOGLE_APPLICATION_CREDENTIALS: '', FIREBASE_TOKEN: '', LAUNCHPAD_AUTO_OPEN: '0' }, stdio: ['ignore', 'pipe', 'pipe'] });
  const port = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Server startup timeout')), 15000);
    let output = '';
    child.stdout.on('data', data => { output += data; const m = output.match(/TEST_PORT=(\d+)/); if (m) { clearTimeout(timer); resolve(m[1]); } });
    child.on('error', reject);
  });
  const base = `http://127.0.0.1:${port}`;
  assert.equal((await fetch(base + '/api/download/demo-project/demo-site?source=local')).status, 401);
  const unlocked = await fetch(base + '/api/unlock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: 'test-password-only' }) });
  const cookie = unlocked.headers.get('set-cookie').split(';')[0];
  const headers = { Cookie: cookie };
  const response = await fetch(base + '/api/download/demo-project/demo-site?source=local', { headers });
  assert.equal(response.status, 200); assert.match(response.headers.get('content-disposition'), /demo-site-local-website.zip/);
  assert.equal(new AdmZip(Buffer.from(await response.arrayBuffer())).readAsText('index.html'), '<h1>Export test</h1>');
  assert.equal((await fetch(base + '/api/download/demo-project/missing-site?source=local', { headers })).status, 404);
  assert.equal((await fetch(base + '/api/download/demo-project/demo-site?source=invalid', { headers })).status, 400);
  assert.equal((await fetch(base + '/api/logout', { method: 'POST', headers: { ...headers, Origin: 'https://wrong.example' } })).status, 403);
  const loggedOut = await fetch(base + '/api/logout', { method: 'POST', headers });
  assert.equal(loggedOut.status, 200); assert.match(loggedOut.headers.get('set-cookie'), /Max-Age=0/);
  assert.equal((await fetch(base + '/api/staged')).status, 401);
  assert.equal((await fetch(base + '/api/staged', { headers })).status, 401);
  console.log('Download/logout tests passed: ZIP contents, pagination, verification, redirects, missing files, release changes, API authentication, logout cookie and origin checks.');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  if (child && child.exitCode === null) { child.kill(); await new Promise(resolve => child.once('exit', resolve)); }
  fs.rmSync(temp, { recursive: true, force: true });
});
