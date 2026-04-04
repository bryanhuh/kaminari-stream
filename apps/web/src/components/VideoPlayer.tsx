import { useEffect, useMemo, useRef } from "react";
import {
  MediaPlayer,
  MediaProvider,
  Track,
  type MediaPlayerInstance,
} from "@vidstack/react";
import {
  DefaultVideoLayout,
  defaultLayoutIcons,
} from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import type { StreamData } from "@anime-app/types";

interface VideoPlayerProps {
  streamData: StreamData;
  title: string;
  initialTime?: number;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  sourceUrl?: string;
  onEnded?: () => void;
}

function getBestSource(sources: StreamData["sources"]): string {
  const order = ["1080p", "720p", "480p", "360p", "default"];
  for (const q of order) {
    const found = sources.find((s) => s.quality === q && s.isM3U8);
    if (found) return found.url;
  }
  const anyM3u8 = sources.find((s) => s.isM3U8);
  if (anyM3u8) return anyM3u8.url;
  return sources[0]?.url ?? "";
}

function proxied(url: string, referer?: string): string {
  if (!referer) return url;
  return `/api/proxy/hls?url=${encodeURIComponent(url)}&referer=${encodeURIComponent(referer)}`;
}

// Subtitle VTT files on anime CDNs require the same referer + CORS bypass.
// We reuse the HLS proxy since it pipes any content-type through.
function proxiedVtt(url: string, referer?: string): string {
  return `/api/proxy/hls?url=${encodeURIComponent(url)}&referer=${encodeURIComponent(referer ?? "")}`;
}

export default function VideoPlayer({
  streamData,
  title,
  initialTime = 0,
  onTimeUpdate,
  sourceUrl,
  onEnded,
}: VideoPlayerProps) {
  const playerRef = useRef<MediaPlayerInstance>(null);
  const referer = streamData.headers?.Referer;
  const rawSrc = sourceUrl ?? getBestSource(streamData.sources);
  const srcUrl = proxied(rawSrc, referer);

  // Memoize src so Vidstack only reloads when the URL genuinely changes,
  // not on every parent render (which caused flickering).
  const src = useMemo(
    () => ({ src: srcUrl, type: "application/x-mpegurl" as const }),
    [srcUrl]
  );

  // Seek to saved position after media is ready
  useEffect(() => {
    const player = playerRef.current;
    if (!player || initialTime <= 0) return;

    let seeked = false;
    const unsub = player.subscribe(({ canSeek }) => {
      if (canSeek && !seeked) {
        seeked = true;
        player.currentTime = initialTime;
      }
    });

    return unsub;
  }, [initialTime]);

  return (
    <MediaPlayer
      ref={playerRef}
      title={title}
      src={src}
      className="w-full aspect-video bg-black rounded-lg overflow-hidden"
      onTimeUpdate={(detail) => {
        const duration = playerRef.current?.duration ?? 0;
        onTimeUpdate?.(detail.currentTime, duration);
      }}
      onEnded={onEnded}
      crossOrigin="anonymous"
    >
      <MediaProvider>
        {streamData.subtitles
          // Consumet includes "Thumbnails" (seek-preview sprites) — skip those.
          ?.filter((sub) => sub.lang.toLowerCase() !== "thumbnails")
          .map((sub, i) => (
            <Track
              key={`${i}-${sub.lang}`}
              src={proxiedVtt(sub.url, referer)}
              kind="subtitles"
              label={sub.lang}
              lang={sub.lang}
              default={sub.lang.toLowerCase().includes("english")}
            />
          ))}
      </MediaProvider>
      <DefaultVideoLayout icons={defaultLayoutIcons} />
    </MediaPlayer>
  );
}
