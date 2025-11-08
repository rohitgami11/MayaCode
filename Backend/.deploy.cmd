@if "%SCM_NODE_PATH"=="" (
  call :ExecuteCmd "npm install --production" 
) else (
  call :ExecuteCmd "%SCM_NODE_PATH%\npm.cmd" install --production
)
goto :EOF

:ExecuteCmd
setlocal
set _CMD_=%*
call %_CMD_%
if "%ERRORLEVEL%" neq "0" (
  echo Failed to execute '%_CMD_%'
  exit /b %ERRORLEVEL%
)
endlocal
goto :EOF

