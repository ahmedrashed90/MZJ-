@echo off
setlocal
set "SCRIPT=%~dp0mzj-folder-opener.ps1"
reg add "HKCU\Software\Classes\mzjfolder" /ve /d "URL:MZJ Folder Protocol" /f
reg add "HKCU\Software\Classes\mzjfolder" /v "URL Protocol" /d "" /f
reg add "HKCU\Software\Classes\mzjfolder\shell\open\command" /ve /d "powershell.exe -NoProfile -ExecutionPolicy Bypass -File \"%SCRIPT%\" \"%%1\"" /f
echo.
echo MZJ folder opener installed successfully.
echo Keep this tools folder in the same location.
pause
