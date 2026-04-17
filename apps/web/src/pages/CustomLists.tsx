import { useState } from "react";
import { Link } from "react-router-dom";
import { usePageMeta } from "../hooks/usePageMeta";
import { useAuth } from "../context/AuthContext";
import LoginPrompt from "../components/LoginPrompt";
import LazyImage from "../components/LazyImage";
import {
  useCustomLists,
  useCustomListEntries,
  useCreateCustomList,
  useDeleteCustomList,
  useRenameCustomList,
  useRemoveFromCustomList,
  type CustomList,
} from "../hooks/useCustomLists";

const listIcon = (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

export default function CustomLists() {
  usePageMeta("My Lists — raijin.", "Manage your custom anime lists on raijin.");
  const { isLoggedIn } = useAuth();
  const { data: lists, isLoading } = useCustomLists();
  const createList = useCreateCustomList();
  const deleteList = useDeleteCustomList();
  const renameList = useRenameCustomList();

  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [newListName, setNewListName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const selectedList = lists?.find((l) => l.id === selectedListId) ?? null;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = newListName.trim();
    if (!name) return;
    const result = await createList.mutateAsync(name);
    setNewListName("");
    setShowCreateForm(false);
    if (result) setSelectedListId((result as { id: number }).id);
  }

  async function handleDelete(listId: number) {
    if (!confirm("Delete this list? This cannot be undone.")) return;
    await deleteList.mutateAsync(listId);
    if (selectedListId === listId) setSelectedListId(null);
  }

  async function handleRename(listId: number) {
    const name = renameValue.trim();
    if (!name) return;
    await renameList.mutateAsync({ listId, name });
    setRenamingId(null);
  }

  function startRename(list: CustomList) {
    setRenamingId(list.id);
    setRenameValue(list.name);
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-white mb-8">My Lists</h1>
        <LoginPrompt
          icon={listIcon}
          heading="Sign in to manage your lists"
          body="Create custom lists like 'Comfort Rewatches' or 'Top 10' to organize your anime."
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">My Lists</h1>
        <button
          onClick={() => setShowCreateForm((v) => !v)}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-primary-500 hover:bg-primary-400 text-[#0a0a0f] font-semibold transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New List
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreate} className="flex gap-2 mb-6">
          <input
            autoFocus
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="List name (e.g. Comfort Rewatches)"
            maxLength={80}
            className="flex-1 bg-[#111118] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#5d6169] focus:outline-none focus:border-primary-500"
          />
          <button
            type="submit"
            disabled={!newListName.trim() || createList.isPending}
            className="text-sm px-4 py-2 rounded-lg bg-primary-500 text-[#0a0a0f] font-semibold hover:bg-primary-400 transition-colors disabled:opacity-40"
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => setShowCreateForm(false)}
            className="text-sm px-3 py-2 rounded-lg border border-[#2a2a38] text-[#5d6169] hover:text-[#bfc1c6] transition-colors"
          >
            Cancel
          </button>
        </form>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-[#111118] animate-pulse" />
          ))}
        </div>
      ) : !lists?.length ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <svg className="w-16 h-16 text-[#2a2a38]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          <p className="text-[#5d6169] text-lg font-medium">No lists yet</p>
          <p className="text-[#3d3d4f] text-sm">Create a list like "Comfort Rewatches" or "Top 10"</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* List sidebar */}
          <div className="lg:w-72 shrink-0 flex flex-col gap-1">
            {lists.map((list) => (
              <div key={list.id}>
                {renamingId === list.id ? (
                  <div className="flex gap-2 px-1">
                    <input
                      autoFocus
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRename(list.id);
                        if (e.key === "Escape") setRenamingId(null);
                      }}
                      maxLength={80}
                      className="flex-1 bg-[#111118] border border-primary-500 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none"
                    />
                    <button
                      onClick={() => handleRename(list.id)}
                      disabled={renameList.isPending}
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-primary-500 text-[#0a0a0f] font-semibold"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setRenamingId(null)}
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-[#2a2a38] text-[#5d6169]"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedListId(list.id === selectedListId ? null : list.id)}
                    className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
                      selectedListId === list.id
                        ? "bg-primary-500/15 border border-primary-500/30 text-primary-400"
                        : "hover:bg-[#1e1e28] text-[#bfc1c6]"
                    }`}
                  >
                    <span className="truncate font-medium">{list.name}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); startRename(list); }}
                        title="Rename"
                        className="p-1 rounded hover:text-white transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(list.id); }}
                        title="Delete"
                        className="p-1 rounded hover:text-red-400 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* List entries */}
          <div className="flex-1 min-w-0">
            {selectedList ? (
              <ListEntries list={selectedList} />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-[#5d6169]">
                <svg className="w-12 h-12 mb-3 text-[#2a2a38]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" />
                </svg>
                <p>Select a list to see its anime</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ListEntries({ list }: { list: CustomList }) {
  const { data: entries, isLoading } = useCustomListEntries(list.id);
  const removeFromList = useRemoveFromCustomList();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2 animate-pulse">
            <div className="aspect-[3/4] rounded-xl bg-[#111118]" />
            <div className="h-4 rounded bg-[#111118] w-4/5" />
          </div>
        ))}
      </div>
    );
  }

  if (!entries?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <p className="text-[#5d6169] text-lg font-medium">"{list.name}" is empty</p>
        <p className="text-[#3d3d4f] text-sm">Add anime to this list from any anime's detail page.</p>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-lg font-bold text-white mb-4">{list.name} <span className="text-[#5d6169] font-normal text-sm">({entries.length})</span></h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {entries.map((entry) => (
          <div key={entry.animeId} className="group flex flex-col gap-2">
            <Link to={`/anime/${entry.animeId}`}>
              <div className="relative overflow-hidden rounded-xl aspect-[3/4] bg-[#111118]">
                {entry.animeCover ? (
                  <LazyImage
                    src={entry.animeCover}
                    alt={entry.animeTitle}
                    className="w-full h-full object-cover group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#5d6169] text-sm">No image</div>
                )}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    removeFromList.mutate({ listId: list.id, animeId: entry.animeId });
                  }}
                  title="Remove from list"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-full bg-black/70 flex items-center justify-center text-red-400 hover:text-red-300"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </Link>
            <p className="text-sm font-medium text-white line-clamp-2 leading-tight group-hover:text-primary-400 transition-colors px-0.5">
              {entry.animeTitle}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
