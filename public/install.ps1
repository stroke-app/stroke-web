# Install Stroke on Windows:   irm https://stroke.click/install.ps1 | iex
# Nightly:   $env:STROKE_CHANNEL = "nightly"; irm https://stroke.click/install.ps1 | iex
#
# Scoop when it's installed (updates then come with `scoop update`), otherwise
# the official installer, run silently for the current user (no admin).

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue" # Invoke-WebRequest is many times faster without the bar

$Repo = "stroke-app/stroke"
$Channel = if ($env:STROKE_CHANNEL -eq "nightly") { "nightly" } else { "stable" }

function Say($msg) { Write-Host $msg -ForegroundColor Cyan }

if (-not [Environment]::Is64BitOperatingSystem) {
  throw "Stroke needs 64-bit Windows."
}

if ($Channel -eq "stable" -and (Get-Command scoop -ErrorAction SilentlyContinue)) {
  Say "Installing Stroke with Scoop"
  $buckets = (scoop bucket list 6>$null | Out-String)
  if ($buckets -notmatch "(?m)^\s*stroke\b") {
    scoop bucket add stroke "https://github.com/$Repo"
  }
  scoop install stroke/stroke
  Say "Installed. Open Stroke from the Start menu, and update it with: scoop update stroke"
  return
}

if ($Channel -eq "nightly") {
  $Tag = "nightly"
  $Exe = "stroke-nightly_x64-setup.exe"
} else {
  $release = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases/latest" -Headers @{ "User-Agent" = "stroke-installer" }
  $Tag = $release.tag_name
  if (-not $Tag) { throw "Couldn't find the latest release. Check your connection, or download from https://stroke.click/download" }
  $Exe = "stroke_$($Tag.TrimStart('v'))_x64-setup.exe"
}

$Url = "https://github.com/$Repo/releases/download/$Tag/$Exe"
$Out = Join-Path ([IO.Path]::GetTempPath()) $Exe

Say "Downloading Stroke ($Tag)"
Invoke-WebRequest -Uri $Url -OutFile $Out -UseBasicParsing

Say "Installing"
# The installer is per-user; /S runs it without the wizard.
$p = Start-Process -FilePath $Out -ArgumentList "/S" -Wait -PassThru
Remove-Item $Out -ErrorAction SilentlyContinue
if ($p.ExitCode -ne 0) { throw "The installer exited with code $($p.ExitCode)." }

$Name = if ($Channel -eq "nightly") { "Stroke Nightly" } else { "Stroke" }
Say "Installed. Open $Name from the Start menu. It updates itself from inside the app."
