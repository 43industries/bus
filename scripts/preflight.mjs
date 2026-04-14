import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const requiredFiles = [
  'track.html',
  'driver.html',
  'js/app-config.js',
  'js/analytics.js',
  'js/observability.js',
  'supabase/functions/driver-location/index.ts',
  'supabase/functions/send-parent-sms-v2/index.ts',
  'supabase/migrations/20260413_parent_accounts_diary_writes.sql',
  'supabase/migrations/20260414_parent_profile_auth_split.sql',
  'supabase/migrations/20260415_sms_rate_limits.sql',
];

const errors = [];

for (const rel of requiredFiles) {
  if (!existsSync(join(root, rel))) errors.push(`Missing required file: ${rel}`);
}

const deployScriptPath = join(root, 'scripts', 'deploy-supabase.ps1');
if (existsSync(deployScriptPath)) {
  const deployScript = readFileSync(deployScriptPath, 'utf8');
  if (!/supabase functions deploy send-parent-sms-v2/i.test(deployScript)) {
    errors.push('deploy-supabase.ps1 does not deploy send-parent-sms-v2');
  }
}

const configPath = join(root, 'js', 'app-config.js');
if (existsSync(configPath)) {
  const config = readFileSync(configPath, 'utf8');
  if (!/smsFunctionUrl/i.test(config)) {
    errors.push('app-config.js must define smsFunctionUrl');
  }
  if (!/release/i.test(config)) {
    errors.push('app-config.js must define release');
  }
}

if (errors.length) {
  console.error('preflight: failed');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('preflight: ok');
