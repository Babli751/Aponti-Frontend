#!/usr/bin/env node

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Get API URL from environment variable or use default
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://206.189.57.55:8001';

console.log('🚀 Starting production server...');
console.log('📍 Port:', PORT);
console.log('🔗 API_BASE_URL:', API_BASE_URL);

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build')));

// Create API proxy
app.use('/api', createProxyMiddleware({
  target: API_BASE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '' // Remove /api prefix before forwarding
  },
  onError: (err, req, res) => {
    console.error('❌ Proxy error:', err.message);
    res.status(500).json({ error: 'API request failed', message: err.message });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`📤 ${req.method} ${req.path} -> ${API_BASE_URL}${req.path.replace(/^\/api/, '')}`);
    // Forward Authorization header if present
    const authToken = req.headers['authorization'];
    if (authToken) {
      proxyReq.setHeader('Authorization', authToken);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`📥 ${req.method} ${req.path} - Status: ${proxyRes.statusCode}`);
  },
  timeout: 10000
}));

// Handle client-side routing - serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'build')}`);
  console.log(`🔌 API proxy configured: /api/* -> ${API_BASE_URL}/*`);
});
