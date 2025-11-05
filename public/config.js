// Runtime configuration for API URL - PRODUCTION v14
console.log('🔄 Loading API config v14...');

// Try to get API URL from meta tag (injected at build/deploy time)
const getMetaTagValue = (name) => {
  const meta = document.querySelector(`meta[name="${name}"]`);
  return meta ? meta.getAttribute('content') : null;
};

window.API_BASE_URL = (() => {
  const host = window.location.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1';
  const protocol = window.location.protocol;

  // Check for meta tag first (injected at deploy time)
  const metaApiUrl = getMetaTagValue('api-base-url');
  if (metaApiUrl) {
    console.log('✅ API_BASE_URL from meta tag:', metaApiUrl);
    return metaApiUrl;
  }

  if (isLocal) {
    // Local development: Use production backend for testing
    console.log('🔗 Local development: Using production backend');
    return 'http://206.189.57.55:8001/api/v1';
  }

  // Production: Use same origin - server will proxy /api requests to backend
  if (host === '206.189.57.55') {
    console.log('🔗 Production on 206.189.57.55: Using same origin');
    return `http://${host}:8001/api/v1`;
  }

  // For all other deployments (fly.dev, netlify, etc): Use relative paths
  // The server/proxy should handle routing to backend
  console.log('🔗 Cloud deployment detected: Using relative API paths');
  console.log('🌐 Hostname:', host);
  return '/api/v1';
})();

console.log('✅ API_BASE_URL final value:', window.API_BASE_URL);
console.log('🔥 Config loaded at:', new Date().toISOString());
