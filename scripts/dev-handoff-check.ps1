$ErrorActionPreference = "Stop"

Write-Host "Starting E3 Website Handoff Check..." -ForegroundColor Cyan

$branch = git rev-parse --abbrev-ref HEAD
$commit = git rev-parse --short HEAD
$tracking = $(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>$null)
if (-not $tracking) { $tracking = "None" }

Write-Host "Current Branch: $branch"
Write-Host "Current Commit: $commit"
Write-Host "Tracking Branch: $tracking"

if ($tracking -eq "None") {
  Write-Error "Branch has no upstream. Please push your branch before handoff."
  exit 1
}

if (git status --porcelain) {
  Write-Error "Working tree is dirty. Untracked or modified files exist."
  git status --short
  exit 1
}

$untracked = git ls-files --others --exclude-standard
if ($untracked) {
  Write-Error "Untracked files exist. Please commit or ignore them:"
  Write-Host $untracked
  exit 1
}

$behind = 0
$ahead = 0
try {
  $behind = git rev-list --count HEAD..@{u} 2>$null
  $ahead = git rev-list --count @{u}..HEAD 2>$null
} catch {}

Write-Host "Commits Behind: $behind"
Write-Host "Commits Ahead: $ahead"

if ($ahead -gt 0) {
  Write-Error "You have $ahead unpushed commits. Please push to origin before handoff."
  exit 1
}

if (Test-Path "eslint-results*.json" -or Test-Path "lint-results*.json") {
  Write-Error "Temporary lint reports found. Please delete them before handoff."
  exit 1
}

Write-Host "Handoff check passed successfully! Safe to switch devices." -ForegroundColor Green
