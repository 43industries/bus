import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const diaryMigration = join(
  root,
  'supabase',
  'migrations',
  '20260413_parent_accounts_diary_writes.sql'
);
const profileSplitMigration = join(
  root,
  'supabase',
  'migrations',
  '20260414_parent_profile_auth_split.sql'
);
const smsLimitMigration = join(
  root,
  'supabase',
  'migrations',
  '20260415_sms_rate_limits.sql'
);

test('save_my_diary migration revokes anon and grants authenticated only', () => {
  assert.ok(existsSync(diaryMigration), diaryMigration);
  const sql = readFileSync(diaryMigration, 'utf8');
  assert.match(sql, /revoke execute on function public\.save_my_diary.*from anon/is);
  assert.match(
    sql,
    /grant execute on function public\.save_my_diary \(text, jsonb, text\) to authenticated;/i
  );
  assert.doesNotMatch(
    sql,
    /grant execute on function public\.save_my_diary[^;]*to anon/i,
    'should not grant save_my_diary to anon'
  );
});

test('save_my_diary requires parent_accounts for parent role', () => {
  const sql = readFileSync(diaryMigration, 'utf8');
  assert.match(sql, /parent_accounts/i);
  assert.match(sql, /PARENT_AUTH_REQUIRED/i);
  assert.match(sql, /NOT_GUARDIAN_FOR_STUDENT/i);
});

test('parent profile split keeps anon on public RPC only', () => {
  assert.ok(existsSync(profileSplitMigration), profileSplitMigration);
  const sql = readFileSync(profileSplitMigration, 'utf8');
  assert.match(sql, /create or replace function public\.get_parent_profile_public/i);
  assert.match(sql, /create or replace function public\.get_parent_profile_secure/i);
  assert.match(
    sql,
    /grant execute on function public\.get_parent_profile_public\(text\) to anon, authenticated;/i
  );
  assert.match(
    sql,
    /grant execute on function public\.get_parent_profile_secure\(text\) to authenticated;/i
  );
  assert.match(sql, /revoke execute on function public\.get_parent_profile\(text\) from anon;/i);
  assert.match(sql, /NOT_GUARDIAN_FOR_STUDENT/i);
});

test('sms rate limit table is locked to service role paths', () => {
  assert.ok(existsSync(smsLimitMigration), smsLimitMigration);
  const sql = readFileSync(smsLimitMigration, 'utf8');
  assert.match(sql, /create table if not exists public\.sms_rate_limits/i);
  assert.match(sql, /alter table public\.sms_rate_limits enable row level security;/i);
  assert.doesNotMatch(sql, /create policy .* sms_rate_limits/i);
});
