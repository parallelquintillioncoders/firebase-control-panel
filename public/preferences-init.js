/* Apply saved appearance before styles load to avoid a flash of the wrong theme. */
(() => {
  'use strict';
  const defaults = {theme:'flame',mode:'light',language:'en'};
  const allowed = {theme:['flame','classic'],mode:['light','dark'],language:['en','es','ru','fr','de','pt','ar','zh']};
  let preferences = {...defaults};
  try {
    const saved = JSON.parse(localStorage.getItem('pqc.preferences.v1') || '{}');
    for (const key of Object.keys(defaults)) if (allowed[key].includes(saved?.[key])) preferences[key]=saved[key];
  } catch (error) {
    // Corrupt or unavailable browser storage must never block the dashboard.
    window.pqcPreferenceStorageUnavailable = true;
  }
  window.PQCPreferences = {values:preferences,allowed};
  document.documentElement.dataset.theme=preferences.theme;
  document.documentElement.dataset.mode=preferences.mode;
  document.documentElement.lang=preferences.language;
  document.documentElement.dir=preferences.language==='ar'?'rtl':'ltr';
})();
