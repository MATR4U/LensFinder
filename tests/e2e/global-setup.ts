import { FullConfig } from '@playwright/test';
import { spawnSync } from 'child_process';

async function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export default async function globalSetup(_config: FullConfig) {
  // Ensure DB is up and migrated before webServer starts
  const pgPort = process.env.POSTGRES_PORT || '55432';
  const pgAdminPort = process.env.PGADMIN_PORT || '55050';
  // Start DB with non-default ports to avoid local conflicts
  try {
    spawnSync('npm', ['run', 'db:up'], { stdio: 'inherit', shell: true, env: { ...process.env, POSTGRES_PORT: pgPort, PGADMIN_PORT: pgAdminPort } });
  } catch {}
  await wait(1500);
  spawnSync('npm', ['run', 'db:migrate'], { stdio: 'inherit', shell: true, env: { ...process.env, POSTGRES_PORT: pgPort } });
  // Build client so the server can serve static UI from client/dist
  spawnSync('npm', ['--workspace', 'client', 'run', 'build'], { stdio: 'inherit', shell: true });
}


