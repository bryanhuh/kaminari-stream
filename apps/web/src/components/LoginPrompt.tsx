import { useState } from "react";
import AuthModal from "./AuthModal";

interface LoginPromptProps {
  icon: React.ReactNode;
  heading: string;
  body: string;
}

export default function LoginPrompt({ icon, heading, body }: LoginPromptProps) {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col items-center justify-center gap-5 py-32 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#111118] border border-[#1e1e28] flex items-center justify-center text-[#5d6169]">
          {icon}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-2">{heading}</h2>
          <p className="text-sm text-[#5d6169] max-w-xs">{body}</p>
        </div>
        <button
          onClick={() => setAuthOpen(true)}
          className="px-6 py-2.5 bg-primary-500 hover:bg-primary-400 text-[#0a0a0f] font-bold text-sm rounded-full transition-colors shadow-lg"
        >
          Sign In
        </button>
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
