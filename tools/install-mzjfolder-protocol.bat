@echo off
setlocal

set "APPDIR=C:\MZJFolderOpener"
set "PSFILE=%APPDIR%\open-folder.ps1"

mkdir "%APPDIR%" >nul 2>&1

> "%PSFILE%" echo param([string]$Url)
>> "%PSFILE%" echo $Log = "$env:TEMP\mzjfolder.log"
>> "%PSFILE%" echo "URL=$Url" ^| Out-File -FilePath $Log -Encoding utf8
>> "%PSFILE%" echo try {
>> "%PSFILE%" echo   $path = $Url
>> "%PSFILE%" echo   if ($Url -match 'path=([^&]+)') {
>> "%PSFILE%" echo     $path = [System.Uri]::UnescapeDataString($Matches[1])
>> "%PSFILE%" echo   } else {
>> "%PSFILE%" echo     $path = $Url -replace '^mzjfolder://open\??path=', ''
>> "%PSFILE%" echo   }
>> "%PSFILE%" echo   $path = $path -replace '/', '\'
>> "%PSFILE%" echo   "PATH=$path" ^| Add-Content -Path $Log -Encoding utf8
>> "%PSFILE%" echo   if (Test-Path -LiteralPath $path) {
>> "%PSFILE%" echo     Start-Process explorer.exe -ArgumentList "`"$path`""
>> "%PSFILE%" echo   } else {
>> "%PSFILE%" echo     "NOT_FOUND=$path" ^| Add-Content -Path $Log -Encoding utf8
>> "%PSFILE%" echo     Add-Type -AssemblyName System.Windows.Forms
>> "%PSFILE%" echo     [System.Windows.Forms.MessageBox]::Show("Folder not found:`n" + $path + "`n`nCheck RaiDrive letter Z: and create raw folders again.", "MZJ Folder") ^| Out-Null
>> "%PSFILE%" echo   }
>> "%PSFILE%" echo } catch {
>> "%PSFILE%" echo   "ERROR=$($_.Exception.Message)" ^| Add-Content -Path $Log -Encoding utf8
>> "%PSFILE%" echo   Add-Type -AssemblyName System.Windows.Forms
>> "%PSFILE%" echo   [System.Windows.Forms.MessageBox]::Show($_.Exception.Message, "MZJ Folder Error") ^| Out-Null
>> "%PSFILE%" echo }

reg delete "HKCU\Software\Classes\mzjfolder" /f >nul 2>&1
reg add "HKCU\Software\Classes\mzjfolder" /ve /d "URL:MZJ Folder Protocol" /f
reg add "HKCU\Software\Classes\mzjfolder" /v "URL Protocol" /d "" /f
reg add "HKCU\Software\Classes\mzjfolder\shell\open\command" /ve /d "powershell.exe -NoProfile -ExecutionPolicy Bypass -File \"C:\MZJFolderOpener\open-folder.ps1\" \"%%1\"" /f

echo.
echo MZJ Folder Protocol v753 installed.
echo.
pause
