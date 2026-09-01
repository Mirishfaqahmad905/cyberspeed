import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { adStore, AdPlacement, AdType } from './server/adStore';

const ADMIN_USERNAME = 'ishfaqahmad';
const ADMIN_PASSWORD = 'ishfaqahmad';

// In-memory token storage with expiration (24 hours)
const activeSessions = new Map<string, { username: string; expiresAt: number }>();

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function verifyAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Admin login required.' });
  }

  const token = authHeader.substring(7);
  const session = activeSessions.get(token);

  if (!session || session.expiresAt < Date.now()) {
    if (session) activeSessions.delete(token);
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }

  next();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for JSON body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Pre-generate a 1MB uncompressible randomized byte chunk to serve high-speed streams efficiently
  const randomChunk1MB = crypto.randomBytes(1024 * 1024);

  // Disable etag and set no-cache headers for all /api endpoints
  app.use('/api', (req, res, next) => {
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store',
    });
    next();
  });

  // ==========================================
  // 1. SPEED TEST TELEMETRY ENDPOINTS
  // ==========================================

  // Ping / Latency
  app.get('/api/ping', (req, res) => {
    res.json({
      status: 'pong',
      clientTimestamp: req.query.t ? Number(req.query.t) : undefined,
      serverTime: Date.now(),
    });
  });

  // Real Download Stream
  app.get('/api/download', (req, res) => {
    const sizeParam = parseInt(req.query.size as string, 10);
    // Allow up to 250MB for 1-minute continuous measurements
    const totalBytes = Number.isFinite(sizeParam) && sizeParam > 0
      ? Math.min(sizeParam * 1024 * 1024, 250 * 1024 * 1024)
      : 50 * 1024 * 1024;

    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Length': totalBytes.toString(),
      'Content-Disposition': 'attachment; filename="bandwidth-stream.bin"',
    });

    let bytesSent = 0;
    const chunkSize = randomChunk1MB.length;

    function sendNext() {
      while (bytesSent < totalBytes) {
        const remaining = totalBytes - bytesSent;
        const currentChunk = remaining < chunkSize ? randomChunk1MB.subarray(0, remaining) : randomChunk1MB;
        bytesSent += currentChunk.length;

        const canContinue = res.write(currentChunk);
        if (!canContinue) {
          res.once('drain', sendNext);
          return;
        }
      }
      res.end();
    }

    sendNext();

    req.on('close', () => {
      res.end();
    });
  });

  // Real Upload Stream Consumer
  app.post('/api/upload', (req, res) => {
    const startTime = Date.now();
    let totalBytesReceived = 0;

    req.on('data', (chunk: Buffer) => {
      totalBytesReceived += chunk.length;
    });

    req.on('end', () => {
      const elapsedMs = Math.max(1, Date.now() - startTime);
      const mbps = ((totalBytesReceived * 8) / (elapsedMs / 1000)) / 1_000_000;
      res.json({
        status: 'ok',
        receivedBytes: totalBytesReceived,
        elapsedMs,
        speedMbps: Number(mbps.toFixed(2)),
      });
    });

    req.on('error', (err) => {
      res.status(500).json({ error: 'Stream error', details: err.message });
    });
  });

  // Connection info & IP detection
  app.get('/api/connection-info', (req, res) => {
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp = typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : req.socket.remoteAddress || '127.0.0.1';

    const userAgent = req.headers['user-agent'] || 'Unknown Browser';
    const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https'
      ? 'HTTPS / HTTP2 (Secure)'
      : 'HTTP/1.1 (Direct)';

    res.json({
      ip: clientIp,
      protocol,
      userAgent,
      serverRegion: process.env.K_LOCATION || 'Cloud Edge (Low Latency)',
      serverTime: new Date().toISOString(),
    });
  });

  // ==========================================
  // 2. PUBLIC ADS ENDPOINTS
  // ==========================================

  // Get active ads for frontend placement
  app.get('/api/ads', (req, res) => {
    try {
      const result = adStore.getActiveAdsForFrontend();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch ads', details: err.message });
    }
  });

  // Track impression
  app.post('/api/ads/track/impression/:id', (req, res) => {
    const { id } = req.params;
    adStore.trackImpression(id);
    res.json({ status: 'ok', tracked: 'impression', adId: id });
  });

  // Track click
  app.post('/api/ads/track/click/:id', (req, res) => {
    const { id } = req.params;
    adStore.trackClick(id);
    res.json({ status: 'ok', tracked: 'click', adId: id });
  });

  // ==========================================
  // 3. ADMIN AUTHENTICATION
  // ==========================================

  app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = generateToken();
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      activeSessions.set(token, { username: ADMIN_USERNAME, expiresAt });

      return res.json({
        status: 'ok',
        token,
        username: ADMIN_USERNAME,
        expiresAt,
        message: 'Admin authentication successful',
      });
    }

    return res.status(401).json({
      status: 'error',
      error: 'Invalid username or password. Please use authorized credentials.',
    });
  });

  app.get('/api/admin/me', verifyAdminAuth, (req, res) => {
    res.json({
      status: 'ok',
      authenticated: true,
      username: ADMIN_USERNAME,
    });
  });

  app.post('/api/admin/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      activeSessions.delete(token);
    }
    res.json({ status: 'ok', message: 'Logged out successfully' });
  });

  // ==========================================
  // 4. ADMIN ADS MANAGEMENT (PROTECTED)
  // ==========================================

  // Get all ads (with full stats)
  app.get('/api/admin/ads', verifyAdminAuth, (req, res) => {
    const ads = adStore.getAllAds();
    const spaces = adStore.getAdSpaces();
    res.json({ ads, spaces });
  });

  // Create ad
  app.post('/api/admin/ads', verifyAdminAuth, (req, res) => {
    const { title, type, placement, imageUrl, targetUrl, altText, htmlCode, adText, ctaText, sponsorName, badgeLabel, isActive } = req.body;

    if (!title || !type || !placement) {
      return res.status(400).json({ error: 'Title, type, and placement are required fields.' });
    }

    const created = adStore.createAd({
      title,
      type: type as AdType,
      placement: placement as AdPlacement,
      imageUrl,
      targetUrl,
      altText,
      htmlCode,
      adText,
      ctaText,
      sponsorName,
      badgeLabel,
      isActive: isActive !== false,
    });

    res.status(201).json({ status: 'ok', ad: created });
  });

  // Update ad
  app.put('/api/admin/ads/:id', verifyAdminAuth, (req, res) => {
    const { id } = req.params;
    const updated = adStore.updateAd(id, req.body);

    if (!updated) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    res.json({ status: 'ok', ad: updated });
  });

  // Delete ad
  app.delete('/api/admin/ads/:id', verifyAdminAuth, (req, res) => {
    const { id } = req.params;
    const deleted = adStore.deleteAd(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    res.json({ status: 'ok', message: 'Ad deleted successfully', id });
  });

  // Toggle ad active status
  app.post('/api/admin/ads/toggle/:id', verifyAdminAuth, (req, res) => {
    const { id } = req.params;
    const toggled = adStore.toggleAdActive(id);

    if (!toggled) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    res.json({ status: 'ok', ad: toggled });
  });

  // Get ad spaces
  app.get('/api/admin/spaces', verifyAdminAuth, (req, res) => {
    const spaces = adStore.getAdSpaces();
    res.json({ spaces });
  });

  // Update ad space enabled status
  app.put('/api/admin/spaces/:id', verifyAdminAuth, (req, res) => {
    const { id } = req.params;
    const { isEnabled } = req.body;

    const updated = adStore.updateSpace(id as AdPlacement, isEnabled);
    if (!updated) {
      return res.status(404).json({ error: 'Ad space not found' });
    }

    res.json({ status: 'ok', space: updated });
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: Date.now() });
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Speed test server & Ad engine running on port ${PORT}`);
  });
}

startServer();
