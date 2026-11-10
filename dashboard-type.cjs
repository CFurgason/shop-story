'use strict';
// Apply the requested 3px increase once per inline stylesheet, including responsive rules.
function increaseText(html){
 return html.replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/g,(block,attrs,css)=>{
  if(attrs.includes('data-text-increase="3"'))return block;
  css=css.replace(/(font-size\s*:\s*)([^;}]+)/gi,(all,prefix,value)=>{
   const important=/\s*!important\s*$/i.test(value)?'!important':'';
   const size=value.replace(/\s*!important\s*$/i,'').trim();
   if(/^\d+(?:\.\d+)?px$/.test(size))return prefix+(parseFloat(size)+3)+'px'+important;
   if(/^clamp\(/.test(size))return prefix+'calc('+size+' + 3px)'+important;
   return all;
  });
  css=css.replace(/(font\s*:\s*[^;}]*?)(\d+(?:\.\d+)?)px/gi,(_all,prefix,size)=>prefix+(Number(size)+3)+'px');
  return '<style'+attrs+' data-text-increase="3">'+css+'</style>';
 });
}
module.exports=increaseText;
