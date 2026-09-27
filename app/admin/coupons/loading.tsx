export default function AdminCouponsLoading() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex gap-2">
        <div className="skeleton h-9 w-28 rounded-full" />
        <div className="skeleton h-9 w-24 rounded-full" />
        <div className="skeleton h-9 w-24 rounded-full" />
        <div className="skeleton h-9 w-24 rounded-full" />
        <div className="skeleton h-9 w-24 rounded-full" />
      </div>

      <div className="skeleton h-7 w-48" />
      <div className="skeleton mt-2 h-4 w-56" />

      <div className="card mt-6 grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="skeleton h-3 w-24" />
            <div className="skeleton h-10 rounded-xl" />
          </div>
        ))}
        <div className="skeleton h-10 w-32 rounded-full sm:col-span-2" />
      </div>

      <div className="card mt-6 divide-y divide-ink-100">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              <div className="skeleton h-9 w-9 rounded-full" />
              <div className="space-y-2">
                <div className="skeleton h-4 w-32" />
                <div className="skeleton h-3 w-48" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="skeleton h-8 w-20 rounded-full" />
              <div className="skeleton h-8 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
