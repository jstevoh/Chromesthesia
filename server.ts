import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import ytdl from "@distube/ytdl-core";
import cors from "cors";

// --- Security: URL validation ---
const YOUTUBE_URL_REGEX = /^https?:\/\/(www\.)?(youtube\.com\/(watch\?|shorts\/|embed\/)|youtu\.be\/)/;

function isValidYouTubeUrl(url: string): boolean {
  return YOUTUBE_URL_REGEX.test(url);
}

// --- Security: Simple in-memory rate limiter ---
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 30; // max requests per window per IP

function rateLimit(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    res.status(429).send("Too many requests. Please try again later.");
    return;
  }
  next();
}

// Clean up stale rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetTime) rateLimitMap.delete(ip);
  }
}, 300_000);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security: Restrict CORS to known origins
  const allowedOrigins = [
    'https://chromesthesia.web.app',
    'https://chromesthesia-app.web.app',
    'https://chromesthesia-app.firebaseapp.com',
    'http://localhost:5173', // Vite dev server
    'http://localhost:3000',
  ];

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (same-origin, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'OPTIONS'],
    allowedHeaders: ['Range', 'Content-Type'],
    exposedHeaders: ['Content-Length', 'Content-Range', 'Accept-Ranges'],
  }));

  // Apply rate limiting to API routes
  app.use('/api/', rateLimit);

  // YouTube Info Endpoint
  app.get("/api/youtube/info", async (req, res) => {
    const videoUrl = req.query.url as string;
    if (!videoUrl) return res.status(400).send("URL is required");

    // Security: Validate YouTube URL
    if (!isValidYouTubeUrl(videoUrl)) {
      return res.status(400).send("Invalid YouTube URL");
    }

    try {
      const info = await ytdl.getInfo(videoUrl);
      res.json(info.videoDetails);
    } catch (error) {
      console.error("[YouTube Info Error]:", error);
      res.status(500).send("Failed to fetch video info");
    }
  });

  // YouTube Stream Endpoint
  app.get("/api/youtube/stream", async (req, res) => {
    const videoUrl = req.query.url as string;
    if (!videoUrl) {
      return res.status(400).send("Missing YouTube URL");
    }

    // Security: Validate YouTube URL
    if (!isValidYouTubeUrl(videoUrl)) {
      return res.status(400).send("Invalid YouTube URL");
    }

    console.log(`[YouTube Proxy] Requesting stream for: ${videoUrl}`);

    try {
      const info = await ytdl.getInfo(videoUrl, {
        requestOptions: {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
          }
        }
      });

      console.log(`[YouTube Proxy] Found video: ${info.videoDetails.title}`);

      let format = ytdl.chooseFormat(info.formats, {
        quality: 'highestvideo',
        filter: (f) => f.container === 'mp4' && f.hasAudio && f.hasVideo && !f.isLive && !f.isHLS
      });

      if (!format) {
        console.log(`[YouTube Proxy] No MP4 combined format found, falling back to any audioandvideo`);
        format = ytdl.chooseFormat(info.formats, {
          quality: 'highest',
          filter: 'audioandvideo'
        });
      }

      if (!format) {
        console.error(`[YouTube Proxy] No suitable format found for: ${videoUrl}`);
        return res.status(404).send("No suitable format with audio and video found");
      }

      console.log(`[YouTube Proxy] Selected format: itag=${format.itag}, container=${format.container}, quality=${format.qualityLabel}`);

      const range = req.headers.range;
      let streamOptions: any = { format };

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : undefined;

        // Security: Validate range values
        if (isNaN(start) || start < 0 || (end !== undefined && (isNaN(end) || end < start))) {
          return res.status(416).send("Invalid Range");
        }

        if (format.contentLength) {
          const total = parseInt(format.contentLength, 10);
          const chunkEnd = end !== undefined ? Math.min(end, total - 1) : total - 1;
          const chunksize = (chunkEnd - start) + 1;

          console.log(`[YouTube Proxy] Range request: ${start}-${chunkEnd}/${total}`);

          res.status(206).set({
            "Content-Range": `bytes ${start}-${chunkEnd}/${total}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunksize,
            "Content-Type": format.mimeType || "video/mp4",
          });

          streamOptions.range = { start, end: chunkEnd };
        } else {
          console.log(`[YouTube Proxy] Range request (no total length): ${start}-`);
          res.setHeader("Content-Type", format.mimeType || "video/mp4");
          streamOptions.range = { start };
        }
      } else {
        res.setHeader("Content-Type", format.mimeType || "video/mp4");
        if (format.contentLength) {
          res.setHeader("Content-Length", format.contentLength);
        }
        res.setHeader("Accept-Ranges", "bytes");
      }

      // Set a timeout for the stream to prevent hung connections
      req.setTimeout(120_000); // 2 minute timeout

      const stream = ytdl(videoUrl, {
        ...streamOptions,
        requestOptions: {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          }
        }
      });

      stream.on('response', (response) => {
        console.log(`[YouTube Proxy] Stream response received: ${response.statusCode}`);
      });

      stream.on('error', (err) => {
        console.error(`[YouTube Proxy] Stream error:`, err);
        if (!res.headersSent) {
          res.status(500).send("Stream error");
        } else {
          res.end();
        }
      });

      // Clean up stream if client disconnects
      req.on('close', () => {
        stream.destroy();
      });

      stream.pipe(res);
    } catch (error) {
      console.error("[YouTube Proxy] Error:", error);
      if (!res.headersSent) {
        res.status(500).send("Failed to stream YouTube video");
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Security: Bind to localhost only — use a reverse proxy for public access
  app.listen(PORT, "127.0.0.1", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
