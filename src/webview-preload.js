// Applies spoofed fingerprint in webview only when enabled in main process
const { ipcRenderer } = require('electron');

(async function() {
  try {
    const mode = await ipcRenderer.invoke('get-fingerprint-mode');
    if (mode !== 'spoofed') return;

    // Spoof common properties
    try { Object.defineProperty(navigator, 'webdriver', { get: () => false }); } catch {}
    try { Object.defineProperty(navigator, 'languages', { get: () => ['en-US','en'] }); } catch {}
    try { Object.defineProperty(navigator, 'platform', { get: () => 'MacIntel' }); } catch {}
    try { Object.defineProperty(navigator, 'vendor', { get: () => 'Google Inc.' }); } catch {}
    try {
      if (!window.chrome) Object.defineProperty(window, 'chrome', { value: { runtime: {} }, configurable: false, enumerable: false, writable: false });
    } catch {}
    try {
      const fakePluginArray = { length: 3, 0: { name: 'Chrome PDF Plugin' }, 1: { name: 'Chrome PDF Viewer' }, 2: { name: 'Native Client' }, item: (i)=>fakePluginArray[i], namedItem: ()=>undefined };
      Object.defineProperty(navigator, 'plugins', { get: () => fakePluginArray });
    } catch {}
    // Avoid timezone spoofing to reduce inconsistencies
  } catch {}
})();
