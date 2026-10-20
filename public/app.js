/* Launchpad UI — no framework or build step required. */
'use strict';
const $ = id => document.getElementById(id);
const icon = (id, extra='') => `<svg class="icon ${extra}"><use href="#i-${id}"/></svg>`;
const escapeHTML = x => String(x ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtSize = bytes => { const n=Number(bytes)||0; return n<1024?`${n} B`:n<1048576?`${(n/1024).toFixed(1)} KB`:`${(n/1048576).toFixed(1)} MB`; };
const fmtDate = date => date ? new Date(date).toLocaleString(document.documentElement.lang || 'en', { day:'numeric',month:'short',hour:'2-digit',minute:'2-digit' }) : '—';
const relative = date => { if(!date)return 'Never'; const s=Math.floor((Date.now()-new Date(date).getTime())/1000); return s<55?'Just now':s<3600?`${Math.floor(s/60)} min ago`:s<86400?`${Math.floor(s/3600)} hr ago`:fmtDate(date); };
const validUrl = url => {
  if (!url) return '#';
  const full = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  try { const u = new URL(full); return ['https:','http:'].includes(u.protocol) ? u.href : '#'; }
  catch (_) { return '#'; }
};
const state = {
  view:'overview', projects:[], sites:[], builds:[], jobs:[], health:null, settings:null,
  siteErrors:[], loading:true, projectError:null, siteSearch:'', projectFilter:'all', deployFilter:'all',
  selectedSite:null, selectedTab:'build', selectedJob:null, jobLogs:[], stream:null,
  uploadFiles:[], uploadMode:null, uploadBusy:false, pendingDeploy:null, refreshCount:0, authStatus:null, loginPoll:null, loginPanelActive:false
};

async function api(route, options={}) {
  let res;
  try { res = await fetch('/api'+route, {credentials:'same-origin',headers:options.body && !(options.body instanceof FormData) ? {'Content-Type':'application/json'} : {}, ...options}); }
  catch(error){ throw new Error('Cannot reach dashboard backend. Is the Node server running?'); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}
function notify(title, message='', type='info') {
  const stack=$('toastStack'), el=document.createElement('div'); el.className=`toast ${type}`;
  el.innerHTML=`${icon(type==='error'?'alert':type==='success'?'check':'info')}<div class="toast-content"><strong>${escapeHTML(title)}</strong>${escapeHTML(message)}</div><button aria-label="Dismiss">${icon('x')}</button>`;
  el.querySelector('button').onclick=()=>el.remove(); stack.prepend(el);setTimeout(()=>el.remove(),6200);
}
const modalTriggers=new Map();
function openModal(id){
  const el=$(id);
  modalTriggers.set(id,document.activeElement);
  el.classList.add('open');el.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
  el.querySelector('button:not(:disabled),input,select,[tabindex="0"]')?.focus();
}
function closeModal(id){
  const el=$(id),wasOpen=el.classList.contains('open');
  el.classList.remove('open');el.setAttribute('aria-hidden','true');
  if(!document.querySelector('.modal-overlay.open'))document.body.style.overflow='';
  if(wasOpen)modalTriggers.get(id)?.focus();
  modalTriggers.delete(id);
}
function setButtonBusy(btn,busy,text){btn.disabled=busy;if(text)btn.innerHTML=(busy?icon('refresh'):'')+escapeHTML(text);}
function buildFor(p,s){return state.builds.find(x=>x.projectId===p&&x.siteId===s);}
function siteFor(p,s){return state.sites.find(x=>x.projectId===p&&x.id===s);}
function getSelectedSite(){return state.selectedSite?siteFor(state.selectedSite.projectId,state.selectedSite.siteId):null;}

async function boot(){
  try {
    const session=await api('/boot');
    if(session.requiresAuth&&!session.authenticated){openModal('authModal');$('authPassword').focus();return;}
    await refreshAll();
  }catch(error){state.projectError=error.message;state.loading=false;render();notify('Connection unavailable',error.message,'error');}
}
async function refreshAll(){
  const serial=++state.refreshCount;
  state.loading=true;render();
  const [health,builds,jobs]=await Promise.allSettled([api('/health'),api('/staged'),api('/jobs')]);
  if(serial!==state.refreshCount)return;
  if(health.status==='fulfilled')state.health=health.value;
  refreshLoginStatus().catch(()=>{});
  if(builds.status==='fulfilled')state.builds=builds.value.builds||[];
  if(jobs.status==='fulfilled')state.jobs=jobs.value.jobs||[];
  render();
  try {
    const data=await api('/projects');
    if(serial!==state.refreshCount)return;
    state.projects=data.projects||[];state.projectError=null;
    state.sites=[];state.siteErrors=[];
    render();
    // Per-project refresh means one broken project's credentials don't hide other projects.
    const resolved=await Promise.allSettled(state.projects.map(async project=>{
      const result=await api('/sites?projectId='+encodeURIComponent(project.id));
      return result.sites.map(site=>({...site,projectId:project.id,projectName:project.name}));
    }));
    if(serial!==state.refreshCount)return;
    resolved.forEach((r,i)=>{
      if(r.status==='fulfilled') state.sites.push(...r.value);
      else state.siteErrors.push(`${state.projects[i].name}: ${r.reason.message}`);
    });
    state.sites.sort((a,b)=>a.name.localeCompare(b.name));
  }catch(error){
    if(serial!==state.refreshCount)return;
    state.projectError=error.message;state.projects=[];state.sites=[];
  }finally {
    if(serial===state.refreshCount){state.loading=false;render();refreshLoginStatus().catch(()=>{});}
  }
}
function setView(view, updateHistory=true){
  const allowed=['overview','websites','deployments','logs','settings'];if(!allowed.includes(view))return;
  state.view=view;
  if(updateHistory && location.hash!=='#'+view)history.pushState(null,'','#'+view);
  document.querySelectorAll('.nav-item[data-view]').forEach(el=>{
    el.classList.toggle('active',el.dataset.view===view);
    if(el.dataset.view===view)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');
  });
  document.querySelectorAll('.view').forEach(el=>el.classList.toggle('active',el.id==='view-'+view));
  const titles={overview:['Good to see you','Manage all your Firebase websites from one beautiful dashboard.'],websites:['Your websites','Every Hosting site across the Firebase projects you can access.'],deployments:['Deployment center','A complete history of your production and preview releases.'],logs:['Activity & logs','Real-time command output, deployment history and error details.'],settings:['Settings & setup','Connect the Firebase CLI and manage your deployment environment.']};
  const labels={overview:'Overview',websites:'Websites',deployments:'Deployments',logs:'Activity logs',settings:'Settings & setup'};
  $('breadcrumb').textContent=labels[view];$('pageTitle').innerHTML=escapeHTML(titles[view][0])+(view==='overview'?' <span class="wave">✳</span>':'');$('pageSubtitle').textContent=titles[view][1];
  $('headerUpload').style.display=(view==='logs'||view==='settings')?'none':'';
  $('sidebar').classList.remove('open');
  window.dispatchEvent(new Event('launchpad:navigate'));
  render();document.getElementById('pageScroll').scrollTo?.({top:0,behavior:'smooth'});window.scrollTo({top:0,behavior:'instant'});
}
function pill(status){const variants={success:['green','Success'],failed:['red','Failed'],running:['orange','Running'],queued:['purple','Queued'],interrupted:['red','Interrupted']};const [color,label]=variants[status]||['gray',status||'Unknown'];return `<span class="pill pill-${color}">${escapeHTML(label)}</span>`;}
function render(){
  $('statSites').textContent=state.loading&&state.sites.length===0?'…':state.sites.length;
  $('statStaged').textContent=state.builds.length;
  $('statSuccess').textContent=state.jobs.filter(j=>j.status==='success').length;
  $('statActive').textContent=state.jobs.filter(j=>['running','queued'].includes(j.status)).length;
  $('siteNavCount').textContent=state.sites.length;
  const ready=state.health?.cli==='ready';
  $('cliIndicator').className='cli-status '+(ready?'connected':state.health?'failed':'');
  $('cliIndicator').innerHTML=`<span class="status-bullet"></span><span>${ready?'Firebase CLI ready':state.health?'CLI not found':'Checking connection'}</span>`;
  $('sidebarCliLabel').textContent=ready?'Firebase CLI connected':state.health?'Firebase CLI unavailable':'Checking Firebase CLI';
  document.querySelector('.footer-dot').classList.toggle('ready',ready);
  ['stepCli','stepSite','stepBuild'].forEach((id,i)=>$(id).classList.toggle('complete', i===0?ready:i===1?state.sites.length>0:state.jobs.some(j=>j.status==='success'&&j.mode==='live')));
  renderSites();renderJobs();renderSettings();
  window.dispatchEvent(new Event('launchpad:render'));
}
function siteCard(site,i){
  const build=buildFor(site.projectId,site.id), key=`data-project="${escapeHTML(site.projectId)}" data-site="${escapeHTML(site.id)}"`;
  const shade=['','teal','blue'][i%3];
  const liveUrl=validUrl(site.url || `https://${site.id}.web.app`);
  return `<article class="site-card"><div class="site-card-top"><span class="site-icon ${shade}">${icon('globe')}</span>${build?'<span class="pill pill-green">Build ready</span>':'<span class="pill pill-gray">No local build</span>'}</div><h3 class="site-card-name">${escapeHTML(site.name)}</h3><div class="site-url">${icon('link')}<a href="${escapeHTML(liveUrl)}" target="_blank" rel="noopener noreferrer" title="Open live website">${escapeHTML(site.url.replace(/^https?:\/\//,''))}</a></div><div class="site-card-middle"><div class="site-card-meta">FIREBASE PROJECT<strong title="${escapeHTML(site.projectName)}">${escapeHTML(site.projectName||site.projectId)}</strong></div><div class="site-card-meta" style="text-align:right">STAGED BUILD<strong>${build?`${build.count} files · ${fmtSize(build.bytes)}`:'Not uploaded'}</strong></div></div><div class="site-card-actions"><button class="btn ${build?'btn-outline':'btn-primary'} btn-small" data-action="${build?'inspect':'upload'}" ${key}>${icon(build?'eye':'upload')} ${build?'View & deploy':'Upload build'}</button><button class="btn btn-outline btn-small" title="Website downloads and details" data-action="inspect" ${key}>${icon('download')} Download</button><a class="icon-btn site-live-btn" href="${escapeHTML(liveUrl)}" target="_blank" rel="noopener noreferrer" title="Open live website" aria-label="Open live website">${icon('external')}</a></div></article>`;
}
function placeholder(message,detail,buttonLabel,action){return `<div class="site-placeholder"><span class="placeholder-icon">${icon('globe')}</span><h3>${escapeHTML(message)}</h3><p>${escapeHTML(detail)}</p>${buttonLabel?`<button class="btn btn-outline btn-small" data-action="${action}">${escapeHTML(buttonLabel)} ${icon('arrow')}</button>`:''}</div>`;}
function renderSites(){
  const all=state.sites;
  let feature=all.slice(0,3).map(siteCard).join('');
  if(!all.length){
    const issue=state.projectError;
    feature=placeholder(state.loading?'Loading Firebase websites...':issue?'Firebase connection needed':'No Hosting sites found',state.loading?'Discovering websites from your Firebase account.':issue?issue:state.projects.length?'No Hosting sites were returned. Create a site in Firebase Console, then click Refresh.':'Connect your Firebase account to display all accessible websites.',state.loading?null:'Open setup guide','settings');
    if(!state.loading)feature+=placeholder('Ready when you are','Upload a ZIP or build folder after connecting to Firebase.','View setup steps','settings');
  }else if(all.length<3){feature+=placeholder('More sites, one dashboard','Additional Hosting sites will automatically appear when you refresh.','See all sites','websites');}
  $('featuredSites').innerHTML=feature;
  const search=state.siteSearch.trim().toLowerCase();let filtered=all.filter(s=>(state.projectFilter==='all'||state.projectFilter===s.projectId) && (!search||`${s.name} ${s.projectId} ${s.projectName} ${s.url}`.toLowerCase().includes(search)));
  $('allSites').innerHTML=filtered.length?filtered.map(siteCard).join(''):placeholder(state.loading?'Loading...':'No websites match',state.projectError||'Change your filters, refresh, or check Firebase Hosting configuration.', 'Refresh websites','refresh');
  const html='<option value="all">All projects</option>'+state.projects.map(p=>`<option value="${escapeHTML(p.id)}">${escapeHTML(p.name)}</option>`).join('');
  if($('projectFilter').innerHTML!==html){$('projectFilter').innerHTML=html;$('projectFilter').value=state.projectFilter;}
}
function jobRow(j){return `<div class="job-row" role="button" tabindex="0" data-action="job" data-id="${escapeHTML(j.id)}"><span class="job-symbol">${icon(j.mode==='preview'?'eye':'rocket')}</span><div class="job-row-body"><strong>${escapeHTML(j.siteId)}</strong><span>${j.mode==='preview'?'Preview release':'Production release'} · ${escapeHTML(j.projectId)}</span></div><div class="job-row-side">${pill(j.status)}<small>${relative(j.createdAt)}</small></div></div>`;}
function renderJobs(){
  $('recentJobs').innerHTML=state.jobs.length?state.jobs.slice(0,3).map(jobRow).join(''):'<div class="empty-inline"><strong>No deployments yet</strong>Your deployment history and logs will appear here after your first release.</div>';
  const filtered=state.jobs.filter(j=>state.deployFilter==='all'||(state.deployFilter==='failed'?['failed','interrupted'].includes(j.status):state.deployFilter===j.mode));
  $('deployTable').innerHTML=filtered.length?filtered.map(j=>`<tr><td><div class="table-icon-title"><span class="table-icon">${icon('globe')}</span><div><strong>${escapeHTML(j.siteId)}</strong><small>${escapeHTML(j.projectId)}</small></div></div></td><td>${escapeHTML(j.mode==='preview'?'Preview channel':'Production')}</td><td>${pill(j.status)}</td><td>${fmtDate(j.startedAt||j.createdAt)}</td><td>${fmtDate(j.finishedAt)}</td><td><button class="tiny-link" data-action="job" data-id="${escapeHTML(j.id)}">View logs →</button></td></tr>`).join(''):`<tr><td colspan="6"><div class="empty-inline"><strong>No deployments to display</strong>Release history is recorded automatically when you deploy through this panel.</div></td></tr>`;
  $('logJobList').innerHTML=state.jobs.length?state.jobs.map(j=>`<button class="log-job ${j.id===state.selectedJob?'active':''}" data-action="job" data-id="${escapeHTML(j.id)}"><span class="log-job-icon">${icon(j.mode==='preview'?'eye':'terminal')}</span><div><strong>${escapeHTML(j.siteId)}</strong><small>${relative(j.createdAt)} · ${j.mode==='preview'?'Preview':'Production'}</small></div>${pill(j.status)}</button>`).join(''):'<div class="empty-inline">No deployments recorded yet.</div>';
}
function renderSettings(){
  const ready=state.health?.cli==='ready';
  $('settingsCliBadge').className=`pill ${ready?'pill-green':state.health?'pill-orange':'pill-gray'}`;
  $('settingsCliBadge').textContent=ready?'Installed':state.health?'Unavailable':'Checking';
  $('settingsCliStatus').textContent=ready?'Installed':state.health?'Check setup':'Checking';
  $('settingsCliVersion').textContent=ready?`Firebase CLI v${state.health.version}`:state.health?.error||'Checking CLI installation...';
  $('settingsAuth').textContent=state.health?.authMethod==='service-account'?'Server-side service account':'Google account via the bundled Firebase CLI';
  updateProjectSelect();
  $('settingsStorage').textContent=state.health?.dataDirectory||'Local filesystem';
  $('settingsEndpoint').textContent=location.origin;
  $('settingsLocalAddress').textContent=location.host;
}
// Firebase authentication and new Hosting site setup.
let lastAuthEmail='';
function updateProjectSelect(){
  const el=$('newSiteProject');if(!el)return;
  const current=el.value;
  const placeholder=state.projects.length?'Choose project':state.loading?'Loading projects…':'No projects available — connect or create one';
  el.innerHTML=`<option value="">${placeholder}</option>`+state.projects.map(p=>`<option value="${escapeHTML(p.id)}">${escapeHTML(p.name||p.id)} (${escapeHTML(p.id)})</option>`).join('');
  el.disabled=!state.projects.length;
  if(state.projects.some(p=>p.id===current))el.value=current;
}
async function refreshLoginStatus(){
  try {
    const status=await api('/auth/status');state.authStatus=status;
    const badge=$('googleStatusBadge'); badge.className=`pill ${status.signedIn?'pill-green':'pill-orange'}`; badge.textContent=status.signedIn?'Connected':'Not signed in';
    $('googleAccountLabel').textContent=status.signedIn?status.accounts.join(', '):'Google account not connected';
    $('googleAccountHint').textContent=status.signedIn?'Firebase CLI credentials are saved by Firebase on this machine.':'Click Connect Google Account to authorize access.';
    $('googleAccountPills').innerHTML=status.accounts.map(x=>`<span class="pill pill-green">${escapeHTML(x)}</span>`).join('');
    window.dispatchEvent(new Event('launchpad:auth'));
    if(state.loginPanelActive) {
      const proc=status.process;
      if(proc){
        $('loginConsole').textContent=(proc.lines||[]).join('\n')||'Waiting for the Firebase CLI to respond…';
        $('codeLoginStatus').textContent=proc.status;
        $('codeLoginStatus').className=`pill ${proc.status==='success'?'pill-green':proc.status==='failed'?'pill-red':'pill-purple'}`;
        $('loginConsole').scrollTop=$('loginConsole').scrollHeight;
      }
    }
    if(status.signedIn && !lastAuthEmail){lastAuthEmail=status.accounts[0]||'connected';if(state.projectError)refreshAll().catch(()=>{});}
    if(!status.signedIn)lastAuthEmail='';
  } catch(e){$('googleAccountHint').textContent=e.message;}
}
async function openGoogleLogin(){
  const button=$('connectGoogle');button.disabled=true;
  try{
    if(/Windows/i.test(navigator.userAgent)){
      const result=await api('/auth/connect',{method:'POST',body:'{}'});
      if(!result.opened)throw new Error('Google sign-in window was not started. Use Alternative code login.');
      $('connectInfo').textContent=result.message+' The dashboard will automatically check your connection.';
      notify('Google sign-in started','Finish approval in Chrome. If you do not see a sign-in window, use Alternative code login.','info');
    }else{
      await openCodeLogin();
    }
    startLoginPolling();
  }catch(e){notify('Login could not start',e.message,'error');}
  finally{button.disabled=false;}
}
async function openCodeLogin(){
  $('codeLogin').hidden=false;state.loginPanelActive=true;
  try {
    await api('/auth/embedded',{method:'POST',body:'{}'});
    startLoginPolling(); await refreshLoginStatus();
    $('loginResponse').focus();
  }catch(e){notify('Code-based login failed',e.message,'error');}
}
async function sendLoginInput(){
  const value=$('loginResponse').value;
  if(!value.trim())return;
  try{await api('/auth/input',{method:'POST',body:JSON.stringify({value})});$('loginResponse').value='';await refreshLoginStatus();}
  catch(e){notify('Could not send login response',e.message,'error');}
}
function startLoginPolling(){
  if(state.loginPoll)clearInterval(state.loginPoll);
  let checks=0;
  state.loginPoll=setInterval(async()=>{
    if(++checks>120){clearInterval(state.loginPoll);state.loginPoll=null;return;}
    await refreshLoginStatus();
    if(state.authStatus?.signedIn){clearInterval(state.loginPoll);state.loginPoll=null;notify('Firebase account connected','Your projects and Hosting sites can now load.','success');await refreshAll();}
  },5000);
}
async function createFirebaseProject(){
  const displayName=$('newProjectName').value.trim(),projectId=$('newProjectId').value.trim();
  if(!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(projectId))return notify('Invalid project ID','Use 6–30 lowercase characters; begin with a letter and end with a letter or digit.','error');
  if(displayName.length<3 || displayName.length>90)return notify('Invalid name','Project name must be 3–90 characters.','error');
  if(!confirm(`Create a new Firebase project in your Google account?\n\n${displayName}\nID: ${projectId}`))return;
  const button=$('createProjectBtn');button.disabled=true;$('createProjectResult').textContent='Creating Firebase project…';
  try{
    await api('/projects/create',{method:'POST',body:JSON.stringify({projectId,displayName})});
    $('createProjectResult').textContent='Project created. Next, create a Hosting site for this project.';
    notify('Firebase project created',projectId+' is ready. Now create a Hosting site.','success');
    await refreshAll();$('newSiteProject').value=projectId;
  }catch(e){$('createProjectResult').textContent='Error: '+e.message;notify('Could not create project',e.message,'error');}
  finally{button.disabled=false;}
}
async function createHostingSite(){
  const projectId=$('newSiteProject').value;
  const siteId=$('newSiteId').value.trim();
  if(!projectId)return notify('Choose a project','Connect Google and select a Firebase project.','error');
  if(!/^[a-z0-9][a-z0-9-]{0,28}[a-z0-9]$/.test(siteId))return notify('Invalid site ID','Use 2–30 lowercase letters, numbers and hyphens; start/end with a letter or number.','error');
  if(!confirm(`Create a real Firebase Hosting site?\n\nProject: ${projectId}\nSite ID: ${siteId}\nURL: https://${siteId}.web.app`))return;
  const btn=$('createSiteBtn');btn.disabled=true;$('createSiteResult').textContent='Creating the Hosting site in Firebase…';
  try{
    await api('/hosting/create',{method:'POST',body:JSON.stringify({projectId,siteId})});
    $('createSiteResult').textContent=`Created: https://${siteId}.web.app (propagation may take a few minutes)`;
    notify('Hosting site created',siteId+' was created in Firebase. Refreshing websites…','success');
    await refreshAll();setView('websites');
  }catch(e){$('createSiteResult').textContent='Error: '+e.message;notify('Cannot create Hosting site',e.message,'error');}
  finally{btn.disabled=false;}
}
function updateSelect(select,items,placeholder,selected){select.innerHTML=`<option value="">${escapeHTML(placeholder)}</option>`+items.map(item=>`<option value="${escapeHTML(item.id)}">${escapeHTML(item.name)}</option>`).join('');if(selected&&items.some(x=>x.id===selected))select.value=selected;}
function openUpload(projectId='',siteId=''){
  const desired=projectId||state.selectedSite?.projectId||state.projects[0]?.id||'';
  updateSelect($('uploadProject'),state.projects,'Select a project',desired);
  syncUploadSites(siteId||state.selectedSite?.siteId);
  resetUpload();openModal('uploadModal');
  if(!state.projects.length){notify('Firebase account not connected','See Settings & setup for the Firebase CLI login steps.','info');}
}
function syncUploadSites(preselected=''){
  const p=$('uploadProject').value;
  updateSelect($('uploadSite'),state.sites.filter(s=>s.projectId===p),'Select a website',preselected);
}
function resetUpload(){state.uploadFiles=[];state.uploadMode=null;$('zipInput').value='';$('folderInput').value='';$('chosenBuild').hidden=true;$('uploadProgress').hidden=true;$('progressFill').style.width='0%';$('startUpload').disabled=false;}
function setUploadFiles(files,mode){
  if(!files?.length)return;
  if(mode==='zip' && (!/\.zip$/i.test(files[0].name)||files.length!==1))return notify('Please choose a ZIP file','The selected archive must end in .zip.','error');
  if(mode==='folder'&&files.length>2500)return notify('Too many files','A build can contain up to 2,500 files.','error');
  state.uploadFiles=Array.from(files);state.uploadMode=mode;
  $('chosenBuild').hidden=false;
  $('chosenLabel').textContent=mode==='zip'?files[0].name:`${files[0].webkitRelativePath?.split('/')[0]||'Website folder'} (${files.length} files)`;
  $('chosenMeta').textContent=`${fmtSize([...files].reduce((s,f)=>s+f.size,0))} · ${mode==='zip'?'ZIP archive':'Folder upload'}`;
}
function doUpload(){
  const p=$('uploadProject').value,s=$('uploadSite').value;
  if(!p||!s)return notify('Select a website','Choose a Firebase project and Hosting site first.','error');
  if(!state.uploadFiles.length)return notify('Choose build files','Select a ZIP archive or website folder.','error');
  const form=new FormData();form.append('projectId',p);form.append('siteId',s);form.append('spa',String($('spaToggle').checked));
  if(state.uploadMode==='zip')form.append('archive',state.uploadFiles[0]);
  else for(const file of state.uploadFiles)form.append('files',file,file.webkitRelativePath||file.name);
  const button=$('startUpload');button.disabled=true;state.uploadBusy=true;$('uploadProgress').hidden=false;$('progressFill').style.width='3%';$('progressText').textContent='Sending files securely to the local Node server…';
  const xhr=new XMLHttpRequest();xhr.open('POST','/api/stage');xhr.withCredentials=true;
  xhr.upload.onprogress=e=>{if(e.lengthComputable){const percent=Math.max(3,Math.min(95,Math.round(e.loaded/e.total*100)));$('progressFill').style.width=percent+'%';$('progressText').textContent=`Uploading ${percent}% · preparing website files…`;}};
  xhr.onload=async()=>{
    state.uploadBusy=false;button.disabled=false;
    let data={};try{data=JSON.parse(xhr.responseText);}catch(_){}
    if(xhr.status>=200&&xhr.status<300){$('progressFill').style.width='100%';closeModal('uploadModal');notify('Build uploaded successfully',`${data.build.count} files staged for ${s}. Production website is unchanged.`,'success');
      state.builds=state.builds.filter(x=>!(x.projectId===p&&x.siteId===s));state.builds.push({...data.build,projectId:p,siteId:s});render();openSite(p,s);
    }else{notify('Upload failed',data.error||`Server error ${xhr.status}`,'error');$('progressText').textContent='Could not prepare this build.';}
  };
  xhr.onerror=()=>{state.uploadBusy=false;button.disabled=false;notify('Upload failed','Connection to Node server was lost.','error');};
  xhr.send(form);
}
async function openSite(projectId,siteId){
  const site=siteFor(projectId,siteId);if(!site){notify('Website not found','Refresh the Firebase Hosting sites list.','error');return;}
  state.selectedSite={projectId,siteId};state.selectedTab='build';
  $('siteModalTitle').textContent=site.name;$('siteModalSubtitle').textContent=site.projectName||site.projectId;
  const build=buildFor(projectId,siteId);
  $('siteModalMeta').innerHTML=`${pill(build?'success':'queued')}<span>Project: <b>${escapeHTML(projectId)}</b></span><a href="${escapeHTML(validUrl(site.url))}" target="_blank" rel="noopener noreferrer">${escapeHTML(site.url)} ↗</a>`;
  renderSiteTab();openModal('siteModal');
  if(build){try{const {build:complete}=await api(`/staged/${encodeURIComponent(projectId)}/${encodeURIComponent(siteId)}`);state.builds=state.builds.map(b=>b.projectId===projectId&&b.siteId===siteId?{...b,...complete}:b);renderSiteTab();}catch(_){}}
}
function renderSiteTab(){
  const {projectId,siteId}=state.selectedSite||{};
  const build=buildFor(projectId,siteId), el=$('siteTabContent');
  document.querySelectorAll('.site-modal .tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===state.selectedTab));
  $('detailDownloadLocal').disabled=!build;$('detailDownloadLocal').title=build?'Download the latest local upload':'No uploaded build saved on this computer';$('detailPreview').disabled=!build;$('detailDeploy').disabled=!build;
  if(state.selectedTab==='build'){
    el.innerHTML=build?`<div class="file-list-head"><span>Uploaded ${relative(build.updatedAt)} · ${build.spa?'SPA routing enabled':'Static routing'}</span><strong>${build.count} files · ${fmtSize(build.bytes)}</strong></div><div class="file-list">${(build.files||[]).slice(0,120).map(f=>`<div class="file-row">${icon('file')}<span>${escapeHTML(f.path)}</span><small>${fmtSize(f.size)}</small></div>`).join('')}${build.count>120?`<div class="file-row">… and ${build.count-120} other files</div>`:''}</div>`:`<div class="build-empty">${icon('folder')}<strong>No uploaded build</strong><span>Click New upload to stage a ZIP or website folder.</span></div>`;
  }else if(state.selectedTab==='preview'){
    const url=`/preview/${encodeURIComponent(projectId)}/${encodeURIComponent(siteId)}/`;
    el.innerHTML=build?`<iframe class="preview-frame" sandbox="allow-scripts allow-forms allow-popups" referrerpolicy="no-referrer" src="${url}" title="Sandboxed local website preview"></iframe><p class="preview-note">This is your locally uploaded build, not your live Firebase site. Absolute-root asset paths may not display correctly here; use a Firebase preview channel to verify the final hosted result.</p>`:`<div class="build-empty">${icon('eye')}<strong>Preview unavailable</strong><span>Upload a website build first.</span></div>`;
  }else{
    const jobs=state.jobs.filter(j=>j.projectId===projectId&&j.siteId===siteId);
    el.innerHTML=jobs.length?jobs.slice(0,9).map(jobRow).join(''):'<div class="build-empty">No deployments for this site have been started from Launchpad.</div>';
  }
}
function askDeploy(projectId,siteId,mode){
  const build=buildFor(projectId,siteId);if(!build)return notify('Upload needed','Stage a build before deploying.','error');
  if(mode==='preview'){startDeploy(projectId,siteId,mode);return;}
  state.pendingDeploy={projectId,siteId,mode};
  $('confirmSummary').innerHTML=`<div><strong>Project:</strong> ${escapeHTML(projectId)}</div><div><strong>Hosting site:</strong> ${escapeHTML(siteId)}</div><div><strong>Staged files:</strong> ${build.count} (${fmtSize(build.bytes)})</div><div><strong>Last uploaded:</strong> ${fmtDate(build.updatedAt)}</div><div class="confirm-warning">This replaces the live Hosting release for this site. Other Hosting sites and Firebase services will not be deployed.</div>`;
  openModal('confirmModal');
}
async function startDeploy(projectId,siteId,mode){
  closeModal('confirmModal');closeModal('siteModal');
  try {
    const {job}=await api('/deploy',{method:'POST',body:JSON.stringify({projectId,siteId,mode})});
    state.jobs.unshift(job);render();notify(mode==='live'?'Production deployment started':'Preview deployment started',`Running Firebase CLI for ${siteId}. Logs are available in Activity logs.`,'success');openJob(job.id);
  }catch(error){notify('Cannot start deployment',error.message,'error');}
}
async function openJob(id){
  closeModal('siteModal');
  state.selectedJob=id;
  state.jobLogs=[];
  setView('logs');
  $('logTitle').textContent='Deployment output';$('logSubtitle').textContent='Loading logs…';
  $('terminalOutput').textContent='Loading command output…';
  if(state.stream){state.stream.close();state.stream=null;}
  try {
    const data=await api(`/jobs/${encodeURIComponent(id)}`);
    if(state.selectedJob!==id)return;
    state.jobLogs=data.logs||[];
    syncJob(data.job);renderLogs();
    if(['running','queued'].includes(data.job.status))listenToJob(id);
  }catch(error){notify('Cannot load job',error.message,'error');}
}
function syncJob(job){const pos=state.jobs.findIndex(j=>j.id===job.id);if(pos>=0)state.jobs[pos]=job;else state.jobs.unshift(job);renderJobs();}
function listenToJob(id){
  if(state.stream)state.stream.close();
  const stream=new EventSource(`/api/jobs/${encodeURIComponent(id)}/stream`);
  state.stream=stream;
  stream.addEventListener('snapshot',e=>{
    if(state.selectedJob!==id)return;
    const data=JSON.parse(e.data);state.jobLogs=data.logs||[];syncJob(data.job);renderLogs();
  });
  stream.addEventListener('line',e=>{
    if(state.selectedJob!==id)return;
    state.jobLogs.push(JSON.parse(e.data).line);if(state.jobLogs.length>550)state.jobLogs.shift();renderLogs();
  });
  stream.addEventListener('state',e=>{
    if(state.selectedJob!==id)return;
    const job=JSON.parse(e.data);syncJob(job);renderLogs();render();
    if(!['running','queued'].includes(job.status)){
      stream.close();state.stream=null;
      notify(job.status==='success'?'Deployment complete':'Deployment failed',job.status==='success'?`${job.siteId} ${job.mode==='live'?'is now published':'preview is ready'}.`:job.error||'Inspect deployment logs for details.',job.status==='success'?'success':'error');
    }
  });
  stream.onerror=()=>{ /* browser will automatically retry the stream */ };
}
function renderLogs(){
  const job=state.jobs.find(j=>j.id===state.selectedJob);
  if(!job)return;
  $('logTitle').textContent=`${job.mode==='preview'?'Preview':'Production'} · ${job.siteId}`;
  $('logSubtitle').textContent=`${job.projectId} · ${job.status.toUpperCase()} · Started ${fmtDate(job.startedAt||job.createdAt)}`;
  const output=$('terminalOutput'),nearBottom=output.scrollHeight-output.scrollTop-output.clientHeight<140;
  const highlighted=state.jobLogs.map(line=>{
    const safe=escapeHTML(line);
    const cls=/\b(ERROR|Error|Failed|failed|Permission denied|Unauthorized)\b/.test(line)?'term-error':/\b(success|Success|complete|deployed|finished)\b/i.test(line)?'term-success':line.startsWith('> firebase')?'term-command':'';
    return `<span class="${cls}">${safe}</span>`;
  });
  output.innerHTML=highlighted.join('\n')||'<span class="term-muted">Waiting for deployment output…</span>';
  if(nearBottom)output.scrollTop=output.scrollHeight;
  $('terminalLabel').textContent=job.status==='running'?'firebase-cli / executing':'firebase-cli / '+job.status;
  $('downloadLogs').disabled=false;
  $('copyLogs').disabled=false;
  document.querySelector('.term-live').hidden=!['running','queued'].includes(job.status);
  $('downloadLogs').title='Download complete logs';
  if(job.previewUrl&&job.status==='success')$('logSubtitle').innerHTML=`${escapeHTML(job.projectId)} · Completed · <a href="${escapeHTML(validUrl(job.previewUrl))}" target="_blank" rel="noopener noreferrer" style="color:#515ad2">Open preview URL ↗</a>`;
}
async function copy(text){try{await navigator.clipboard.writeText(text);notify('Copied to clipboard','','success');}catch(_){notify('Copy failed','Your browser blocked clipboard access.','error');}}
function handleAction(el){
  const a=el.dataset.action,p=el.dataset.project,s=el.dataset.site;
  if(a==='inspect')openSite(p,s);
  if(a==='upload')openUpload(p,s);
  if(a==='live'){const site=siteFor(p,s);const target=validUrl(site?.url || `https://${s}.web.app`);if(target!=='#')window.open(target,'_blank');}
  if(a==='job')openJob(el.dataset.id);
  if(a==='settings'||a==='websites'||a==='refresh'){if(a==='refresh')refreshAll();else setView(a);}
}
async function downloadWebsite(projectId, siteId, source, button) {
  if (!projectId || !siteId || button.disabled) return;
  const label = button.innerHTML;
  button.disabled = true; button.setAttribute('aria-busy', 'true'); button.textContent = 'Preparing ZIP…';
  notify('Preparing download', source === 'live' ? 'Recovering and verifying the published static files. This can take several minutes.' : 'Packaging the uploaded website files.');
  try {
    const res = await fetch(`/api/download/${encodeURIComponent(projectId)}/${encodeURIComponent(siteId)}?source=${source}`, { credentials: 'same-origin' });
    if (!res.ok) { const data = await res.json().catch(() => ({})); throw new Error(data.error || `Download failed (HTTP ${res.status})`); }
    const url = URL.createObjectURL(await res.blob());
    const link = document.createElement('a'); link.href = url; link.download = `${siteId}-${source}-website.zip`;
    document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000);
    notify('ZIP ready', 'Your browser download has started.', 'success');
  } catch (error) { notify('Download unavailable', error.message, 'error'); }
  finally { button.innerHTML = label; button.disabled = false; button.removeAttribute('aria-busy'); }
}
async function logout(button) {
  if (!confirm('Log out of all Firebase CLI accounts on this computer? Other Firebase CLI sessions will also be disconnected. Your live websites and saved builds stay available. Close any Google sign-in window first.')) return;
  button.disabled = true;
  try {
    await api('/logout', { method: 'POST', body: '{}' });
    state.stream?.close(); clearInterval(state.loginPoll);
    window.location.reload();
  } catch (error) { notify('Could not log out', error.message, 'error'); button.disabled = false; }
}
function wire(){
  $('logoutBtn').onclick=()=>logout($('logoutBtn'));
  $('detailDownloadLive').onclick=()=>{const s=state.selectedSite;if(s)downloadWebsite(s.projectId,s.siteId,'live',$('detailDownloadLive'));};
  $('detailDownloadLocal').onclick=()=>{const s=state.selectedSite;if(s)downloadWebsite(s.projectId,s.siteId,'local',$('detailDownloadLocal'));};
  document.querySelectorAll('.nav-item[data-view]').forEach(el=>el.addEventListener('click',()=>setView(el.dataset.view)));
  document.querySelectorAll('[data-go]').forEach(el=>el.addEventListener('click',()=>setView(el.dataset.go)));
  document.addEventListener('click',e=>{
    const action=e.target.closest('[data-action]');if(action){e.preventDefault();handleAction(action);}
    const close=e.target.closest('[data-close]');if(close){if(!state.uploadBusy)closeModal(close.dataset.close);}
    const copyBtn=e.target.closest('[data-copy]');if(copyBtn)copy(copyBtn.dataset.copy);
  });
  document.addEventListener('keydown',e=>{
    const row=e.target.closest('.job-row[role="button"]');
    if(row&&(e.key==='Enter'||e.key===' ')){e.preventDefault();handleAction(row);}
  });
  document.querySelectorAll('.modal-overlay').forEach(el=>el.addEventListener('mousedown',e=>{if(e.target===el && el.id!=='authModal'&&!state.uploadBusy)closeModal(el.id);}));
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&!state.uploadBusy){
      const modal=[...document.querySelectorAll('.modal-overlay.open:not(#authModal)')].pop();
      if(modal){e.preventDefault();closeModal(modal.id);}
    }
  });
  $('refreshBtn').onclick=refreshAll;$('headerRefresh').onclick=refreshAll;$('siteSync').onclick=refreshAll;$('settingsRefresh').onclick=refreshAll;
  $('headerUpload').onclick=()=>openUpload();$('sidebarUpload').onclick=()=>openUpload();
  $('mobileMenu').onclick=()=>window.dispatchEvent(new Event('launchpad:toggle-menu'));
  $('siteSearch').oninput=e=>{state.siteSearch=e.target.value;renderSites();};
  $('projectFilter').onchange=e=>{state.projectFilter=e.target.value;renderSites();};
  $('deployFilter').onchange=e=>{state.deployFilter=e.target.value;renderJobs();};
  $('uploadProject').onchange=()=>syncUploadSites();
  $('chooseZip').onclick=()=>$('zipInput').click();$('chooseFolder').onclick=()=>$('folderInput').click();
  $('zipInput').onchange=e=>setUploadFiles(e.target.files,'zip');$('folderInput').onchange=e=>setUploadFiles(e.target.files,'folder');
  $('clearUpload').onclick=resetUpload;$('startUpload').onclick=doUpload;
  $('uploadDrop').addEventListener('keydown',e=>{if(e.target.id==='uploadDrop'&&(e.key==='Enter'||e.key===' ')){e.preventDefault();$('zipInput').click();}});
  ['dragenter','dragover'].forEach(t=>$('uploadDrop').addEventListener(t,e=>{e.preventDefault();$('uploadDrop').classList.add('dragging');}));
  ['dragleave','drop'].forEach(t=>$('uploadDrop').addEventListener(t,e=>{e.preventDefault();$('uploadDrop').classList.remove('dragging');}));
  $('uploadDrop').addEventListener('drop',e=>{if(e.dataTransfer.files?.length===1&&/\.zip$/i.test(e.dataTransfer.files[0].name))setUploadFiles(e.dataTransfer.files,'zip');else notify('Use Select folder for directories','Folder selection preserves the file paths needed for deployment.','info');});
  document.querySelectorAll('.site-modal .tab').forEach(el=>el.onclick=()=>{state.selectedTab=el.dataset.tab;renderSiteTab();});
  $('detailUpload').onclick=()=>{const s=state.selectedSite;closeModal('siteModal');openUpload(s.projectId,s.siteId);};
  $('detailDeploy').onclick=()=>{const s=state.selectedSite;askDeploy(s.projectId,s.siteId,'live');};
  $('detailPreview').onclick=()=>{const s=state.selectedSite;askDeploy(s.projectId,s.siteId,'preview');};
  $('confirmDeploy').onclick=()=>{if(state.pendingDeploy){const p=state.pendingDeploy;state.pendingDeploy=null;startDeploy(p.projectId,p.siteId,p.mode);}};
  $('copyLogs').onclick=()=>copy(state.jobLogs.join('\n'));
  $('downloadLogs').onclick=()=>{if(state.selectedJob)window.open(`/api/jobs/${encodeURIComponent(state.selectedJob)}/log`,'_blank','noopener,noreferrer');};
  $('connectGoogle').onclick=openGoogleLogin;
  $('connectCode').onclick=openCodeLogin;
  $('checkLogin').onclick=async()=>{await refreshLoginStatus();await refreshAll();};
  $('sendLoginResponse').onclick=sendLoginInput;
  $('loginResponse').onkeydown=e=>{if(e.key==='Enter')sendLoginInput();};
  $('createSiteBtn').onclick=createHostingSite;
  $('createProjectBtn').onclick=createFirebaseProject;
  $('authSubmit').onclick=unlock;$('authPassword').onkeydown=e=>{if(e.key==='Enter')unlock();};
}
async function unlock(){
  $('authError').textContent='';
  try{await api('/unlock',{method:'POST',body:JSON.stringify({token:$('authPassword').value})});$('authPassword').value='';closeModal('authModal');await refreshAll();window.dispatchEvent(new Event('launchpad:unlocked'));}
  catch(error){$('authError').textContent=error.message;}
}
window.LaunchpadBridge = { state, api, refreshAll, setView, openJob, notify, downloadWebsite, logout, openGoogleLogin };
wire();
const restoreView=()=>setView(location.hash.slice(1)||'overview',false);
window.addEventListener('popstate',restoreView);
window.addEventListener('hashchange',restoreView);
restoreView();boot();
setInterval(async()=>{
  if(document.hidden)return;
  try{
    const {jobs}=await api('/jobs');
    state.jobs=jobs;
    renderJobs();$('statSuccess').textContent=state.jobs.filter(j=>j.status==='success').length;$('statActive').textContent=state.jobs.filter(j=>['queued','running'].includes(j.status)).length;
  }catch(_){ /* network failures displayed by explicit refresh */ }
},15000);
