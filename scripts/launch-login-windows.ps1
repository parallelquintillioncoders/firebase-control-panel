param(
  [Parameter(Mandatory=$true)][string]$NodeExecutable,
  [Parameter(Mandatory=$true)][string]$FirebaseScript
)
$ErrorActionPreference = 'Stop'
try {
  $worker = Join-Path $PSScriptRoot 'login-windows.ps1'
  if (-not (Test-Path -LiteralPath $worker)) { throw 'Google sign-in worker was not found.' }
  if (-not (Test-Path -LiteralPath $NodeExecutable)) { throw 'Node.js executable was not found.' }
  if (-not (Test-Path -LiteralPath $FirebaseScript)) { throw 'Bundled Firebase CLI was not found.' }
  function Quote-WindowsArg([string]$value) {
    return '"' + $value.Replace('"', '\"') + '"'
  }
  # Start-Process creates a NEW visible console for console applications.
  # A detached spawn from Node with ignored stdio does not do that.
  $arguments = @('-NoLogo', '-NoProfile', '-ExecutionPolicy', 'Bypass',
                 '-File', (Quote-WindowsArg $worker),
                 (Quote-WindowsArg $NodeExecutable),
                 (Quote-WindowsArg $FirebaseScript))
  $child = Start-Process -FilePath 'powershell.exe' -ArgumentList $arguments -PassThru -ErrorAction Stop
  if ($null -eq $child -or $child.Id -le 0) { throw 'Start-Process did not return a process ID.' }
  Start-Sleep -Milliseconds 350
  if ($child.HasExited) { throw "Login window exited too early (code $($child.ExitCode))." }
  Write-Output "LAUNCHED_PID=$($child.Id)"
  exit 0
} catch {
  [Console]::Error.WriteLine('LOGIN_WINDOW_FAILED: ' + $_.Exception.Message)
  exit 1
}
