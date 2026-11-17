@echo off
echo Starting the application...
npm start
REM Chequea el código de salida del comando npm start
if %errorlevel% neq 0 (
    echo Application failed to start. Please check for errors.
) else (
    echo Application started successfully.
)

REM Si el programa es cerrado por el usuario, se confirma que se cerró correctamente
if %errorlevel% neq 0 (
    echo Application closed with errors.
) else (
    echo Application closed successfully.
)

pause