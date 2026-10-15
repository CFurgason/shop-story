$ErrorActionPreference='Stop'
$runtime=Get-Command node -ErrorAction SilentlyContinue
if($runtime) {
 & $runtime.Source (Join-Path $PSScriptRoot 'render-report.cjs') | Out-Host
} else {
 $electron=Join-Path $env:LOCALAPPDATA 'Programs/Microsoft VS Code/Code.exe'
 if(-not (Test-Path -LiteralPath $electron)){throw 'Node.js is required to generate the populated report.'}
 $priorElectronMode=$env:ELECTRON_RUN_AS_NODE
 try { $env:ELECTRON_RUN_AS_NODE='1'; & $electron (Join-Path $PSScriptRoot 'render-report.cjs') | Out-Host }
 finally { $env:ELECTRON_RUN_AS_NODE=$priorElectronMode }
}
if($LASTEXITCODE -ne 0){throw 'Report rendering failed; previous standalone file was preserved.'}
$dist=Join-Path $PSScriptRoot 'dashboard/dist'
$html=[IO.File]::ReadAllText((Join-Path $dist 'index.html'))
$css=[IO.File]::ReadAllText((Join-Path $dist 'style.css'))
$data=[IO.File]::ReadAllText((Join-Path $dist 'data.js'))
$js=[IO.File]::ReadAllText((Join-Path $dist 'app.js'))
$html=$html.Replace('<link rel="stylesheet" href="style.css">',('<style>'+$css+'</style>')).Replace('<script src="data.js"></script>',('<script>'+$data+'</script>')).Replace('<script src="app.js"></script>',('<script>'+$js+'</script>'))
[IO.File]::WriteAllText((Join-Path $PSScriptRoot 'index.html'),$html,[Text.UTF8Encoding]::new($false))
$json=$data.Substring('window.IMPACT_DATA='.Length).TrimEnd(';') | ConvertFrom-Json
$json.buckets | Export-Csv -LiteralPath (Join-Path $PSScriptRoot 'Shop Story Monthly Data.csv') -NoTypeInformation -Encoding UTF8
$json.audit | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'Shop Story Reconciliation.json') -Encoding UTF8
Write-Output "Standalone dashboard and monthly data exported."
