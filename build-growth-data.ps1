$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.IO.Compression
$stream=[IO.File]::Open((Join-Path $PSScriptRoot 'shop_story.xlsx'),'Open','Read','ReadWrite')
$zip=[IO.Compression.ZipArchive]::new($stream)
function ReadXml($name){$r=[IO.StreamReader]::new($zip.GetEntry($name).Open());try{[xml]$r.ReadToEnd()}finally{$r.Dispose()}}
try {
 $book=ReadXml 'xl/workbook.xml'; $rels=ReadXml 'xl/_rels/workbook.xml.rels'
 $shared=ReadXml 'xl/sharedStrings.xml'; $strings=@($shared.sst.si | ForEach-Object {$_.InnerText})
 function Rows($name){
  $tab=$book.workbook.sheets.sheet | Where-Object name -eq $name
  if(-not $tab){throw "Missing sheet: $name"}
  $id=$tab.GetAttribute('id','http://schemas.openxmlformats.org/officeDocument/2006/relationships')
  $target=[string]($rels.Relationships.Relationship | Where-Object Id -eq $id).Target
  if($target.StartsWith('/')){$target=$target.TrimStart('/')}else{$target='xl/'+$target}
  $sheet=ReadXml $target
  foreach($row in ($sheet.worksheet.sheetData.row | Select-Object -Skip 1)){
   $v=@{}; foreach($c in $row.c){$value=[string]$c.v; if($c.t -eq 's'){$value=$strings[[int]$value]}elseif($c.t -eq 'inlineStr'){$value=$c.is.InnerText};$v[($c.r -replace '\d','')]=$value}
   if($v.A){$v}
  }
 }
 $active=@(Rows 'Shop active dates' | ForEach-Object {[ordered]@{shop=$_.A.Trim();start=([datetime]::FromOADate([double]$_.B)).ToString('yyyy-MM-dd');end=if($_.C){([datetime]::FromOADate([double]$_.C)).ToString('yyyy-MM-dd')}else{$null}}})
 $rows=@(Rows '12 month car count' | ForEach-Object {[ordered]@{shop=$_.A.Trim();cars=if($_.B -ne ''){[double]::Parse($_.B,[cultureinfo]::InvariantCulture)}else{$null};month=([datetime]::FromOADate([double]$_.C)).ToString('yyyy-MM')}})
 $result=[ordered]@{source='shop_story.xlsx / 12 month car count + Shop active dates';asOf='2026-11-10';active=$active;rows=$rows}
 [IO.File]::WriteAllText((Join-Path $PSScriptRoot 'dashboard/dist/growth-data.json'),($result | ConvertTo-Json -Depth 8),[Text.UTF8Encoding]::new($false))
 Write-Output "Growth source: $($rows.Count) shop-month rows; $($active.Count) launch records."
}finally{$zip.Dispose();$stream.Dispose()}
