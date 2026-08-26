@echo off
REM SNS watcher - ONE pass. Windows Task Scheduler calls this every few minutes.
REM Korean paths live in package.json (npm run sns-watch) so this file stays ASCII;
REM cmd.exe reads .cmd files in the OEM codepage and mangles Korean otherwise.
REM Notes in Korean: watcher-README.md next to this file.
setlocal
cd /d "%~dp0..\..\.."
echo [%date% %time%] --- one pass --- >> "%~dp0watcher.log"
call npm run --silent sns-watch >> "%~dp0watcher.log" 2>&1
endlocal
