export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-line bg-cream p-5">
      <div className="flex items-center justify-between">
        <div className="skeleton h-5 w-28 rounded-full" />
        <div className="skeleton h-8 w-12 rounded-full" />
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton h-4 rounded-full" style={{ width: `${85 - i * 12}%` }} />
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 3, lines = 3 }: { count?: number; lines?: number }) {
  return (
    <div className="flex flex-col gap-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} lines={lines} />
      ))}
    </div>
  );
}
