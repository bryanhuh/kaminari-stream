export default function AnimeCardSkeleton() {
  return (
    <div className="flex flex-col gap-2.5 animate-pulse">
      <div className="aspect-[3/4] rounded-xl bg-[#111118]" />
      <div className="flex flex-col gap-1.5 px-0.5">
        <div className="h-3.5 w-3/4 rounded bg-[#111118]" />
        <div className="h-3 w-1/2 rounded bg-[#111118]" />
      </div>
    </div>
  );
}
