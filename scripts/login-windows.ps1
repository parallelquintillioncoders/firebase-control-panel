param(
    [Parameter(Mandatory=$true)][string]$NodeExecutable,
    [Parameter(Mandatory=$true)][string]$FirebaseScript
)
$Host.UI.RawUI.WindowTitle = 'Launchpad - Google Account Sign In'
Write-Host ''
Write-Host '  LAUNCHPAD - GOOGLE FIREBASE ACCOUNT' -ForegroundColor Cyan
Write-Host '  --------------------------------' -ForegroundColor Cyan
Write-Host '  This window will open the official Google sign-in flow.'
Write-Host '  Choose the Google account that owns your Firebase projects.'
Write-Host '  If Chrome does not appear, find the Google sign-in link below.' -ForegroundColor Yellow
Write-Host ''
# Force the actual Google/Firebase authorization step, even if stale credentials
# exist. This also skips the CLI's optional Gemini and usage survey prompts.
Remove-Item Env:CI -ErrorAction SilentlyContinue
Remove-Item Env:AI_AGENT -ErrorAction SilentlyContinue
Remove-Item Env:ANTIGRAVITY_AGENT -ErrorAction SilentlyContinue

& $NodeExecutable $FirebaseScript login --reauth --interactive
if ($LASTEXITCODE -eq 0) {
    Write-Host ''
    Write-Host '  Firebase login completed! Return to the Launchpad dashboard.' -ForegroundColor Green
    Start-Sleep -Seconds 3
    exit 0
} else {
    Write-Host ''
    Write-Host '  Firebase login did not finish. See the error above.' -ForegroundColor Red
}
Write-Host ''
Read-Host 'Press Enter to close this window'
exit 1
