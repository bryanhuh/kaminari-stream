import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

type Tab = "signin" | "signup";

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const [tab, setTab] = useState<Tab>("signin");
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-sm mx-4 bg-[#111118] border border-[#2a2a38] rounded-2xl shadow-2xl overflow-hidden">
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-[#5d6169] hover:text-white hover:bg-white/5 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <span className="text-2xl font-extrabold text-primary-500 tracking-tight">raijin.</span>
            <p className="text-sm text-[#5d6169] mt-1">Your anime, your way.</p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl bg-[#0a0a0f] p-1 mb-6 gap-1">
            {(["signin", "signup"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  tab === t
                    ? "bg-primary-500 text-[#0a0a0f] shadow"
                    : "text-[#5d6169] hover:text-white"
                }`}
              >
                {t === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {tab === "signin" ? <SignInForm onSuccess={onClose} /> : <SignUpForm onSuccess={onClose} />}
        </div>
      </div>
    </div>
  );
}

function SignInForm({ onSuccess }: { onSuccess: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <div>
        <label className="block text-xs font-semibold text-[#bfc1c6] mb-1.5" htmlFor="signin-email">
          Email
        </label>
        <input
          id="signin-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
          className="w-full bg-[#0a0a0f] border border-[#2a2a38] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-[#5d6169] outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/40 transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#bfc1c6] mb-1.5" htmlFor="signin-password">
          Password
        </label>
        <input
          id="signin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="current-password"
          className="w-full bg-[#0a0a0f] border border-[#2a2a38] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-[#5d6169] outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/40 transition-colors"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-primary-500 hover:bg-primary-400 text-[#0a0a0f] font-semibold text-sm rounded-lg transition-colors mt-1 disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading && (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
          </svg>
        )}
        {loading ? "Signing in…" : "Sign In"}
      </button>
      <p className="text-center text-xs text-[#5d6169]">
        By signing in you agree to our{" "}
        <span className="text-primary-500 cursor-pointer hover:underline">Terms of Service</span>.
      </p>
    </form>
  );
}

function SignUpForm({ onSuccess }: { onSuccess: () => void }) {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(username, email, password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <div>
        <label className="block text-xs font-semibold text-[#bfc1c6] mb-1.5" htmlFor="signup-username">
          Username
        </label>
        <input
          id="signup-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="otaku_legend"
          required
          autoComplete="username"
          className="w-full bg-[#0a0a0f] border border-[#2a2a38] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-[#5d6169] outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/40 transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#bfc1c6] mb-1.5" htmlFor="signup-email">
          Email
        </label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
          className="w-full bg-[#0a0a0f] border border-[#2a2a38] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-[#5d6169] outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/40 transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#bfc1c6] mb-1.5" htmlFor="signup-password">
          Password
        </label>
        <input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full bg-[#0a0a0f] border border-[#2a2a38] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-[#5d6169] outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/40 transition-colors"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-primary-500 hover:bg-primary-400 text-[#0a0a0f] font-semibold text-sm rounded-lg transition-colors mt-1 disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading && (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
          </svg>
        )}
        {loading ? "Creating account…" : "Create Account"}
      </button>
      <p className="text-center text-xs text-[#5d6169]">
        By signing up you agree to our{" "}
        <span className="text-primary-500 cursor-pointer hover:underline">Terms of Service</span>{" "}
        and{" "}
        <span className="text-primary-500 cursor-pointer hover:underline">Privacy Policy</span>.
      </p>
    </form>
  );
}
