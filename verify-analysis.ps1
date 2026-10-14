$ErrorActionPreference='Stop'
Add-Type -Path (Join-Path $PSScriptRoot 'analyze.cs') -ReferencedAssemblies System.Core,System.Web.Extensions
$testDir=Join-Path $PSScriptRoot 'verification/a/b'
[IO.Directory]::CreateDirectory($testDir) | Out-Null
$rows=[Collections.Generic.List[string[]]]::new()
$rows.Add([string[]]::new(24))
function Add-Record($shop,$date,$task,$service,$open,$post,$amount,$appointment='') {
 $r=[string[]]::new(24);$r[0]=$shop;$r[1]='outbound';$r[3]=([datetime]$date).ToOADate().ToString([Globalization.CultureInfo]::InvariantCulture);$r[11]=$task;$r[14]=$service;$r[19]=$open;$r[21]=$post;$r[23]=[string]$amount;$r[17]=$appointment;$rows.Add($r)
}
Add-Record A '2025-03-01' 1 'Reminder Oil Change (Syn)' '10 (03-31-25)' '10 (03-31-25)' 100 111
$rows.Add($rows[1])
Add-Record A '2025-03-10' 2 'Service Overdue' '10 (03-31-25)' '10 (03-31-25)' 100 111
Add-Record B '2025-03-01' 1 'Reminder Oil Change (Syn)' '10 (03-31-25)' '10 (03-31-25)' 200 111
Add-Record A '2025-03-01' 3 'Service Overdue' '11 (04-01-25)' '11 (04-01-25)' 300
$i=12
foreach($service in @('Next Day Satisfaction','Returning Lost Customer','Returning Lost Vehicle','Welcome New Customer')) {
 Add-Record A '2025-03-01' $i $service "$i (03-02-25)" "$i (03-02-25)" 500
 $i++
}
Add-Record A '2025-03-01' 8 'Service Overdue' '16 (03-02-25), 17 (03-02-25)' '16 (03-02-25), 17 (03-02-25)' 1000
Add-Record A '2025-09-30' 9 'Service Overdue' '18 (10-01-25)' '18 (10-01-25)' 600
$dates=[Collections.Generic.List[string[]]]::new()
[ImpactAnalysis]::Run($rows,$dates,(Join-Path $testDir 'test.js'))
$s=[IO.File]::ReadAllText((Join-Path $testDir 'test.js'))
$d=$s.Substring('window.IMPACT_DATA='.Length).TrimEnd(';') | ConvertFrom-Json
foreach($pair in @(@('qualifiedVisits',4),@('verifiedRevenue',300),@('duplicateRows',1),@('uniqueAppointments',2),@('roOutsideWindow',1),@('relationshipOnlyROs',4),@('roAfterCutoff',1),@('unresolvedIndividualAmounts',2))) {
 if($d.audit.($pair[0]) -ne $pair[1]) { throw "Failed $($pair[0]): expected $($pair[1]), got $($d.audit.($pair[0]))" }
}
$a=$d.buckets | Where-Object { $_.shop -eq 'A' -and $_.service -eq 'Service Overdue' -and $_.month -eq '2025-03' }
if($a.revenue -ne 100 -or $a.visits -ne 3){throw 'Latest eligible contact attribution failed'}
Write-Output 'PASS: duplicate rows, shop-scoped IDs, all four revenue exclusions, 30/31-day boundaries, latest-touch attribution, multi-RO ambiguity, and future cutoff.'
