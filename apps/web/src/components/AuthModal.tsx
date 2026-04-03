import { useEffect, useRef, useState } from "react";

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
                    ? "bg-primary-500 text-white shadow"
                    : "text-[#5d6169] hover:text-white"
                }`}
              >
                {t === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {tab === "signin" ? <SignInForm /> : <SignUpForm />}
        </div>
      </div>
    </div>
  );
}

function SignInForm() {
  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-semibold text-[#bfc1c6] mb-1.5">Email</label>
        <input
          type="email"
          placeholder="you@example.com"
          className="w-full bg-[#0a0a0f] border border-[#2a2a38] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-[#5d6169] outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/40 transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#bfc1c6] mb-1.5">Password</label>
        <input
          type="password"
          placeholder="••••••••"
          className="w-full bg-[#0a0a0f] border border-[#2a2a38] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-[#5d6169] outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/40 transition-colors"
        />
      </div>
      <div className="flex items-center justify-between text-xs">
        <label className="flex items-center gap-2 text-[#bfc1c6] cursor-pointer">
          <input type="checkbox" className="accent-primary-500" />
          Remember me
        </label>
        <button type="button" className="text-primary-500 hover:text-primary-400 transition-colors">
          Forgot password?
        </button>
      </div>
      <button
        type="submit"
        className="w-full py-2.5 bg-primary-500 hover:bg-primary-400 text-white font-semibold text-sm rounded-lg transition-colors mt-1"
      >
        Sign In
      </button>
      <p className="text-center text-xs text-[#5d6169]">
        By signing in you agree to our{" "}
        <span className="text-primary-500 cursor-pointer hover:underline">Terms of Service</span>.
      </p>
    </form>
  );
}

function SignUpForm() {
  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-semibold text-[#bfc1c6] mb-1.5">Username</label>
        <input
          type="text"
          placeholder="otaku_legend"
          className="w-full bg-[#0a0a0f] border border-[#2a2a38] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-[#5d6169] outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/40 transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#bfc1c6] mb-1.5">Email</label>
        <input
          type="email"
          placeholder="you@example.com"
          className="w-full bg-[#0a0a0f] border border-[#2a2a38] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-[#5d6169] outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/40 transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#bfc1c6] mb-1.5">Password</label>
        <input
          type="password"
          placeholder="••••••••"
          className="w-full bg-[#0a0a0f] border border-[#2a2a38] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-[#5d6169] outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/40 transition-colors"
        />
      </div>
      <button
        type="submit"
        className="w-full py-2.5 bg-primary-500 hover:bg-primary-400 text-white font-semibold text-sm rounded-lg transition-colors mt-1"
      >
        Create Account
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
