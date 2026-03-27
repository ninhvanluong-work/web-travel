$files = $(git diff --name-only HEAD 2>$null; git diff --name-only 2>$null) |
    Where-Object { $_ -match '\.(ts|tsx)$' } |
    Sort-Object -Unique |
    Where-Object { Test-Path $_ }

if (!$files) {
    Write-Host 'Khong co file .ts/.tsx nao thay doi.' -ForegroundColor Yellow
    Read-Host 'Nhan Enter de thoat'
    exit
}

Write-Host '=== Lint + Prettier cho file thay doi ===' -ForegroundColor Cyan
$files | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
Write-Host

Write-Host '[1/2] Prettier...' -ForegroundColor Green
& pnpm prettier --write @files --cache --log-level warn

Write-Host
Write-Host '[2/2] ESLint --fix...' -ForegroundColor Green
$flags = $files | ForEach-Object { '--file'; $_ }
& pnpm next lint --fix @flags

Write-Host
Write-Host '=== Hoan thanh! ===' -ForegroundColor Cyan
Read-Host 'Nhan Enter de thoat'
