#!/usr/bin/env node
'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');

const help = `Firebase Hosting c-Panel · Powered by PQC

Run from the project folder:
  npm run help
  npm run verify -- FOLDER
  npm run projects
  npm run sites -- PROJECT_ID
  npm run upload -- FOLDER PROJECT_ID SITE_ID [--spa]
  npm run preview -- PROJECT_ID SITE_ID
  npm run deploy -- PROJECT_ID SITE_ID --confirm
  npm run jobs
  npm run logs -- JOB_ID

verify validates a built static folder offline. upload checks it, then stages
files on the local server; it does not publish. No ZIP files are created.
preview and deploy return a job ID; use logs to check progress and results.
--spa enables index.html fallback routing; default is static routing.
Start the server with npm start in another terminal for API commands.
Optional environment: PANEL_URL (default http://127.0.0.1:4183),
DASHBOARD_TOKEN (only when your local server requires a password).
`;
const idPattern = /^[a-z0-9][a-z0-9-]{1,62}$/;
const excluded = new Set(['node_modules', '.git', '.codex', '.agents']);

async function inspectFolder(folder) {
  const root = path.resolve(folder);
  const rootStat = await fs.lstat(root);
  if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) throw new Error('Choose a real build folder, not a file or symbolic link.');
  const files = [];
  let bytes = 0;
  async function scan(dir) {
    for (const entry of await fs.readdir(dir, {withFileTypes:true})) {
      const absolute = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`Symbolic links are not supported: ${entry.name}`);
      if (entry.isDirectory()) {
        if (!excluded.has(entry.name)) await scan(absolute);
      } else if (entry.isFile()) {
        if (/^\.env(?:\.|$)/i.test(entry.name) || /\.(?:pem|key|p12|pfx)$/i.test(entry.name)) {
          throw new Error(`Potential credential file found: ${entry.name}. Choose a clean static build folder.`);
        }
        const stat = await fs.stat(absolute);
        const relative = path.relative(root, absolute).split(path.sep).join('/');
        if (/["\r\n\\:]/.test(relative)) throw new Error(`Unsupported upload filename: ${relative}`);
        if (stat.size > 120 * 1024 * 1024) throw new Error(`File exceeds the 120 MB upload limit: ${relative}`);
        bytes += stat.size;
        files.push({absolute, relative});
        if (files.length > 2500 || bytes > 250 * 1024 * 1024) throw new Error('Build exceeds 2,500 files or 250 MB.');
      }
    }
  }
  await scan(root);
  if (!files.some(file => file.relative === 'index.html')) throw new Error('The build folder must contain index.html at its root. Build your website first.');
  return {files, bytes};
}

function createClient(env) {
  const base = new URL(env.PANEL_URL || 'http://127.0.0.1:4183');
  if (base.protocol !== 'http:' || !['localhost','127.0.0.1','[::1]'].includes(base.hostname) || base.username || base.password || base.pathname !== '/' || base.search || base.hash) {
    throw new Error('PANEL_URL must be a local HTTP origin, e.g. http://127.0.0.1:4183.');
  }
  let cookie = '';
  async function request(route, body) {
    const headers = cookie ? {Cookie:cookie} : {};
    const options = {headers, redirect:'error', signal:AbortSignal.timeout(180000)};
    if (body !== undefined) {
      options.method = 'POST';
      if (body instanceof FormData) options.body = body;
      else { headers['Content-Type']='application/json'; options.body=JSON.stringify(body); }
    }
    let response;
    try { response = await fetch(new URL('/api'+route, base), options); }
    catch (error) { throw new Error(`Cannot reach local panel at ${base.origin}. Run npm start and retry. ${error.message}`); }
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    const session = response.headers.get('set-cookie');
    if (session) cookie = session.split(';')[0];
    return data;
  }
  return {
    request,
    async connect() {
      const boot = await request('/boot');
      if (boot.requiresAuth && !boot.authenticated) {
        if (!env.DASHBOARD_TOKEN) throw new Error('This panel requires a password. Set DASHBOARD_TOKEN in this terminal; do not pass it as a command argument.');
        await request('/unlock', {token:env.DASHBOARD_TOKEN});
      }
    }
  };
}

async function run(args, env = process.env, output = console.log) {
  const [command='help', ...rest] = args;
  if (['help','--help','-h'].includes(command)) { output(help); return; }
  const count = {check:1,projects:0,sites:1,upload:3,preview:2,deploy:2,jobs:0,logs:1}[command];
  if (count === undefined) throw new Error(`Unknown command "${command}". Run npm run help.`);
  const flags = rest.filter(value=>value.startsWith('--'));
  const positional = rest.filter(value=>!value.startsWith('--'));
  const allowedFlag = command==='upload' ? '--spa' : command==='deploy' ? '--confirm' : null;
  if (positional.length !== count || flags.some(flag=>flag!==allowedFlag) || flags.length>1) throw new Error(`Invalid arguments for ${command}. Run npm run help.`);
  if (command==='deploy' && !flags.includes('--confirm')) throw new Error('Production deployment replaces the live site. Add --confirm to publish the staged build.');
  const ids = command==='upload' ? positional.slice(1) : ['sites','preview','deploy'].includes(command) ? positional : [];
  if (ids.some(id=>!idPattern.test(id))) throw new Error('Invalid project/site ID. Use lowercase letters, digits and hyphens.');
  let build;
  if (['check','upload'].includes(command)) {
    build = await inspectFolder(positional[0]);
    output(`Build valid: ${build.files.length} files, ${build.bytes} bytes. No ZIP created.`);
    if (command==='check') return;
  }
  const client = createClient(env);
  await client.connect();
  let result;
  if (command==='projects') result=await client.request('/projects');
  if (command==='sites') result=await client.request('/sites?projectId='+encodeURIComponent(positional[0]));
  if (command==='jobs') result=await client.request('/jobs');
  if (command==='logs') result=await client.request('/jobs/'+encodeURIComponent(positional[0]));
  if (command==='upload') {
    const form = new FormData();
    form.set('projectId',positional[1]); form.set('siteId',positional[2]); form.set('spa',String(flags.includes('--spa')));
    for (const file of build.files) form.append('files', new Blob([await fs.readFile(file.absolute)]), file.relative);
    result=await client.request('/stage',form);
    output('Uploaded to local staging. Your live website has not changed.');
  }
  if (['preview','deploy'].includes(command)) {
    result=await client.request('/deploy',{projectId:positional[0],siteId:positional[1],mode:command==='preview'?'preview':'live'});
    output('Deployment job started; this is not yet a successful release. Check logs using the returned job ID.');
  }
  output(JSON.stringify(result,null,2));
}
if (require.main === module) run(process.argv.slice(2)).catch(error=>{console.error('Error: '+error.message);process.exitCode=1;});
module.exports = {run, inspectFolder, createClient};
