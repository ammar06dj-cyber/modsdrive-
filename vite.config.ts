import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

function safeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

// Auth API plugin - handles /api/admin-auth without separate server
const authApiPlugin = () => ({
  name: 'auth-api',
  configureServer(server) {
    // Admin authentication endpoint
    server.middlewares.use('/api/admin-auth', (req, res, next) => {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
      }
      
      let body = '';
      let isOverLimit = false;

      const contentLength = parseInt(req.headers['content-length'] || '', 10);
      if (!isNaN(contentLength) && contentLength > 2048) {
        res.statusCode = 413;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Payload Too Large' }));
        return;
      }

      req.on('data', chunk => {
        if (isOverLimit) return;
        body += chunk;
        if (body.length > 2048) {
          isOverLimit = true;
          res.statusCode = 413;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Payload Too Large' }));
          req.destroy();
        }
      });

      req.on('end', () => {
        if (isOverLimit) return;

        try {
          const adminPassword = process.env.ADMIN_PASSWORD;
          if (!adminPassword) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Server misconfiguration: admin authentication is not configured.' }));
            return;
          }

          const { password } = JSON.parse(body);
          if (!password) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Password required' }));
            return;
          }
          
          if (safeCompare(password, adminPassword)) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ authenticated: true }));
          } else {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ authenticated: false, error: 'Invalid credentials' }));
          }
        } catch (e) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Invalid request payload' }));
        }
      });
    });
    
    // Health check endpoint
    server.middlewares.use('/api/health', (req, res, next) => {
      if (req.method === 'GET') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
      } else {
        next();
      }
    });

    // Sitemap API endpoint
    server.middlewares.use('/api/sitemap', async (req, res, next) => {
      if (req.method === 'GET') {
        try {
          const baseUrl = process.env.APP_URL || 'https://modsdrive.pages.dev';
          const { SEED_MODS } = await import('./src/supabaseClient.ts');
          
          const urls = [
            { loc: `${baseUrl}/`, priority: '1.0' },
            { loc: `${baseUrl}/privacy-policy`, priority: '0.3' },
            ...SEED_MODS.map(m => ({ loc: `${baseUrl}/mod/${m.id}`, priority: '0.8' }))
          ];
          
          const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u.loc}</loc><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>`;
          
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/xml');
          res.end(xml);
        } catch (err) {
          console.error("Failed to generate dynamic sitemap in Vite middleware:", err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Server error generating sitemap' }));
        }
      } else {
        next();
      }
    });

    // Dedicated /sitemap.xml endpoint serving from public/sitemap.xml
    server.middlewares.use('/sitemap.xml', (req, res, next) => {
      if (req.method === 'GET') {
        const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
        
        if (fs.existsSync(sitemapPath)) {
          const xml = fs.readFileSync(sitemapPath, 'utf8');
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/xml');
          res.end(xml);
        } else {
          res.statusCode = 404;
          res.end('Not found');
        }
      } else {
        next();
      }
    });
  }
});

export default defineConfig({
  plugins: [react(), tailwindcss(), authApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
    cors: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'admin': ['./src/components/AdminPage'],
          'detail': ['./src/components/ModDetailPage'],
          'auth': ['./src/components/DesignerAuthPage'],
          'privacy': ['./src/components/PrivacyPolicyPage'],
        },
      },
    },
  },
});
