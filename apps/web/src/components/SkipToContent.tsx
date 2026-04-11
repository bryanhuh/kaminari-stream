export default function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary-500 focus:text-[#0a0a0f] focus:font-bold focus:text-sm focus:shadow-lg"
    >
      Skip to main content
    </a>
  );
}
