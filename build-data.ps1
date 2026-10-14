$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$reader=[regex]::Match((Get-Content -LiteralPath (Join-Path $PSScriptRoot 'inspect.ps1') -Raw),"(?s)@'\r?\n(.*?)\r?\n'@").Groups[1].Value
Add-Type -TypeDefinition $reader -ReferencedAssemblies System.IO.Compression,System.IO.Compression.FileSystem,System.Xml,System.Core
Add-Type -Path (Join-Path $PSScriptRoot 'analyze.cs') -ReferencedAssemblies System.Core,System.Web.Extensions
$rows=[WorkbookReader]::Read((Join-Path $PSScriptRoot 'shop_story.xlsx'),'sheet1')
$dates=[WorkbookReader]::Read((Join-Path $PSScriptRoot 'shop_story.xlsx'),'sheet2')
[IO.Directory]::CreateDirectory((Join-Path $PSScriptRoot 'dashboard/dist')) | Out-Null
[ImpactAnalysis]::Run($rows,$dates,(Join-Path $PSScriptRoot 'dashboard/dist/data.js'))
