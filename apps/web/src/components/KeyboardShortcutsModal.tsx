import { useEffect } from "react";

interface ShortcutGroup {
  label: string;
  shortcuts: { key: string; description: string }[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    label: "Player",
    shortcuts: [
      { key: "Space", description: "Play / Pause" },
      { key: "← / →", description: "Seek backward / forward 5 seconds" },
      { key: "↑ / ↓", description: "Volume up / down" },
      { key: "F", description: "Toggle fullscreen" },
      { key: "M", description: "Toggle mute" },
    ],
  },
  {
    label: "Navigation",
    shortcuts: [
      { key: "P", description: "Previous episode" },
      { key: "N", description: "Next episode" },
    ],
  },
  {
    label: "Global",
    shortcuts: [
      { key: "?", description: "Show / hide this shortcuts guide" },
    ],
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-[#111118] border border-[#2a2a38] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e1e28]">
          <div className="flex items-center gap-2.5">
            <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8" />
            </svg>
            <h2 className="text-sm font-bold text-white">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex items-center justify-center w-7 h-7 rounded-lg text-[#5d6169] hover:text-white hover:bg-white/5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 flex flex-col gap-5">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#5d6169] mb-2.5">
                {group.label}
              </p>
              <div className="flex flex-col gap-1.5">
                {group.shortcuts.map(({ key, description }) => (
                  <div key={key} className="flex items-center justify-between gap-4">
                    <span className="text-sm text-[#bfc1c6]">{description}</span>
                    <kbd className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#1a1a24] border border-[#2a2a38] text-[11px] font-mono font-semibold text-primary-400">
                      {key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#1e1e28] text-center">
          <p className="text-[11px] text-[#3d3d4f]">Press <kbd className="px-1.5 py-0.5 rounded bg-[#1a1a24] border border-[#2a2a38] text-[11px] font-mono text-[#5d6169]">?</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-[#1a1a24] border border-[#2a2a38] text-[11px] font-mono text-[#5d6169]">Esc</kbd> to close</p>
        </div>
      </div>
    </div>
  );
}
