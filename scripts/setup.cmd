@echo off
REM Setup para Windows sem alterar a política de execução do PowerShell.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup.ps1"
pause
