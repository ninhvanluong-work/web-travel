@echo off
:: ============================================================
:: Schedule k6 capacity test to run automatically
:: Registers a Windows Task Scheduler job
::
:: Usage:
::   schedule.bat install    <- chạy test mỗi tuần Thứ Hai 2am
::   schedule.bat remove     <- xóa lịch
::   schedule.bat status     <- xem lịch đang có
::   schedule.bat run-now    <- chạy ngay lập tức
:: ============================================================

set "TASK_NAME=k6-capacity-test"
set "PROJECT_DIR=%~dp0..\.."
set "SCRIPT=%~dp0run-k6-influx.bat"

if /i "%1"=="install"  goto :install
if /i "%1"=="remove"   goto :remove
if /i "%1"=="status"   goto :status
if /i "%1"=="run-now"  goto :run_now
goto :help

:: ============================================================

:install
:: Tạo file wrapper script trước
echo @echo off > "%SCRIPT%"
echo cd /d "%PROJECT_DIR%" >> "%SCRIPT%"
echo call tests\k6\run-tests.bat capacity --influx >> "%SCRIPT%"

:: Đăng ký task: chạy mỗi Thứ Hai lúc 2:00am
schtasks /create ^
  /tn "%TASK_NAME%" ^
  /tr "\"%SCRIPT%\"" ^
  /sc weekly ^
  /d MON ^
  /st 02:00 ^
  /f

if errorlevel 1 (
    echo [ERROR] Không thể tạo scheduled task. Chạy lại với quyền Admin.
) else (
    echo.
    echo  [OK] Đã đăng ký task: %TASK_NAME%
    echo  Lịch chạy: mỗi Thứ Hai lúc 2:00am
    echo  Kết quả xem tại: http://localhost:3001
    echo.
    echo  Lưu ý: Docker Desktop phải đang chạy để Grafana hoạt động.
)
goto :end

:remove
schtasks /delete /tn "%TASK_NAME%" /f
if errorlevel 1 (
    echo [ERROR] Không tìm thấy task hoặc không có quyền xóa.
) else (
    echo [OK] Đã xóa scheduled task: %TASK_NAME%
)
goto :end

:status
schtasks /query /tn "%TASK_NAME%" /fo list
goto :end

:run_now
schtasks /run /tn "%TASK_NAME%"
echo [OK] Task đang chạy. Xem kết quả tại http://localhost:3001
goto :end

:help
echo.
echo  ===================================
echo   k6 Auto Schedule
echo  ===================================
echo.
echo  Usage: schedule.bat [command]
echo.
echo  Commands:
echo    install   Đăng ký chạy tự động mỗi Thứ Hai 2am
echo    remove    Xóa lịch tự động
echo    status    Xem trạng thái lịch
echo    run-now   Chạy ngay lập tức
echo.
echo  Yêu cầu:
echo    - Grafana đang chạy: run-tests.bat grafana
echo    - Docker Desktop đang mở
echo.

:end
