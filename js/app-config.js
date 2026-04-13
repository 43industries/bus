/**
 * BusBuddy — single place for Supabase URLs and defaults.
 * Copy/rename for staging vs production if needed; the anon key is public (client-safe).
 */
(function (global) {
  'use strict';
  var defaultConfig = {
    supabaseUrl: 'https://shsgyoeuponjemicmyvd.supabase.co',
    supabaseAnonKey: 'sb_publishable_VndNb4MsmH2pVY4Y2oiLHw_DJgUct-Y',
    defaultBusId: 'bus_07',
    /** Driver Edge Function base (no trailing slash). */
    driverLocationFunctionUrl: 'https://shsgyoeuponjemicmyvd.functions.supabase.co/driver-location',
    /** Parent SMS function endpoint (optional). */
    smsFunctionUrl: 'https://shsgyoeuponjemicmyvd.functions.supabase.co/send-parent-sms-v2',
    /** Optional: POST funnel events (see docs/ANALYTICS.md). */
    analyticsEndpoint: '',
    /** Optional: Sentry browser DSN (see docs/MONITORING.md). */
    sentryDsn: '',
    environment: 'production',
    /** Optional release tag, e.g. git sha or semver. */
    release: '',
  };
  var runtimeConfig = global.BUSBUDDY_RUNTIME_CONFIG || {};
  global.BUSBUDDY_CONFIG = Object.assign({}, defaultConfig, runtimeConfig);
})(typeof window !== 'undefined' ? window : globalThis);
