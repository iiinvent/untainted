/**
 * Shortcut for getElementById
 * @param {string} id
 */
const byId = id => document.getElementById(id);

/**
 * Shortcut for a click addEventListener
 * @param {string} id - The ID of element the listener will be attached to
 * @param {Function} cb - The callback function that's executed when a user clicks the element
 */
const click = (id, cb) => byId(id).addEventListener('click', (e) => {
  cb(e);
});

/** The default home page for untainted */
const defaultHome = 'https://untainted.cloudflareaccess.com/browser';

/** untainted' GitHub repository */
const githubRepo = 'https://github.com/iiinvent/untainted/';

/** The default search engine. Also make a PR in the gh-pages (https://github.com/iiinvent/untainted/tree/gh-pages) branch if you're changing the default */
const defaultEngine = 'https://search.brave.com/search?q=';

/** The current webview element */
let view;

/** The version of untainted; fetched in startup.js */
let version;

/** The active tab's hash */
let activeHash = '0';

/** The current tab's favicon */
let favicon = '';

const omnibox = byId('omnibox'),
      ssl = byId('ssl'),
      back = byId('back'),
      forward = byId('forward'),
      menu = byId('menu'),
      cover = byId('cover'),
      reload = byId('reload'),
      target = byId('target'),
      settings = byId('settings');