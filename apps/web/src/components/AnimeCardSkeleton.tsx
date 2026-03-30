export default function AnimeCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 animate-pulse">
      <div className="aspect-[3/4] rounded-lg bg-gray-800" />
      <div className="flex flex-col gap-1.5">
        <div className="h-3.5 w-3/4 rounded bg-gray-800" />
        <div className="h-3 w-1/2 rounded bg-gray-800" />
      </div>
    </div>
  );
}
