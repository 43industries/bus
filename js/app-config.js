/**
 * BusBuddy — single place for Supabase URLs and defaults.
 * Copy/rename for staging vs production if needed; the anon key is public (client-safe).
 */
(function (global) {
  'use strict';
  global.BUSBUDDY_CONFIG = {
    supabaseUrl: 'https://shsgyoeuponjemicmyvd.supabase.co',
    supabaseAnonKey: 'sb_publishable_VndNb4MsmH2pVY4Y2oiLHw_DJgUct-Y',
    defaultBusId: 'bus_07',
    /** Driver Edge Function base (no trailing slash). */
    driverLocationFunctionUrl: 'https://shsgyoeuponjemicmyvd.functions.supabase.co/driver-location',
  };
})(typeof window !== 'undefined' ? window : globalThis);
