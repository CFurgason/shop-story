(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.SizeComparison=factory()})(typeof window==='object'?window:this,function(){
 'use strict';
 const groups=[{id:'small',name:'Small',range:'Under 200 cars / month'},{id:'medium',name:'Medium',range:'200–399 cars / month'},{id:'large',name:'Large',range:'400+ cars / month'}];
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const number=n=>new Intl.NumberFormat('en-US',{maximumFractionDigits:1}).format(n);
 const index=m=>{const [y,n]=m.split('-').map(Number);return y*12+n-1};
 const month=i=>Math.floor(i/12)+'-'+String(i%12+1).padStart(2,'0');
 const median=xs=>{const a=[...xs].sort((a,b)=>a-b),m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2};
 const validVisits=r=>Number.isInteger(r.visits)&&r.visits>=0;
 const validCars=r=>Number.isInteger(r.cars)&&r.cars>0&&validVisits(r)&&r.visits<=r.cars;
 function shops(data){
  const map=new Map();for(const row of data.rows){if(!map.has(row.shop))map.set(row.shop,[]);map.get(row.shop).push(row)}
  return [...map].map(([name,rows])=>{
   rows.sort((a,b)=>a.month.localeCompare(b.month));const duplicates=rows.some((r,i)=>i&&r.month===rows[i-1].month);
   const carRows=rows.filter(validCars),typical=carRows.length?median(carRows.map(r=>r.cars)):null;
   let reason=name==='Hughes Motors Auto Repair'?'Excluded: car counts unreliable under this shop’s reporting process':duplicates?'Duplicate shop-months need resolution':/Cordell.*Tomah (MN|WI)$/.test(name)?'Tomah MN/WI identity and start month need confirmation':carRows.length<3?'Fewer than 3 valid car-count months':null;
   return {name,rows,start:rows[0].month,carRows,typical,size:reason?null:typical<200?'small':typical<400?'medium':'large',reason};
  }).sort((a,b)=>a.name.localeCompare(b.name));
 }
 function cohort(data,size){
  const horizon=6;
  const candidates=shops(data).filter(s=>s.size===size),included=[],excluded=[];
  for(const s of candidates){const byMonth=new Map(s.rows.map(r=>[r.month,r])),series=[];let missing=null;
   for(let i=0;i<horizon;i++){const key=month(index(s.start)+i),row=byMonth.get(key);if(key>data.cutoff||!row||!validVisits(row)){missing=key;break}series.push(row.visits)}
   if(missing)excluded.push({...s,reason:'Incomplete first '+horizon+' months (missing or invalid '+missing+')'});else included.push({...s,series});
  }
  const points=included.length?Array.from({length:horizon},(_,i)=>{const values=included.map(s=>s.series[i]);return {month:i+1,average:values.reduce((a,b)=>a+b,0)/values.length,median:median(values),min:Math.min(...values),max:Math.max(...values),n:included.length}}):[];
  return {included,excluded,points};
 }
 function graph(points){
  if(!points.length)return '<p class="empty-state">No shops have complete records for this comparison. Choose a shorter follow-up period.</p>';
  const W=1050,H=340,L=65,R=20,T=35,B=50,max=Math.max(1,...points.map(p=>p.average)),iw=W-L-R,ih=H-T-B,step=iw/points.length;
  let svg='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Average reported BDC visits by program month"><title>Average reported BDC visits per shop, with the same shops in every month</title>';
  for(let i=0;i<=4;i++){const y=T+ih*(1-i/4);svg+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+y+'" y2="'+y+'" stroke="#dce1d7"/><text class="chart-label" x="'+(L-10)+'" y="'+(y+4)+'" text-anchor="end">'+number(max*i/4)+'</text>'}
  for(const [i,p] of points.entries()){const h=ih*p.average/max,x=L+step*i+step*.22,y=T+ih-h;svg+='<rect class="chart-bar" tabindex="0" x="'+x+'" y="'+y+'" width="'+step*.56+'" height="'+h+'" rx="3"><title>Program month '+p.month+': '+number(p.average)+' average BDC visits; '+p.n+' shops; range '+p.min+'–'+p.max+'</title></rect><text class="chart-label" x="'+(x+step*.28)+'" y="'+(H-20)+'" text-anchor="middle">M'+p.month+'</text><text class="chart-value" x="'+(x+step*.28)+'" y="'+(y-8)+'" text-anchor="middle">'+number(p.average)+'</text>'}
  return svg+'</svg>';
 }
 function overview(data){return '<div class="size-cards">'+groups.map(g=>{const c=cohort(data,g.id);return '<a class="size-card" href="'+g.id+'.html"><span class="eyebrow">'+g.name.toUpperCase()+' SHOPS</span><h3>'+g.range+'</h3><p>'+c.included.length+' shops with complete first-six-month visit records</p><span class="button">Explore '+g.name.toLowerCase()+' shops ↗</span></a>'}).join('')+'</div>'}
 function render(data,size){
  const horizon=6;
  const c=cohort(data,size,horizon),all=shops(data),g=groups.find(g=>g.id===size),total=c.included.reduce((a,s)=>a+s.series.reduce((x,y)=>x+y,0),0);
  const excluded=[...c.excluded,...all.filter(s=>s.reason)];
  return '<div class="metrics size-metrics"><article class="metric"><span>Comparable shops</span><strong>'+c.included.length+'</strong><small>Same shops at every program month</small></article><article class="metric"><span>Complete shop-months</span><strong>'+number(c.included.length*horizon)+'</strong><small>First '+horizon+' months from each launch</small></article><article class="metric"><span>Reported BDC visits</span><strong>'+number(total)+'</strong><small>Across the included shops and months</small></article></div>'+
   '<div class="chart-panel"><p class="eyebrow">'+g.name.toUpperCase()+' SHOPS · '+g.range.toUpperCase()+'</p><h2>Visits as shops stay in the program</h2><p>Average reported BDC visits per shop in each program month.</p>'+(c.included.length<3?'<p class="evidence-note">Small sample: fewer than three shops qualify. Treat this as a description of these shops, not a typical performance forecast.</p>':'')+'<div class="size-chart">'+graph(c.points)+'</div><p class="fine">Each bar = the included shops’ total BDC visits in that program month ÷ '+c.included.length+' shops. Month 1 is the first calendar month listed for each shop, including a possible partial launch month. No missing visit month is filled with zero.</p></div>'+
   '<h3>Shops included in this graph</h3><div class="table-wrap"><table><thead><tr><th>Shop</th><th>First active month</th><th>Median cars / month</th><th>Valid car-count months</th><th>BDC visits, first '+horizon+' months</th></tr></thead><tbody>'+c.included.map(s=>'<tr><td>'+esc(s.name)+'</td><td>'+s.start+'</td><td>'+number(s.typical)+'</td><td>'+s.carRows.length+'</td><td>'+number(s.series.reduce((a,b)=>a+b,0))+'</td></tr>').join('')+(c.included.length?'':'<tr><td colspan="5">No shops qualify for this period.</td></tr>')+'</tbody></table></div>'+
   '<details><summary>Monthly graph values and variation</summary><div class="table-wrap"><table><thead><tr><th>Program month</th><th>Mean visits / shop</th><th>Median visits / shop</th><th>Lowest</th><th>Highest</th><th>Shops</th></tr></thead><tbody>'+c.points.map(p=>'<tr><td>'+p.month+'</td><td>'+number(p.average)+'</td><td>'+number(p.median)+'</td><td>'+p.min+'</td><td>'+p.max+'</td><td>'+p.n+'</td></tr>').join('')+'</tbody></table></div></details>'+
   '<details><summary>Excluded shops and data checks ('+excluded.length+')</summary><p class="fine">Includes shops in this size group without complete follow-up and shops that cannot be assigned a size. Shops assigned to other size groups appear on their own pages.</p><div class="table-wrap"><table><thead><tr><th>Shop</th><th>Reason</th></tr></thead><tbody>'+excluded.map(s=>'<tr><td>'+esc(s.name)+'</td><td class="reason">'+esc(s.reason)+'</td></tr>').join('')+'</tbody></table></div></details>';
 }
 return {groups,esc,number,index,month,median,validCars,shops,cohort,graph,overview,render};
});
