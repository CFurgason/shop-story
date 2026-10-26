$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.IO.Compression
$stream=[IO.File]::Open((Join-Path $PSScriptRoot 'shop_story.xlsx'),[IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]::ReadWrite)
$zip=[IO.Compression.ZipArchive]::new($stream,[IO.Compression.ZipArchiveMode]::Read)
function Read-WorkbookXml($name) {
 $entry=$zip.GetEntry($name)
 if(-not $entry){throw "Missing workbook entry: $name"}
 $reader=[IO.StreamReader]::new($entry.Open())
 try { return [xml]$reader.ReadToEnd() } finally { $reader.Dispose() }
}
try {
 $book=Read-WorkbookXml 'xl/workbook.xml'
 $rels=Read-WorkbookXml 'xl/_rels/workbook.xml.rels'
 $tab=@($book.workbook.sheets.sheet | Where-Object name -EQ 'past numbers')
 if($tab.Count -ne 1){throw 'Expected one past numbers sheet.'}
 $relationship=$rels.Relationships.Relationship | Where-Object Id -EQ $tab[0].GetAttribute('id','http://schemas.openxmlformats.org/officeDocument/2006/relationships')
 $target=[string]$relationship.Target
 if($target.StartsWith('/')){$target=$target.TrimStart('/')}else{$target='xl/'+$target}
 $shared=Read-WorkbookXml 'xl/sharedStrings.xml'
 $strings=@($shared.sst.si | ForEach-Object {$_.InnerText})
 $sheet=Read-WorkbookXml $target
 $records=@(foreach($row in ($sheet.worksheet.sheetData.row | Select-Object -Skip 1)) {
  $values=@{}
  foreach($cell in $row.c) {
   $value=[string]$cell.v
   if($cell.t -eq 's'){$value=$strings[[int]$value]}
   elseif($cell.t -eq 'inlineStr'){$value=$cell.is.InnerText}
   $values[($cell.r -replace '\d','')]=$value
  }
  if([string]::IsNullOrWhiteSpace($values['A'])){continue}
  if([string]::IsNullOrWhiteSpace($values['B'])){throw "Missing date at row $($row.r)"}
  $date=[datetime]::FromOADate([double]$values['B'])
  $visits=$null;$cars=$null
  if(-not [string]::IsNullOrWhiteSpace($values['D'])){$visits=[double]::Parse($values['D'],[cultureinfo]::InvariantCulture)}
  if(-not [string]::IsNullOrWhiteSpace($values['G'])){$cars=[double]::Parse($values['G'],[cultureinfo]::InvariantCulture)}
  [pscustomobject]@{row=[int]$row.r;shop=$values['A'].Trim();month=$date.ToString('yyyy-MM');visits=$visits;cars=$cars}
 })
 $result=[ordered]@{source='shop_story.xlsx / past numbers';cutoff=($records.month | Sort-Object | Select-Object -Last 1);rows=$records}
 [IO.File]::WriteAllText((Join-Path $PSScriptRoot 'dashboard/dist/size-data.json'),($result | ConvertTo-Json -Depth 6),[Text.UTF8Encoding]::new($false))
 Write-Output "Size comparison source: $($records.Count) shop-month rows; cutoff $($result.cutoff)."
} finally {$zip.Dispose();$stream.Dispose()}
