'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const AdmZip = require('adm-zip');
const { dataDir, getStaged, updateStaged } = require('./store');
const LIMIT = 250 * 1024 * 1024;
const MAX_FILES = 2500;
const buildsDir = path.join(dataDir, 'builds');
fs.mkdirSync(buildsDir, { recursive: true, mode: 0o700 });
const ID_RE = /^[a-z0-9][a-z0-9-]{1,62}$/;
function validateId(id) { return typeof id === 'string' && ID_RE.test(id); }
function safeName(raw) {
  if (typeof raw !== 'string' || raw.includes('\0')) throw new Error('Invalid uploaded file name');
  const rawParts = raw.replace(/\\/g, '/').split('/');
  if (rawParts.some(x => x === '..')) throw new Error('Unsafe parent-directory path in upload');
  let normalized = path.posix.normalize(rawParts.join('/')).replace(/^\.\//, '');
  if (!normalized || normalized === '.' || normalized.startsWith('/') || /^[a-z]:/i.test(normalized) || normalized.includes(':') || normalized.startsWith('../')) throw new Error('Unsafe path in upload');
  return normalized;
}
function commonBase(names) {
  // Remove a single enclosing directory (as created by zip tools and folder picker).
  let current = names;
  let strip = '';
  for (let i = 0; i < 4; i++) {
    if (current.some(n => n === 'index.html')) break;
    const dirs = new Set(current.filter(Boolean).map(n => n.split('/')[0]));
    if (dirs.size !== 1 || current.some(n => !n.includes('/'))) break;
    const dir = [...dirs][0];
    strip += dir + '/';
    current = current.map(n => n.slice(dir.length + 1));
  }
  return strip;
}
function fileManifest(root) {
  const out = []; let bytes = 0;
  function scan(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) scan(p);
      else if (entry.isFile()) {
        const st = fs.statSync(p); bytes += st.size;
        out.push({ path: path.relative(root, p).split(path.sep).join('/'), size: st.size });
      }
    }
  }
  scan(root); return { files: out.sort((a,b) => a.path.localeCompare(b.path)), bytes };
}
function makeConfig(siteId, spa) {
  const hosting = { site: siteId, public: 'public', ignore: ['firebase.json', '**/node_modules/**'] };
  if (spa) hosting.rewrites = [{ source: '**', destination: '/index.html' }];
  return { hosting };
}
async function stageUpload({ projectId, siteId, files, spa }) {
  if (!validateId(projectId) || !validateId(siteId)) throw new Error('Invalid Firebase project or site ID');
  if (!files?.length) throw new Error('Choose a ZIP file or a website folder');
  if (files.length > MAX_FILES) throw new Error(`Maximum ${MAX_FILES} files per upload`);
  const isZip = files.length === 1 && (files[0].fieldname === 'archive' || /\.zip$/i.test(files[0].originalname));
  const publicDir = path.join(buildsDir, `${crypto.randomUUID()}-public`);
  fs.mkdirSync(publicDir, { recursive: true, mode: 0o700 });
  try {
    let entries = [];
    if (isZip) {
      const zip = new AdmZip(files[0].path);
      entries = zip.getEntries().filter(entry => !entry.isDirectory).map(e => ({ raw: e.entryName, size: e.header.size, entry: e }));
    } else {
      entries = files.map(f => ({ raw: f.originalname, size: f.size, file: f }));
    }
    if (entries.length > MAX_FILES) throw new Error(`Maximum ${MAX_FILES} files per upload`);
    if (!entries.length) throw new Error('Archive has no files');
    let total = 0;
    for (const e of entries) { e.name = safeName(e.raw); total += e.size; }
    if (total > LIMIT) throw new Error('Uncompressed website size cannot exceed 250 MB');
    const prefix = commonBase(entries.map(e => e.name));
    const used = new Set();
    for (const e of entries) {
      const relative = safeName(prefix ? e.name.slice(prefix.length) : e.name);
      if (used.has(relative)) throw new Error('Duplicate file names in upload');
      used.add(relative);
      const dest = path.resolve(publicDir, relative);
      if (!dest.startsWith(publicDir + path.sep)) throw new Error('Unsafe path in upload');
      fs.mkdirSync(path.dirname(dest), { recursive: true, mode: 0o700 });
      if (e.entry) {
        const content = e.entry.getData();
        if (content.length > LIMIT || content.length !== e.size) throw new Error('Invalid ZIP file size');
        fs.writeFileSync(dest, content, { mode: 0o600 });
      } else {
        fs.copyFileSync(e.file.path, dest);
      }
    }
    if (!fs.existsSync(path.join(publicDir, 'index.html'))) throw new Error('Website root must contain index.html. Upload your build/dist folder, not the source code.');
    const manifest = fileManifest(publicDir);
    const previous = getStaged(projectId, siteId);
    const record = { buildId: path.basename(publicDir), updatedAt: new Date().toISOString(),
      count: manifest.files.length, bytes: manifest.bytes, files: manifest.files, spa: Boolean(spa) };
    updateStaged(projectId, siteId, record);
    if (previous?.buildId && previous.buildId !== record.buildId) {
      // Leave old build for any currently running deploy. Cleanup can happen on process restart.
    }
    return record;
  } catch (err) {
    fs.rmSync(publicDir, { recursive: true, force: true }); throw err;
  }
}
function stagedPath(record) {
  if (!record?.buildId || !/^[a-f0-9-]+-public$/.test(record.buildId)) throw new Error('Invalid staged build');
  return path.join(buildsDir, record.buildId);
}
module.exports = { validateId, makeConfig, stageUpload, stagedPath };
