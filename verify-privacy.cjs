'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const aliases=JSON.parse(fs.readFileSync('dashboard/shop-aliases.private.json','utf8'));
const escapeHtml=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
for(const dir of ['','dashboard/dist/'])for(const page of ['index','small','medium','large','growth']){
 const html=fs.readFileSync(dir+page+'.html','utf8');
 for(const name of Object.keys(aliases))for(const variant of [name,escapeHtml(name),JSON.stringify(name).slice(1,-1),name.replace(/'/g,"\\'")])assert.ok(!html.includes(variant),'Identity remains in '+dir+page);
 assert.ok(!/Hughes|Cordell|Tomah/i.test(html),'Shorthand identity remains');
}
const snapshot=require('./dashboard-snapshot.cjs');
for(const size of ['small','medium','large']){
 const html=fs.readFileSync(size+'.html','utf8'),scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
 const runtime=snapshot(html,scripts),d=runtime.context.window.IMPACT_DATA,h=runtime.context.window.SIZE_DATA;
 assert.ok(d.shops.every(s=>/^Shop \d+$/.test(s)));
 assert.ok(h.rows.every(r=>/^Shop \d+$/.test(r.shop)));
 assert.ok(runtime.elements.get('shop').innerHTML.includes('Shop ')||!d.shops.length);
}
const html=fs.readFileSync('growth.html','utf8'),scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const context={};context.window=context;vm.createContext(context);
for(const script of scripts.slice(0,2))vm.runInContext(script,context);
assert.ok(context.GROWTH_DATA.rows.every(r=>/^Shop \d+$/.test(r.shop)));
const model=require('./dashboard/dist/growth-model.js'),data=require('./dashboard/dist/growth-data.json');
for(const h of [3,6])for(const cars of [150,300,450,600]){
 const before=model.compare(data,cars,25,h),after=context.CarGrowth.compare(context.GROWTH_DATA,cars,25,h);
 assert.equal(after.average,before.average);assert.equal(after.matches.length,before.matches.length);
}
console.log('PASS: all 10 HTML files contain no source shop names; anonymous filters and embedded models work; growth results unchanged.');
