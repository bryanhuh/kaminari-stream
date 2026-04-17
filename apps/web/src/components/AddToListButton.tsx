import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCustomLists, useAddToCustomList, useRemoveFromCustomList, useCustomListEntries } from "../hooks/useCustomLists";
import { useAuth } from "../context/AuthContext";

interface Props {
  animeId: number;
  animeTitle: string;
  animeCover?: string | null;
}

export default function AddToListButton({ animeId, animeTitle, animeCover }: Props) {
  const { isLoggedIn } = useAuth();
  const { data: lists } = useCustomLists();
  const addTo = useAddToCustomList();
  const removeFrom = useRemoveFromCustomList();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Build a set of listIds that already contain this anime
  // We query each list's entries only when the dropdown is open to avoid N queries
  // Instead, track membership via mutation responses in local state
  const [inLists, setInLists] = useState<Set<number>>(new Set());
  const initialized = useRef(false);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!isLoggedIn) return null;

  async function toggle(listId: number) {
    if (inLists.has(listId)) {
      await removeFrom.mutateAsync({ listId, animeId });
      setInLists((prev) => { const s = new Set(prev); s.delete(listId); return s; });
    } else {
      await addTo.mutateAsync({ listId, animeId, animeTitle, animeCover });
      setInLists((prev) => new Set([...prev, listId]));
    }
  }

  const noLists = !lists?.length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#2a2a38] bg-[#111118] hover:border-primary-500/50 text-[#bfc1c6] hover:text-white text-sm font-medium transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        Add to List
        <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 w-56 bg-[#1e1e28] border border-[#2a2a38] rounded-xl shadow-xl z-50 overflow-hidden">
          {noLists ? (
            <div className="px-4 py-3 text-center">
              <p className="text-sm text-[#5d6169] mb-2">No lists yet</p>
              <Link
                to="/lists"
                onClick={() => setOpen(false)}
                className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
              >
                Create a list →
              </Link>
            </div>
          ) : (
            <>
              <div className="py-1 max-h-56 overflow-y-auto">
                {lists!.map((list) => {
                  const isIn = inLists.has(list.id);
                  return (
                    <button
                      key={list.id}
                      onClick={() => toggle(list.id)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-[#2a2a38] transition-colors"
                    >
                      <span className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border ${isIn ? "bg-primary-500 border-primary-500" : "border-[#5d6169]"}`}>
                        {isIn && (
                          <svg className="w-2.5 h-2.5 text-[#0a0a0f]" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      <span className="truncate text-[#bfc1c6]">{list.name}</span>
                    </button>
                  );
                })}
              </div>
              <div className="border-t border-[#2a2a38] px-3 py-2">
                <Link
                  to="/lists"
                  onClick={() => setOpen(false)}
                  className="text-xs text-[#5d6169] hover:text-primary-400 transition-colors"
                >
                  Manage lists →
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
