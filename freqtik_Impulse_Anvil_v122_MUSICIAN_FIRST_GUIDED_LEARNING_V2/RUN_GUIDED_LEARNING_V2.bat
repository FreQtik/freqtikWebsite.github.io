@echo off
setlocal
echo.
echo Impulse Anvil v1.0.122 - Musician-First Guided Learning v2
echo ==========================================================
echo.
where node >nul 2>&1
if errorlevel 1 (
  echo FAILED: Node.js is required.
  pause
  exit /b 1
)

echo Syntax-checking patch...
node --check "%~dp0APPLY_GUIDED_LEARNING_V2.cjs"
if errorlevel 1 goto :fail
node --check "%~dp0LEARNING_V3.js"
if errorlevel 1 goto :fail
node --check "%~dp0VALIDATE_LEARNING_V3.cjs"
if errorlevel 1 goto :fail

echo Static syntax checks: PASS
echo.
node "%~dp0APPLY_GUIDED_LEARNING_V2.cjs"
if errorlevel 1 goto :fail

echo.
echo SUCCESS.
echo Delete this patch folder, review GitHub Desktop, test Guided Learning, commit and push.
pause
exit /b 0

:fail
echo.
echo FAILED. Read the message above. Do not commit or push.
pause
exit /b 1
