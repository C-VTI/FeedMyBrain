@echo off
REM FeedMyBrain starten (Windows): installiert beim ersten Mal die Pakete und oeffnet die App im Browser.
cd /d "%~dp0"
if not exist node_modules (
  echo Installiere Pakete ...
  call npm install
)
call npm run dev
