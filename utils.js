/**
 * ToolNest Utilities
 * Shared utility functions for all tools
 * Includes: clipboard, download, notifications, analytics, error handling
 */

// ================================================================
// 1. CLIPBOARD UTILITIES
// ================================================================

/**
 * Copy text to clipboard with user feedback
 * @param {string} text - Text to copy
 * @param {string} [feedbackElementId] - Optional element to show feedback on
 * @returns {Promise<boolean>}
 */
window.copyToClipboard = async function(text, feedbackElementId) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      showCopyFeedback(feedbackElementId);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) {
        showCopyFeedback(feedbackElementId);
      }
      return successful;
    }
  } catch (error) {
    console.error('Failed to copy:', error);
    showError('Failed to copy to clipboard. Please try again.');
    return false;
  }
};

/**
 * Show visual feedback when text is copied
 * @param {string} [elementId] - Optional button element to show feedback on
 */
function showCopyFeedback(elementId) {
  const button = elementId ? document.getElementById(elementId) : null;
  if (button) {
    const originalText = button.textContent;
    button.textContent = '✓ Copied!';
    setTimeout(() => {
      button.textContent = originalText;
    }, 2000);
  }
  // Show toast notification
  showToast('Copied to clipboard!', 'success');
}

// ================================================================
// 2. DOWNLOAD UTILITIES
// ================================================================

/**
 * Download text as file
 * @param {string} content - Content to download
 * @param {string} filename - File name
 * @param {string} [mimeType] - MIME type (default: 'text/plain')
 */
window.downloadText = function(content, filename, mimeType = 'text/plain') {
  try {
    const blob = new Blob([content], { type: mimeType });
    downloadBlob(blob, filename);
  } catch (error) {
    console.error('Download failed:', error);
    showError('Failed to download file. Please try again.');
  }
};

/**
 * Download blob as file
 * @param {Blob} blob - Blob to download
 * @param {string} filename - File name
 */
window.downloadBlob = function(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast(`Downloaded: ${filename}`, 'success');
};

/**
 * Download data as JSON
 * @param {Object} data - Data to download
 * @param {string} filename - File name
 */
window.downloadJSON = function(data, filename) {
  const json = JSON.stringify(data, null, 2);
  window.downloadText(json, filename, 'application/json');
};

/**
 * Download CSV from array of objects
 * @param {Array} data - Array of objects
 * @param {string} filename - File name
 */
window.downloadCSV = function(data, filename) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    showError('No data to download');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  window.downloadText(csvContent, filename, 'text/csv');
};

// ================================================================
// 3. NOTIFICATION SYSTEM
// ================================================================

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} [type] - Type: 'info', 'success', 'warning', 'error'
 * @param {number} [duration] - Duration in milliseconds (default: 3000)
 */
