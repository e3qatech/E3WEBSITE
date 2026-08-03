# Cross-Device Development Workflow

This document outlines the standard operating procedure for developing the E3 Website across multiple devices (e.g., Windows PCs) without requiring local Docker or PostgreSQL installations.

## 1. Architecture Overview
- **GitHub**: Source of truth for all code and configuration. No code exists only on one device.
- **Vercel**: Source of truth for environment variables (Development, Preview, Production).
- **Neon**: Source of truth for the database. Development uses a separate Neon branch/database to isolate from Production.

## 2. Source of Truth
- All environment variables are managed in Vercel.
- Local `.env` files must NEVER be committed to GitHub.
- Database state and schema are managed via Prisma migrations applied against the respective Neon branch.

## 3. First-time Setup on PC 1
1. Clone the repository.
2. Run the bootstrap script: `./scripts/dev-bootstrap.ps1` (or `.sh`).
3. If Vercel variables are missing, ensure you are added to the Vercel team and project.

## 4. First-time Setup on PC 2
1. Clone the repository.
2. Run the bootstrap script: `./scripts/dev-bootstrap.ps1`.
3. The bootstrap script automatically pulls environment variables and generates the Prisma client.

## 5. Codespaces Setup
1. Open the repository in GitHub Codespaces.
2. The devcontainer automatically configures Node 22 and pnpm 9.1.0.
3. Run `pnpm dlx vercel link` to pull environment variables.

## 6. Start-of-Session Process
1. Run `./scripts/dev-bootstrap.ps1` to ensure your local branch is synchronized with remote.
2. The script will verify Node/pnpm versions and environment safety.

## 7. End-of-Session Handoff Process
1. Run `./scripts/dev-handoff-check.ps1`.
2. This script ensures you have no uncommitted or unpushed changes.
3. Once passed, you can safely resume work on the other PC.

## 8. Feature Branch and Repair Branch Workflow
- Always create a branch for new work.
- Push your branch frequently to synchronize across devices.

## 9. Pull Request Workflow
- Open a PR for all changes.
- The `main` branch is protected.

## 10. Vercel Preview Workflow
- Pushing to a branch automatically triggers a Vercel Preview deployment.
- Verify changes on the Preview URL before merging.

## 11. Development Database Policy
- Local development MUST use the Neon Development database branch.
- Never connect local development to the Production database.

## 12. Production Database Restrictions
- No `prisma db push` or direct local migrations against Production.

## 13. Prisma Migration Procedure
- Use `pnpm turbo run db:migrate:development` to apply existing migrations to the dev DB.

## 14. Team Seed Procedure
- The official team seed command is `pnpm run db:seed:team:development`
- Seed is manual and must not be run by the bootstrap script automatically.
- Seed targets Development only. Never run it against Production or Preview.
- Run it twice to verify idempotency.
- The `.env` file must come from Vercel Development and must remain ignored.

## 15. How to Verify the Database Host Safely
- Run `pnpm run db:verify:development`. It parses the host without exposing passwords.

## 16. How to Recover a Missing Branch
- Run `git fetch origin` followed by `git checkout <branch>`.

## 17. How to Handle Non-Fast-Forward Git Pulls
- Avoid working on the same branch simultaneously on both PCs. If a conflict occurs, rebase or merge manually.

## 18. How to Handle Uncommitted Work
- The handoff script will block you if work is uncommitted. Commit or stash before switching devices.

## 19. Troubleshooting localhost:5432
- If the app tries to connect to localhost, your `.env.local` is missing or `.env` is overriding it. Ensure `.env.local` is populated via Vercel CLI.

## 20. Troubleshooting Missing tsx
- Ensure `pnpm install` ran successfully. Corepack handles pnpm.

## 21. Troubleshooting Missing ESLint Config
- The current branch lacks an ESLint config. This must be repaired in a separate lint gate.

## 22. Troubleshooting Node Version Mismatch
- Install Node 22.14.0 using `fnm`, `nvs`, or `nvm-windows`. The bootstrap script explicitly checks for v22.

## 23. Troubleshooting Vercel Link Location
- Vercel should link in `apps/web`. The bootstrap script ensures `.vercel/project.json` exists.

## 24. Never Commit .env Values
- All `.env` files are in `.gitignore`. If accidentally tracked, use `git rm --cached <file>`.

## 25. Never Push Directly to main
- Branch protection rules enforce PRs.
