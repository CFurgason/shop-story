Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -TypeDefinition @'
using System; using System.IO; using System.IO.Compression; using System.Xml; using System.Linq; using System.Collections.Generic; using System.Globalization;
public class WorkbookReader {
public static List<string[]> Read(string path,string sheet) {
var rows=new List<string[]>(); using(var z=ZipFile.OpenRead(path)) {
var strings=new List<string>(); using(var x=XmlReader.Create(z.GetEntry("xl/sharedStrings.xml").Open())) {while(x.Read()) if(x.NodeType==XmlNodeType.Element && x.LocalName=="si") {using(var sub=x.ReadSubtree()){var doc=new XmlDocument();doc.Load(sub);strings.Add(doc.DocumentElement.InnerText);}}}
using(var x=XmlReader.Create(z.GetEntry("xl/worksheets/"+sheet+".xml").Open())) {while(x.Read()) if(x.NodeType==XmlNodeType.Element && x.LocalName=="row") {var a=new string[24]; using(var sub=x.ReadSubtree()){var doc=new XmlDocument();doc.Load(sub);foreach(XmlNode c in doc.DocumentElement.ChildNodes) {string addr=c.Attributes["r"].Value; int col=0;foreach(char ch in addr){if(!char.IsLetter(ch))break;col=col*26+ch-'A'+1;} var v=c.ChildNodes.Cast<XmlNode>().FirstOrDefault(t=>t.LocalName=="v");string val=v==null?"":v.InnerText;if(c.Attributes["t"]!=null && c.Attributes["t"].Value=="s")val=strings[int.Parse(val)];if(col<=24)a[col-1]=val;}} rows.Add(a);}}
} return rows; }
}
'@ -ReferencedAssemblies System.IO.Compression,System.IO.Compression.FileSystem,System.Xml,System.Core
$rows=[WorkbookReader]::Read((Join-Path $PWD 'shop_story.xlsx'),'sheet1')
Write-Output "Rows: $($rows.Count)"
$rows | Select-Object -First 1 | ForEach-Object { $_ -join ' | ' }
$rows | Select-Object -Skip 1 | Group-Object { $_[14] } | Sort-Object Count -Descending | Select-Object Count,Name | Format-Table -AutoSize
Write-Output 'Directions'
$rows | Select-Object -Skip 1 | Group-Object { $_[1] } | Select-Object Count,Name | Format-Table -AutoSize
Write-Output 'Revenue samples'
$rows | Where-Object { $_[23] -and [double]$_[23] -gt 0 } | Select-Object -First 15 | ForEach-Object { @($_[0],$_[3],$_[11],$_[14],$_[17],$_[19],$_[21],$_[23]) -join ' | ' }
$active=[WorkbookReader]::Read((Join-Path $PWD 'shop_story.xlsx'),'sheet2')
$active | ForEach-Object { $_[0..2] -join ' | ' }
