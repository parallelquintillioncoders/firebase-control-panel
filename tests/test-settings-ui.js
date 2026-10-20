'use strict';
// Uses mock API responses; never creates projects, sites or login sessions.
const assert = require('node:assert/strict');
const path = require('node:path');
const os = require('node:os');
const express = require('express');
const {chromium} = require('playwright');

(async()=>{
  const app=express();
  app.use(express.static(path.join(__dirname,'../public')));
  const server=await new Promise(resolve=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s));});
  let browser;
  try {
    browser=await chromium.launch({channel:'chrome',headless:true});
    const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
    const errors=[], writes=[];
    let connected=false, projects=[], failHealth=false, refreshes=0;
    page.on('pageerror',error=>errors.push(error.message));
    page.on('dialog',dialog=>dialog.dismiss());
    await page.addInitScript(()=>{if(window===window.top)localStorage.setItem('pqc.launchpad.consent.v1','declined');});
    await page.route('**/api/**',route=>{
      const req=route.request(), url=new URL(req.url());
      if(req.method()==='POST') {
        writes.push(url.pathname);
        if(url.pathname==='/api/auth/connect')return route.fulfill({json:{opened:true,message:'Mock sign-in opened.'}});
        if(url.pathname==='/api/auth/embedded')return route.fulfill({json:{ok:true}});
        if(url.pathname==='/api/auth/input')return route.fulfill({json:{ok:true}});
        return route.fulfill({status:500,json:{error:'Unexpected mutation in test'}});
      }
      let data={};
      if(url.pathname==='/api/boot')data={requiresAuth:false,authenticated:true};
      if(url.pathname==='/api/health')data=failHealth?{cli:'missing',error:'Mock CLI unavailable'}:{cli:'ready',version:'15.0',dataDirectory:'C:\\workspace\\saved-builds'};
      if(url.pathname==='/api/auth/status')data={signedIn:connected,accounts:connected?['test@example.test']:[],process:{status:'running',lines:['Mock authorization prompt']}};
      if(url.pathname==='/api/projects'){data={projects};refreshes++;}
      if(url.pathname==='/api/sites')data={sites:[]};
      if(url.pathname==='/api/jobs')data={jobs:[]};
      if(url.pathname==='/api/staged')data={builds:[]};
      return route.fulfill({json:data});
    });
    await page.goto(`http://127.0.0.1:${server.address().port}/#settings`);
    await page.waitForFunction(()=>document.getElementById('newSiteProject').textContent.includes('No projects available'));
    assert.ok(await page.locator('#newSiteProject').isDisabled());
    assert.equal(await page.locator('#settingsLocalAddress').textContent(),`127.0.0.1:${server.address().port}`);
    await page.locator('#connectGoogle').click();
    await page.waitForFunction(()=>document.getElementById('connectGoogle').disabled===false);
    await page.locator('#connectCode').click();
    await page.locator('#loginResponse').fill('mock-code');
    await page.locator('#sendLoginResponse').click();
    await page.waitForFunction(()=>document.getElementById('loginResponse').value==='');
    assert.ok(writes.includes('/api/auth/embedded'));
    assert.ok(writes.includes('/api/auth/input'));
    connected=true;
    projects=[{id:'demo-project',name:'Demo project'}];
    await page.locator('#checkLogin').click();
    await page.waitForFunction(()=>document.getElementById('newSiteProject').options.length===2);
    assert.equal(await page.locator('#googleStatusBadge').textContent(),'Connected');
    await page.locator('#newSiteProject').selectOption('demo-project');
    const count=refreshes;
    await Promise.all([page.waitForResponse(response=>new URL(response.url()).pathname==='/api/projects'),page.locator('#settingsRefresh').click()]);
    await page.waitForFunction(()=>!window.LaunchpadBridge.state.loading);
    await page.waitForFunction(()=>!document.getElementById('newSiteProject').disabled&&document.getElementById('newSiteProject').options.length===2);
    assert.equal(await page.locator('#newSiteProject').inputValue(),'demo-project');
    assert.ok(refreshes>count);
    // Invalid input and cancelled confirmations must not create remote resources.
    await page.locator('#createProjectBtn').click();
    await page.locator('#newProjectName').fill('Demo project');
    await page.locator('#newProjectId').fill('demo-project');
    await page.locator('#createProjectBtn').click();
    await page.locator('#createSiteBtn').click();
    await page.locator('#newSiteId').fill('demo-site');
    await page.locator('#createSiteBtn').click();
    assert.ok(!writes.some(url=>url.includes('/create')));
    for(const width of [1440,812,375]) {
      await page.setViewportSize({width,height:1000});
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`No overflow at ${width}px`);
      const dropdown=await page.locator('#newSiteProject').boundingBox();
      const field=await page.locator('#newSiteId').boundingBox();
      assert.ok(Math.abs(dropdown.x-field.x)<1&&Math.abs(dropdown.width-field.width)<1,'Fields align');
      assert.ok(dropdown.height>=48,'Dropdown matches input height');
      await page.evaluate(()=>window.scrollTo(0,0));
      await page.screenshot({path:path.join(os.tmpdir(),`pqc-settings-${width}.png`),fullPage:true,style:'.toast-stack,.skip-link { visibility:hidden !important; }'});
    }
    failHealth=true;
    await page.locator('#settingsRefresh').click();
    await page.waitForFunction(()=>document.getElementById('settingsCliBadge').textContent==='Unavailable');
    assert.deepEqual(errors,[]);
    console.log('Settings checks passed: layouts, dropdown states, connection controls, refresh, validation and cancelled creation. Mock API only; no Firebase writes.');
  } finally {
    await browser?.close();
    await new Promise(resolve=>server.close(resolve));
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
