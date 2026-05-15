import { cpSync, mkdirSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Create Vercel output directories
const outputDir = join(root, '.vercel', 'output');
const staticDir = join(outputDir, 'static');
const funcDir = join(outputDir, 'functions', 'ssr.func');

mkdirSync(staticDir, { recursive: true });
mkdirSync(funcDir, { recursive: true });

// Copy client assets to static directory
const clientDir = join(root, 'dist', 'client');
if (existsSync(clientDir)) {
  cpSync(clientDir, staticDir, { recursive: true });
}

// Copy entire server directory to function
const serverDir = join(root, 'dist', 'server');
if (existsSync(serverDir)) {
  cpSync(serverDir, funcDir, { recursive: true });
}

// Create Node.js handler that wraps the server (ESM)
const handlerCode = `
import server from './server.js';

export default async function handler(req, res) {
  try {
    // Build URL
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const url = new URL(req.url, protocol + '://' + host);
    
    // Build headers
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach(v => headers.append(key, v));
        } else {
          headers.set(key, value);
        }
      }
    }
    
    // Build request body for non-GET requests
    let body = null;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      if (chunks.length > 0) {
        body = Buffer.concat(chunks);
      }
    }
    
    // Create Web Request
    const webRequest = new Request(url.toString(), {
      method: req.method,
      headers,
      body,
      duplex: 'half'
    });
    
    // Call the server
    const fetchFn = server.default?.fetch || server.fetch;
    const response = await fetchFn(webRequest, {}, {});
    
    // Send response status
    res.statusCode = response.status;
    res.statusMessage = response.statusText;
    
    // Send response headers
    response.headers.forEach((value, key) => {
      // Skip certain headers that Node handles
      if (key.toLowerCase() !== 'content-encoding') {
        res.setHeader(key, value);
      }
    });
    
    // Send response body
    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();
  } catch (error) {
    console.error('SSR Error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/html');
    res.end('<html><body><h1>Internal Server Error</h1></body></html>');
  }
};
`;

writeFileSync(join(funcDir, 'index.js'), handlerCode);

// Create package.json for the function (ESM)
const pkgJson = {
  type: 'module'
};
writeFileSync(join(funcDir, 'package.json'), JSON.stringify(pkgJson, null, 2));

// Create function config for Node.js runtime
const funcConfig = {
  runtime: 'nodejs20.x',
  handler: 'index.js',
  launcherType: 'Nodejs',
  shouldAddHelpers: false,
  shouldAddSourcemapSupport: false
};
writeFileSync(join(funcDir, '.vc-config.json'), JSON.stringify(funcConfig, null, 2));

// Create Vercel output config
const outputConfig = {
  version: 3,
  routes: [
    {
      src: '^/assets/(.*)$',
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
      continue: true
    },
    {
      handle: 'filesystem'
    },
    {
      src: '/(.*)',
      dest: '/ssr'
    }
  ]
};
writeFileSync(join(outputDir, 'config.json'), JSON.stringify(outputConfig, null, 2));

console.log('Vercel Build Output created successfully!');
console.log('Static files:', staticDir);
console.log('Serverless function:', funcDir);
