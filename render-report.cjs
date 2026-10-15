'use strict';
// Build a populated HTML snapshot using the same calculations as the interactive report.
// The snapshot stays useful in file previews, printing tools, and script-blocked browsers.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=__dirname,dist=path.join(root,'dashboard','dist');
const template=fs.readFileSync(path.join(root,'dashboard','template.html'),'utf8');
const elements=new Map();
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function element(id){
 if(!elements.has(id)){
  const item={id,value:'',checked:false,disabled:false,changed:false,content:'',tag:'',attributes:'',text:null,handlers:{},dataset:{},classList:{toggle(){}},addEventListener(k,f){this.handlers[k]=f},insertAdjacentHTML(_,html){this.innerHTML=this.content+html}};
  Object.defineProperty(item,'innerHTML',{get(){return this.content},set(html){this.content=String(html);this.text=null;this.changed=true;readElements(this.content)}});
  Object.defineProperty(item,'textContent',{get(){return this.text??this.content.replace(/<[^>]+>/g,'')},set(text){this.text=String(text);this.content=escape(text);this.changed=true}});
  elements.set(id,item);
 }
 return elements.get(id);
}
function readElements(html){
 const pattern=/<([a-z][\w-]*)\b([^>]*\bid="([^"]+)"[^>]*)>/gi;
 for(const match of html.matchAll(pattern)){
  const item=element(match[3]);item.tag=match[1];item.attributes=match[2];
  item.value=(match[2].match(/\bvalue="([^"]*)"/)||[])[1]||'';
  item.checked=/\bchecked(?:\s|$|=)/.test(match[2]);
 }
}
readElements(template);
const chartButtons=['revenue','visits','contacts'].map(chart=>({dataset:{chart},classList:{toggle(){}}}));
const document={getElementById:element,querySelectorAll(selector){if(selector==='[data-chart]')return chartButtons;if(selector==='#plan input')return [...elements.values()].filter(e=>e.tag==='input'&&!['from','to'].includes(e.id));if(selector==='button,input,select')return [...elements.values()].filter(e=>['button','input','select'].includes(e.tag));return []},createElement(){return {click(){}}}};
const context={window:{print(){}},document,console,Intl,Date,Map,Math,Number,String,Object,Blob,URL,setTimeout};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(dist,'data.js'),'utf8'),context,{filename:'data.js'});
vm.runInContext(fs.readFileSync(path.join(dist,'app.js'),'utf8'),context,{filename:'app.js'});
assert.ok(element('metrics').innerHTML.includes('29,643'));
assert.equal(element('totalCost').textContent,'$6,623');
assert.equal(element('heroRevenue').textContent,'$19,078,871');
assert.equal((element('shop').innerHTML.match(/<option\b/g)||[]).length,15);
element('reportStatus').textContent='Full-workbook snapshot · Open this report in a browser to use the filters and calculator.';
let html=template;
for(const item of elements.values()){
 if(!item.changed)continue;
 const regex=new RegExp('(<([a-z][\\w-]*)\\b[^>]*\\bid="'+item.id+'"[^>]*>)[\\s\\S]*?(<\\/\\2>)','i');
 html=html.replace(regex,(_,open,tag,close)=>open+item.content+close);
}
// Script execution enables the controls only after the data and event handlers are ready.
html=html.replace(/<(button|input|select)\b([^>]*)>/gi,(_,tag,attrs)=>'<'+tag+attrs.replace(/\sdisabled(?:="[^"]*")?/gi,'')+' disabled>');
for(const id of ['heroRevenue','heroVisits','metrics','chart','funnel','relationship','serviceRows','shopRows','tenure','planRows','audit','totalCost','planVisits','planRevenue']){
 const re=new RegExp('<([a-z][\\w-]*)\\b[^>]*\\bid="'+id+'"[^>]*>\\s*<\\/\\1>','i');
 assert.ok(!re.test(html),'Empty report section: '+id);
}
fs.writeFileSync(path.join(dist,'index.html'),html);
console.log('Populated report saved: key metrics, 19 monthly chart bars, service/shop tables, plan, and audit are present without JavaScript.');
