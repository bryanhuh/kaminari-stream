import { useState } from "react";
import { useAniListOAuthStatus, useDisconnectAniList } from "../hooks/useAniListOAuth";

export default function AniListOAuthButton() {
  const [connecting, setConnecting] = useState(false);
  const { data: status, isLoading, error } = useAniListOAuthStatus();
  const disconnectMutation = useDisconnectAniList();

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const base = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";
      const authData = localStorage.getItem("raijin_auth");
      const token = authData ? JSON.parse(authData).token : null;

      if (!token) {
        setConnecting(false);
        return;
      }

      const res = await fetch(`${base}/api/auth/anilist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (json.data?.authUrl) {
        // Store state in sessionStorage for validation on callback
        sessionStorage.setItem("anilist_oauth_state", json.data.state);
        window.location.href = json.data.authUrl;
      }
    } catch {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnectMutation.mutateAsync();
  };

  if (isLoading) {
    return (
      <div className="px-3 py-2 text-xs text-[#5d6169]">
        Loading AniList status...
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-3 py-2 text-xs text-red-400">
        Error loading AniList status
      </div>
    );
  }

  if (status?.connected) {
    return (
      <div className="border-t border-[#1e1e28] px-3 py-2">
        <div className="text-xs font-semibold text-primary-400 mb-2">AniList Connected</div>
        <button
          onClick={handleDisconnect}
          disabled={disconnectMutation.isPending}
          className="w-full text-left text-xs text-[#bfc1c6] hover:text-white hover:bg-white/5 transition-colors px-2 py-1 rounded disabled:opacity-60"
        >
          {disconnectMutation.isPending ? "Disconnecting..." : "Disconnect AniList"}
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-[#1e1e28] px-3 py-2">
      <button
        onClick={handleConnect}
        disabled={connecting}
        className="w-full text-left text-xs text-[#bfc1c6] hover:text-white hover:bg-white/5 transition-colors px-2 py-1 rounded disabled:opacity-60"
      >
        {connecting ? "Connecting..." : "Connect AniList"}
      </button>
    </div>
  );
}
