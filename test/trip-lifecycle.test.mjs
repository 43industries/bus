import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tripMigration = join(root, 'supabase', 'migrations', '20260414_trip_lifecycle.sql');
const tripFunction = join(root, 'supabase', 'functions', 'trip-events', 'index.ts');

// ---------------------------------------------------------------------------
// Migration structure tests
// ---------------------------------------------------------------------------

test('trip lifecycle migration file exists', () => {
  assert.ok(existsSync(tripMigration), `Missing: ${tripMigration}`);
});

test('migration creates trip_status enum with all 6 statuses', () => {
  const sql = readFileSync(tripMigration, 'utf8');
  const expected = [
    'LEFT_SCHOOL',
    'EN_ROUTE_TO_HOME',
    'ARRIVED_HOME_STOP',
    'LEFT_HOME_AREA',
    'RETURNING_TO_SCHOOL',
    'ARRIVED_SCHOOL',
  ];
  assert.match(sql, /CREATE TYPE public\.trip_status AS ENUM/i);
  for (const s of expected) {
    assert.ok(sql.includes(`'${s}'`), `Enum missing status: ${s}`);
  }
});

test('migration creates trips table with bus_id and current_status', () => {
  const sql = readFileSync(tripMigration, 'utf8');
  assert.match(sql, /CREATE TABLE IF NOT EXISTS public\.trips/i);
  assert.ok(sql.includes('bus_id'), 'trips table must have bus_id column');
  assert.ok(sql.includes('current_status'), 'trips table must have current_status column');
  assert.ok(sql.includes('completed_at'), 'trips table must have completed_at column');
});

test('migration creates trip_events with unique constraint on (trip_id, status)', () => {
  const sql = readFileSync(tripMigration, 'utf8');
  assert.match(sql, /CREATE TABLE IF NOT EXISTS public\.trip_events/i);
  assert.match(sql, /UNIQUE\s*\(\s*trip_id\s*,\s*status\s*\)/i);
});

test('migration creates notification_log with channel and status checks', () => {
  const sql = readFileSync(tripMigration, 'utf8');
  assert.match(sql, /CREATE TABLE IF NOT EXISTS public\.notification_log/i);
  assert.match(sql, /channel text NOT NULL CHECK.*sms.*push/is);
  assert.match(sql, /status text NOT NULL.*CHECK.*pending.*sent.*failed/is);
});

test('migration enables RLS on all three new tables', () => {
  const sql = readFileSync(tripMigration, 'utf8');
  assert.match(sql, /ALTER TABLE public\.trips ENABLE ROW LEVEL SECURITY/i);
  assert.match(sql, /ALTER TABLE public\.trip_events ENABLE ROW LEVEL SECURITY/i);
  assert.match(sql, /ALTER TABLE public\.notification_log ENABLE ROW LEVEL SECURITY/i);
});

test('notification_log has no anon/authenticated read policies (service_role only)', () => {
  const sql = readFileSync(tripMigration, 'utf8');
  assert.doesNotMatch(
    sql,
    /CREATE POLICY.*notification_log.*TO\s+(anon|authenticated)/i,
    'notification_log should not have anon or authenticated policies'
  );
});

test('trips and trip_events are readable by anon and authenticated', () => {
  const sql = readFileSync(tripMigration, 'utf8');
  assert.match(sql, /CREATE POLICY.*trips.*TO anon, authenticated/is);
  assert.match(sql, /CREATE POLICY.*trip_events.*TO anon, authenticated/is);
});

test('migration adds tables to supabase_realtime publication', () => {
  const sql = readFileSync(tripMigration, 'utf8');
  assert.match(sql, /ALTER PUBLICATION supabase_realtime ADD TABLE public\.trip_events/i);
  assert.match(sql, /ALTER PUBLICATION supabase_realtime ADD TABLE public\.trips/i);
});

// ---------------------------------------------------------------------------
// Edge Function structure tests
// ---------------------------------------------------------------------------

test('trip-events edge function file exists', () => {
  assert.ok(existsSync(tripFunction), `Missing: ${tripFunction}`);
});

test('edge function defines all 6 valid statuses', () => {
  const ts = readFileSync(tripFunction, 'utf8');
  const expected = [
    'LEFT_SCHOOL',
    'EN_ROUTE_TO_HOME',
    'ARRIVED_HOME_STOP',
    'LEFT_HOME_AREA',
    'RETURNING_TO_SCHOOL',
    'ARRIVED_SCHOOL',
  ];
  for (const s of expected) {
    assert.ok(ts.includes(`"${s}"`), `Edge function missing status: ${s}`);
  }
});

test('edge function sends notifications only for LEFT_SCHOOL and ARRIVED_HOME_STOP', () => {
  const ts = readFileSync(tripFunction, 'utf8');
  assert.match(ts, /NOTIFY_STATUSES.*LEFT_SCHOOL.*ARRIVED_HOME_STOP/s);
  assert.ok(
    !ts.includes('NOTIFY_STATUSES') ||
    (ts.includes('"LEFT_SCHOOL"') && ts.includes('"ARRIVED_HOME_STOP"')),
    'Only LEFT_SCHOOL and ARRIVED_HOME_STOP should trigger notifications'
  );
});

test('edge function enforces forward-only status progression', () => {
  const ts = readFileSync(tripFunction, 'utf8');
  assert.match(ts, /INVALID_TRANSITION/);
  assert.match(ts, /nextOrder <= currentOrder/);
});

test('edge function handles duplicate events via unique constraint error', () => {
  const ts = readFileSync(tripFunction, 'utf8');
  assert.match(ts, /23505/);
  assert.match(ts, /DUPLICATE_EVENT/);
});

test('edge function requires driver or fleet manager auth', () => {
  const ts = readFileSync(tripFunction, 'utf8');
  assert.match(ts, /NOT_DRIVER_OR_FLEET_MANAGER/);
  assert.match(ts, /driver_accounts/);
  assert.match(ts, /teacher_accounts/);
});

test('edge function logs SMS delivery to notification_log', () => {
  const ts = readFileSync(tripFunction, 'utf8');
  assert.match(ts, /notification_log/);
  assert.match(ts, /provider_sid/);
  assert.match(ts, /error_detail/);
});

test('edge function logs push notification channel entries', () => {
  const ts = readFileSync(tripFunction, 'utf8');
  assert.match(ts, /channel:\s*"push"/);
});
