param(
    [string[]]$Extra = @()
)

# --- Thu thap file tu git ---
$gitFiles = @(
    git diff --name-only HEAD 2>$null
    git diff --name-only 2>$null
    git ls-files --others --exclude-standard 2>$null
)

# --- Gop voi file truyen vao tu tham so ---
$allFiles = @($gitFiles + $Extra) |
    Where-Object { $_ -match '\.(ts|tsx)$' } |
    Sort-Object -Unique |
    Where-Object { Test-Path $_ }

if (!$allFiles) {
    Write-Host 'Khong co file .ts/.tsx nao moi, thay doi, hoac duoc chi dinh.' -ForegroundColor Yellow
    Read-Host 'Nhan Enter de thoat'
    exit
}

Write-Host "=== Phat hien $($allFiles.Count) file can xu ly ===" -ForegroundColor Cyan
$allFiles | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
Write-Host

Write-Host '[1/2] Dang chay Prettier --write...' -ForegroundColor Green
$allFiles | ForEach-Object { & pnpm prettier --write $_ --cache --log-level warn }

Write-Host
Write-Host '[2/2] Dang chay ESLint --fix...' -ForegroundColor Green
$allFiles | ForEach-Object { & npx eslint --fix $_ }

Write-Host
Write-Host '=== Hoan thanh! Tat ca imports da duoc sap xep va format. ===' -ForegroundColor Cyan
Read-Host 'Nhan Enter de thoat'
