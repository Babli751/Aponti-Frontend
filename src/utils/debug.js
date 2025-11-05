// Debug utility for development logging
export const debug = {
  log: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEBUG]', ...args);
    }
  },
  error: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[DEBUG ERROR]', ...args);
    }
  },
  warn: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[DEBUG WARN]', ...args);
    }
  }
};
