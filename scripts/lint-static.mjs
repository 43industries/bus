/**
 * Lightweight static checks: required client assets exist.
 */
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const required = [
  'driver.html',
  'track.html',
  'js/app-config.js',
  'js/analytics.js',
  'js/observability.js',
];

const errors = [];
for (const rel of required) {
  if (!existsSync(join(root, rel))) errors.push(`Missing ${rel}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('lint-static: ok');
