@echo off
chcp 65001 >nul
title Maycell - Ordem de Servico
cd /d "%~dp0"
where python >nul 2>nul
if %errorlevel%==0 (
  python maycell.py
) else (
  where py >nul 2>nul
  if %errorlevel%==0 (
    py maycell.py
  ) else (
    echo Python nao encontrado.
    echo Instale em https://www.python.org/downloads/ e marque "Add Python to PATH".
  )
)
pause
