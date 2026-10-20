'use strict';
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const fs = require('node:fs');
const path = require('node:path');
const auth = require('../server/auth');
const cliFolder = path.join(__dirname,'..','node_modules','firebase-tools');
const created = !fs.existsSync(cliFolder);
if (created) {
  fs.mkdirSync(cliFolder, {recursive: true});
  fs.writeFileSync(path.join(cliFolder, 'package.json'), JSON.stringify({ bin: {firebase:'./test.js'} }));
  fs.writeFileSync(path.join(cliFolder, 'test.js'), '// fixture');
}
function fakeChild(out, err, code) {
  const p = new EventEmitter();
  p.stdout = new EventEmitter(); p.stderr = new EventEmitter();
  p.kill = () => {};
  process.nextTick(() => {
    if(out) p.stdout.emit('data', Buffer.from(out));
    if(err) p.stderr.emit('data', Buffer.from(err));
    p.emit('close', code);
  });
  return p;
}
(async()=>{
  assert.throws(()=>auth.nativeWindowsLogin({ platform:'linux' }), /Windows sign-in window/);
  const ok = await auth.nativeWindowsLogin({ platform:'win32', spawnProcess:(cmd,args,opts)=>{
    assert.equal(cmd,'powershell.exe'); assert.ok(args.some(a=>a.endsWith('launch-login-windows.ps1')));
    assert.equal(opts.shell,false); return fakeChild('LAUNCHED_PID=1234\r\n','',0);
  }});
  assert.equal(ok.opened,true);assert.equal(ok.pid,1234);
  await assert.rejects(auth.nativeWindowsLogin({ platform:'win32', spawnProcess:()=>fakeChild('', 'LOGIN_WINDOW_FAILED: access denied',1)}), /access denied/);
  await assert.rejects(auth.nativeWindowsLogin({ platform:'win32', spawnProcess:()=>{
    const p=new EventEmitter();p.stdout=new EventEmitter();p.stderr=new EventEmitter();p.kill=()=>{};
    process.nextTick(()=>p.emit('error',new Error('ENOENT')));return p;
  }}), /ENOENT/);
  console.log('Windows login launch tests passed: success, blocked, missing PowerShell, other platform');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{
  if(created) fs.rmSync(path.join(__dirname,'..','node_modules'),{recursive:true,force:true});
});
