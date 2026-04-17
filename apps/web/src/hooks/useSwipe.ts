import { useEffect, useRef } from "react";

interface SwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export function useSwipe(
  ref: React.RefObject<HTMLElement | null>,
  { onSwipeLeft, onSwipeRight, threshold = 60 }: SwipeOptions
) {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return;
      const dx = touchStartX.current - e.changedTouches[0].clientX;
      const dy = touchStartY.current - e.changedTouches[0].clientY;
      // Ignore if the gesture is more vertical than horizontal
      if (Math.abs(dy) > Math.abs(dx)) return;
      if (Math.abs(dx) < threshold) return;
      if (dx > 0) onSwipeLeft?.();
      else onSwipeRight?.();
      touchStartX.current = null;
      touchStartY.current = null;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, threshold, ref]);
}
