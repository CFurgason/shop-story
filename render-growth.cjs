'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=__dirname,dist=path.join(root,'dashboard/dist'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const data=JSON.parse(read('dashboard/dist/growth-data.json'));
const increaseText=require('./dashboard-type.cjs');
const html=increaseText(read('dashboard/growth-template.html').replace('/*STYLES*/',()=>read('dashboard/dist/style.css')).replace('/*MODEL*/',()=>read('dashboard/dist/growth-model.js')).replace('/*DATA*/',()=>JSON.stringify(data).replace(/</g,'\\u003c')).replace('/*APP*/',()=>read('dashboard/dist/growth-app.js')));
fs.writeFileSync(path.join(root,'growth.html'),html);fs.writeFileSync(path.join(dist,'growth.html'),html);
// Keep the front page focused on choosing a dashboard. Growth opens separately.
for(const directory of [root,dist])for(const page of ['index.html','small.html','medium.html','large.html']){
 const target=path.join(directory,page);if(!fs.existsSync(target))continue;
 let source=fs.readFileSync(target,'utf8');
 source=source.replace(/<section id="car-count-growth"[\s\S]*?<\/iframe><\/section>/,'');
 source=source.replace(/<a class="button growth-link" href="growth.html">[\s\S]*?<\/a>/g,'');
 source=source.replace(/<a class="growth-nav" href="growth.html">[\s\S]*?<\/a>/g,'');
 if(page!=='index.html')source=source.replace('</nav>','<a class="growth-nav" href="growth.html">Car-count growth ↗</a></nav>');
 source=source.replace(/<style id="dashboard-layout"[^>]*>[\s\S]*?<\/style>/,'');
 source=source.replace('</head>','<style id="dashboard-layout">'+read('dashboard/dashboard-layout.css')+'</style></head>');
 fs.writeFileSync(target,increaseText(source));
}
console.log('Front page restored; compact growth links on shop dashboards; wider dashboard layout saved.');
require('./anonymize-dashboard.cjs');
const compact=require('./compact-dashboard.cjs');
for(const directory of [root,dist])for(const page of ['index','small','medium','large','growth']){
 const file=path.join(directory,page+'.html');
 fs.writeFileSync(file,compact(fs.readFileSync(file,'utf8')));
}
