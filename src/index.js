const { app, BrowserWindow, session, ipcMain } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (process.platform === 'win32') {
  try {
    if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
      app.quit();
    }
  } catch (_) {}
}

const chromeVersion = process.versions.chrome || '121.0.0.0';
const REAL_UA = `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minHeight: 450,
    minWidth: 450,
    webPreferences: {
      webviewTag: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.setMenuBarVisibility(false);

  // Use realistic Chrome desktop User-Agent based on embedded Chromium
  try { mainWindow.webContents.setUserAgent(REAL_UA); } catch (_) {}
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Align UA and client hint headers for Cloudflare bot challenge
app.whenReady().then(() => {
  try { app.userAgentFallback = REAL_UA; } catch (_) {}

  const ses = session.defaultSession;
  if (typeof ses.setUserAgent === 'function') {
    try { ses.setUserAgent(REAL_UA, 'en-US,en;q=0.9'); } catch (_) {}
  }

  // Dynamic webRequest listeners controlled by settings
  let logDomain = '';
  let fingerprintMode = 'real';

  const headerLogger = (details, callback) => {
    const url = new URL(details.url);
    if (logDomain && url.hostname.endsWith(logDomain)) {
      try { console.log('[Headers]', url.hostname, details.requestHeaders); } catch (_) {}
    }
    callback({ requestHeaders: details.requestHeaders });
  };
  // attach once
  try { ses.webRequest.onBeforeSendHeaders(headerLogger); } catch (_) {}

  // Settings from renderer
  ipcMain.on('settings-update', (_event, settings = {}) => {
    if (typeof settings.fingerprintMode === 'string') {
      fingerprintMode = settings.fingerprintMode === 'spoofed' ? 'spoofed' : 'real';
    }
    if (typeof settings.logDomain === 'string') {
      logDomain = settings.logDomain.trim();
    }
  });

  ipcMain.handle('get-fingerprint-mode', () => fingerprintMode);
  ipcMain.handle('clear-site-data', async (_event, domain) => {
    if (!domain || typeof domain !== 'string') return false;
    try {
      await ses.clearStorageData({ origin: `https://${domain}` });
      await ses.clearStorageData({ origin: `http://${domain}` });
      return true;
    } catch (_) { return false; }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Intercept new windows and make them do nothing (new windows are handled
// in `browser.js` by opening new tabs)
app.on('web-contents-created', function (event, contents) {
  if (contents.getType() === 'webview') {
    contents.on('new-window', function (newWindowEvent) {
      newWindowEvent.preventDefault();
    });
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// Auto reload the app on files changes
try {
  require('electron-reloader')(module)
} catch (_) {}