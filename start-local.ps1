$ErrorActionPreference = 'Stop'
Push-Location $PSScriptRoot
try {
  Write-Host 'AI 前沿本地预览：http://127.0.0.1:5173（不需要登录）'
  & node scripts/run-framework.mjs dev
} finally {
  Pop-Location
}
