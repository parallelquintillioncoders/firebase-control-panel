'use strict';
// Separate process so account switches/logout never reuse cached CLI credentials.
const fs = require('fs');
const { getProjectDefaultAccount, setActiveAccount } = require('firebase-tools/lib/auth');
const { requireAuth } = require('firebase-tools/lib/requireAuth');
const { Client } = require('firebase-tools/lib/apiv2');
const { liveArchive } = require('./download');
(async () => {
  const [projectId, siteId, output] = process.argv.slice(2);
  const options = { project: projectId, nonInteractive: true };
  const account = getProjectDefaultAccount(process.cwd());
  if (account) setActiveAccount(options, account);
  await requireAuth(options);
  const client = new Client({ urlPrefix: 'https://firebasehosting.googleapis.com', apiVersion: 'v1beta1', auth: true });
  fs.writeFileSync(output, await liveArchive(projectId, siteId, client), { mode: 0o600 });
})().catch(error => { console.error(error.message); process.exitCode = 1; });
