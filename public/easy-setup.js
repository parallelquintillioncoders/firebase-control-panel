/* Launchpad Easy Publish: GUI-only onboarding workflow (classic Firebase Hosting). */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const b = window.LaunchpadBridge;
  let opener = null;
  const wizard = {open:false,step:1,projectId:'',siteId:'',files:[],mode:'',busy:false,job:null,lastPreview:'',loginPending:false,finishingLogin:false,codeMode:false,authPending:false};
  const safeUrl = u => {try {const x=new URL(u);return x.protocol==='https:'?x.href:'#';}catch(_){return '#';}};
  const bytes = size => size >= 1048576 ? `${(size/1048576).toFixed(1)} MB` : `${(size/1024).toFixed(1)} KB`;
  const activeSite = () => b.state.sites.find(s=>s.projectId===wizard.projectId&&s.id===wizard.siteId);
  const activeBuild = () => b.state.builds.find(s=>s.projectId===wizard.projectId&&s.siteId===wizard.siteId);
  const display = (id,text) => {$(id).textContent = text;};
  const msg = (id,text,err=false) => {$(id).textContent=text;$(id).classList.toggle('danger',err);};
  const $api = (...args) => b.api(...args);
  function showStep(step){
    wizard.step=step;
    for(let i=1;i<=4;i++){$('ezPanel'+i).hidden=i!==step;}
    document.querySelectorAll('#ezStepRail .ez-step').forEach(el=>{const n=Number(el.dataset.step);el.classList.toggle('active',n===step);el.classList.toggle('complete',n<step);});
    $('easyPage').scrollTo({top:0,behavior:'smooth'});
    if(step===2)renderProjectSelect();
    if(step===3)renderStage();
    if(step===4)renderPublish();
  }
  function open(step=1){
    if($('authModal')?.classList.contains('open')) return;
    opener=document.activeElement;
    window.dispatchEvent(new Event('launchpad:navigate'));
    wizard.open=true;$('easyPage').hidden=false;document.documentElement.classList.add('easy-mode');document.body.style.overflow='hidden';
    document.querySelector('.app-shell').inert=true;
    $('ezClose').focus();
    const status=b.state.authStatus;
    showStep(status?.signedIn ? (step===1?2:step) : 1);
    checkAccount().catch(()=>{});
  }
  function close(){wizard.open=false;$('easyPage').hidden=true;document.querySelector('.app-shell').inert=false;document.documentElement.classList.remove('easy-mode');if(!document.querySelector('.modal-overlay.open'))document.body.style.overflow='';if(opener&&!opener.closest('[inert]'))opener.focus();else $('mobileMenu').focus();}
  const getProjects = () => b.state.projects || [];
  const getSites = () => b.state.sites || [];
  async function checkAccount(){
    try {
      const status=await $api('/auth/status');
      b.state.authStatus=status;
      const label=status.signedIn?`Connected: ${status.accounts.join(', ')}`:'Google account not connected';
      $('ezLoginState').className='ez-status '+(status.signedIn?'ok':'');
      $('ezLoginState').querySelector('span:last-child').textContent=label;
      if(status.signedIn){
        wizard.loginPending=false;
        $('ezProjectStatus').querySelector('span:last-child').textContent=label;
        if(wizard.open && wizard.step===1 && !wizard.finishingLogin){
          wizard.finishingLogin=true;msg('ezLoginMessage','Connected successfully. Loading your websites…');
          try{await b.refreshAll();showStep(2);}finally{wizard.finishingLogin=false;}
        }
      } else if(wizard.loginPending)msg('ezLoginMessage',wizard.codeMode?'Waiting for browser approval. Open the Google link and submit the one-time code.':'Waiting for Google approval. If no Google sign-in window appeared, use the browser sign-in option below.');
      if(wizard.codeMode && !status.signedIn) await checkCodeSession();
      return status.signedIn;
    } catch(e){msg('ezLoginMessage',`Cannot check connection: ${e.message}`,true);return false;}
  }
  async function connectGoogle(){
    $('ezConnect').disabled=true;msg('ezLoginMessage','Starting the Google sign-in window…');
    try {
      const result=await $api('/auth/connect',{method:'POST',body:'{}'});
      if(!result.opened)throw new Error('Windows did not confirm the sign-in window started.');
      wizard.loginPending=true;
      msg('ezLoginMessage','Google sign-in was started. Look for the new “Launchpad - Google Account Sign In” window and complete approval in Chrome. If it is missing, use browser sign-in below.');
    }catch(e){
      msg('ezLoginMessage',e.message,true);
      showCodeFallback(false);
    }finally{$('ezConnect').disabled=false;}
  }
  function showCodeFallback(start){
    $('ezAuthFallback').hidden=false;
    if(start)startCodeFallback();
  }
  async function startCodeFallback(){
    $('ezStartFallback').disabled=true;
    $('ezOpenAuthLink').hidden=true;$('ezOpenAuthLink').removeAttribute('href');
    wizard.codeMode=true; wizard.loginPending=true;
    msg('ezFallbackMessage','Preparing official Google authorization link…');
    try {
      await $api('/auth/embedded',{method:'POST',body:'{}'});
      await checkCodeSession();
    }catch(e){msg('ezFallbackMessage','Could not start login: '+e.message,true);}
    finally{$('ezStartFallback').disabled=false;}
  }
  async function checkCodeSession(){
    try {
      const {process:session}=await $api('/auth/session');
      if(!session)return;
      $('ezFallbackStatus').textContent=session.status;
      $('ezAuthOutput').textContent=(session.lines||[]).join('\n')||'Waiting for Google sign-in…';
      const link=$('ezOpenAuthLink');
      link.hidden=true;link.removeAttribute('href');
      if(session.authUrl){
        const parsed=new URL(session.authUrl);
        if(parsed.protocol==='https:' && parsed.hostname==='auth.firebase.tools'){
          link.href=parsed.href;link.hidden=false;
          msg('ezFallbackMessage','Google authorization link is ready. Click “Open Google login”, choose your account, then paste the authorization code here.');
        }
      }
      if(session.status==='failed')msg('ezFallbackMessage','Authorization could not finish. Expand technical details for the error, then retry sign-in.',true);
      if(session.status==='success'){wizard.codeMode=false;checkAccount();}
    }catch(e){msg('ezFallbackMessage',e.message,true);}
  }
  async function submitAuthCode(){
    const value=$('ezAuthCode').value.trim();
    if(!value)return msg('ezFallbackMessage','Paste your one-time authorization code first.',true);
    $('ezSubmitAuthCode').disabled=true;
    try {
      await $api('/auth/input',{method:'POST',body:JSON.stringify({value})});
      $('ezAuthCode').value='';
      msg('ezFallbackMessage','Code submitted. Checking Google connection…');
      setTimeout(()=>checkAccount(),1400);
    }catch(e){msg('ezFallbackMessage',e.message,true);}
    finally{$('ezSubmitAuthCode').disabled=false;}
  }
  async function refreshSites(){
    $('ezRefreshSites').disabled=true;msg('ezProjectMessage','Looking for your Firebase websites…');
    try{await b.refreshAll();renderProjectSelect();msg('ezProjectMessage',getProjects().length ? 'Website list updated.' : 'No projects found for the current Google account. You can create one below.');}
    catch(e){msg('ezProjectMessage',e.message,true);}finally{$('ezRefreshSites').disabled=false;}
  }
  function renderProjectSelect(){
    const projects=getProjects(),select=$('ezProject');
    const current=wizard.projectId||'';
    select.replaceChildren(new Option(projects.length?'Select your Firebase project':'No projects yet — create one below',''));
    for(const p of projects)select.add(new Option(`${p.name || p.id}  (${p.id})`,p.id));
    if(projects.some(p=>p.id===current)) select.value=current;
    else if(projects.length===1){ select.value=projects[0].id;wizard.projectId=projects[0].id; }
    else {select.value='';wizard.projectId='';wizard.siteId='';}
    renderSiteSelect();
  }
  function renderSiteSelect(){
    const project=wizard.projectId;
    const items=getSites().filter(s=>s.projectId===project);
    const select=$('ezSite');
    select.replaceChildren(new Option(items.length?'Choose website':'No websites yet — create one below',''));
    for(const s of items)select.add(new Option(`${s.name}  •  ${s.url.replace('https://','')}`,s.id));
    if(items.some(s=>s.id===wizard.siteId))select.value=wizard.siteId;
    else{wizard.siteId='';select.value='';}
    select.disabled=!project;
    const site=activeSite();
    $('ezToUpload').disabled=!site;
    $('ezDownloadLive').disabled=!site;
    $('ezDownloadLocal').disabled=!site||!activeBuild();
    $('ezExistingSite').hidden=!site;
    if(site){display('ezSiteName',site.name);$('ezSiteUrl').textContent=site.url.replace('https://','')+' ↗';$('ezSiteUrl').href=safeUrl(site.url);}
    if(!getProjects().length) msg('ezProjectMessage','No projects found. Click “Create a new project” below, or make sure you chose the right Google account.');
    else if(project&&!items.length)msg('ezProjectMessage','No Hosting websites found in this project. Click “Create a new website” below.');
    else msg('ezProjectMessage','');
  }
  const slug = input => String(input||'').trim().toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/-+/g,'-').replace(/^-+|-+$/g,'').slice(0,30);
  async function createProject(){
    const name=$('ezNewProjectName').value.trim(),id=$('ezNewProjectId').value.trim();
    if(name.length<3 || !/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(id))return msg('ezNewProjectMessage','Enter a project name (3+ characters) and unique ID (6–30 lowercase letters/numbers/hyphens).',true);
    if(!confirm(`Create a new Firebase project named “${name}” with ID “${id}”?`))return;
    $('ezCreateProject').disabled=true;msg('ezNewProjectMessage','Creating Firebase project. This may take a moment…');
    try{await $api('/projects/create',{method:'POST',body:JSON.stringify({displayName:name,projectId:id})});wizard.projectId=id;wizard.siteId='';await b.refreshAll();renderProjectSelect();$('ezNewProjectBox').hidden=true;msg('ezProjectMessage','Project created! Now create a Hosting website below.');$('ezNewSiteBox').hidden=false;$('ezNewSiteId').value=slug(id).slice(0,30);}
    catch(e){msg('ezNewProjectMessage',e.message,true);}finally{$('ezCreateProject').disabled=false;}
  }
  async function createSite(){
    const id=$('ezNewSiteId').value.trim(),projectId=wizard.projectId;
    if(!projectId)return msg('ezNewSiteMessage','Select or create a project first.',true);
    if(!/^[a-z0-9][a-z0-9-]{0,28}[a-z0-9]$/.test(id))return msg('ezNewSiteMessage','Use 2–30 lowercase letters, numbers and hyphens; start and end with a letter or number.',true);
    if(!confirm(`Create website https://${id}.web.app inside project ${projectId}?`))return;
    $('ezCreateSite').disabled=true;msg('ezNewSiteMessage','Creating your Hosting website…');
    try{await $api('/hosting/create',{method:'POST',body:JSON.stringify({projectId,siteId:id})});wizard.siteId=id;await b.refreshAll();renderProjectSelect();$('ezNewSiteBox').hidden=true;msg('ezProjectMessage','Hosting website created. You can now upload its files.');}
    catch(e){msg('ezNewSiteMessage',e.message,true);}finally{$('ezCreateSite').disabled=false;}
  }
  function renderStage(){
    const site=activeSite();
    if(!site){showStep(2);return;}
    display('ezUploadDest',`${site.name}  ·  ${site.projectName || site.projectId}`);
    $('ezUseExisting').hidden=!activeBuild();
  }
  function chooseFiles(mode,files){
    const list=Array.from(files||[]);
    if(!list.length)return;
    wizard.files=list;wizard.mode=mode;
    const total=list.reduce((acc,x)=>acc+x.size,0);
    $('ezFilePicked').hidden=false;
    display('ezFileName',mode==='zip'?list[0].name:`${list.length} website file${list.length===1?'':'s'} selected`);
    display('ezFileSize',`${bytes(total)} • Ready to upload`);
    $('ezUpload').disabled=false;msg('ezUploadMessage','');
  }
  async function upload(){
    if(wizard.busy||!wizard.files.length||!activeSite())return;
    wizard.busy=true;$('ezUpload').disabled=true;$('ezUploadProgress').hidden=false;$('ezUploadBar').style.width='3%';display('ezUploadCaption','Preparing your website…');
    const form=new FormData();form.set('projectId',wizard.projectId);form.set('siteId',wizard.siteId);form.set('spa',String($('ezSpa').checked));
    if(wizard.mode==='zip')form.append('archive',wizard.files[0]);
    else for(const file of wizard.files)form.append('files',file,file.webkitRelativePath||file.name);
    const xhr=new XMLHttpRequest();xhr.open('POST','/api/stage');xhr.withCredentials=true;
    xhr.upload.onprogress=e=>{if(e.lengthComputable){const n=Math.min(94,Math.max(3,Math.round(100*e.loaded/e.total)));$('ezUploadBar').style.width=n+'%';display('ezUploadCaption',`Uploading website files… ${n}%`);}};
    xhr.onload=()=>{
      wizard.busy=false;$('ezUpload').disabled=false;
      let data={};try{data=JSON.parse(xhr.responseText);}catch(_){}
      if(xhr.status>=200&&xhr.status<300){
        $('ezUploadBar').style.width='100%';display('ezUploadCaption','Website files uploaded successfully.');
        b.state.builds=b.state.builds.filter(x=>!(x.projectId===wizard.projectId&&x.siteId===wizard.siteId));
        b.state.builds.push({...data.build,projectId:wizard.projectId,siteId:wizard.siteId});
        wizard.files=[];wizard.lastPreview='';wizard.job=null;
        showStep(4);
      }else{msg('ezUploadMessage',data.error||`Upload failed (code ${xhr.status}). Check that the folder or ZIP contains index.html.`,true);}
    };
    xhr.onerror=()=>{wizard.busy=false;$('ezUpload').disabled=false;msg('ezUploadMessage','Cannot reach the local app. Please keep the Launchpad starter window open.',true);};
    xhr.send(form);
  }
  function renderPublish(){
    const site=activeSite(),build=activeBuild();if(!site){showStep(2);return;}if(!build){showStep(3);return;}
    display('ezPublishUrl',site.url);
    $('ezPreviewFrame').src=`/preview/${encodeURIComponent(wizard.projectId)}/${encodeURIComponent(wizard.siteId)}/`;
    $('ezSuccess').hidden=true;$('ezPublish').hidden=false;$('ezPublish').disabled=false;$('ezViewLogs').hidden=true;
    $('ezCloudPreviewUrl').textContent='';msg('ezPublishMessage',`${build.count} files (${bytes(build.bytes)}) uploaded and ready. Your live site has NOT changed yet.`);
    $('ezJobStatus').hidden=true;
    $('ezFinishTitle').textContent='Check and publish';
    $('ezFinishSubtitle').textContent='Preview the uploaded website, then approve the live update.';
  }
  function viewJob(job){
    wizard.job=job;
    $('ezJobStatus').hidden=false;
    const label=job.mode==='preview'?'Test link':'Website publication';
    const el=$('ezJobStatus');el.className=`ez-status ${job.status==='success'?'ok':job.status==='failed'?'error':''}`;
    el.querySelector('span:last-child').textContent=`${label}: ${job.status==='running'?'Working in background…':job.status==='queued'?'Starting…':job.status==='success'?'Completed':job.status==='failed'?'Could not finish':job.status}`;
    $('ezViewLogs').hidden=false;
    if(job.status==='success'){
      if(job.mode==='live'){
        $('ezSuccess').hidden=false;$('ezPublish').hidden=true;$('ezLocalPreview').hidden=true;
        $('ezCloudPreview').hidden=true;$('ezFinishTitle').textContent='Website published!';$('ezFinishSubtitle').textContent='Your selected Firebase Hosting website was updated successfully.';
        $('ezSuccessLink').href=safeUrl(activeSite()?.url);msg('ezPublishMessage','Deployment successful. Changes may take a short time to become visible worldwide.');
      } else {
        wizard.lastPreview=job.previewUrl||'';
        const box=$('ezCloudPreviewUrl');box.replaceChildren();
        if(job.previewUrl){
          const link=document.createElement('a');link.href=safeUrl(job.previewUrl);link.target='_blank';link.rel='noopener noreferrer';link.textContent='Open test link ↗';link.style.color='#5656d5';link.style.fontWeight='800';box.append('Preview ready: ',link);
        }else box.textContent='Preview deploy completed. Open Activity logs to find the Firebase test URL.';
        msg('ezPublishMessage','Test link is ready. Production is still unchanged.');
      }
    }else if(job.status==='failed')msg('ezPublishMessage',job.error||'Deployment failed. Select View deployment details for the error.',true);
    else msg('ezPublishMessage','Working in the background. Keep the Launchpad starter running. You can inspect details below.');
    $('ezPublish').disabled=['running','queued'].includes(job.status);
    $('ezCloudPreview').disabled=['running','queued'].includes(job.status);
  }
  async function startJob(mode){
    const site=activeSite(),build=activeBuild();if(!site||!build)return;
    if(['running','queued'].includes(wizard.job?.status))return;
    if(mode==='live'&&!confirm(`Publish ${build.count} files to your LIVE website?\n\n${site.url}\n\nThis replaces the live Hosting release for this website only.`))return;
    $('ezPublish').disabled=true;$('ezCloudPreview').disabled=true;
    msg('ezPublishMessage',mode==='live'?'Starting live website publication…':'Creating a shareable preview link…');
    try{const {job}=await $api('/deploy',{method:'POST',body:JSON.stringify({projectId:wizard.projectId,siteId:wizard.siteId,mode})});viewJob(job);}catch(e){msg('ezPublishMessage',e.message,true);$('ezPublish').disabled=false;$('ezCloudPreview').disabled=false;}
  }
  async function pollJob(){
    if(!wizard.open || wizard.step!==4 || !wizard.job || !['running','queued'].includes(wizard.job.status))return;
    try{const {job}=await $api('/jobs/'+encodeURIComponent(wizard.job.id));viewJob(job);}catch(_){}
  }
  function bind(){
    $('ezLogout').onclick=()=>b.logout($('ezLogout'));
    $('ezDownloadLive').onclick=()=>b.downloadWebsite(wizard.projectId,wizard.siteId,'live',$('ezDownloadLive'));
    $('ezDownloadLocal').onclick=()=>b.downloadWebsite(wizard.projectId,wizard.siteId,'local',$('ezDownloadLocal'));
    $('easyLaunchTop').onclick=()=>open();$('easyLaunchNav').onclick=()=>open();$('ezClose').onclick=close;
    $('ezConnect').onclick=connectGoogle;$('ezCheck').onclick=checkAccount;
    $('ezLoginHelp').onclick=()=>showCodeFallback(false);
    $('ezStartFallback').onclick=startCodeFallback;
    $('ezSubmitAuthCode').onclick=submitAuthCode;
    $('ezAuthCode').onkeydown=e=>{if(e.key==='Enter')submitAuthCode();};
    $('ezProject').onchange=()=>{wizard.projectId=$('ezProject').value;wizard.siteId='';renderSiteSelect();};
    $('ezSite').onchange=()=>{wizard.siteId=$('ezSite').value;renderSiteSelect();};
    $('ezRefreshSites').onclick=refreshSites;
    $('ezToUpload').onclick=()=>{if(activeSite())showStep(activeBuild()?4:3);};
    $('ezShowNewProject').onclick=()=>{$('ezNewSiteBox').hidden=true;$('ezNewProjectBox').hidden=false;};
    $('ezShowNewSite').onclick=()=>{$('ezNewProjectBox').hidden=true;$('ezNewSiteBox').hidden=false;$('ezNewSiteId').value=slug(wizard.projectId).slice(0,30);};
    $('ezCancelProject').onclick=()=>{$('ezNewProjectBox').hidden=true;};$('ezCancelSite').onclick=()=>{$('ezNewSiteBox').hidden=true;};
    $('ezNewProjectName').oninput=()=>{if(!$('ezNewProjectId').dataset.edited)$('ezNewProjectId').value=slug($('ezNewProjectName').value).slice(0,30);};
    $('ezNewProjectId').oninput=()=>{$('ezNewProjectId').dataset.edited='yes';};
    $('ezCreateProject').onclick=createProject;$('ezCreateSite').onclick=createSite;
    $('ezBack2').onclick=()=>showStep(1);$('ezBack3').onclick=()=>showStep(2);$('ezBack4').onclick=()=>{$('ezLocalPreview').hidden=false;$('ezCloudPreview').hidden=false;showStep(3);};
    $('ezChooseZip').onclick=()=>$('ezZipInput').click();$('ezChooseFolder').onclick=()=>$('ezFolderInput').click();
    $('ezZipInput').onchange=e=>chooseFiles('zip',e.target.files);$('ezFolderInput').onchange=e=>chooseFiles('folder',e.target.files);
    $('ezUpload').onclick=upload;$('ezUseExisting').onclick=()=>{if(activeBuild())showStep(4);};
    $('ezNewTabPreview').onclick=()=>{window.open(`/preview/${encodeURIComponent(wizard.projectId)}/${encodeURIComponent(wizard.siteId)}/`,'_blank','noopener,noreferrer');};
    $('ezCloudPreview').onclick=()=>startJob('preview');$('ezPublish').onclick=()=>startJob('live');
    $('ezViewLogs').onclick=()=>{if(wizard.job){const id=wizard.job.id;close();b.openJob(id);}};
    setInterval(()=>{if(wizard.open&&wizard.step===1&&!document.hidden)checkAccount().catch(()=>{});},6500);
    setInterval(pollJob,3000);
  }
  bind();
  window.addEventListener('launchpad:unlocked',async()=>{try{const signed=await checkAccount();if(!signed)open(1);else if(!b.state.sites.length)open(2);}catch(_){}});
  // Keep navigation available; users explicitly open Easy Publish when needed.
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&!event.defaultPrevented&&wizard.open&&!wizard.busy&&!document.querySelector('.modal-overlay.open'))close();
  });
})();
