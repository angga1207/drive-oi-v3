export default function SharedItemsSkeleton() {
  const rows = [
    { isFolder: true, nameWidth: 'w-40', metaWidth: 'w-20' },
    { isFolder: true, nameWidth: 'w-52', metaWidth: 'w-24' },
    { isFolder: false, nameWidth: 'w-48', metaWidth: 'w-28' },
    { isFolder: false, nameWidth: 'w-36', metaWidth: 'w-20' },
    { isFolder: false, nameWidth: 'w-44', metaWidth: 'w-24' },
    { isFolder: false, nameWidth: 'w-56', metaWidth: 'w-16' },
    { isFolder: false, nameWidth: 'w-40', metaWidth: 'w-20' },
  ];

  return (
    <div className="space-y-3">
      {/* Search bar skeleton */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 max-w-md h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>

      {/* Item rows */}
      {rows.map((row, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border-2 border-accent/10 h-20"
        >
          {/* Icon skeleton */}
          <div
            className={`w-12 h-12 rounded-xl animate-pulse shrink-0 ${
              row.isFolder ? 'bg-primary/20 dark:bg-primary/30' : 'bg-accent/30 dark:bg-accent/20'
            }`}
          />

          {/* Text skeleton */}
          <div className="flex-1 min-w-0 space-y-2">
            <div
              className={`h-4 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse ${row.nameWidth}`}
              style={{ animationDelay: `${i * 60}ms` }}
            />
            <div
              className={`h-3 bg-gray-100 dark:bg-gray-600 rounded-md animate-pulse ${row.metaWidth}`}
              style={{ animationDelay: `${i * 60 + 30}ms` }}
            />
          </div>

          {/* Action buttons skeleton */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
              style={{ animationDelay: `${i * 60 + 10}ms` }}
            />
            <div
              className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
              style={{ animationDelay: `${i * 60 + 20}ms` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
