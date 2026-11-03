// Vercel Serverless Function entry point for backend
const app = require('../backend/server.js');

module.exports = (req, res) => {
  const originalPath = req.headers['x-matched-path'] || req.headers['x-invoke-path'] || req.headers['x-forwarded-uri'];
  if (originalPath && (req.url === '/api/index' || req.url === '/api' || req.url.startsWith('/api/index?'))) {
    const queryIdx = req.url.indexOf('?');
    const queryString = queryIdx !== -1 ? req.url.substring(queryIdx) : '';
    req.url = originalPath + queryString;
  }
  return app(req, res);
};
