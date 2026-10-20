/* Presentation controls only; Firebase operations live in the existing bridge. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const bridge = window.LaunchpadBridge;
  const consentKey = 'pqc.launchpad.consent.v1';
  const mobile = window.matchMedia('(max-width:720px)');
  let consent = null;

  function closeWorkspace(restoreFocus = false) {
    $('workspacePanel').hidden = true;
    $('workspacePicker').setAttribute('aria-expanded', 'false');
    if (restoreFocus) $('workspacePicker').focus();
  }
  function renderWorkspace() {
    const {projects, projectFilter, loading} = bridge.state;
    const selected = projects.find(project => project.id === projectFilter);
    $('workspaceName').textContent = selected?.name || 'My workspace';
    $('workspaceDescription').textContent = selected ? selected.id : 'All Firebase projects';
    const list = $('workspaceProjects');
    list.replaceChildren();
    for (const project of [{id:'all', name:'All projects'}, ...projects]) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'workspace-option';
      button.textContent = project.name || project.id;
      button.setAttribute('aria-pressed', String(project.id === projectFilter));
      button.onclick = () => {
        bridge.state.projectFilter = project.id;
        $('projectFilter').value = project.id;
        closeWorkspace();
        bridge.setView('websites');
        $('pageTitle').focus();
      };
      list.append(button);
    }
    if (!projects.length) {
      const note = document.createElement('p');
      note.textContent = loading ? 'Loading your projects…' : 'Connect your account in Settings to see projects.';
      list.append(note);
    }
  }
  function setMenu(open, restoreFocus = false) {
    $('sidebar').classList.toggle('open', open);
    $('sidebarBackdrop').hidden = !open;
    $('mobileMenu').setAttribute('aria-expanded', String(open));
    $('mobileMenu').setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    $('sidebar').inert = mobile.matches && !open;
    if (open) $('workspacePicker').focus();
    else if (restoreFocus) $('mobileMenu').focus();
  }
  function applyConsent() {
    document.getElementById('optionalFonts')?.remove();
    if (consent === 'accepted') {
      const link = document.createElement('link');
      link.id = 'optionalFonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap';
      document.head.append(link);
    }
    document.body.classList.toggle('optional-fonts', consent === 'accepted');
    $('cookieBanner').hidden = consent !== null;
  }
  function saveConsent(value) {
    consent = value;
    try { localStorage.setItem(consentKey, value); }
    catch (error) {
      bridge.notify('Preference applies to this visit', 'Browser storage is unavailable. You may be asked again next time.', 'info');
    }
    applyConsent();
  }
  function showPrivacy() { openModal('privacyModal'); }
  function showTerms() { openModal('termsModal'); }
  $('workspacePicker').onclick = () => {
    const open = $('workspacePanel').hidden;
    $('workspacePanel').hidden = !open;
    $('workspacePicker').setAttribute('aria-expanded', String(open));
    if (open) $('workspacePanel').querySelector('button')?.focus();
  };
  $('projectFilter').addEventListener('change', renderWorkspace);
  window.addEventListener('launchpad:render', renderWorkspace);
  window.addEventListener('launchpad:navigate', () => { closeWorkspace(); setMenu(false); });
  window.addEventListener('launchpad:toggle-menu', () => setMenu(!$('sidebar').classList.contains('open')));
  $('sidebarBackdrop').onclick = () => setMenu(false, true);
  mobile.addEventListener('change', () => setMenu(false));
  document.addEventListener('click', event => {
    if (!event.target.closest('.workspace-switcher')) closeWorkspace();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !event.defaultPrevented) {
      if (!$('workspacePanel').hidden) closeWorkspace(true);
      else if ($('sidebar').classList.contains('open')) setMenu(false, true);
    }
    if (event.key !== 'Tab') return;
    const container = [...document.querySelectorAll('.modal-overlay.open')].pop()
      || (mobile.matches && $('sidebar').classList.contains('open') ? $('sidebar') : null);
    if (!container) return;
    const controls = [...container.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),[tabindex="0"]')]
      .filter(element => element.getClientRects().length && !element.closest('[hidden]'));
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && (document.activeElement === first || !container.contains(document.activeElement))) {
      event.preventDefault(); last?.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !container.contains(document.activeElement))) {
      event.preventDefault(); first?.focus();
    }
  });
  $('cookieAccept').onclick = () => saveConsent('accepted');
  $('cookieDecline').onclick = () => saveConsent('declined');
  $('cookieSettings').onclick = () => { $('cookieBanner').hidden = false; $('cookieDecline').focus(); };
  $('cookieDetails').onclick = showPrivacy;
  $('privacyDetails').onclick = showPrivacy;
  if ($('termsDetails')) $('termsDetails').onclick = showTerms;
  try {
    const saved = localStorage.getItem(consentKey);
    if (['accepted','declined'].includes(saved)) consent = saved;
  } catch (error) {
    bridge.notify('Browser storage unavailable', 'Cookie preferences will apply to this visit only.', 'info');
  }
  document.querySelectorAll('button[title]:not([aria-label])').forEach(button => button.setAttribute('aria-label', button.title));
  $('siteSearch').setAttribute('aria-label', 'Search websites');
  $('projectFilter').setAttribute('aria-label', 'Filter websites by project');
  $('deployFilter').setAttribute('aria-label', 'Filter deployments');
  $('copyLogs').disabled = true;
  $('downloadLogs').disabled = true;
  document.querySelector('.term-live').hidden = true;
  renderWorkspace();
  setMenu(false);
  applyConsent();
})();
