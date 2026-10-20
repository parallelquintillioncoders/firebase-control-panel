'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');
const AdmZip = require('adm-zip');
const { validateId } = require('./stage');
const LIMIT = 250 * 1024 * 1024;
function archiveName(raw) {
  const name = String(raw).replace(/^\//, '');
  if (!name || name.includes('\\') || name.includes(':') || /[\x00-\x1f]/.test(name) || name.split('/').some(p => !p || p === '.' || p === '..')) throw new Error('Unsafe website file path');
  return name;
}
function localArchive(root) {
  const zip = new AdmZip();
  let count = 0, bytes = 0;
  function scan(dir) {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, item.name);
      if (item.isSymbolicLink()) throw new Error('Cannot export symbolic links');
      if (item.isDirectory()) scan(file);
      else if (item.isFile()) {
        bytes += fs.statSync(file).size;
        if (++count > 2500 || bytes > LIMIT) throw new Error('Download limit: 2500 files / 250 MB');
        zip.addFile(archiveName(path.relative(root, file).split(path.sep).join('/')), fs.readFileSync(file));
      }
    }
  }
  scan(root);
  return zip.toBuffer();
}
function matchesHash(content, expected) {
  // Hosting hashes gzip content. Reject rewritten pages and files changed during export.
  for (const level of [9, 6, 1]) {
    const compressed = zlib.gzipSync(content, { level });
    for (const os of new Set([compressed[9], 3, 0, 10, 255])) {
      compressed[9] = os;
      if (crypto.createHash('sha256').update(compressed).digest('hex') === expected) return true;
    }
  }
  return false;
}
async function liveArchive(projectId, siteId, client, fetchFile = fetch) {
  if (!validateId(projectId) || !validateId(siteId)) throw new Error('Invalid site');
  const base = `/projects/${projectId}/sites/${siteId}`;
  await client.get(base); // Verify the selected project owns this site and the account has access.
  const { body: channel } = await client.get(`${base}/channels/live`);
  const version = channel.release?.version?.name;
  if (!version || channel.release?.type === 'SITE_DISABLE') throw new Error('This site has no active live release to download.');
  if (!new RegExp(`^(projects/[^/]+/)?sites/${siteId}/versions/[^/]+$`).test(version)) throw new Error('Unexpected Hosting version');
  const files = [], seen = new Set();
  let pageToken;
  do {
    const { body } = await client.get(`/${version}/files`, { queryParams: { pageSize: 1000, ...(pageToken ? { pageToken } : {}) } });
    files.push(...(body.files || []));
    if (files.length > 2500) throw new Error('Download limit: 2500 files');
    pageToken = body.nextPageToken;
    if (pageToken && seen.has(pageToken)) throw new Error('Invalid file listing pagination');
    seen.add(pageToken);
  } while (pageToken);
  if (!files.length) throw new Error('No static files found in the live release.');
  const zip = new AdmZip();
  const reservedFiles = [];
  let total = 0;
  for (const file of files) {
    const name = archiveName(file.path);
    // Firebase's reserved routes take precedence over uploaded static files.
    // Their public response cannot recover the original deployed bytes.
    if (name.startsWith('__/')) {
      reservedFiles.push('/' + name);
      continue;
    }
    const origin = `https://${siteId}.web.app`;
    let url = new URL('/' + name.split('/').map(encodeURIComponent).join('/'), origin);
    let response;
    for (let i = 0; i < 6; i++) {
      response = await fetchFile(url, { redirect: 'manual', signal: AbortSignal.timeout(30000) });
      if (![301, 302, 303, 307, 308].includes(response.status)) break;
      const location = response.headers.get('location');
      await response.body?.cancel();
      if (!location) throw new Error(`Invalid redirect: ${name}`);
      url = new URL(location, url);
      if (url.origin !== origin) throw new Error(`Cannot recover redirected file: ${name}. Use the original build.`);
    }
    if (!response.ok) throw new Error(`Cannot download ${name} (HTTP ${response.status}). Use the original build.`);
    const chunks = [];
    for await (const chunk of response.body) {
      total += chunk.length;
      if (total > LIMIT) throw new Error('Download limit: 250 MB');
      chunks.push(Buffer.from(chunk));
    }
    const content = Buffer.concat(chunks);
    if (!matchesHash(content, file.hash)) throw new Error(`Could not verify ${name} against the published build. Hosting routing, compression or a newer release may prevent recovery. Download the uploaded build or use your original files.`);
    zip.addFile(name, content);
  }
  const { body: latest } = await client.get(`${base}/channels/live`);
  if (latest.release?.version?.name !== version) throw new Error('Website changed during download. Please retry.');
  if (!zip.getEntries().length) throw new Error('This release contains only Firebase reserved files; no recoverable static website files were found.');
  if (reservedFiles.length) {
    // Never overwrite a website file that happens to use our report name.
    let reportName = 'LAUNCHPAD-EXPORT-NOTES.txt';
    while (zip.getEntry(reportName)) reportName = 'LAUNCHPAD-' + reportName;
    zip.addFile(reportName, Buffer.from([
      'Firebase Hosting static website export',
      `Site: ${siteId}`, `Release: ${version}`, '',
      'The static website files in this ZIP passed the published-build hash check.',
      'This is not a complete copy of the original deployment archive.',
      'The following uploaded paths were omitted because Firebase reserves /__/ URLs',
      'and serves its own runtime responses instead of the original uploaded bytes:',
      ...reservedFiles.map(name => '  ' + name), '',
      'Firebase Hosting supplies these runtime URLs when the website runs on Firebase.',
      'Local previews and other hosts may need Firebase SDK/configuration setup.',
      'Original files hidden by these reserved routes cannot be recovered through their public URLs.',
      'No original source project, backend, database, or Hosting configuration is included.',
      'Reference: https://firebase.google.com/docs/hosting/reserved-urls', ''
    ].join('\n')));
  }
  return zip.toBuffer();
}
module.exports = { localArchive, liveArchive, archiveName, matchesHash };
