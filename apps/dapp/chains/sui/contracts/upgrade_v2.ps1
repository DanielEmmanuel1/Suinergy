# Upgrade v2 package to add withdraw<T> function
# This will make USDC withdrawals work

$UPGRADE_CAP = "0xe755028b4868c2d2369a4908e62f6e2f12d0c17eb4289c76f17bf3d0bcd274d2"

Write-Host "Upgrading v2 package to add withdraw<T> function..." -ForegroundColor Cyan

# Build the package
Write-Host "Building package..." -ForegroundColor Yellow
sui move build

# Upgrade the package
Write-Host "Upgrading package..." -ForegroundColor Yellow
sui client upgrade `
  --upgrade-capability $UPGRADE_CAP `
  --gas-budget 100000000

Write-Host ""
Write-Host "✅ Package upgraded!" -ForegroundColor Green
Write-Host "📝 USDC withdrawals should now work" -ForegroundColor Yellow
