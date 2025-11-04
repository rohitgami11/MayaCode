# PowerShell script to fix Node.js version on Azure App Service
# Run this via Kudu Console → PowerShell or via Azure CLI

# This script sets the Node.js version to 20.x
# You can also do this via Azure Portal:
# Configuration → General settings → Stack settings → Node.js 20.x

Write-Host "Setting Node.js version to 20.x..."
Write-Host "Note: This requires Azure CLI or Azure Portal access"
Write-Host ""
Write-Host "To fix via Azure Portal:"
Write-Host "1. Go to Azure Portal → App Service 'Maya'"
Write-Host "2. Configuration → General settings"
Write-Host "3. Stack settings → Stack: Node.js"
Write-Host "4. Major version: 20"
Write-Host "5. Minor version: 20.x (latest)"
Write-Host "6. Click Save"
Write-Host "7. Restart the App Service"
Write-Host ""
Write-Host "After restart, verify with: node -v"
Write-Host "Should show: v20.x.x"

