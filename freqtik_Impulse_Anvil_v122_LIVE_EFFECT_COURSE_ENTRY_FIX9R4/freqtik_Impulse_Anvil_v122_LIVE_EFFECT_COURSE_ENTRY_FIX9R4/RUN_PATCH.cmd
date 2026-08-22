@echo off
setlocal
cd /d "%~dp0"
echo.
echo Impulse Anvil v1.0.122 - Live Effect + Course Entry FIX9R4
echo ========================================================
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo FAIL - Node.js was not found in PATH.
  echo.
  pause
  exit /b 1
)
node "%~dp0APPLY_LIVE_EFFECT_COURSE_ENTRY_FIX9R4.cjs"
if errorlevel 1 (
  echo.
  echo Patch failed. If any write happened before validation, FIX9R4 restored the original files automatically.
  echo.
  pause
  exit /b 1
)
echo.
echo Patch completed successfully.
echo.
pause
