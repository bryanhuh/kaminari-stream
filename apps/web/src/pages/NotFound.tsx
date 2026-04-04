import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="text-7xl font-extrabold text-primary-500 mb-2">404</h1>
      <p className="text-xl font-semibold text-white mb-1">Page not found</p>
      <p className="text-[#5d6169] text-sm mb-8 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="px-6 py-2.5 rounded-lg bg-primary-500 hover:bg-primary-400 text-black font-semibold text-sm transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
