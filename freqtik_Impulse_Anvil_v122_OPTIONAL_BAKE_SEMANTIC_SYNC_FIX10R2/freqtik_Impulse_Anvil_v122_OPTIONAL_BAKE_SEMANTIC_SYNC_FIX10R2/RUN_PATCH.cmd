@echo off
setlocal
cd /d "%~dp0"
echo.
echo Impulse Anvil v1.0.122 - Optional Bake Semantic Sync FIX10R2
echo ===============================================================
echo.
node "%~dp0APPLY_BAKE_OPTIONAL_SEMANTIC_SYNC_FIX10R2.cjs"
if errorlevel 1 (
  echo.
  echo Patch failed. FIX10R2 writes transactionally and restores originals if post-write validation fails.
  echo.
  pause
  exit /b 1
)
echo.
echo Patch completed successfully.
echo.
pause
