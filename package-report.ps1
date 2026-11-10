$ErrorActionPreference='Stop'
& (Join-Path $PSScriptRoot 'build-data.ps1')
& (Join-Path $PSScriptRoot 'build-size-data.ps1')
& (Join-Path $PSScriptRoot 'build-growth-data.ps1')
$runtime=Get-Command node -ErrorAction SilentlyContinue
if($runtime) {
 & $runtime.Source (Join-Path $PSScriptRoot 'render-size-dashboards.cjs') | Out-Host
 if($LASTEXITCODE -ne 0){throw 'Shop-size page rendering failed.'}
 & $runtime.Source (Join-Path $PSScriptRoot 'render-size-landing.cjs') | Out-Host
} else {
 $electron=Join-Path $env:LOCALAPPDATA 'Programs/Microsoft VS Code/Code.exe'
 if(-not (Test-Path -LiteralPath $electron)){throw 'Node.js is required to generate the populated report.'}
 $priorElectronMode=$env:ELECTRON_RUN_AS_NODE
 try {
  $env:ELECTRON_RUN_AS_NODE='1'
  & $electron (Join-Path $PSScriptRoot 'render-size-dashboards.cjs') | Out-Host
  if($LASTEXITCODE -ne 0){throw 'Shop-size page rendering failed.'}
  & $electron (Join-Path $PSScriptRoot 'render-size-landing.cjs') | Out-Host
 }
 finally { $env:ELECTRON_RUN_AS_NODE=$priorElectronMode }
}
if($LASTEXITCODE -ne 0){throw 'Report rendering failed; previous standalone file was preserved.'}
$dist=Join-Path $PSScriptRoot 'dashboard/dist'
$html=[IO.File]::ReadAllText((Join-Path $dist 'index.html'))
$css=[IO.File]::ReadAllText((Join-Path $dist 'style.css'))
$data=[IO.File]::ReadAllText((Join-Path $dist 'data.js'))
$js=[IO.File]::ReadAllText((Join-Path $dist 'app.js'))
$html=$html.Replace('<link rel="stylesheet" href="style.css">',('<style>'+$css+'</style>')).Replace('<script src="data.js"></script>',('<script>'+$data+'</script>')).Replace('<script src="app.js"></script>',('<script>'+$js+'</script>'))
$html=$html.Replace('<link rel="stylesheet" href="size-style.css">',('<style>'+[IO.File]::ReadAllText((Join-Path $dist 'size-style.css'))+'</style>'))
foreach($asset in @('size-model.js','size-data.js')) {
 $html=$html.Replace(('<script src="'+$asset+'"></script>'),('<script>'+[IO.File]::ReadAllText((Join-Path $dist $asset))+'</script>'))
}
[IO.File]::WriteAllText((Join-Path $PSScriptRoot 'index.html'),$html,[Text.UTF8Encoding]::new($false))
if($runtime){
 & $runtime.Source (Join-Path $PSScriptRoot 'render-growth.cjs') | Out-Host
}else{
 $priorElectronMode=$env:ELECTRON_RUN_AS_NODE
 try{$env:ELECTRON_RUN_AS_NODE='1'; & $electron (Join-Path $PSScriptRoot 'render-growth.cjs') | Out-Host}
 finally{$env:ELECTRON_RUN_AS_NODE=$priorElectronMode}
}
if($LASTEXITCODE -ne 0){throw 'Car-count comparison rendering failed.'}
$json=$data.Substring('window.IMPACT_DATA='.Length).TrimEnd(';') | ConvertFrom-Json
$json.buckets | Export-Csv -LiteralPath (Join-Path $PSScriptRoot 'Shop Story Monthly Data.csv') -NoTypeInformation -Encoding UTF8
$json.audit | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'Shop Story Reconciliation.json') -Encoding UTF8
Write-Output "Standalone dashboard and monthly data exported."
Compress-Archive -LiteralPath @((Join-Path $PSScriptRoot 'index.html'),(Join-Path $PSScriptRoot 'small.html'),(Join-Path $PSScriptRoot 'medium.html'),(Join-Path $PSScriptRoot 'large.html'),(Join-Path $PSScriptRoot 'growth.html')) -DestinationPath (Join-Path $PSScriptRoot 'Shop Story Website.zip') -Force
