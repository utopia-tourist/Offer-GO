@echo off
setlocal
cd /d "%~dp0"

if not exist ".env.local" (
  echo [AI Resume Editor] .env.local not found. AI features will show "not configured".
  echo Copy .env.local.example to .env.local and fill AI_API_KEY, then restart this window.
)

where npm.cmd >nul 2>nul
if %errorlevel%==0 (
  start "AI Resume Editor Server" cmd /k npm.cmd run dev -- --hostname 127.0.0.1 --port 3000
) else (
  start "AI Resume Editor Server" cmd /k "E:\nodejs\npm.cmd" run dev -- --hostname 127.0.0.1 --port 3000
)

timeout /t 6 /nobreak >nul
start "" "http://127.0.0.1:3000"
