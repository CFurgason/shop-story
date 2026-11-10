'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=__dirname,dist=path.join(root,'dashboard/dist');
const readJson=p=>JSON.parse(fs.readFileSync(path.join(dist,p),'utf8'));
const history=readJson('size-data.json'),growth=readJson('growth-data.json');
const detail=JSON.parse(fs.readFileSync(path.join(dist,'data.js'),'utf8').replace(/^window\.IMPACT_DATA=/,'').replace(/;\s*$/,''));
// Private build input only. Never embed this lookup in the downloadable HTML.
const mappingPath=path.join(root,'dashboard/shop-aliases.private.json');
const aliases=fs.existsSync(mappingPath)?JSON.parse(fs.readFileSync(mappingPath,'utf8')):{};
const names=[...new Set([...history.rows.map(r=>r.shop),...growth.rows.map(r=>r.shop),...growth.active.map(r=>r.shop),...detail.shops,...(detail.active||[]).map(r=>r.shop)])].filter(Boolean).sort();
let next=Math.max(0,...Object.values(aliases).map(a=>Number(a.replace('Shop ',''))));
for(const name of names)if(!aliases[name])aliases[name]='Shop '+String(++next).padStart(3,'0');
fs.writeFileSync(mappingPath,JSON.stringify(aliases,null,2)+'\n');
const escapeHtml=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const variants=name=>[name,escapeHtml(name),escapeHtml(name).replace(/&#39;/g,'&#x27;'),JSON.stringify(name).slice(1,-1),name.replace(/'/g,"\\'")];
function anonymize(text){
 for(const name of Object.keys(aliases).sort((a,b)=>b.length-a.length))for(const variant of new Set(variants(name)))text=text.split(variant).join(aliases[name]);
 // Remove shorthand identities in prose and the legacy identity-check expression.
 text=text.replace(/\/Cordell\.\*Tomah \(MN\|WI\)\$\//g,'/unresolved-shop-identity/');
 text=text.replace(/Cordell|Hughes|Tomah MN\/WI|Tomah MN\/WI identity/gi,'An anonymous shop');
 return text;
}
for(const directory of [root,dist])for(const page of ['index','small','medium','large','growth']){
 const target=path.join(directory,page+'.html');if(!fs.existsSync(target))continue;
 let html=anonymize(fs.readFileSync(target,'utf8'));
 html=html.replace(/<p id="shop-privacy-note"[^>]*>[\s\S]*?<\/p>/,'');
 if(page!=='index')html=html.replace('<main>','<main><p id="shop-privacy-note" class="evidence-note">Shop names are anonymous. The same shop label is used throughout the dashboards and downloads.</p>');
 fs.writeFileSync(target,html);
}
module.exports={aliases,variants,anonymize};
console.log('Shop identities removed from all five HTML pages, including embedded data and download values.');
