const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = 8080;
const DIST_DIR = path.join(__dirname, 'dist/operator'); // Path to Vite build output
const BASE_PATH = '/operator/'; // Must match "base" in vite.config.ts

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf',
  '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Normalize URL to remove query strings and base path
  let urlPath = req.url.split('?')[0];
  
  // Remove base path to find file on disk
  if (urlPath.startsWith(BASE_PATH)) {
    urlPath = urlPath.slice(BASE_PATH.length);
  } else if (urlPath === '/operator') {
      // Handle missing trailing slash
      res.writeHead(301, { 'Location': '/operator/' });
      res.end();
      return;
  } else {
      // 404 for anything not starting with /operator/ (unless it's a health check?)
      // For this specific app, we might want to be strict or lenient.
      // Let's assume everything should be under /operator/
  }

  // Prevent directory traversal
  const safePath = path.normalize(urlPath).replace(/^(\.\.[\/\\])+/, '');
  
  let filePath = path.join(DIST_DIR, safePath);

  // Default to index.html for root or directories
  if (urlPath === '' || urlPath === '/' || urlPath.endsWith('/')) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // SPA Fallback: If file not found, serve index.html
      // BUT only if it looks like a page request (no extension), not a missing asset
      if (!path.extname(urlPath)) {
          const index = path.join(DIST_DIR, 'index.html');
          fs.readFile(index, (error, content) => {
              if (error) {
                  res.writeHead(500);
                  res.end('Error loading index.html');
              } else {
                  res.writeHead(200, { 'Content-Type': 'text/html' });
                  res.end(content);
              }
          });
          return;
      }

      res.writeHead(404);
      res.end('Not found');
      return;
    }

    // Serve file
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Operator Server running at http://localhost:${PORT}${BASE_PATH}`);
  console.log(`Serving files from: ${DIST_DIR}`);
});
