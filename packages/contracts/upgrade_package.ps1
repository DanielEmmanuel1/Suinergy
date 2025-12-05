# Robust Package Upgrade Script
# Usage: ./upgrade_package.ps1

# 1. Read configuration
$DeployInfo = Get-Content deployment_info.json | ConvertFrom-Json
$UpgradeCapId = $DeployInfo.upgradeCapId
$PackageId = $DeployInfo.packageId

Write-Host "📦 Preparing to upgrade package $PackageId..." -ForegroundColor Cyan
Write-Host "🔑 Using UpgradeCap: $UpgradeCapId" -ForegroundColor DarkGray

# 2. Verify UpgradeCap matches (Optional but recommended check)
# In a real script we might query the object, but for now we trust deployment_info.json

# 3. Build the package
Write-Host "🛠️  Building Move package..." -ForegroundColor Yellow
sui move build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed. Aborting upgrade." -ForegroundColor Red
    exit 1
}

# 4. Upgrade the package
Write-Host "🚀 Upgrading package on testnet..." -ForegroundColor Yellow
$UpgradeOutput = sui client upgrade --upgrade-capability $UpgradeCapId --gas-budget 100000000 --json | ConvertFrom-Json

if ($?) {
    Write-Host "✅ Upgrade successful!" -ForegroundColor Green
    
    # 5. Update deployment info (conceptually - parsing the new package ID would go here)
    # The package ID changes on upgrade (it increments), but it's linked.
    # Users interacting with the old ID are forwarded or need to use the new ID depending on the change.
    
    $NewPackageId = $UpgradeOutput.packageId # This field might vary in actual JSON output
    Write-Host "📝 Note: Package ID may have updated to a new version." -ForegroundColor Yellow
    Write-Host "   Check the output for the new package ID if you need to update .env.local"
} else {
    Write-Host "❌ Upgrade failed." -ForegroundColor Red
    exit 1
}
