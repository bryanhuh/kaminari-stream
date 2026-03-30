import { useEffect, useRef } from "react";
import {
  MediaPlayer,
  MediaProvider,
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
}

function getBestSource(sources: StreamData["sources"]): string {
  // Prefer 1080p > 720p > 480p > default > first available
  const order = ["1080p", "720p", "480p", "360p", "default"];
  for (const q of order) {
    const found = sources.find((s) => s.quality === q && s.isM3U8);
    if (found) return found.url;
  }
  // Fall back to any m3u8 source
  const anyM3u8 = sources.find((s) => s.isM3U8);
  if (anyM3u8) return anyM3u8.url;
  // Last resort: first source
  return sources[0]?.url ?? "";
}

export default function VideoPlayer({
  streamData,
  title,
  initialTime = 0,
  onTimeUpdate,
}: VideoPlayerProps) {
  const playerRef = useRef<MediaPlayerInstance>(null);
  const src = getBestSource(streamData.sources);

  // Seek to saved position after media is ready
  useEffect(() => {
    const player = playerRef.current;
    if (!player || initialTime <= 0) return;

    const unsub = player.subscribe(({ canSeek }) => {
      if (canSeek) {
        player.currentTime = initialTime;
        unsub();
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
      crossOrigin="anonymous"
    >
      <MediaProvider />
      <DefaultVideoLayout icons={defaultLayoutIcons} />
    </MediaPlayer>
  );
}
