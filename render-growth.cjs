'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=__dirname,dist=path.join(root,'dashboard/dist'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const data=JSON.parse(read('dashboard/dist/growth-data.json'));
const html=read('dashboard/growth-template.html').replace('/*STYLES*/',()=>read('dashboard/dist/style.css')).replace('/*MODEL*/',()=>read('dashboard/dist/growth-model.js')).replace('/*DATA*/',()=>JSON.stringify(data).replace(/</g,'\\u003c')).replace('/*APP*/',()=>read('dashboard/dist/growth-app.js'));
fs.writeFileSync(path.join(root,'growth.html'),html);fs.writeFileSync(path.join(dist,'growth.html'),html);
// Preserve the dashboard pages while exposing the new comparison in both distributions.
for(const directory of [root,dist])for(const page of ['index.html','small.html','medium.html','large.html']){
 const target=path.join(directory,page);if(!fs.existsSync(target))continue;
 let source=fs.readFileSync(target,'utf8');
 if(!source.includes('href="growth.html"'))source=source.replace('</header>','<a class="button growth-link" href="growth.html">Compare car-count growth ↗</a></header>');
 fs.writeFileSync(target,source);
}
console.log('Car-count calculator saved to growth.html and linked from all dashboards.');
