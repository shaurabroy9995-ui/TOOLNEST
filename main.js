window.Toolnest = window.Toolnest || {};
window.Toolnest.ui = window.Toolnest.ui || {};
window.Toolnest.ui.scrollToSection = function (id) {
  document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
};
window.scrollToSection = window.Toolnest.ui.scrollToSection;

window.Toolnest.ui.toggleNav = function () {
  const nav = document.querySelector('nav');
  const btn = document.querySelector('.nav-toggle');
  if (!nav) return;
  const isOpen = nav.classList.toggle('open');
  if (btn) {
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    btn.classList.toggle('open', isOpen);
  }

  // prevent body scroll when nav is open on small screens
  document.body.style.overflow = isOpen ? 'hidden' : '';

  // backdrop handling
  const BACKDROP_ID = 'tn-nav-backdrop';
  function cleanupBackdrop() {
    const b = document.getElementById(BACKDROP_ID);
    if (b) b.remove();
    document.removeEventListener('keydown', escHandler);
    // remove link click handlers
    nav.querySelectorAll('a[href]').forEach(a => a.removeEventListener('click', linkCloser));
  }

  function escHandler(e) {
    if (e.key === 'Escape') window.toggleNav();
  }

  function linkCloser() { window.toggleNav(); }

  if (isOpen) {
    // create backdrop and insert it BEFORE the nav so the nav is above it in DOM order
    let backdrop = document.getElementById(BACKDROP_ID);
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = BACKDROP_ID;
      backdrop.className = 'nav-backdrop';
      backdrop.addEventListener('click', () => window.toggleNav());
      document.body.insertBefore(backdrop, nav);
    }
    // attach esc listener
    document.addEventListener('keydown', escHandler);

    // attach a single nav-level click handler that closes the menu when a link is clicked
    const navLinkHandler = function (e) {
      const link = e.target.closest('a[href]');
      if (!link) return;
      // allow default navigation to happen, but close the menu
      window.toggleNav();
    };
    // store the handler so we can remove it later
    nav._navLinkHandler = navLinkHandler;
    nav.addEventListener('click', navLinkHandler);
  } else {
    // remove nav-level handler
    if (nav._navLinkHandler) {
      nav.removeEventListener('click', nav._navLinkHandler);
      delete nav._navLinkHandler;
    }

    cleanupBackdrop();
  }
};
window.toggleNav = window.Toolnest.ui.toggleNav;
const THEME_KEY = 'tn-theme';

function applyTheme(theme) {
  if (!theme) {
    // look for preference
    const pref = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    theme = localStorage.getItem(THEME_KEY) || pref;
  }
  theme = theme || 'light';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  updateUi(theme);
}

const THEMES = ['light', 'dark', 'unnatureall'];
function toggleTheme() {
  const curr = localStorage.getItem(THEME_KEY) || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const idx = THEMES.indexOf(curr);
  const next = THEMES[(idx + 1) % THEMES.length];
  applyTheme(next);
}

function updateUi(theme) {
  const btns = document.querySelectorAll('.theme-toggle');
  btns.forEach(b => {
    const emoji = theme === 'dark' ? '☀️' : theme === 'unnatureall' ? '🌀' : '🌙';
    b.textContent = emoji;
    b.setAttribute('aria-pressed', theme !== 'light' ? 'true' : 'false');
    b.setAttribute('data-theme', theme);
    const label = theme === 'unnatureall' ? 'Unnatural' : theme.charAt(0).toUpperCase() + theme.slice(1);
    b.title = `Theme: ${label}`;
  });
}

// attach to body for other modules to call
window.Toolnest = window.Toolnest || {};
window.Toolnest.theme = { applyTheme, toggleTheme };

// wire UI
if (document.readyState === 'interactive' || document.readyState === 'complete') init();
else document.addEventListener('DOMContentLoaded', init);

function init() {
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => toggleTheme());
  });
  applyTheme();
}

// Expose theme helpers on window (for non-module contexts)
window.Toolnest.theme = { applyTheme, toggleTheme };

const processingOverlay = (() => {
  let node = null;
  let counter = 0; // nested operations
  function createNode() {
    const overlay = document.createElement('div');
    overlay.id = 'tn-processing';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('role', 'status');
    overlay.className = 'tn-processing-overlay';
    overlay.innerHTML = `
      <div class="tn-progress-inner" aria-live="polite">Processing…</div>
    `;
    document.body.appendChild(overlay);
    node = overlay;
  }
  return {
    start(msg = 'Processing…') {
      if (!node) createNode();
      counter++;
      node.setAttribute('aria-hidden', 'false');
      node.querySelector('.tn-progress-inner').textContent = msg;
      document.body.classList.add('tn-processing-active');
      // trap focus
      node.tabIndex = -1;
      node.focus();
    },
    update(msg) {
      if (!node) return;
      node.querySelector('.tn-progress-inner').textContent = msg;
    },
    stop() {
      if (!node) return;
      counter = Math.max(0, counter - 1);
      if (counter === 0) {
        node.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('tn-processing-active');
      }
    }
  };
})();

// Toast helper — lightweight non-blocking messages
window.Toolnest = window.Toolnest || {};
window.Toolnest.ui = window.Toolnest.ui || {};
window.Toolnest.ui.showToast = function (message, type = 'info', timeout = 4000) {
  let container = document.getElementById('tn-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'tn-toast-container';
    container.setAttribute('role', 'status');
    container.style.position = 'fixed';
    container.style.right = '20px';
    container.style.bottom = '20px';
    container.style.zIndex = 99999;
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'flex-end';
    document.body.appendChild(container);
  }
  const el = document.createElement('div');
  el.className = 'tn-toast';
  el.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
  el.style.background = (type === 'error') ? '#b00020' : (type === 'success' ? '#0f9d58' : '#333');
  el.style.color = '#fff';
  el.style.padding = '0.6rem 0.9rem';
  el.style.marginTop = '0.6rem';
  el.style.borderRadius = '6px';
  el.style.boxShadow = '0 6px 18px rgba(0,0,0,0.12)';
  el.style.maxWidth = '320px';
  el.style.fontSize = '0.95rem';

  // allow dismiss
  const txt = document.createElement('div'); txt.textContent = message; txt.style.display = 'inline-block'; txt.style.marginRight = '0.6rem';
  el.appendChild(txt);
  if (type === 'error') {
    const btn = document.createElement('button');
    btn.textContent = '✕';
    btn.setAttribute('aria-label', 'Dismiss');
    btn.style.background = 'transparent';
    btn.style.border = 'none';
    btn.style.color = '#fff';
    btn.style.fontSize = '0.9rem';
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', () => el.remove());
    el.appendChild(btn);
  }

  container.appendChild(el);
  if (type !== 'error') setTimeout(() => { el.remove(); }, timeout);
};
window.showToast = window.Toolnest.ui.showToast;

// Expose processing overlay to other scripts
window.Toolnest.processingOverlay = processingOverlay;
window.processingOverlay = processingOverlay;
// ============ Navigation helpers ============
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function goToTool(page) {
  window.location.href = `tools/${page}`;
}


