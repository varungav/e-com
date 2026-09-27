export default function AdminOrdersLoading() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex gap-2">
        <div className="skeleton h-9 w-28 rounded-full" />
        <div className="skeleton h-9 w-24 rounded-full" />
        <div className="skeleton h-9 w-24 rounded-full" />
        <div className="skeleton h-9 w-24 rounded-full" />
        <div className="skeleton h-9 w-24 rounded-full" />
      </div>

      <div className="skeleton h-7 w-40" />
      <div className="skeleton mt-2 h-4 w-64" />

      <div className="card mt-6 divide-y divide-ink-100">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="space-y-2">
              <div className="skeleton h-4 w-24" />
              <div className="skeleton h-3 w-40" />
            </div>
            <div className="flex items-center gap-3">
              <div className="skeleton h-4 w-14" />
              <div className="skeleton h-5 w-16 rounded-full" />
              <div className="skeleton h-9 w-28 rounded-xl" />
              <div className="skeleton h-9 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
