param([string]$Url)
try {
  $raw = [string]$Url
  $path = ""
  if ($raw -match "path=([^&]+)") {
    $path = [System.Uri]::UnescapeDataString($Matches[1])
  } else {
    $path = $raw -replace '^mzjfolder://open\??', ''
    $path = [System.Uri]::UnescapeDataString($path)
  }
  $path = $path.Trim('"')
  if ([string]::IsNullOrWhiteSpace($path)) { exit 1 }
  Start-Process explorer.exe -ArgumentList ('"{0}"' -f $path)
} catch {
  Add-Type -AssemblyName PresentationFramework
  [System.Windows.MessageBox]::Show("تعذر فتح فولدر MZJ: $($_.Exception.Message)", "MZJ Folder Opener") | Out-Null
}
