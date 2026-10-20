'use strict';
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn, execFile } = require('child_process');
const { command, execFirebase, readCLIJson, normalizeProjects, normalizeSites } = require('./firebase-cli');
const auth = require('./auth');
const { localArchive } = require('./download');
const store = require('./store');
const { stageUpload, stagedPath, makeConfig, validateId } = require('./stage');

const app = express();
app.disable('x-powered-by');
const PORT = Number(process.env.PORT || 4183);
const HOST = process.env.HOST || '127.0.0.1';
const TOKEN = process.env.DASHBOARD_TOKEN || '';
if (!['127.0.0.1', 'localhost', '::1'].includes(HOST) && TOKEN.length < 20) {
  console.error('For non-local binding, set DASHBOARD_TOKEN to a secret at least 20 characters long.');
  process.exit(1);
}
const COOKIE_NAME = 'firebase_panel_session';
let cookieValue = crypto.randomBytes(32).toString('hex');
const safeEqual = (a, b) => {
  const x = Buffer.from(String(a)); const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};
const cookies = req => Object.fromEntries((req.headers.cookie || '').split(';').map(p => p.trim().split('=').map(x => x.trim())).filter(a => a.length === 2));
const authed = req => !TOKEN || safeEqual(cookies(req)[COOKIE_NAME] || '', cookieValue);
app.use(express.json({ limit: '40kb' }));
app.use((req, res, next) => {
  // Refuse unexpected Host headers while bound to loopback (DNS rebinding defense).
  if (['127.0.0.1','localhost','::1'].includes(HOST)) {
    let hostname;
    try {hostname = new URL('http://' + (req.headers.host || '')).hostname.replace(/^\[|\]$/g,'');}
    catch (_) {return res.status(403).end('Invalid Host header');}
    if (!['127.0.0.1','localhost','::1'].includes(hostname)) return res.status(403).end('Local-only dashboard: open http://127.0.0.1:4183');
  }
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.headers.origin) {
    try {
      if (new URL(req.headers.origin).host !== req.headers.host) return res.status(403).json({ error: 'Cross-origin request blocked' });
    } catch (_) { return res.status(403).json({ error: 'Invalid Origin' }); }
  }
  next();
});
app.get('/api/boot', (req, res) => res.json({ requiresAuth: Boolean(TOKEN), authenticated: authed(req), localOnly: ['127.0.0.1', 'localhost', '::1'].includes(HOST) }));
app.post('/api/unlock', (req, res) => {
  if (!TOKEN) return res.json({ ok: true });
  if (!safeEqual(req.body?.token || '', TOKEN)) return res.status(401).json({ error: 'Incorrect access password' });
  const secure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${cookieValue}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200${secure ? '; Secure' : ''}`);
  res.json({ ok: true });
});
app.use('/api', (req, res, next) => authed(req) ? next() : res.status(401).json({ error: 'Sign in to your control panel' }));
app.get('/api/health', async (req, res) => {
  try {
    const { stdout } = await execFirebase(['--version'], { timeoutMs: 12000 });
    res.json({ cli: 'ready', version: stdout.trim(), command, dataDirectory: store.dataDir, authMethod: process.env.GOOGLE_APPLICATION_CREDENTIALS ? 'service-account' : 'firebase-cli' });
  } catch (error) { res.json({ cli: 'missing', error: error.message, command, dataDirectory: store.dataDir }); }
});
// User-triggered Google account connection: no password or OAuth token is collected by the dashboard.
// Windows uses the official CLI in its own interactive window (handles browser/prompt reliably).
app.get('/api/auth/status', async (req,res)=>res.json(await auth.loginStatus()));
app.get('/api/auth/session', (req,res)=>res.json({process:auth.recent()}));
app.post('/api/auth/connect', async (req,res,next)=>{
  try { res.json(await auth.nativeWindowsLogin()); } catch(e){next(e);}
});
app.post('/api/auth/embedded', (req,res,next)=>{
  try { res.json({process:auth.embeddedLogin()}); } catch(e){next(e);}
});
app.post('/api/auth/input', (req,res,next)=>{
  try {res.json(auth.sendInput(req.body?.value));} catch(e){next(e);}
});
app.post('/api/auth/switch', async (req,res,next)=>{
  try {
    const email=String(req.body?.email||'');
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254) return res.status(400).json({error:'Invalid email'});
    const r=await execFirebase(['login:use',email],{timeoutMs:20000});
    res.json({ok:true,output:r.stdout.slice(-500)});
  } catch(e){next(e);}
});
app.post('/api/projects/create', async (req,res,next)=>{
  try {
    const id=String(req.body?.projectId||'').trim();
    const name=String(req.body?.displayName||'').trim();
    if(!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(id) || name.length<3 || name.length>90)
      return res.status(400).json({error:'Project ID must be 6–30 characters (lowercase, digits, hyphens). Display name must be 3–90 characters.'});
    const r=await execFirebase(['projects:create',id,'--display-name',name,'--json','--non-interactive'],{timeoutMs:240000});
    let result; try {result=readCLIJson(r.stdout);} catch (_) {result={message:r.stdout.trim().slice(0,1500)};}
    res.json({ok:true,result});
  }catch(e){next(e);}
});
app.post('/api/hosting/create', async (req,res,next)=>{
  try{
    const {projectId,siteId}=req.body||{};
    if(!validateId(projectId)||!validateId(siteId)||siteId.length>30) return res.status(400).json({error:'Invalid project or Hosting site ID (2-30 lowercase letters/numbers/hyphens)'});
    const r=await execFirebase(['hosting:sites:create',siteId,'--project',projectId,'--non-interactive','--json'],{timeoutMs:180000});
    let result; try {result=readCLIJson(r.stdout);} catch (_) {result={message:r.stdout.trim().slice(0,1500)};}
    res.json({ok:true,result});
  }catch(e){next(e);}
});
app.get('/api/projects', async (req, res, next) => {
  try {
    const r = await execFirebase(['projects:list', '--json'], { timeoutMs: 60000 });
    res.json({ projects: normalizeProjects(readCLIJson(r.stdout)) });
  } catch (error) { next(error); }
});
app.get('/api/sites', async (req, res, next) => {
  try {
    if (!validateId(req.query.projectId)) return res.status(400).json({ error: 'Choose a valid Firebase project' });
    const r = await execFirebase(['hosting:sites:list', '--project', req.query.projectId, '--json'], { timeoutMs: 60000 });
    res.json({ sites: normalizeSites(readCLIJson(r.stdout)) });
  } catch (error) { next(error); }
});
app.get('/api/staged', (req, res) => {
  const entries = Object.entries(store.state.staged).map(([key, value]) => {
    const [projectId, siteId] = key.split('::');
    return { projectId, siteId, ...value };
  });
  res.json({ builds: entries.map(({ files, ...b }) => b) });
});
app.get('/api/staged/:projectId/:siteId', (req, res) => {
  const { projectId, siteId } = req.params;
  if (!validateId(projectId) || !validateId(siteId)) return res.status(400).json({ error: 'Invalid site' });
  const build = store.getStaged(projectId, siteId);
  if (!build) return res.status(404).json({ error: 'No staged build for this site' });
  res.json({ build });
});
const uploadsDir = path.join(store.dataDir, 'upload-tmp');
fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o700 });
const uploader = multer({
  storage: multer.diskStorage({ destination: uploadsDir, filename: (req, f, cb) => cb(null, crypto.randomUUID()) }),
  preservePath: true,
  limits: { fileSize: 120 * 1024 * 1024, files: 2500, fields: 8, parts: 2510 }
}).fields([{ name: 'archive', maxCount: 1 }, { name: 'files', maxCount: 2500 }]);
app.post('/api/stage', (req, res, next) => uploader(req, res, async err => {
  if (err) return next(err);
  const all = [...(req.files?.archive || []), ...(req.files?.files || [])];
  try {
    if ((req.files?.archive || []).length && (req.files?.files || []).length) throw new Error('Choose ZIP or folder, not both');
    const build = await stageUpload({ projectId: req.body.projectId, siteId: req.body.siteId, files: all, spa: req.body.spa === 'true' });
    res.json({ build });
  } catch (error) { next(error); }
  finally { for (const f of all) { try { fs.unlinkSync(f.path); } catch (_) {} } }
}));

// A restrictive preview mount: only staged static website files are served.
app.use('/preview/:projectId/:siteId', (req, res, next) => {
  const { projectId, siteId } = req.params;
  if (!validateId(projectId) || !validateId(siteId)) return res.status(404).end();
  if (!authed(req)) return res.status(401).end('Please sign in first');
  const build = store.getStaged(projectId, siteId);
  if (!build) return res.status(404).end('No build uploaded yet');
  let root;
  try { root = stagedPath(build); } catch (_) { return res.status(404).end(); }
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Security-Policy', "sandbox allow-scripts allow-forms allow-popups; frame-ancestors 'self'");
  const statics = express.static(root, { index: 'index.html', fallthrough: true, dotfiles: 'allow' });
  statics(req, res, () => {
    if (build.spa && req.accepts('html') && !path.extname(req.path)) return res.sendFile(path.join(root, 'index.html'));
    res.status(404).end('File not found');
  });
});

const active = new Map();
const listeners = new Map();
const logsDir = path.join(store.dataDir, 'job-logs');
const runsDir = path.join(store.dataDir, 'runs');
fs.mkdirSync(logsDir, { recursive: true, mode: 0o700 });
fs.mkdirSync(runsDir, { recursive: true, mode: 0o700 });
const logFile = job => path.join(logsDir, `${job.id}.log`);
function broadcast(job, event, data) {
  for (const res of listeners.get(job.id) || []) {
    try { res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`); } catch (_) { /* disconnected */ }
  }
}
function append(job, line) {
  const text = String(line).slice(0, 3000).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '');
  fs.appendFileSync(logFile(job), text + '\n');
  broadcast(job, 'line', { line: text });
}
const readLog = job => {
  try { return fs.readFileSync(logFile(job), 'utf8').slice(-250000).split('\n').filter(Boolean).slice(-400); }
  catch (_) { return []; }
};
function publicJob(job) { return { ...job }; }
app.get('/api/jobs', (req, res) => res.json({ jobs: store.state.jobs.slice(0, 120).map(publicJob) }));
app.get('/api/jobs/:id', (req, res) => {
  const job = store.getJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'Deployment job not found' });
  res.json({ job: publicJob(job), logs: readLog(job) });
});
app.get('/api/jobs/:id/log', (req, res) => {
  const job = store.getJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'Deployment job not found' });
  res.download(logFile(job), `firebase-deploy-${job.id}.log`);
});
app.get('/api/jobs/:id/stream', (req, res) => {
  const job = store.getJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'Deployment job not found' });
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
  res.write(`event: snapshot\ndata: ${JSON.stringify({ job: publicJob(job), logs: readLog(job) })}\n\n`);
  if (!listeners.has(job.id)) listeners.set(job.id, new Set());
  listeners.get(job.id).add(res);
  const interval = setInterval(() => { try { res.write(': ping\n\n'); } catch (_) {} }, 18000);
  req.on('close', () => { clearInterval(interval); listeners.get(job.id)?.delete(res); });
});
const extractPreviewURL = output => {
  // CLI may produce multiple links; take a preview channel URL (with --).
  const urls = [...String(output).matchAll(/https:\/\/[a-z0-9-]+\.web\.app(?:\/[^\s"']*)?/gi)].map(m => m[0].replace(/[,.)]+$/, ''));
  return urls.find(u => u.includes('--')) || null;
};
async function perform(job, build) {
  const siteKey = store.siteKey(job.projectId, job.siteId);
  const runDir = path.join(runsDir, job.id);
  try {
    store.updateJob(job, { status: 'running', startedAt: new Date().toISOString() });
    broadcast(job, 'state', publicJob(job));
    fs.mkdirSync(runDir, { recursive: true, mode: 0o700 });
    fs.cpSync(stagedPath(build), path.join(runDir, 'public'), { recursive: true });
    fs.writeFileSync(path.join(runDir, 'firebase.json'), JSON.stringify(makeConfig(job.siteId, build.spa), null, 2));
    const args = job.mode === 'preview' ?
      ['hosting:channel:deploy', job.channel, '--project', job.projectId, '--non-interactive'] :
      ['deploy', '--only', 'hosting', '--project', job.projectId, '--non-interactive'];
    append(job, `> firebase ${args.join(' ')}`);
    append(job, `Site: ${job.siteId} | Files: ${build.count} | Release: ${job.mode}`);
    append(job, '---');
    let accumulated = '';
    const result = await execFirebase(args, { cwd: runDir, timeoutMs: 15 * 60 * 1000,
      onLine: (line, err) => { append(job, `${err ? '[stderr] ' : ''}${line}`); accumulated += line + '\n'; } });
    const previewUrl = job.mode === 'preview' ? extractPreviewURL(accumulated + result.stdout) : null;
    append(job, `---\n${job.mode === 'live' ? 'Production release completed successfully.' : 'Preview channel deployment completed.'}`);
    if (previewUrl) append(job, `Preview URL: ${previewUrl}`);
    store.updateJob(job, { status: 'success', finishedAt: new Date().toISOString(), previewUrl });
    broadcast(job, 'state', publicJob(job));
  } catch (error) {
    append(job, `ERROR: ${error.message}`);
    store.updateJob(job, { status: 'failed', finishedAt: new Date().toISOString(), error: error.message });
    broadcast(job, 'state', publicJob(job));
  } finally {
    active.delete(siteKey);
    try { fs.rmSync(runDir, { recursive: true, force: true }); } catch (_) {}
  }
}
app.post('/api/deploy', (req, res, next) => {
  try {
    const { projectId, siteId, mode } = req.body || {};
    if (!validateId(projectId) || !validateId(siteId) || !['preview', 'live'].includes(mode)) return res.status(400).json({ error: 'Invalid deployment request' });
    const key = store.siteKey(projectId, siteId);
    if (active.has(key)) return res.status(409).json({ error: 'A deployment for this website is already running' });
    const build = store.getStaged(projectId, siteId);
    if (!build || !fs.existsSync(stagedPath(build))) return res.status(400).json({ error: 'Upload a website build before deploying' });
    const channel = mode === 'preview' ? `panel-${Date.now().toString(36)}` : null;
    const job = store.newJob({ projectId, siteId, mode, channel });
    active.set(key, job.id);
    res.status(202).json({ job: publicJob(job) });
    setImmediate(() => perform(job, build));
  } catch (error) { next(error); }
});
app.post('/api/logout', async (req, res, next) => {
  try {
    if (active.size || exporting) return res.status(409).json({ error: 'Wait for deployments and downloads to finish before logging out.' });
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_TOKEN) return res.status(409).json({ error: 'This server uses environment credentials. Remove those credentials and restart the server to disconnect.' });
    if (auth.recent()?.status === 'running') return res.status(409).json({ error: 'Finish or close the active sign-in process before logging out.' });
    await execFirebase(['logout', '--non-interactive'], { timeoutMs: 60000 });
    cookieValue = crypto.randomBytes(32).toString('hex');
    res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`);
    res.setHeader('Cache-Control', 'no-store');
    res.json({ ok: true });
  } catch (error) { next(error); }
});
let exporting = false;
app.get('/api/download/:projectId/:siteId', async (req, res, next) => {
  const { projectId, siteId } = req.params;
  const source = req.query.source;
  if (!validateId(projectId) || !validateId(siteId) || !['local', 'live'].includes(source)) return res.status(400).json({ error: 'Invalid website download request' });
  if (exporting) return res.status(409).json({ error: 'Another download is being prepared. Please wait.' });
  exporting = true;
  const output = path.join(uploadsDir, `${crypto.randomUUID()}.zip`);
  try {
    if (source === 'local') {
      const build = store.getStaged(projectId, siteId);
      if (!build || !fs.existsSync(stagedPath(build))) return res.status(404).json({ error: 'No uploaded build is saved on this computer. Try Download live website.' });
      fs.writeFileSync(output, localArchive(stagedPath(build)), { mode: 0o600 });
    } else {
      await new Promise((resolve, reject) => {
        execFile(process.execPath, [path.join(__dirname, 'download-worker.js'), projectId, siteId, output],
          { windowsHide: true, timeout: 10 * 60 * 1000, maxBuffer: 1024 * 1024 },
          (error, stdout, stderr) => error ? reject(new Error(error.killed ? 'Download timed out. Try the uploaded build.' : (stderr.trim().slice(-1500) || 'Live download failed. Check your Google connection.'))) : resolve());
      });
    }
    res.setHeader('Cache-Control', 'no-store');
    await new Promise((resolve, reject) => res.download(output, `${siteId}-${source}-website.zip`, error => error ? reject(error) : resolve()));
  } catch (error) { next(error); }
  finally {
    exporting = false;
    try { fs.unlinkSync(output); } catch (_) {}
  }
});
app.get('/api/config', (req, res) => res.json({ safeMode: true, host: HOST, port: PORT, authType: process.env.GOOGLE_APPLICATION_CREDENTIALS ? 'Service account (server-side)' : 'Firebase CLI login', maxUnpackedMb: 250 }));
app.use('/api', (req, res) => res.status(404).json({ error: 'API endpoint not found' }));
app.use(express.static(path.join(__dirname, '..', 'public'), { etag: true, maxAge: 0, setHeaders: res => res.setHeader('Cache-Control', 'no-store') }));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'index.html')));
app.use((err, req, res, next) => {
  console.error('[API error]', err.message);
  if (res.headersSent) return next(err);
  res.status(err.status || (err instanceof multer.MulterError ? 413 : 500)).json({ error: err.message || 'Unexpected server error' });
});
app.listen(PORT, HOST, () => {
  console.log(`
  ==============================================================
    LAUNCHPAD FIREBASE CONTROL PANEL v4
  ==============================================================
  ➜  Local Dashboard:  http://${HOST}:${PORT}
  ➜  Deployment Engine: Ready (classic Firebase Hosting)
  ➜  Storage Path:      ${store.dataDir}
  ➜  Security Mode:     ${TOKEN ? 'Access password protection enabled' : 'Local-only session'}
  ==============================================================
`);
  if (process.env.LAUNCHPAD_AUTO_OPEN === '1') {
    let openCmd = 'xdg-open', openArgs = [`http://127.0.0.1:${PORT}`];
    if (process.platform === 'win32') {
      openCmd = 'powershell.exe';
      openArgs = ['-NoProfile', '-Command', `Start-Process 'http://127.0.0.1:${PORT}'`];
    } else if (process.platform === 'darwin') {
      openCmd = 'open';
      openArgs = [`http://127.0.0.1:${PORT}`];
    }
    const child = spawn(openCmd, openArgs, { windowsHide:true, stdio:'ignore' });
    child.on('error', err => console.log('Could not open browser automatically:', err.message));
  }
});
