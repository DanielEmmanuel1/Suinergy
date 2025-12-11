$packageId = "0xf9905c6611e02cd1834a5f3b966276085d314037b1d6c2e56a6c20be2ea6b620"
$objects = sui client objects --json | ConvertFrom-Json

Write-Host "Searching for Vault objects..."
Write-Host ""

foreach ($obj in $objects) {
    $type = $obj.data.type
    if ($type -like "*$packageId*Vault*" -and $type -notlike "*VaultCap*") {
        Write-Host "Found Vault:"
        Write-Host "  Object ID: $($obj.data.objectId)"
        Write-Host "  Type: $type"
        Write-Host ""
    }
}
