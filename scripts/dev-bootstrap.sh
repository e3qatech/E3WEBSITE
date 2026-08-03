#!/usr/bin/env bash
set -e

echo "Starting E3 Website Bootstrap..."

if [ ! -f "package.json" ]; then
  echo "ERROR: Please run this script from the repository root."
  exit 1
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Current Branch: $BRANCH"

if ! git diff-index --quiet HEAD --; then
  echo "ERROR: Working tree is dirty. Please commit or stash changes before bootstrapping."
  exit 1
fi

echo "Fetching latest changes..."
git fetch origin --prune

echo "Pulling latest changes (fast-forward only)..."
git pull origin "$BRANCH" --ff-only

echo "Checking Node version..."
NODE_VER=$(node -v)
if [[ $NODE_VER != v22* ]]; then
  echo "ERROR: Expected Node v22.x but found $NODE_VER. Please switch using nvm, fnm, or nvs."
  exit 1
fi

echo "Enabling Corepack..."
corepack enable

echo "Checking pnpm version..."
PNPM_VER=$(pnpm --version)
if [[ $PNPM_VER != "9.1.0" ]]; then
  echo "ERROR: Expected pnpm 9.1.0 but found $PNPM_VER. Corepack should handle this automatically."
  exit 1
fi

echo "Installing dependencies..."
pnpm install --frozen-lockfile

echo "Verifying Vercel link..."
if [ ! -f "apps/web/.vercel/project.json" ]; then
  echo "Linking Vercel..."
  pnpm dlx vercel@latest link --project e3-qatar --scope e3qatechs-projects --yes
fi

echo "Pulling Development environment variables..."
pnpm run env:pull:development

echo "Verifying Development Environment..."
pnpm run db:verify:development
if [ $? -ne 0 ]; then
  echo "ERROR: Development variables verification failed."
  exit 1
fi

echo "Generating Prisma Client..."
pnpm turbo run db:generate

echo "Bootstrap complete. You are ready to develop!"
