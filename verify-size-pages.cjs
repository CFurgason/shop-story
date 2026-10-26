'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const m=require('./dashboard/dist/size-model.js'),data=JSON.parse(fs.readFileSync('dashboard/dist/size-data.json','utf8'));
// Independent source-level reconciliation of each plotted month, with fixed denominators.
for(const group of m.groups){
 for(const horizon of [6]){
  const c=m.cohort(data,group.id,horizon);
  assert.equal(c.points.length,c.included.length?horizon:0);
  for(const p of c.points){let total=0;
   for(const shop of c.included){const expected=m.month(m.index(shop.start)+p.month-1),rows=data.rows.filter(r=>r.shop===shop.name&&r.month===expected);assert.equal(rows.length,1);total+=rows[0].visits;assert.ok(shop.carRows.length>=3);assert.notEqual(shop.name,'Hughes Motors Auto Repair')}
   assert.equal(p.average,total/c.included.length);assert.equal(p.n,c.included.length);
  }
 }
 const html=fs.readFileSync(group.id+'.html','utf8'),snapshot=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
 assert.ok(snapshot.includes(m.render(data,group.id)),'Six-month report must be populated before JS');
 assert.ok(!snapshot.includes('id="horizon"'),'Longer-period selector must be removed');
 assert.equal((snapshot.match(/class="chart-bar"/g)||[]).length,6);
 assert.ok(!/<(?:script|link)\b[^>]*(?:src|href)="(?!https?:)/i.test(html),'Page must be self-contained');
 for(const match of snapshot.matchAll(/href="([^"]+\.html)"/g))assert.ok(fs.existsSync(match[1]),'Broken navigation: '+match[1]);
 const elements=new Map(),el=id=>{if(!elements.has(id))elements.set(id,{value:'12',innerHTML:'',listeners:{},addEventListener(k,fn){this.listeners[k]=fn}});return elements.get(id)};
 const ctx={window:{print(){}},document:{getElementById:el,createElement:()=>({click(){}})},console,Intl,Date,Map,Math,Number,String,Object,Blob,URL,setTimeout};vm.createContext(ctx);
 for(const script of html.matchAll(/<script>([\s\S]*?)<\/script>/g))vm.runInContext(script[1],ctx);
 el('downloadSize').onclick();
 console.log(group.name+': 6 months = '+m.cohort(data,group.id).included.length+' shops');
}
// Data-quality boundaries: a missing month cannot become zero, and size never changes by tenure.
const row=(shop,month,cars=100,visits=10)=>({shop,month,cars,visits});
const fixture={cutoff:'2026-06',rows:[row('Complete','2026-01'),row('Complete','2026-02'),row('Complete','2026-03'),row('Complete','2026-04'),row('Complete','2026-05'),row('Complete','2026-06'),row('Gap','2026-01'),row('Gap','2026-03'),row('Gap','2026-04'),row('Hughes Motors Auto Repair','2026-01'),row('Hughes Motors Auto Repair','2026-02'),row('Hughes Motors Auto Repair','2026-03')]};
assert.equal(m.cohort(fixture,'small',6).included.length,1);
assert.equal(m.cohort(fixture,'small',6).excluded[0].name,'Gap');
assert.equal(m.shops(fixture).find(s=>s.name==='Hughes Motors Auto Repair').size,null);
for(const [cars,size] of [[199,'small'],[200,'medium'],[399,'medium'],[400,'large']]){assert.equal(m.shops({rows:['01','02','03'].map(n=>row('Boundary','2026-'+n,cars))})[0].size,size)}
assert.equal(m.validCars(row('Bad','2026-01',null)),false);
assert.equal(m.validCars(row('Bad','2026-01',0)),false);
assert.equal(m.validCars(row('Bad','2026-01',8,101)),false);
assert.equal(m.cohort({cutoff:'2026-06',rows:fixture.rows.concat(row('Complete','2026-01'))},'small',6).included.length,0);
for(const g of m.groups)assert.ok(fs.readFileSync('index.html','utf8').includes('href="'+g.id+'.html"'));
assert.ok(!fs.readFileSync('index.html','utf8').includes('What happens as a shop stays in the program?'));
console.log('PASS: group boundaries, Hughes exclusion, gap and duplicate exclusion, fixed six-month samples, source totals, static snapshots, navigation, and CSV download.');
