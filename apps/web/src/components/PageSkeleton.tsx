export default function PageSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-80 bg-[#111118] w-full" />
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-6">
        <div className="h-6 w-48 rounded bg-[#111118]" />
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="aspect-[3/4] rounded-xl bg-[#111118]" />
              <div className="h-3 w-3/4 rounded bg-[#111118]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
