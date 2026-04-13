/**
 * Optional product analytics — set BUSBUDDY_CONFIG.analyticsEndpoint in app-config.js.
 * POST JSON { event, props, ts } — no-op if endpoint unset.
 */
(function (global) {
  'use strict';
  function cfg() {
    return (global.BUSBUDDY_CONFIG || {});
  }
  global.BusBuddyAnalytics = {
    track: function (event, props) {
      var url = cfg().analyticsEndpoint;
      if (!url || typeof fetch !== 'function') return;
      var body = JSON.stringify({
        event: String(event || 'unknown'),
        props: props && typeof props === 'object' ? props : {},
        ts: new Date().toISOString(),
      });
      fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: body,
        keepalive: true,
      }).catch(function () {});
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
