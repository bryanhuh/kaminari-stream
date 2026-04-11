import { useEffect, useState } from "react";
import { useIsFetching } from "@tanstack/react-query";

// Debounce threshold: don't show the bar for instant cache hits.
const SHOW_DELAY_MS = 150;

export default function NavigationProgress() {
  const isFetching = useIsFetching();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isFetching > 0) {
      const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [isFetching]);

  return (
    <div
      role="progressbar"
      aria-label="Loading"
      aria-hidden={!visible}
      className={`fixed top-0 inset-x-0 z-[100] h-0.5 overflow-hidden pointer-events-none transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="h-full w-1/4 bg-primary-500 rounded-full"
        style={{ animation: "nav-progress 1.2s ease-in-out infinite" }}
      />
    </div>
  );
}
