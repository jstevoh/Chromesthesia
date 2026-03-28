import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import ytdl from "@distube/ytdl-core";
import cors from "cors";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());

  // YouTube Stream Proxy
  app.get("/api/youtube/info", async (req, res) => {
    const videoUrl = req.query.url as string;
    if (!videoUrl) return res.status(400).send("URL is required");
    try {
      const info = await ytdl.getInfo(videoUrl);
      res.json(info.videoDetails);
    } catch (error) {
      console.error("[YouTube Info Error]:", error);
      res.status(500).send(error instanceof Error ? error.message : 'Unknown error');
    }
  });

  app.get("/api/youtube/stream", async (req, res) => {
    const videoUrl = req.query.url as string;
    if (!videoUrl) {
      return res.status(400).send("Missing YouTube URL");
    }

    console.log(`[YouTube Proxy] Requesting stream for: ${videoUrl}`);

    try {
      // Use a more robust way to get info
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

      // Filter for formats that have both audio and video
      // Prioritize mp4 and higher resolution but within reasonable limits for streaming
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

      console.log(`[YouTube Proxy] Selected format: itag=${format.itag}, container=${format.container}, mimeType=${format.mimeType}, quality=${format.qualityLabel}`);

      // Handle Range header from browser
      const range = req.headers.range;
      let streamOptions: any = { format };

      // Set CORS headers early
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Range, Content-Type");
      res.setHeader("Access-Control-Expose-Headers", "Content-Length, Content-Range, Accept-Ranges");

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : undefined;
        
        if (format.contentLength) {
          const total = parseInt(format.contentLength, 10);
          const chunkEnd = end || total - 1;
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

      // Stream the video with a User-Agent and handle errors
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
          // If headers already sent, we can't do much but end the response
          res.end();
        }
      });

      stream.pipe(res);
    } catch (error) {
      console.error("[YouTube Proxy] Error:", error);
      if (!res.headersSent) {
        res.status(500).send(`Failed to stream YouTube video: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
