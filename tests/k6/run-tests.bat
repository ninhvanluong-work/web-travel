@echo off
setlocal enabledelayedexpansion

:: ============================================================
:: k6 Load Test Runner
:: Usage: run-tests.bat [test] [--dashboard|--influx]
:: ============================================================

:: Add k6 to PATH if not found
where k6 >nul 2>&1
if errorlevel 1 (
    set "PATH=%PATH%;C:\Program Files\k6"
)

:: Check k6 available
where k6 >nul 2>&1
if errorlevel 1 (
    echo [ERROR] k6 not found. Install: winget install k6 --source winget
    pause
    exit /b 1
)

:: Create reports directory
if not exist "tests\k6\reports" mkdir "tests\k6\reports"

:: No argument - show help
if "%1"=="" goto :help

:: Route to test
if /i "%1"=="api"      goto :run_api
if /i "%1"=="load"     goto :run_load
if /i "%1"=="stress"   goto :run_stress
if /i "%1"=="spike"    goto :run_spike
if /i "%1"=="capacity" goto :run_capacity
if /i "%1"=="fe"       goto :run_fe
if /i "%1"=="grafana"  goto :grafana_up
if /i "%1"=="stop"     goto :grafana_down
goto :help

:: ============================================================
:: Helper: build k6 run command based on flag
:: %1 = script path, %2 = flag (--dashboard / --influx / empty)
:: ============================================================

:run_k6
set "SCRIPT=%~1"
set "FLAG=%~2"
set "REPORT=tests\k6\reports\%~3"

if /i "%FLAG%"=="--dashboard" (
    echo  Live dashboard: http://localhost:5665
    echo.
    set "K6_WEB_DASHBOARD=true"
    set "K6_WEB_DASHBOARD_EXPORT=%REPORT%"
    k6 run --out web-dashboard %SCRIPT%
) else if /i "%FLAG%"=="--influx" (
    echo  Sending metrics to Grafana at http://localhost:3001
    echo.
    set "K6_WEB_DASHBOARD=true"
    set "K6_WEB_DASHBOARD_EXPORT=%REPORT%"
    k6 run --out influxdb=http://localhost:8086/k6 %SCRIPT%
) else (
    set "K6_WEB_DASHBOARD=true"
    set "K6_WEB_DASHBOARD_EXPORT=%REPORT%"
    k6 run %SCRIPT%
)
goto :result

:: ============================================================

:run_api
echo.
echo  ===================================
echo   API Test - 100 VUs / ~4 min
echo   Target: https://web-travel-be.fly.dev
echo  ===================================
echo.
call :run_k6 "tests\k6\api-test.js" "%2" "api-report-latest.html"
goto :end

:run_load
echo.
echo  ===================================
echo   Load Test - 20 VUs / ~5 min
echo   Target: http://localhost:3000
echo  ===================================
echo.
call :run_k6 "tests\k6\load-test.js" "%2" "load-report-latest.html"
goto :end

:run_stress
echo.
echo  ===================================
echo   Stress Test - up to 300 VUs / ~38 min
echo   Target: https://web-travel-be.fly.dev
echo  ===================================
echo.
call :run_k6 "tests\k6\stress-test.js" "%2" "stress-report-latest.html"
goto :end

:run_spike
echo.
echo  ===================================
echo   Spike Test - up to 200 VUs / ~8 min
echo   Target: https://web-travel-be.fly.dev
echo  ===================================
echo.
call :run_k6 "tests\k6\spike-test.js" "%2" "spike-report-latest.html"
goto :end

:run_capacity
echo.
echo  ===================================
echo   Capacity Test - 10 to 100 VUs / ~21 min
echo   Target: https://web-travel-be.fly.dev
echo  ===================================
echo.
call :run_k6 "tests\k6\capacity-test.js" "%2" "capacity-report-latest.html"
goto :end

:run_fe
echo.
echo  ===================================
echo   Frontend Test - 10 to 50 VUs / ~13 min
echo   Target: Vercel (production)
echo  ===================================
echo.
call :run_k6 "tests\k6\fe-test.js" "%2" "fe-report-latest.html"
goto :end

:: ============================================================
:: Grafana stack management
:: ============================================================

:grafana_up
echo.
echo  Starting Grafana + InfluxDB...
docker compose -f tests\k6\docker-compose.yml up -d
echo.
echo  Grafana  : http://localhost:3001
echo  InfluxDB : http://localhost:8086
echo.
echo  First time: import dashboard ID 2587 in Grafana.
echo  Run test with --influx flag to send data to Grafana.
echo.
goto :end

:grafana_down
echo.
echo  Stopping Grafana + InfluxDB...
docker compose -f tests\k6\docker-compose.yml down
echo.
goto :end

:: ============================================================

:result
if errorlevel 1 (
    echo.
    echo  [FAILED] One or more thresholds were crossed.
) else (
    echo.
    echo  [PASSED] All thresholds met.
)
echo  HTML report: %REPORT%
echo  Opening report in browser...
start "" "%REPORT%"
echo.
exit /b

:help
echo.
echo  ===================================
echo   k6 Load Test Runner
echo  ===================================
echo.
echo  Usage:
echo    run-tests.bat [command] [--dashboard^|--influx]
echo.
echo  Tests:
echo    api      Test API backend directly    (100 VUs, ~4 min)
echo    load     Test Next.js pages           (20 VUs,  ~5 min)
echo    stress   Find server breaking point   (300 VUs, ~38 min)
echo    spike    Sudden burst of traffic      (200 VUs, ~8 min)
echo    capacity Find optimal VU limit        (10-100 VUs, ~21 min)
echo    fe       Test Vercel frontend pages   (10-50 VUs,  ~13 min)
echo.
echo  Grafana:
echo    grafana  Start Grafana + InfluxDB (Docker)
echo    stop     Stop Grafana + InfluxDB
echo.
echo  Options:
echo    --dashboard   Real-time dashboard at http://localhost:5665
echo    --influx      Send metrics to Grafana at http://localhost:3001
echo.
echo  Examples:
echo    run-tests.bat grafana
echo    run-tests.bat capacity --influx
echo    run-tests.bat api --influx
echo    run-tests.bat stop
echo.

:end
endlocal
