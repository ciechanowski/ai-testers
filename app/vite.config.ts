import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'mock-api',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (!req.url?.startsWith('/api/')) return next();

          const dataDir = path.resolve(__dirname, 'src/data');
          let filePath: string | null = null;

          if (req.url === '/api/artworks') {
            filePath = path.join(dataDir, 'artworks.json');
          } else if (req.url === '/api/artists') {
            filePath = path.join(dataDir, 'artists.json');
          } else if (req.url === '/api/testimonials') {
            filePath = path.join(dataDir, 'testimonials.json');
          } else if (req.url === '/api/activity') {
            // DELIBERATELY non-deterministic: every request reshuffles the feed
            // and re-stamps fresh "x minutes ago" timestamps. This is the VRT
            // trap the S03 factory exists to tame — mock it in tests, never
            // screenshot the live endpoint.
            const pool = JSON.parse(
              fs.readFileSync(path.join(dataDir, 'activity.json'), 'utf-8'),
            ) as Array<Record<string, unknown>>;
            const now = Date.now();
            const events = [...pool]
              .sort(() => Math.random() - 0.5)
              .slice(0, 6)
              .map((e) => ({
                ...e,
                createdAt: new Date(
                  now - Math.floor(Math.random() * 6 * 3_600_000),
                ).toISOString(),
              }));
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(events));
            return;
          } else if (req.url === '/api/insights') {
            // DELIBERATELY non-deterministic, like /api/activity: views and
            // favorites drift on every request and the row order follows them.
            // Screenshot this live and the baseline is noise — page.route() +
            // a factory is the point of S03L01.
            const rows = JSON.parse(
              fs.readFileSync(path.join(dataDir, 'insights.json'), 'utf-8'),
            ) as Array<Record<string, number>>;
            const drifted = rows
              .map((r) => ({
                ...r,
                views: r.views + Math.floor(Math.random() * 400),
                favorites: r.favorites + Math.floor(Math.random() * 25),
              }))
              .sort((a, b) => b.views - a.views);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(drifted));
            return;
          } else if (req.url.startsWith('/api/artworks/')) {
            const id = req.url.replace('/api/artworks/', '');
            const artworks = JSON.parse(
              fs.readFileSync(path.join(dataDir, 'artworks.json'), 'utf-8'),
            );
            const artwork = artworks.find(
              (a: { id: string }) => a.id === id,
            );
            if (artwork) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(artwork));
            } else {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Not found' }));
            }
            return;
          }

          if (filePath && fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'application/json');
            res.end(fs.readFileSync(filePath, 'utf-8'));
          } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Not found' }));
          }
        });
      },
    },
  ],
  server: {
    port: 5173,
  },
});
