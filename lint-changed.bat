@echo off
chcp 65001 >nul
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0lint-changed.ps1"

rem ============================================================
rem  CACH DUNG:
rem    Chay file nay sau khi hoan thanh 1 task co sua .ts/.tsx
rem    Script se tu dong:
rem      1. Phat hien cac file .ts/.tsx da thay doi (git diff + untracked)
rem      2. Chay Prettier --write de format
rem      3. Chay ESLint --fix de sua import order, lint errors
rem
rem  Lenh: double-click lint-changed.bat
rem        hoac chay trong terminal: .\lint-changed.bat
rem ============================================================
