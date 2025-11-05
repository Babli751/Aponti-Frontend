// Runtime configuration for API URL - PRODUCTION v12
console.log('🔄 Loading API config v12...');
window.API_BASE_URL = (() => {
  const host = window.location.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1';

  if (isLocal) {
    // Local development: Use production backend for testing
    console.log('🔗 Local development: Using production backend');
    return 'http://206.189.57.55';
  }

  // Production: Use same origin - Apache will proxy /api requests to backend
  if (host === '206.189.57.55') {
    console.log('🔗 Production: Using same origin - Apache will proxy /api requests to backend');
    console.log('🌐 API_BASE_URL set to:', `http://${host}`);
    return `http://${host}`; // Apache will proxy /api requests to backend
  }

  // Fallback to production server
  console.log('🔗 Using production backend as fallback');
  console.log('🌐 API_BASE_URL set to: http://206.189.57.55');
  return 'http://206.189.57.55';
})();

console.log('✅ API_BASE_URL final value:', window.API_BASE_URL);
console.log('🔥 Config loaded at:', new Date().toISOString());