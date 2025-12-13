# Initialize Protocol Config for v3 Package
# This creates a ProtocolConfig object that matches your current v3 deployment

$PACKAGE_ID = "0xf9905c6611e02cd1834a5f3b966276085d314037b1d6c2e56a6c20be2ea6b620"
$REGISTRY_CAP_ID = "0xa8653acdf7b208ef06b3f94fb559ac15325823689d40550a8a3cc4ec55500f05"

Write-Host "Creating ProtocolConfig for v3 package..." -ForegroundColor Cyan
Write-Host "Package: $PACKAGE_ID"
Write-Host "Registry Cap: $REGISTRY_CAP_ID"
Write-Host ""

# Call init_protocol_config function
# Note: You'll need to check the exact function name in your registry module
sui client call `
  --package $PACKAGE_ID `
  --module registry `
  --function init_protocol_config `
  --args $REGISTRY_CAP_ID `
  --gas-budget 10000000

Write-Host ""
Write-Host "✅ Protocol Config created!" -ForegroundColor Green
Write-Host "📝 Copy the ProtocolConfig object ID from the output above" -ForegroundColor Yellow
Write-Host "📝 Update your .env.local: NEXT_PUBLIC_PROTOCOL_CONFIG_ID=<object_id>" -ForegroundColor Yellow
Write-Host "📝 Also update package-mappings.ts to add the protocolConfigId for v3" -ForegroundColor Yellow
