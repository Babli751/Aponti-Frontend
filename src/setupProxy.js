const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy API requests to LOCAL backend
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
      logLevel: 'debug'
    })
  );

  // Proxy uploads requests to LOCAL backend
  app.use(
    '/uploads',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
      logLevel: 'debug',
      onProxyRes: (proxyRes, req, res) => {
        console.log('✅ Proxy response for', req.url, ':', proxyRes.statusCode, 'Content-Type:', proxyRes.headers['content-type']);
      }
    })
  );
};
