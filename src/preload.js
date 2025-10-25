// Preload to align environment with a typical Chrome browser for bot challenges
(() => {
  try {
    // navigator.webdriver -> false
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    });

    // navigator.languages
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en'],
    });

    // navigator.platform
    Object.defineProperty(navigator, 'platform', {
      get: () => 'MacIntel',
    });

    // navigator.vendor
    Object.defineProperty(navigator, 'vendor', {
      get: () => 'Google Inc.',
    });

    // window.chrome presence
    if (!window.chrome) {
      Object.defineProperty(window, 'chrome', {
        value: { runtime: {} },
        configurable: false,
        enumerable: false,
        writable: false,
      });
    }

    // Plugins length > 0
    const fakePluginArray = {
      length: 3,
      0: { name: 'Chrome PDF Plugin' },
      1: { name: 'Chrome PDF Viewer' },
      2: { name: 'Native Client' },
      item: (i) => fakePluginArray[i],
      namedItem: () => undefined,
    };
    Object.defineProperty(navigator, 'plugins', {
      get: () => fakePluginArray,
    });

    // Permissions API: return "prompt" for notifications by default
    if (navigator.permissions && navigator.permissions.query) {
      const originalQuery = navigator.permissions.query.bind(navigator.permissions);
      navigator.permissions.query = (parameters) => {
        if (parameters && parameters.name === 'notifications') {
          return Promise.resolve({ state: 'prompt' });
        }
        return originalQuery(parameters);
      };
    }

    // navigator.userAgentData (Client Hints)
    if (!('userAgentData' in navigator)) {
      const brands = [
        { brand: 'Chromium', version: (navigator.userAgent.match(/Chrome\/(\d+)/) || [null, '121'])[1] },
        { brand: 'Not;A=Brand', version: '8' },
        { brand: 'Google Chrome', version: (navigator.userAgent.match(/Chrome\/(\d+)/) || [null, '121'])[1] },
      ];
      const uaData = {
        brands,
        mobile: false,
        platform: 'macOS',
        getHighEntropyValues: async (hints) => {
          const major = brands[0].version;
          return {
            architecture: 'arm',
            bitness: '64',
            model: '',
            platform: 'macOS',
            platformVersion: '15.0.0',
            uaFullVersion: `${major}.0.0.0`,
            fullVersionList: brands.map(b => ({ brand: b.brand, version: `${major}.0.0.0` })),
          };
        },
        toJSON() { return this; },
      };
      Object.defineProperty(navigator, 'userAgentData', {
        get: () => uaData,
      });
    }

    // Hardware/environment signals
    if (!('hardwareConcurrency' in navigator)) {
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
    }
    if (!('deviceMemory' in navigator)) {
      Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
    }
    if (!('maxTouchPoints' in navigator)) {
      Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 0 });
    }

    // Timezone and Intl signals
    try {
      if (Intl && Intl.DateTimeFormat) {
        const orig = Intl.DateTimeFormat.prototype.resolvedOptions;
        Intl.DateTimeFormat.prototype.resolvedOptions = function(...args) {
          const o = orig.apply(this, args);
          o.timeZone = 'America/Los_Angeles';
          return o;
        };
      }
    } catch (_) {}
  } catch (_) {
    // Ignore any failures to redefine properties
  }
})();
