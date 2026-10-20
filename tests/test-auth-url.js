'use strict';
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { PassThrough } = require('node:stream');
const auth = require('../server/auth');
let child;
function spawnProcess() {
  child = new EventEmitter();
  child.stdout = new PassThrough();
  child.stderr = new PassThrough();
  child.stdin = new PassThrough();
  child.kill = () => child.emit('close', 1);
  return child;
}
const url = 'https://auth.firebase.tools/login?code_challenge=test&session=test&attest=' + 'a'.repeat(4800);
try {
  auth.embeddedLogin({spawnProcess});
  child.stdout.write('\u001b[1m' + url.slice(0, 900));
  assert.equal(auth.recent().authUrl, null, 'Never expose an incomplete link');
  child.stdout.write(url.slice(900, 2300));
  assert.equal(auth.recent().authUrl, null);
  child.stdout.write(url.slice(2300) + '\u001b[22m\r\n');
  assert.equal(auth.recent().authUrl, url, 'Preserve every signed token character');
  assert.ok(auth.recent().lines.every(line => line.length <= 1600));
  child.stdout.write('Enter authorization code: ');
  assert.match(auth.recent().lines.at(-1), /Enter authorization code/);
  assert.equal(auth.recent().authUrl, url);
  child.emit('close', 1);
  assert.equal(auth.recent().authUrl, null, 'Ended sessions must not expose stale links');
  auth.embeddedLogin({spawnProcess});
  child.stdout.write('https://untrusted.example/login?attest=test\n');
  assert.equal(auth.recent().authUrl, null);
  child.emit('close', 0);
  console.log('PASS: long signed URL, split output chunks, ANSI formatting, prompts, trusted host, expired session link.');
} finally {
  if(auth.recent()?.status === 'running')child.emit('close', 1);
}
