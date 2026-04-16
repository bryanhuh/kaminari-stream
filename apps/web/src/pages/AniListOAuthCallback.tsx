import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function AniListOAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    async function handleCallback() {
      const code = searchParams.get("code");
      const state = searchParams.get("state");

      if (!code) {
        setError("No authorization code received.");
        setProcessing(false);
        return;
      }

      // Validate state token
      const storedState = sessionStorage.getItem("anilist_oauth_state");
      if (!state || state !== storedState) {
        setError("Invalid state token. Please try again.");
        setProcessing(false);
        return;
      }

      try {
        const base = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";
        const authData = localStorage.getItem("raijin_auth");
        const token = authData ? JSON.parse(authData).token : null;

        if (!token) {
          setError("Not authenticated. Please sign in first.");
          setProcessing(false);
          return;
        }

        const res = await fetch(
          `${base}/api/auth/anilist/callback?${new URLSearchParams({ code })}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const json = await res.json();

        if (!res.ok) {
          setError(json.error || "Failed to connect AniList.");
          setProcessing(false);
          return;
        }

        // Clear the stored state
        sessionStorage.removeItem("anilist_oauth_state");

        // Success! Redirect to home
        navigate("/", { replace: true });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred.");
        setProcessing(false);
      }
    }

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="text-center">
        {processing ? (
          <>
            <div className="inline-block mb-4">
              <svg className="w-12 h-12 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Connecting AniList...</h1>
            <p className="text-[#bfc1c6]">Please wait while we set up your connection.</p>
          </>
        ) : error ? (
          <>
            <div className="inline-block mb-4 p-3 bg-red-400/10 border border-red-400/20 rounded-lg">
              <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Connection Failed</h1>
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => navigate("/", { replace: true })}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-400 text-[#0a0a0f] font-semibold rounded-lg transition-colors"
            >
              Return Home
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
