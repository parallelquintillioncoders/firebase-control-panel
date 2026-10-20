'use strict';
const { spawn } = require('child_process');
const path = require('path');
const crypto = require('crypto');
const { cliFile, execFirebase } = require('./firebase-cli');
let login = null;
function safeLoginUrl(lines) {
  const match = (lines || []).join('\n').match(/https:\/\/auth\.firebase\.tools\/login\?[^\s<>'\"`]+/i);
  if (!match) return null;
  try { const url = new URL(match[0]); return url.protocol === 'https:' && url.hostname === 'auth.firebase.tools' ? url.href : null; }
  catch (_) { return null; }
}
function recent() { return login ? { id:login.id, status:login.status, lines:[...login.lines.slice(-74), ...(login.pending ? [login.pending.slice(0,1600)] : [])], startedAt:login.startedAt, authUrl:login.status==='running' ? login.authUrl : null } : null; }
function cleanOutput(line) {
  return String(line).replace(/\u001b\[[0-?]*[ -/]*[@-~]/g, '').replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '');
}
function log(line) {
  if (!login) return;
  const cleaned = cleanOutput(line);
  // OAuth attestations are signed: truncating even one character invalidates them.
  // Extract only complete lines, before applying the diagnostic display limit.
  const url = safeLoginUrl([cleaned]);
  if (url) login.authUrl = url;
  if (cleaned.trim()) login.lines.push(cleaned.slice(0,1600));
  if (login.lines.length > 120) login.lines.shift();
}
function embeddedLogin({ spawnProcess = spawn } = {}) {
  if (login?.status === 'running') return recent();
  const script = cliFile();
  const env={...process.env,FORCE_COLOR:'0'};
  delete env.CI;
  const child = spawnProcess(process.execPath, [script,'login','--reauth','--no-localhost','--interactive'], {
    cwd:path.join(__dirname,'..'),
    env,
    stdio:['pipe','pipe','pipe'],windowsHide:true,shell:false
  });
  login = { id:crypto.randomUUID(), status:'running', startedAt:new Date().toISOString(), lines:[], pending:'', authUrl:null, child };
  let pending='';
  const output = data => {
    pending += data.toString('utf8');
    const lines=pending.split(/[\r\n]+/);pending=lines.pop() || '';
    for(const line of lines) log(line);
    // Show prompts without consuming partial lines: a URL may span many chunks.
    login.pending=cleanOutput(pending);
  };
  child.stdout.on('data',output);child.stderr.on('data',output);
  child.on('error',e=>{ log('ERROR: '+e.message);login.status='failed'; });
  child.on('close',code=>{
    if(pending)log(pending);
    login.pending='';
    log(code===0?'Firebase authentication completed.':'Firebase login ended with code '+code+'. Use Open Windows login as a fallback.');
    login.status=code===0?'success':'failed';
    login.child=null;
  });
  const timer=setTimeout(()=>{if(login?.child===child&&login.status==='running'){child.kill();log('Login timed out after 10 minutes.');}},600000);
  child.on('close',()=>clearTimeout(timer));
  return recent();
}
function sendInput(value) {
  if(!login || login.status!=='running' || !login.child?.stdin.writable) throw new Error('No interactive sign-in process is active');
  if(typeof value !== 'string' || value.length>4096 || value.includes('\n') || value.includes('\r')) throw new Error('Invalid sign-in input');
  // Never persist the one-time OAuth authorization code or user responses in logs.
  login.child.stdin.write(value+'\n');
  return {ok:true};
}
/**
 * Launch a visible console through PowerShell Start-Process.
 * Node detached + stdio:ignore does NOT create a console window by itself.
 * Confirm launcher execution via stdout before telling the UI it opened.
 */
function nativeWindowsLogin({ platform = process.platform, spawnProcess = spawn } = {}) {
  if (platform !== 'win32') throw new Error('Windows sign-in window is only available on Windows. Use browser code sign-in on this system.');
  const launcher = path.join(__dirname, '..', 'scripts', 'launch-login-windows.ps1');
  return new Promise((resolve, reject) => {
    const child = spawnProcess('powershell.exe', [
      '-NoLogo', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass',
      '-File', launcher, process.execPath, cliFile()
    ], { cwd: path.join(__dirname, '..'), windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'], shell: false });
    let stdout = '', stderr = '', done = false;
    const finish = (error, result) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      if (error) reject(error);
      else resolve(result);
    };
    child.stdout.on('data', d => { stdout = (stdout + d.toString()).slice(-4000); });
    child.stderr.on('data', d => { stderr = (stderr + d.toString()).slice(-4000); });
    child.on('error', e => finish(new Error('Could not launch Google sign-in: ' + e.message)));
    child.on('close', code => {
      const match = stdout.match(/LAUNCHED_PID=(\d+)/);
      if (code === 0 && match) {
        finish(null, {
          ok: true, opened: true, pid: Number(match[1]),
          message: 'Google sign-in window started. Approve sign-in in your browser. If no window appears, use Browser code sign-in below.'
        });
      } else {
        const detail = (stderr || stdout || `launcher exited with code ${code}`).trim().slice(-600);
        finish(new Error('Windows could not open the sign-in window. ' + detail + ' Use Browser code sign-in instead.'));
      }
    });
    const timer = setTimeout(() => {
      child.kill();
      finish(new Error('Timed out opening the sign-in window. Use Browser code sign-in instead.'));
    }, 12000);
  });
}
async function loginStatus(){
  try {
    const { stdout }=await execFirebase(['login:list'],{timeoutMs:25000});
    const emails=[...new Set((stdout.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)||[]))];
    return {signedIn:emails.length>0, accounts:emails, text:stdout.slice(0,800).trim(), process:recent()};
  }catch(e){ return {signedIn:false,accounts:[],text:e.message.slice(0,500), process:recent()}; }
}
module.exports={embeddedLogin,sendInput,nativeWindowsLogin,loginStatus,recent};
