$files = @($(
    git diff --name-only HEAD 2>$null;
    git diff --name-only 2>$null;
    git ls-files --others --exclude-standard 2>$null
) | 
    Where-Object { $_ -match '\.(ts|tsx)$' } |
    Sort-Object -Unique |
    Where-Object { Test-Path $_ })

if (!$files) {
    Write-Host 'Khong co file .ts/.tsx nao moi hoac thay doi.' -ForegroundColor Yellow
    Read-Host 'Nhan Enter de thoat'
    exit
}

Write-Host "=== Phat hien $($files.Count) file thay doi/moi ===" -ForegroundColor Cyan
$files | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
Write-Host

Write-Host '[1/2] Dang chay Prettier --write...' -ForegroundColor Green
$files | ForEach-Object { & pnpm prettier --write $_ --cache --log-level warn }

Write-Host
Write-Host '[2/2] Dang chay ESLint --fix...' -ForegroundColor Green
# For Next.js projects, running eslint directly on files is more reliable for targeted fixes
$files | ForEach-Object { & npx eslint --fix $_ }

Write-Host
Write-Host '=== Hoan thanh! Tat ca imports da duoc sap xep va format. ===' -ForegroundColor Cyan
Read-Host 'Nhan Enter de thoat'
