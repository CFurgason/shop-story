(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.CarGrowth=factory()})(typeof window==='object'?window:this,function(){
 'use strict';
 const idx=m=>{const [y,n]=m.slice(0,7).split('-').map(Number);return y*12+n-1};
 const mean=a=>a.reduce((x,y)=>x+y,0)/a.length;
 const median=a=>{a=[...a].sort((x,y)=>x-y);return a.length%2?a[(a.length-1)/2]:(a[a.length/2-1]+a[a.length/2])/2};
 function prepare(data,horizon=6){
  const grouped=new Map();for(const r of data.rows){if(!grouped.has(r.shop))grouped.set(r.shop,[]);grouped.get(r.shop).push(r)}
  const included=[],excluded=[];
  for(const [shop,rows] of grouped){
   const launches=data.active.filter(r=>r.shop===shop),launch=launches[0];let reason=null;
   if(shop==='Hughes Motors Auto Repair')reason='Car counts previously flagged as unreliable';
   else if(launches.length!==1)reason='Launch date missing or ambiguous';
   else if(new Set(rows.map(r=>r.month)).size!==rows.length)reason='Duplicate shop-months';
   if(reason){excluded.push({shop,reason});continue}
   const start=idx(launch.start),lookup=new Map(rows.map(r=>[idx(r.month),r]));
   const valid=r=>r&&Number.isInteger(r.cars)&&r.cars>0&&idx(r.month)<idx(data.asOf);
   const baselineRows=rows.filter(r=>idx(r.month)>=start-6&&idx(r.month)<start);
   // Require the five immediate pre-launch months; use month -6 too when available.
   if(!Array.from({length:5},(_,i)=>lookup.get(start-1-i)).every(valid)||!baselineRows.every(valid)){excluded.push({shop,reason:'Needs 5 consecutive valid pre-launch months'});continue}
   // Omit the launch calendar month to avoid partial launch effects.
   const follow=Array.from({length:horizon},(_,i)=>lookup.get(start+1+i));
   if(!follow.every(valid)){excluded.push({shop,reason:'Missing or invalid full follow-up months (needs '+horizon+')'});continue}
   if(launch.end&&idx(launch.end)<=start+horizon){excluded.push({shop,reason:'Service ended during follow-up'});continue}
   const baseline=mean(baselineRows.map(r=>r.cars)),post=mean(follow.map(r=>r.cars));
   included.push({shop,start:launch.start,baseline,post,growth:post/baseline-1,baselineMonths:baselineRows.length,series:follow.map(r=>r.cars)});
  }
  return {included,excluded};
 }
 function compare(data,cars,tolerance=25,horizon=6){
  const prepared=prepare(data,horizon);
  if(!Number.isInteger(cars)||cars<=0||!Number.isFinite(tolerance)||tolerance<0||tolerance>100)return {...prepared,matches:[],average:null,median:null,projection:null};
  const matches=prepared.included.filter(s=>s.baseline>=cars*(1-tolerance/100)&&s.baseline<=cars*(1+tolerance/100));
  const average=matches.length?mean(matches.map(s=>s.growth)):null;
  return {...prepared,matches,average,median:matches.length?median(matches.map(s=>s.growth)):null,projection:average===null?null:cars*(1+average)};
 }
 return {idx,mean,prepare,compare};
});