window.showToast = function(message, type = 'info', duration = 3000) {
  const toastContainer = getToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">${getToastIcon(type)}</span>
      <span class="toast-message">${escapeHtml(message)}</span>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()" aria-label="Close notification">✕</button>
  `;

  toastContainer.appendChild(toast);

  // Auto-dismiss after duration
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, duration);

  return toast;
};

/**
 * Show error notification
 * @param {string} message - Error message
 */
window.showError = function(message) {
  showToast(message, 'error', 4000);
};

/**
 * Show success notification
 * @param {string} message - Success message
 */
window.showSuccess = function(message) {
  showToast(message, 'success', 3000);
};

/**
 * Show warning notification
 * @param {string} message - Warning message
 */
window.showWarning = function(message) {
  showToast(message, 'warning', 3000);
};

/**
 * Get or create toast container
 * @returns {HTMLElement}
 */
function getToastContainer() {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Get icon for toast type
 * @param {string} type - Toast type
 * @returns {string}
 */
function getToastIcon(type) {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };
  return icons[type] || '•';
}

// ================================================================
// 4. MODAL UTILITIES
// ================================================================

/**
 * Open donate modal
 */
window.openDonateModal = function() {
  const modal = document.getElementById('donateModal');
  if (modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
};

/**
 * Close donate modal
 */
window.closeDonateModal = function() {
  const modal = document.getElementById('donateModal');
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
};

/**
 * Open notify modal
 */
window.openNotifyModal = function() {
  const modal = document.getElementById('notifyModal');
  if (modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
};

/**
 * Close notify modal
 */
window.closeNotifyModal = function() {
  const modal = document.getElementById('notifyModal');
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
};

/**
 * Subscribe email for notifications
 * @param {Event} event
 */
window.subscribeEmail = async function(event) {
  event.preventDefault();
  const form = event.target;
  const email = form.querySelector('input[type="email"]').value;

  try {
    // TODO: Implement email subscription (backend required)
    showSuccess('Thanks! We\'ll notify you when new tools are released.');
    closeNotifyModal();
    form.reset();
  } catch (error) {
    showError('Failed to subscribe. Please try again.');
  }
};

// ================================================================
// 5. ERROR HANDLING
// ================================================================

/**
 * Validate file type
 * @param {File} file - File to validate
 * @param {string[]} allowedTypes - Allowed MIME types
 * @returns {boolean}
 */
window.validateFileType = function(file, allowedTypes) {
  if (!allowedTypes.includes(file.type)) {
    showError(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
    return false;
  }
  return true;
};

/**
 * Validate file size
 * @param {File} file - File to validate
 * @param {number} maxSizeInMB - Maximum size in MB
 * @returns {boolean}
 */
window.validateFileSize = function(file, maxSizeInMB) {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    showError(`File too large. Maximum: ${maxSizeInMB}MB`);
    return false;
  }
  return true;
};

/**
 * Wrap async function with error handling
 * @param {Function} fn - Async function
 * @returns {Function}
 */
window.withErrorHandling = function(fn) {
  return async function(...args) {
    try {
      return await fn(...args);
    } catch (error) {
      console.error('Error:', error);
      showError(error.message || 'An unexpected error occurred. Please try again.');
    }
  };
};

// ================================================================
// 6. LOADING INDICATORS
// ================================================================

/**
 * Show loading spinner
 * @param {string} [message] - Loading message
 * @returns {HTMLElement}
 */
window.showLoading = function(message) {
  const overlay = document.createElement('div');
  overlay.className = 'loading-overlay';
  overlay.innerHTML = `
    <div class="loading-content">
      <div class="spinner spinner-lg"></div>
      ${message ? `<p>${escapeHtml(message)}</p>` : ''}
    </div>
  `;
  document.body.appendChild(overlay);
  return overlay;
};

/**
 * Hide loading spinner
 * @param {HTMLElement} overlay - Loading overlay element
 */
window.hideLoading = function(overlay) {
  if (overlay && overlay.parentElement) {
    overlay.remove();
  }
};

// ================================================================
// 7. FORM UTILITIES
// ================================================================

/**
 * Get form data as object
 * @param {HTMLFormElement} form - Form element
 * @returns {Object}
 */
window.getFormData = function(form) {
  const data = new FormData(form);
  const obj = {};
  for (const [key, value] of data.entries()) {
    obj[key] = value;
  }
  return obj;
};

/**
 * Validate form
 * @param {HTMLFormElement} form - Form element
 * @returns {boolean}
 */
window.validateForm = function(form) {
  if (!form.checkValidity()) {
    showError('Please fill in all required fields correctly.');
    return false;
  }
  return true;
};

/**
 * Clear form
 * @param {HTMLFormElement} form - Form element
 */
window.clearForm = function(form) {
  form.reset();
  form.querySelectorAll('.form-error').forEach(el => {
    el.remove();
  });
};

// ================================================================
// 8. ANALYTICS (Privacy-Friendly)
// ================================================================

/**
 * Track tool usage (no personal data collected)
 * @param {string} toolName - Name of the tool
 * @param {string} action - Action performed
 * @param {Object} [metadata] - Optional metadata (no sensitive data)
 */
window.trackToolUsage = function(toolName, action, metadata = {}) {
  if (typeof gtag !== 'undefined') {
    gtag('event', `tool_${toolName}_${action}`, {
      tool: toolName,
      action: action,
      timestamp: new Date().toISOString(),
      ...metadata
    });
  }
};

// ================================================================
// 9. THEME UTILITIES
// ================================================================

/**
 * Initialize theme system
 */
window.initTheme = function() {
  const savedTheme = localStorage.getItem('toolnest-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  setTheme(theme);
};

/**
 * Set theme
 * @param {string} theme - 'light' or 'dark'
 */
window.setTheme = function(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('toolnest-theme', theme);
};

/**
 * Toggle theme
 */
window.toggleTheme = function() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'light' ? 'dark' : 'light';
  setTheme(next);
};

// ================================================================
// 10. UTILITY FUNCTIONS
// ================================================================

/**
 * Escape HTML to prevent XSS
 * @param {string} str - String to escape
 * @returns {string}
 */
function escapeHtml(str) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return str.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Format bytes to human readable
 * @param {number} bytes - Number of bytes
 * @param {number} [decimals] - Number of decimals
 * @returns {string}
 */
window.formatBytes = function(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Debounce function
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function}
 */
window.debounce = function(fn, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
};

/**
 * Throttle function
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function}
 */
window.throttle = function(fn, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Get query parameter
 * @param {string} name - Parameter name
 * @returns {string|null}
 */
window.getQueryParam = function(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
};

/**
 * Check if browser supports feature
 * @param {string} feature - Feature to check
 * @returns {boolean}
 */
window.supportsFeature = function(feature) {
  const features = {
    clipboard: () => navigator.clipboard && window.isSecureContext,
    localStorage: () => typeof localStorage !== 'undefined',
    sessionStorage: () => typeof sessionStorage !== 'undefined',
    serviceWorker: () => 'serviceWorker' in navigator,
    webWorkers: () => typeof Worker !== 'undefined',
  };
  return features[feature]?.() ?? false;
};

// ================================================================
// 11. INITIALIZATION
// ================================================================

// Initialize theme on load
document.addEventListener('DOMContentLoaded', () => {
  window.initTheme();
  
  // Set up modal close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeDonateModal?.();
      window.closeNotifyModal?.();
    }
  });
});

// ================================================================
// 12. STYLES FOR NOTIFICATIONS & MODALS
// ================================================================

const styles = `
<style>
  /* Toast Notifications */
  .toast-container {
    position: fixed;
    top: var(--space-6);
    right: var(--space-6);
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    max-width: 400px;
    pointer-events: none;
  }

  .toast {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    box-shadow: var(--shadow-lg);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    min-height: 48px;
    animation: slideInRight 0.3s ease-out;
    pointer-events: auto;
  }

  .toast-success {
    border-left: 4px solid var(--accent-success);
  }

  .toast-error {
    border-left: 4px solid var(--accent-danger);
  }

  .toast-warning {
    border-left: 4px solid var(--accent-warning);
  }

  .toast-info {
    border-left: 4px solid var(--accent-primary);
  }

  .toast-content {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex: 1;
  }

  .toast-icon {
    font-size: var(--font-size-lg);
    flex-shrink: 0;
  }

  .toast-message {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
  }

  .toast-close {
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--text-tertiary);
    font-size: var(--font-size-base);
    padding: 0;
    flex-shrink: 0;
  }

  /* Loading Overlay */
  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }

  .loading-content {
    background: var(--bg-primary);
    border-radius: var(--radius-xl);
    padding: var(--space-12);
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-6);
  }

  /* Modals */
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 5000;
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--transition-base);
  }

  .modal.open {
    opacity: 1;
    pointer-events: auto;
  }

  .modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
  }

  .modal-content {
    background: var(--bg-primary);
    border-radius: var(--radius-xl);
    padding: var(--space-8);
    max-width: 500px;
    width: 90%;
    position: relative;
    z-index: 1;
    box-shadow: var(--shadow-xl);
    animation: slideIn 0.3s ease-out;
  }

  .modal-close {
    position: absolute;
    top: var(--space-4);
    right: var(--space-4);
    background: transparent;
    border: none;
    font-size: var(--font-size-2xl);
    cursor: pointer;
    color: var(--text-primary);
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-content h2 {
    margin-top: var(--space-2);
  }

  .donation-options {
    margin-top: var(--space-6);
  }

  @media (max-width: 640px) {
    .toast-container {
      top: auto;
      bottom: var(--space-4);
      right: var(--space-4);
      left: var(--space-4);
      max-width: none;
    }

    .modal-content {
      width: 95%;
    }
  }
</style>
`;

document.head.insertAdjacentHTML('beforeend', styles);
