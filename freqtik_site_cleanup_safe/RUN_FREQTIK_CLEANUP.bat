@echo off
setlocal
cd /d "%~dp0"
echo.
echo Applying the safe FreQtik website cleanup...
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0APPLY_FREQTIK_CLEANUP.ps1"
set "EXITCODE=%ERRORLEVEL%"
echo.
if not "%EXITCODE%"=="0" (
  echo The cleanup stopped because a preflight or validation check failed.
  echo Nothing should be pushed until the error above is resolved.
) else (
  echo Cleanup and validation completed.
)
echo.
pause
exit /b %EXITCODE%
