import { Router, type Request, type Response } from "express";

const router = Router();

/**
 * GET /api/proxy/hls?url=<encoded>&referer=<encoded>
 *
 * Fetches an HLS resource (m3u8 manifest or TS segment) with the required
 * Referer header and pipes it back to the browser.
 * For m3u8 files, segment/playlist URLs are rewritten so they also go through
 * this proxy (preserving the Referer for every request in the HLS chain).
 */
router.get("/hls", async (req: Request, res: Response) => {
  const url = String(req.query.url ?? "").trim();
  const referer = String(req.query.referer ?? "").trim();

  if (!url) {
    res.status(400).json({ error: "Missing url param" });
    return;
  }

  try {
    const upstream = await fetch(url, {
      headers: {
        ...(referer ? { Referer: referer } : {}),
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!upstream.ok) {
      res.status(upstream.status).send(`Upstream error: ${upstream.statusText}`);
      return;
    }

    const contentType = upstream.headers.get("content-type") ?? "";
    const isM3u8 = contentType.includes("mpegurl") || url.includes(".m3u8");

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", isM3u8 ? "no-cache" : "public, max-age=3600");

    if (isM3u8) {
      const text = await upstream.text();
      // Base URL for resolving relative paths in the manifest
      const baseUrl = url.substring(0, url.lastIndexOf("/") + 1);

      const rewritten = text
        .split("\n")
        .map((line) => {
          const trimmed = line.trim();
          // Leave comments and empty lines untouched
          if (!trimmed || trimmed.startsWith("#")) return line;

          const absolute = trimmed.startsWith("http")
            ? trimmed
            : new URL(trimmed, baseUrl).href;

          return `/api/proxy/hls?url=${encodeURIComponent(absolute)}&referer=${encodeURIComponent(referer)}`;
        })
        .join("\n");

      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      res.send(rewritten);
    } else {
      res.setHeader("Content-Type", contentType || "application/octet-stream");
      const buf = await upstream.arrayBuffer();
      res.send(Buffer.from(buf));
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Proxy error";
    res.status(500).json({ error: msg });
  }
});

export default router;
