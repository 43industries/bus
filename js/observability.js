/**
 * Optional error reporting — set BUSBUDDY_CONFIG.sentryDsn (browser DSN) in app-config.js.
 * Loads Sentry from CDN only when DSN is present.
 */
(function (global) {
  'use strict';
  function cfg() {
    return global.BUSBUDDY_CONFIG || {};
  }
  var dsn = cfg().sentryDsn;
  if (!dsn || typeof document === 'undefined') return;

  var script = document.createElement('script');
  script.src = 'https://browser.sentry-cdn.com/7.120.0/bundle.min.js';
  script.crossOrigin = 'anonymous';
  script.onload = function () {
    if (global.Sentry && typeof global.Sentry.init === 'function') {
      var release = cfg().release;
      global.Sentry.init({
        dsn: dsn,
        environment: cfg().environment || 'production',
        release: release || undefined,
        tracesSampleRate: 0.05,
      });
    }
  };
  document.head.appendChild(script);
})(typeof window !== 'undefined' ? window : globalThis);
