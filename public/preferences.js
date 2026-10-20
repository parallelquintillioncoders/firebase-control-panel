(() => {
  'use strict';
  const root=document.documentElement;
  const {values,allowed}=window.PQCPreferences;
  const translations=window.PQCTranslations;
  const originals=new WeakMap();
  const attributes=new WeakMap();
  const t=text=>translations[values.language]?.[text] || text;
  // Never translate user-provided names, file contents, URLs or diagnostic output.
  const contentSelector='script,style,svg,pre,code,textarea,input,.site-card-name,.site-url,.site-card-meta strong,.job-row-body strong,.log-job strong,.file-list,.site-modal-meta,#workspaceName,#workspaceDescription,#workspaceProjects,#googleAccountLabel,#googleAccountPills,#accountPanelEmail,#settingsStorage,#settingsEndpoint,#settingsLocalAddress,#logTitle,#logSubtitle,#siteModalTitle,#siteModalSubtitle,#chosenLabel,.ez-message,.create-site-result';
  function translateNode(node) {
    const parent=node.parentElement;
    if(!parent || parent.closest(contentSelector))return;
    if(parent.tagName==='OPTION' && parent.value && !parent.parentElement.matches('[data-preference="theme"],[data-preference="mode"],#deployFilter') && !(parent.parentElement.id==='projectFilter'&&parent.value==='all'))return;
    const current=node.nodeValue;
    let record=originals.get(node);
    if(!record || current!==record.last) {
      const source=current.trim();
      if(!translations.en[source]&&!source.startsWith('Connected: ')) { originals.delete(node);return; }
      record={source,prefix:current.match(/^\s*/)[0],suffix:current.match(/\s*$/)[0]};
    }
    const translated=record.source.startsWith('Connected: ')?t('Connected')+': '+record.source.slice(11):t(record.source);
    const next=record.prefix+translated+record.suffix;
    if(node.nodeValue!==next)node.nodeValue=next;
    record.last=next;originals.set(node,record);
  }
  let scheduled=false;
  const observer=new MutationObserver(()=>{
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;translatePage();});
  });
  const observe=()=>observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['title','aria-label','placeholder']});
  function translatePage() {
    observer.disconnect();
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    let node;while((node=walker.nextNode()))translateNode(node);
    document.querySelectorAll('[title],[aria-label],[placeholder]').forEach(element=>{
      let records=attributes.get(element)||{};
      for(const name of ['title','aria-label','placeholder']) {
        const current=element.getAttribute(name);
        if(current===null)continue;
        let record=records[name];
        if(!record || current!==record.last)record={source:current};
        const next=t(record.source);
        if(current!==next)element.setAttribute(name,next);
        record.last=next;records[name]=record;
      }
      attributes.set(element,records);
    });
    observe();
  }
  function apply() {
    root.dataset.theme=values.theme;
    root.dataset.mode=values.mode;
    root.lang=values.language;
    root.dir=values.language==='ar'?'rtl':'ltr';
    document.querySelectorAll('[data-preference]').forEach(select=>select.value=values[select.dataset.preference]);
    document.querySelectorAll('[data-mode-toggle]').forEach(button=>{
      button.setAttribute('aria-label',values.mode==='dark'?'Switch to light mode':'Switch to dark mode');
      button.setAttribute('aria-pressed',String(values.mode==='dark'));
      button.querySelector('span').textContent=values.mode==='dark'?'Light mode':'Dark mode';
    });
    document.querySelector('meta[name="theme-color"]').content=values.mode==='dark'?'#171513':values.theme==='flame'?'#b94700':'#555cde';
    translatePage();
  }
  function save() {
    try {localStorage.setItem('pqc.preferences.v1',JSON.stringify(values));}
    catch(error) {window.LaunchpadBridge?.notify('Preferences apply to this visit','Browser storage is unavailable. Your selection cannot be saved.','info');}
  }
  document.querySelectorAll('[data-preference]').forEach(select=>select.addEventListener('change',()=>{
    const key=select.dataset.preference;
    if(!allowed[key].includes(select.value))return;
    values[key]=select.value;apply();save();updateAccount();
  }));
  document.querySelectorAll('[data-mode-toggle]').forEach(button=>button.addEventListener('click',()=>{
    values.mode=values.mode==='dark'?'light':'dark';apply();save();
  }));
  const accountButton=document.getElementById('accountMenuButton');
  const accountPanel=document.getElementById('accountPanel');
  function updateAccount() {
    const status=window.LaunchpadBridge?.state.authStatus;
    const connected=Boolean(status?.signedIn);
    document.getElementById('accountPanelEmail').textContent=status?.accounts?.join(', ')||t('Google account not connected');
    document.getElementById('accountPanelStatus').textContent=t(!status?'Checking connection':connected?'Connected':'Not signed in');
    accountButton.textContent=status?.accounts?.[0]?.slice(0,2).toUpperCase()||'?';
    for(const id of ['accountLogin','accountLoginTop'])document.getElementById(id).hidden=!status||connected;
    for(const id of ['accountLogout','logoutBtn'])document.getElementById(id).hidden=!connected;
  }
  function closeAccount(focus=false) {
    accountPanel.hidden=true;accountButton.setAttribute('aria-expanded','false');
    if(focus)accountButton.focus();
  }
  function fitAccountPanel() {
    if(!accountPanel.hidden)accountPanel.style.maxHeight=`${Math.max(100,window.innerHeight-accountPanel.getBoundingClientRect().top-16)}px`;
  }
  accountButton.onclick=()=>{
    const open=accountPanel.hidden;updateAccount();
    accountPanel.hidden=!open;accountButton.setAttribute('aria-expanded',String(open));
    fitAccountPanel();
    if(open)accountPanel.querySelector('button').focus();
  };
  window.addEventListener('resize',fitAccountPanel);
  document.getElementById('accountClose').onclick=()=>closeAccount(true);
  for(const id of ['accountLogin','accountLoginTop']) {
    document.getElementById(id).onclick=async()=>{
      closeAccount();
      const bridge=window.LaunchpadBridge;
      bridge.setView('settings');
      document.getElementById('connectGoogle').focus();
      await bridge.openGoogleLogin();
    };
  }
  document.getElementById('accountLogout').onclick=()=>window.LaunchpadBridge.logout(document.getElementById('accountLogout'));
  document.getElementById('accountCookies').onclick=()=>{
    closeAccount();
    document.getElementById('cookieSettings').click();
  };
  accountPanel.addEventListener('focusout',event=>{
    if(event.relatedTarget&&!accountPanel.contains(event.relatedTarget)&&event.relatedTarget!==accountButton)closeAccount();
  });
  document.addEventListener('click',event=>{
    if(!accountPanel.contains(event.target)&&!accountButton.contains(event.target))closeAccount();
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&!accountPanel.hidden){event.preventDefault();closeAccount(true);}
  });
  window.addEventListener('launchpad:navigate',()=>closeAccount());
  window.addEventListener('launchpad:auth',updateAccount);
  window.PQCI18n={t,refresh:translatePage};
  apply();
  updateAccount();
})();
