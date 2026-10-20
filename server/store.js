'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const dataDir = path.resolve(process.env.PANEL_DATA_DIR || path.join(__dirname, '..', 'data'));
const file = path.join(dataDir, 'state.json');
fs.mkdirSync(dataDir, { recursive: true, mode: 0o700 });
const defaultState = () => ({ staged: {}, jobs: [], prefs: { spa: true } });
let state = defaultState();
try { state = { ...defaultState(), ...JSON.parse(fs.readFileSync(file, 'utf8')) }; } catch (_) { /* initial setup */ }
for (const job of state.jobs) {
  if (job.status === 'running' || job.status === 'queued') {
    job.status = 'interrupted'; job.finishedAt = new Date().toISOString();
  }
}
function save() {
  fs.mkdirSync(dataDir, { recursive: true, mode: 0o700 });
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2), { mode: 0o600 });
  fs.renameSync(tmp, file);
}
save();
const siteKey = (p, s) => `${p}::${s}`;
function getStaged(p, s) { return state.staged[siteKey(p, s)] || null; }
function updateStaged(p, s, record) { state.staged[siteKey(p, s)] = record; save(); }
function newJob({ projectId, siteId, mode, channel }) {
  const job = { id: crypto.randomUUID(), projectId, siteId, mode, channel: channel || null,
    status: 'queued', startedAt: null, finishedAt: null, createdAt: new Date().toISOString(),
    previewUrl: null, error: null };
  state.jobs.unshift(job);
  state.jobs = state.jobs.slice(0, 150);
  save(); return job;
}
function updateJob(job, changes) { Object.assign(job, changes); save(); }
function getJob(id) { return state.jobs.find(job => job.id === id) || null; }
module.exports = { state, save, dataDir, siteKey, getStaged, updateStaged, newJob, updateJob, getJob };
