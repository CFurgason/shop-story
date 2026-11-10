'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),m=require('./dashboard/dist/growth-model.js'),d=require('./dashboard/dist/growth-data.json');
for(const h of [3,6]){
 const p=m.prepare(d,h);
 assert.equal(p.included.length+p.excluded.length,new Set(d.rows.map(r=>r.shop)).size);
 for(const s of p.included){
  const start=m.idx(d.active.find(a=>a.shop===s.shop).start);
  const before=d.rows.filter(r=>r.shop===s.shop&&m.idx(r.month)>=start-6&&m.idx(r.month)<start);
  const after=d.rows.filter(r=>r.shop===s.shop&&m.idx(r.month)>start&&m.idx(r.month)<=start+h);
  assert.equal(after.length,h);assert.ok(before.length>=5);assert.equal(s.baseline,m.mean(before.map(r=>r.cars)));assert.equal(s.post,m.mean(after.map(r=>r.cars)));
 }
}
// Hand-calculated equal-weight case, partial launch omitted, missing month rejected.
const months=['2025-08','2025-09','2025-10','2025-11','2025-12','2026-01','2026-02','2026-03','2026-04'];
const synthetic={asOf:'2026-11-10',active:[{shop:'A',start:'2026-01-15'},{shop:'B',start:'2026-01-01'}],rows:months.flatMap((month,i)=>[{shop:'A',month,cars:i<5?100:i===5?999:120},{shop:'B',month,cars:i<5?120:i===5?999:108}])};
let r=m.compare(synthetic,110,25,3);assert.equal(r.matches.length,2);assert.ok(Math.abs(r.average-.05)<1e-12);assert.ok(Math.abs(r.projection-115.5)<1e-10);
synthetic.rows=synthetic.rows.filter(x=>!(x.shop==='A'&&x.month==='2026-03'));assert.equal(m.prepare(synthetic,3).included.length,1);
assert.equal(m.compare(d,99999).average,null);assert.equal(m.compare(d,0).projection,null);assert.equal(m.compare(d,NaN).matches.length,0);
// Execute the actual page scripts and exercise controls without a browser.
const nodes=new Map();for(const id of ['cars','tolerance','horizon','results','tables','excluded'])nodes.set(id,{value:id==='horizon'?'6':id==='tolerance'?'25':'300',valueAsNumber:300,innerHTML:'',addEventListener(_event,fn){this.listener=fn}});
const context={window:{GROWTH_DATA:d},CarGrowth:m,document:{getElementById:id=>nodes.get(id)},Intl};
vm.runInNewContext(fs.readFileSync('dashboard/dist/growth-app.js','utf8'),context);
assert.match(nodes.get('results').innerHTML,/Average growth/);nodes.get('cars').valueAsNumber=99999;nodes.get('cars').listener();assert.match(nodes.get('results').innerHTML,/No comparable shops/);
nodes.get('cars').valueAsNumber=NaN;nodes.get('cars').listener();assert.match(nodes.get('results').innerHTML,/positive whole-number/);
nodes.get('cars').valueAsNumber=300;nodes.get('horizon').value='3';nodes.get('horizon').listener();assert.match(nodes.get('tables').innerHTML,/Month 3/);
for(const page of ['index','small','medium','large'])assert.match(fs.readFileSync(page+'.html','utf8'),/href="growth.html"/);
console.log('PASS: source reconciliation, equal-weight growth, missing months, empty/invalid inputs, interactive controls, and dashboard links.');
console.log('Example: 300 cars, ±25%, 6 months:',JSON.stringify(m.compare(d,300,25,6),['average','median','projection']));
