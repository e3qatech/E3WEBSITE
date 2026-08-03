$ErrorActionPreference = "Stop"

Write-Host "Starting E3 Website Bootstrap..." -ForegroundColor Cyan

if (!(Test-Path "package.json")) {
  Write-Error "Please run this script from the repository root."
  exit 1
}

$branch = git rev-parse --abbrev-ref HEAD
Write-Host "Current Branch: $branch"

if (git status --porcelain) {
  Write-Error "Working tree is dirty. Please commit or stash changes before bootstrapping."
  exit 1
}

Write-Host "Fetching latest changes..."
git fetch origin --prune

Write-Host "Pulling latest changes (fast-forward only)..."
git pull origin $branch --ff-only

Write-Host "Checking Node version..."
$nodeVer = node -v
if ($nodeVer -notmatch "^v22") {
  Write-Error "Expected Node v22.x but found $nodeVer. Please switch using nvm-windows, fnm, or nvs."
  exit 1
}

Write-Host "Enabling Corepack..."
corepack enable

Write-Host "Checking pnpm version..."
$pnpmVer = pnpm --version
if ($pnpmVer -ne "9.1.0") {
  Write-Error "Expected pnpm 9.1.0 but found $pnpmVer. Corepack should handle this automatically."
  exit 1
}

Write-Host "Installing dependencies..."
pnpm install --frozen-lockfile

Write-Host "Verifying Vercel link..."
if (!(Test-Path "apps/web/.vercel/project.json")) {
  Write-Host "Linking Vercel..."
  pnpm dlx vercel@latest link --project e3-qatar --scope e3qatechs-projects --yes
}

Write-Host "Pulling Development environment variables..."
pnpm run env:pull:development

Write-Host "Verifying Development Environment..."
try {
  pnpm run db:verify:development
} catch {
  Write-Error "Development variables verification failed."
  exit 1
}

Write-Host "Generating Prisma Client..."
pnpm turbo run db:generate

Write-Host "Bootstrap complete. You are ready to develop!" -ForegroundColor Green
