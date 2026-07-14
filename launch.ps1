# Kawn Sprouts - quick launch (kills conflicting ports, starts dev server)
# Usage:  .\launch.ps1
#         npm run launch

$ErrorActionPreference = 'SilentlyContinue'
$ProjectRoot = $PSScriptRoot
$FrontendPort = 5173
$PreviewPort = 4173
# Reserved for a future Kawn API - no backend in this prototype yet
$BackendPort = $null

function Stop-Port {
    param([int]$Port)
    $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    foreach ($conn in $connections) {
        $procId = $conn.OwningProcess
        if ($procId -and $procId -ne 0) {
            Write-Host "Stopping process on port $Port (PID $procId)..." -ForegroundColor Yellow
            Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
        }
    }
}

Write-Host ""
Write-Host "Kawn Sprouts - launching..." -ForegroundColor Green
Write-Host ""

Stop-Port -Port $FrontendPort
Stop-Port -Port $PreviewPort
if ($BackendPort) { Stop-Port -Port $BackendPort }

Start-Sleep -Milliseconds 400

Set-Location $ProjectRoot

Start-Job -ScriptBlock {
    param($port)
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:$port"
} -ArgumentList $FrontendPort | Out-Null

$url = "http://localhost:$FrontendPort"
Write-Host "Starting frontend on $url" -ForegroundColor Cyan
Write-Host ""

npm run dev
