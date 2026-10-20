'use strict';
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const ansi = /\u001b\[[0-9;]*m/g;
// Invoke the project's own npm-installed Firebase CLI using Node directly.
// No global npm PATH, .cmd shim, shell, or npx is needed on Windows.
const command = 'firebase (bundled)';
function cliFile() {
  const pkg = path.join(__dirname, '..', 'node_modules', 'firebase-tools', 'package.json');
  if (!fs.existsSync(pkg)) {
    const e = new Error('Bundled Firebase CLI is missing. Double-click start-windows.bat or run npm install inside this folder.');
    e.code = 'CLI_MISSING'; throw e;
  }
  const meta = JSON.parse(fs.readFileSync(pkg, 'utf8'));
  const script = path.resolve(path.dirname(pkg), typeof meta.bin === 'string' ? meta.bin : meta.bin.firebase);
  if (!fs.existsSync(script)) throw new Error('Bundled Firebase CLI entry file missing. Reinstall using npm install.');
  return script;
}

function execFirebase(args, { cwd, timeoutMs = 45000, onLine } = {}) {
  return new Promise((resolve, reject) => {
    let script;
    try {
      script = cliFile();
      // Keep the workaround scoped to the dashboard's all-account logout.
      if (args.length === 2 && args[0] === 'logout' && args[1] === '--non-interactive') {
        script = path.join(__dirname, 'logout-worker.js');
        args = [];
      }
    } catch (error) { return reject(error); }
    // No shell = safe against argument injection, even on Windows.
    const child = spawn(process.execPath, [script, ...args], { cwd: cwd || process.cwd(), env: { ...process.env, CI: '1', FORCE_COLOR: '0' }, windowsHide: true, shell: false });
    let stdout = '', stderr = '', settled = false;
    let ended = false;
    let stdoutPartial = '', stderrPartial = '';
    const MAX_CAPTURE = 3 * 1024 * 1024;
    const emitLines = (chunk, isErr) => {
      let pending = (isErr ? stderrPartial : stdoutPartial) + chunk;
      const parts = pending.split(/\r?\n|\r/g);
      const tail = parts.pop() || '';
      if (isErr) stderrPartial = tail; else stdoutPartial = tail;
      for (const line of parts) if (onLine) onLine(line.replace(ansi, ''), isErr);
    };
    child.stdout.on('data', d => {
      const s = d.toString(); stdout = (stdout + s).slice(-MAX_CAPTURE); emitLines(s, false);
    });
    child.stderr.on('data', d => {
      const s = d.toString(); stderr = (stderr + s).slice(-MAX_CAPTURE); emitLines(s, true);
    });
    const timer = setTimeout(() => { if (!ended) child.kill(); }, timeoutMs);
    child.on('error', error => {
      if (settled) return; settled = true; clearTimeout(timer);
      reject(new Error(error.code === 'ENOENT' ? 'Bundled Firebase CLI/Node runtime not found. Run npm install.' : error.message));
    });
    child.on('close', (code, signal) => {
      ended = true;
      clearTimeout(timer);
      if (settled) return; settled = true;
      if (stdoutPartial && onLine) onLine(stdoutPartial.replace(ansi, ''), false);
      if (stderrPartial && onLine) onLine(stderrPartial.replace(ansi, ''), true);
      const result = { code, stdout: stdout.replace(ansi, ''), stderr: stderr.replace(ansi, ''), signal };
      if (code === 0) resolve(result);
      else reject(Object.assign(new Error((stderr || stdout || (signal ? `Command timed out or stopped (${signal})` : `Firebase command failed with exit code ${code}`)).trim().slice(-2500)), { result }));
    });
  });
}

function readCLIJson(stdout) {
  const trimmed = stdout.trim();
  try { return JSON.parse(trimmed); } catch (_) { /* CLI may print notices before JSON */ }
  for (const symbol of ['{', '[']) {
    const first = trimmed.indexOf(symbol);
    if (first >= 0) {
      try { return JSON.parse(trimmed.slice(first)); } catch (_) { /* ignore */ }
    }
  }
  throw new Error('Firebase CLI output was not valid JSON. Update firebase-tools.');
}

function unwrapList(parsed, possibleKeys) {
  if (parsed?.status === 'error') throw new Error(parsed.error?.message || 'Firebase API reported an error');
  if (Array.isArray(parsed)) return parsed;
  for (const node of [parsed?.result, parsed?.data, parsed]) {
    if (Array.isArray(node)) return node;
    for (const key of possibleKeys) if (Array.isArray(node?.[key])) return node[key];
  }
  throw new Error('Unexpected Firebase CLI response. Check the console for details.');
}

function normalizeProjects(raw) {
  return unwrapList(raw, ['projects']).map(p => ({
    id: p.projectId || p.project_id || p.id || '',
    name: p.displayName || p.display_name || p.name || p.projectId || '',
    projectNumber: p.projectNumber || ''
  })).filter(p => /^[a-z0-9][a-z0-9-]{1,62}$/.test(p.id));
}
function normalizeSites(raw) {
  return unwrapList(raw, ['sites']).map(s => {
    const id = s.name?.split('/').pop() || s.siteId || s.site_id || s.id || '';
    let url = s.defaultUrl || s.default_url || `https://${id}.web.app`;
    if (url && !/^https?:\/\//i.test(url)) url = `https://${url}`;
    return { id, name: id, type: s.type || '', url, appId: s.appId || '' };
  }).filter(s => /^[a-z0-9][a-z0-9-]{1,62}$/.test(s.id));
}
module.exports = { command, cliFile, execFirebase, readCLIJson, normalizeProjects, normalizeSites };
