'use strict';
// Run with Playwright available in NODE_PATH. All Firebase requests are mocked.
const assert = require('node:assert/strict');
const path = require('node:path');
const os = require('node:os');
const express = require('express');
const { chromium } = require('playwright');

(async () => {
  const app = express();
  app.use(express.static(path.join(__dirname, '../public')));
  const server = await new Promise(resolve => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
  let browser;
  try {
    browser = await chromium.launch({headless:true,channel:process.env.UI_BROWSER || 'chrome'});
    const page = await browser.newPage({viewport:{width:1440,height:1000}});
    const errors = [], requests = [];
    page.on('pageerror', error => errors.push(error.message));
    const projects = [{id:'alpha-project',name:'Alpha Studio'},{id:'beta-project',name:'Beta Studio'}];
    const job = {id:'job-one',siteId:'alpha-site',projectId:'alpha-project',mode:'live',status:'success',createdAt:new Date().toISOString()};
    let signedIn = true;
    await page.route('**/api/**', route => {
      const url = new URL(route.request().url());
      assert.equal(route.request().method(), 'GET', 'UI checks must not mutate Firebase');
      let data = {};
      if(url.pathname==='/api/boot') data={requiresAuth:false,authenticated:true};
      if(url.pathname==='/api/health') data={cli:'ready',version:'15.0',authMethod:'firebase-cli'};
      if(url.pathname==='/api/auth/status') data={signedIn,accounts:signedIn?['demo@example.test']:[]};
      if(url.pathname==='/api/projects') data={projects};
      if(url.pathname==='/api/sites') { const id=url.searchParams.get('projectId');data={sites:[{id:id.replace('project','site'),name:id.replace('project','site'),url:'https://example.test'}]}; }
      if(url.pathname==='/api/staged') data={builds:[]};
      if(url.pathname==='/api/jobs') data={jobs:[job]};
      if(url.pathname==='/api/jobs/job-one') data={job,logs:['Deployment complete']};
      return route.fulfill({json:data});
    });
    await page.route('https://fonts.googleapis.com/**', route => { requests.push(route.request().url()); return route.fulfill({contentType:'text/css',body:''}); });
    const base = `http://127.0.0.1:${server.address().port}`;
    await page.goto(base);
    await page.locator('#siteNavCount').filter({hasText:'2'}).waitFor();
    assert.equal(requests.length,0);
    await page.locator('#cookieDecline').click();
    await page.locator('#workspacePicker').click();
    await page.getByRole('button',{name:'Alpha Studio',exact:true}).click();
    assert.equal(new URL(page.url()).hash,'#websites');
    assert.equal(await page.locator('#allSites .site-card').count(),1);
    assert.equal(await page.locator('#projectFilter').inputValue(),'alpha-project');
    await page.locator('#projectFilter').selectOption('beta-project');
    assert.equal(await page.locator('#workspaceName').textContent(),'Beta Studio');
    for(const view of ['overview','websites','deployments','logs','settings']) {
      await page.locator(`.nav-item[data-view="${view}"]`).click();
      assert.equal(await page.locator('.view.active').getAttribute('id'),'view-'+view);
      assert.equal(await page.locator(`[data-view="${view}"]`).getAttribute('aria-current'),'page');
    }
    await page.goBack();
    assert.equal(await page.locator('.view.active').getAttribute('id'),'view-logs');
    await page.goForward();
    assert.equal(await page.locator('.view.active').getAttribute('id'),'view-settings');
    await page.reload();
    assert.equal(await page.locator('.view.active').getAttribute('id'),'view-settings');
    assert.equal(await page.locator('#cookieBanner').isVisible(),false);
    await page.locator('[data-view="overview"]').click();
    await page.locator('#recentJobs .job-row').focus();
    await page.keyboard.press('Enter');
    await page.locator('#terminalOutput').filter({hasText:'Deployment complete'}).waitFor();
    await page.locator('[data-view="websites"]').click();
    await page.locator('#allSites [data-action="inspect"]').first().click();
    await page.locator('.site-modal [data-tab="deploys"]').click();
    await page.locator('#siteTabContent .job-row').click();
    assert.equal(await page.locator('#siteModal').isVisible(),false);
    await page.locator('#privacyDetails').click();
    assert.equal(await page.locator('#privacyModal').isVisible(),true);
    await page.keyboard.press('Escape');
    await page.locator('#cookieSettings').click();
    await page.locator('#cookieAccept').click();
    await page.waitForFunction(()=>!!document.getElementById('optionalFonts'));
    await page.reload();
    await page.waitForFunction(()=>!!document.getElementById('optionalFonts'));
    assert.ok(requests.length>0);
    await page.locator('#cookieSettings').click();
    await page.locator('#cookieDecline').click();
    assert.equal(await page.locator('#optionalFonts').count(),0);
    const requestCount=requests.length;
    await page.reload();
    assert.equal(requests.length,requestCount);
    await page.locator('#easyLaunchTop').click();
    assert.equal(await page.locator('#easyPage').isVisible(),true);
    await page.locator('#ezClose').click();
    assert.equal(await page.locator('#easyPage').isVisible(),false);
    await page.locator('[data-view="overview"]').click();
    await page.screenshot({path:path.join(os.tmpdir(),'pqc-desktop.png'),fullPage:true});
    await page.setViewportSize({width:375,height:812});
    await page.locator('#mobileMenu').click();
    await page.locator('[data-view="websites"]').click();
    assert.equal(await page.locator('#mobileMenu').getAttribute('aria-expanded'),'false');
    assert.equal(await page.locator('#sidebarBackdrop').isVisible(),false);
    await page.locator('#mobileMenu').click();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#mobileMenu').getAttribute('aria-expanded'),'false');
    await page.locator('#mobileMenu').click();
    await page.locator('#sidebarBackdrop').click({position:{x:350,y:300}});
    assert.equal(await page.locator('#sidebarBackdrop').isVisible(),false);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No mobile horizontal overflow');
    await page.screenshot({path:path.join(os.tmpdir(),'pqc-mobile.png'),fullPage:true});
    signedIn=false;
    await page.reload();
    await page.waitForTimeout(2400);
    assert.equal(await page.locator('#easyPage').isVisible(),false,'Disconnected users can navigate without automatic overlay');
    await page.locator('#cookieSettings').click();
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.screenshot({path:path.join(os.tmpdir(),'pqc-mobile-consent.png'),fullPage:true});
    await page.locator('#cookieDetails').click();
    assert.equal(await page.locator('#privacyModal').isVisible(),true);
    await page.keyboard.press('Escape');
    await page.locator('#cookieDecline').click();
    await page.emulateMedia({reducedMotion:'reduce'});
    for(const viewport of [{width:375,height:812},{width:812,height:375}]) {
      await page.setViewportSize(viewport);
      for(const view of ['overview','websites','deployments','logs','settings']) {
        if(viewport.width===375)await page.locator('#mobileMenu').click();
        await page.locator(`[data-view="${view}"]`).click();
        const overflow = await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(el=>el.getBoundingClientRect().right>innerWidth+1 && el.getClientRects().length).map(el=>({tag:el.tagName,id:el.id,cls:el.className,right:el.getBoundingClientRect().right})));
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${view} at ${viewport.width}px overflow: `+JSON.stringify(overflow));
      }
    }
    assert.deepEqual(errors,[]);
    console.log('PASS: navigation/history, workspace filters, keyboard logs, modal dismissal, consent persistence/revocation, wizard and responsive navigation. No Firebase writes or ZIP files.');
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
