'use strict';
const fs=require('node:fs'),path=require('node:path');
const compactCss=`
/* Compact spacing shared by all report pages. */
header{padding-top:14px;padding-bottom:14px}
section{padding-top:22px;padding-bottom:22px}
.hero,.size-hero{padding-top:24px;padding-bottom:24px;gap:28px}
.hero h1,.size-hero h1{margin-bottom:14px}
.intro{margin-bottom:16px;line-height:1.5;max-width:760px}
.eyebrow{margin-bottom:8px}
.section-head{margin-bottom:16px}
.section-head p{margin-top:8px;margin-bottom:0}
.hero-proof{padding:24px}
.hero-proof>div{margin:14px 0;padding:12px 0;gap:8px}
.hero-proof>p{margin:10px 0}
.chart-panel,.panel{padding:18px;margin:16px 0}
.metrics,.size-metrics{margin:16px 0;gap:12px}
.metric{padding:16px}.metric strong{margin:6px 0}
.size-chart{margin-top:12px;padding-bottom:0}
.chart-head p{margin-top:6px;margin-bottom:10px}
.fine{line-height:1.5;margin-top:10px;margin-bottom:10px}
.evidence-note{padding:12px 16px;margin:12px 0}
.filters{padding:14px;margin-top:12px}
.two-col{gap:16px}.two-col .panel{margin:0}
.method-grid{margin:16px 0;gap:20px}
.method-grid p{line-height:1.5}
details{margin:14px 0;padding:12px 0}
details[open] summary{margin-bottom:12px}
.plan-summary{padding:22px}.total-price,.scenario-stats{margin:16px 0}
.size-cards{gap:16px;margin:18px 0}.size-card{padding:20px}
.size-card p{line-height:1.5;margin:10px 0}.size-card .button{margin-top:8px}
.growth-controls{padding:16px;gap:16px;margin:16px 0}
footer{padding:22px 0;gap:12px}
@media(max-width:650px){
 main{padding-left:16px;padding-right:16px}
 .hero,.size-hero{padding-top:20px;padding-bottom:20px}
 .hero{gap:16px}.chart-panel,.panel{padding:14px}
 .plan-summary{padding:18px}.growth-controls label{min-width:0;flex-basis:100%}
}
`;
function compact(html){
 // Only change presentation markup; embedded data and application scripts remain intact.
 const scripts=[];
 html=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,s=>`<!--REPORT_SCRIPT_${scripts.push(s)-1}-->`);
 html=html.replace(/<style id="compact-report"[^>]*>[\s\S]*?<\/style>/,'');
 html=html.replace('</head>','<style id="compact-report" data-text-increase="3">'+compactCss+'</style></head>');
 html=html.replace(/(<p id="shop-privacy-note"[^>]*>)[\s\S]*?<\/p>/,'$1Shop names are anonymous.</p>');
 html=html.replace(/(<p id="reportStatus"[^>]*>)[\s\S]*?<\/p>/,'$1Use the filters to explore results.</p>');
 html=html.replace(/<p class="intro">Explore [\s\S]*?available service history\.<\/p>/,'<p class="intro">Results, six-month visits, and a plan for your shop size.</p>');
 html=html.replace('See what it could mean for your shop','Build your plan');
 html=html.replace(/(<div class="evidence-note"><b>\w+ shops[^<]*<\/b>)[\s\S]*?<\/div>/,'$1 Historical visits and detailed outreach use separate records. Coverage varies by shop.</div>');
 html=html.replace(/(<div class="evidence-note"><b>Revenue you can substantiate[^<]*<\/b>)[\s\S]*?<\/div>/,'$1 Only uniquely priced, posted ROs contribute revenue. Unpriced visits remain in visit totals.</div>');
 html=html.replace(/<p class="fine">Same shops in all six months;[\s\S]*?<\/p>/,'<p class="fine">Same shops in all six months. Month 1 may be a partial launch month.</p>');
 html=html.replace(/<p class="fine">Each bar =[\s\S]*?<\/p>/,'<p class="fine">Average visits per shop. Missing months are excluded, never filled with zero.</p>');
 html=html.replace(/<p class="fine">Size is fixed using[\s\S]*?<\/p>/,'<p class="fine">Shop size uses median valid car counts. Graphs require six complete visit months and show reported activity, not incremental lift.</p>');
 html=html.replace(/<p class="fine">A converted task[\s\S]*?<\/p>/,'<p class="fine">Conversion = tasks with a qualifying RO ÷ unique tasks. Appointments are separate.</p>');
 html=html.replace(/<p>Next Day Satisfaction, Returning Lost Customer,[\s\S]*?<\/p>/,'<p>Relationship services track contacts and appointments separately, with no revenue credit.</p>');
 html=html.replace(/<p class="fine">A later RO may[\s\S]*?<\/p>/,'');
 html=html.replace('Keep the relationship.<br>Keep the revenue math honest.','Relationship activity');
 html=html.replace('Conversion with a clear denominator','Task conversion');
 html=html.replace('Every service has a job to do.','Service results');
 html=html.replace('The work. The visits. The value.','Outreach results');
 html=html.replace(/<p class="fine">Conversion uses task cohorts[\s\S]*?<\/p>/,'<p class="fine">Conversion follows task cohorts; visits use RO opening month and revenue uses posting month. Revenue per contact is a period comparison.</p>');
 html=html.replace(/<p class="fine">Starter contact volumes[\s\S]*?<\/p>/,'<p class="fine">Fees and volumes are editable estimates. Visit projections use this size group’s historical service yields, independent of the filters.</p>');
 html=html.replace(/<p class="fine">Revenue is not profit\.[\s\S]*?<\/p>/,'<p class="fine">Historical yields are illustrative, not guaranteed. Confirm fees and capacity before purchase.</p>');
 html=html.replace(/<section id="method">(?!<details class="method-notes">)([\s\S]*?)<\/section>/,(_all,content)=>'<section id="method"><details class="method-notes"><summary>Counting rules &amp; data notes</summary>'+content.replace(/<div class="section-head">[\s\S]*?<\/h2><\/div><\/div>/,'').replace('<details open>','<details>')+'</details></section>');
 html=html.replace('Monthly BDC visits from launch through Month 6, using the same eligible shops throughout. Aggregate monthly values explain the graph.','Average monthly visits from launch through Month 6, using the same shops.');
 html=html.replace(/<section><h2>How the comparison works<\/h2>([\s\S]*?)<\/section>/,(_all,content)=>'<section><p class="fine">Observed changes may reflect seasonality and other business changes. Results are not guaranteed.</p><details><summary>How the comparison works</summary>'+content+'</details></section>');
 html=html.replace(/<p>Better follow-up starts with a clear view of the opportunity\.<\/p>/,'');
 html=html.replace(/<!--REPORT_SCRIPT_(\d+)-->/g,(_all,i)=>scripts[Number(i)]);
 // Apply the same labels to saved markup, runtime rendering, and downloads.
 const labels=[
  ['Verified attributed revenue','Verified outreach-linked revenue'],
  ['in verified, attributed revenue','in verified outreach-linked revenue'],
  ['Qualifying service visits','Outreach-linked service visits'],
  ['Verified revenue','Verified linked revenue'],
  ['verified revenue','verified linked revenue'],
  ['Visits as shops stay in the program','Observed BDC visits through Month 6'],
  ['What did similar shops grow?','How did similar shops’ car counts change?'],
  ['Average growth','Average observed growth'],
  ['Median growth','Median observed growth'],
  ['Build a plan. See the economics.','What would your plan need to deliver?'],
  ['Choose your services and adjust the monthly budget. Your estimate updates instantly.','Set your budget, repair order value, and margin to see the break-even visits.'],
  ['visits to cover your monthly cost at your ARO and margin','additional visits needed to cover monthly cost at your ARO and margin'],
  ['Revenue / total cost','Modeled revenue / plan cost'],
  ['Gross profit after plan cost','Modeled gross profit after plan cost'],
  ['Results, six-month visits, and a plan for your shop size.','See outreach-linked results, observed visit trends, and break-even costs.'],
  ['Choose a dashboard to explore results, services, six-month growth, and the economics of your plan. Each dashboard uses only its size group’s available evidence.','Compare observed results for your shop size, then explore the cost and break-even visits.'],
  ['These are bookings, not verified arrivals.','Bookings are separate from completed visits.'],
  ['Detailed shop results unavailable. See the historical shop list below.','Detailed shop results unavailable. See the historical visit graph below.']
 ];
 for(const [before,after] of labels)html=html.split(before).join(after);
 html=html.replace(/<p class="fine">Historical yields are illustrative, not guaranteed\.[\s\S]*?<\/p>/,'<p class="fine">Break-even requires additional visits caused by the program. Linked visits are not proof of added visits. Projections use historical yields and are illustrative.</p>');
 html=html.replace(/<p class="intro">Choose a dashboard to explore results,[\s\S]*?<\/p>/,'<p class="intro">Compare observed results for your shop size, then explore the cost and break-even visits.</p>');
 html=html.replace(/<small>March 2025[\s\S]*?Attribution shows association; it does not establish incremental lift\.<\/small>/,'<small>Recorded results associated with outreach; added revenue is not established.</small>');
 return html;
}
module.exports=compact;
if(require.main===module){
 for(const dir of ['','dashboard/dist/'])for(const page of ['index','small','medium','large','growth']){
  const file=path.join(__dirname,dir,page+'.html');
  fs.writeFileSync(file,compact(fs.readFileSync(file,'utf8')));
 }
 console.log('Shortened report copy and tightened spacing across all five pages.');
}
