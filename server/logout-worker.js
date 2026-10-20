'use strict';

// Run Firebase's logout action without the CLI command wrapper's process.exit().
// Let Node drain its Windows handles naturally after token revocation completes.
async function main() {
  const { logoutAction } = require('firebase-tools/lib/commands/logout');
  const { getAllAccounts } = require('firebase-tools/lib/auth');
  const { configstore } = require('firebase-tools/lib/configstore');
  await logoutAction(undefined, { nonInteractive: true });
  if (getAllAccounts().length || configstore.get('tokens')) {
    throw new Error('Firebase accounts are still connected. Logout could not be verified.');
  }
}

main().catch(error => {
  console.error(error.message || 'Firebase logout failed.');
  process.exitCode = 1;
});
