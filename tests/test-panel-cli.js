'use strict';
const assert = require('node:assert/strict');
const express = require('express');
const multer = require('multer');
const {run, inspectFolder, createClient} = require('../scripts/panel-cli');
const path = require('node:path');

(async()=>{
  const folder=path.join(__dirname,'../example-site');
  const build=await inspectFolder(folder);
  assert.ok(build.files.some(file=>file.relative==='index.html'));
  await assert.rejects(inspectFolder(path.join(__dirname,'../scripts')),/index.html/);
  assert.throws(()=>createClient({PANEL_URL:'https://example.com'}),/local HTTP/);
  const output=[];
  const print=value=>output.push(value);
  await run(['check',folder],{},print);
  await assert.rejects(run(['deploy','demo-project','demo-site'],{},print),/--confirm/);
  await assert.rejects(run(['upload',folder,'../bad','demo-site'],{},print),/Invalid project/);
  await assert.rejects(run(['upload',folder,'demo-project','demo-site','--spaa'],{},print),/Invalid arguments/);
  const app=express();
  app.use(express.json());
  let uploads=0, deployments=0, protectedMode=false, unlocks=0;
  app.get('/api/boot',(req,res)=>res.json({requiresAuth:protectedMode,authenticated:!protectedMode}));
  app.post('/api/unlock',(req,res)=>{
    assert.equal(req.body.token,'test-only-password');
    unlocks++;
    res.set('Set-Cookie','firebase_panel_session=test-session; HttpOnly; Path=/').json({ok:true});
  });
  app.use('/api',(req,res,next)=>{
    if(protectedMode)assert.equal(req.headers.cookie,'firebase_panel_session=test-session');
    next();
  });
  app.get('/api/projects',(req,res)=>res.json({projects:[{id:'demo-project'}]}));
  app.get('/api/sites',(req,res)=>{assert.equal(req.query.projectId,'demo-project');res.json({sites:[{id:'demo-site'}]});});
  app.get('/api/jobs',(req,res)=>res.json({jobs:[]}));
  app.get('/api/jobs/:id',(req,res)=>res.json({job:{id:req.params.id,status:'success'},logs:['Done']}));
  app.post('/api/stage',multer({storage:multer.memoryStorage(),preservePath:true}).array('files'),(req,res)=>{
    assert.equal(req.body.projectId,'demo-project');
    assert.equal(req.body.siteId,'demo-site');
    assert.equal(req.body.spa,'true');
    assert.equal(req.files.length,build.files.length);
    assert.ok(req.files.some(file=>file.originalname==='index.html'&&file.buffer.length>0));
    uploads++;
    res.json({build:{count:req.files.length}});
  });
  app.post('/api/deploy',(req,res)=>{
    assert.equal(req.body.projectId,'demo-project');
    assert.equal(req.body.siteId,'demo-site');
    assert.equal(req.body.mode,deployments===0?'preview':'live');
    deployments++;
    res.status(202).json({job:{id:'test-job',status:'queued'}});
  });
  const server=await new Promise(resolve=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s));});
  const env={PANEL_URL:`http://127.0.0.1:${server.address().port}`};
  try {
    await run(['projects'],env,print);
    await run(['sites','demo-project'],env,print);
    await run(['upload',folder,'demo-project','demo-site','--spa'],env,print);
    assert.equal(uploads,1);
    assert.equal(deployments,0,'Upload must never publish');
    await run(['preview','demo-project','demo-site'],env,print);
    await run(['deploy','demo-project','demo-site','--confirm'],env,print);
    await run(['jobs'],env,print);
    await run(['logs','test-job'],env,print);
    protectedMode=true;
    await assert.rejects(run(['projects'],env,print),/requires a password/);
    await run(['projects'],{...env,DASHBOARD_TOKEN:'test-only-password'},print);
    assert.equal(unlocks,1);
    assert.ok(!output.join('\n').includes('test-only-password'));
    console.log('CLI tests passed: offline checks, argument validation, multipart upload, separate publishing, jobs/logs and password-protected sessions. Mock server only; no ZIPs or Firebase changes.');
  } finally {
    await new Promise(resolve=>server.close(resolve));
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
