export default function LoadingSkeleton() {
  return (
    <div className="space-y-5 animate-fade-in">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-surface rounded-card border border-border p-6 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg shimmer-bg" />
            <div className="h-5 w-36 rounded-md shimmer-bg" />
          </div>
          <div className="space-y-2.5">
            <div className="h-4 w-full rounded shimmer-bg" />
            <div className="h-4 w-5/6 rounded shimmer-bg" />
            <div className="h-4 w-4/6 rounded shimmer-bg" />
          </div>
          {i % 2 === 0 && (
            <div className="mt-4 flex gap-2">
              <div className="h-7 w-20 rounded-full shimmer-bg" />
              <div className="h-7 w-24 rounded-full shimmer-bg" />
              <div className="h-7 w-16 rounded-full shimmer-bg" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
