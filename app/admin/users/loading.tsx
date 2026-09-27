export default function AdminUsersLoading() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex gap-2">
        <div className="skeleton h-9 w-28 rounded-full" />
        <div className="skeleton h-9 w-24 rounded-full" />
        <div className="skeleton h-9 w-24 rounded-full" />
        <div className="skeleton h-9 w-24 rounded-full" />
        <div className="skeleton h-9 w-24 rounded-full" />
      </div>

      <div className="skeleton h-7 w-48" />
      <div className="skeleton mt-2 h-4 w-72" />

      <div className="card mt-6 space-y-4 p-6">
        <div className="skeleton h-5 w-48" />
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <div className="skeleton h-10 rounded-xl" />
          <div className="skeleton h-10 w-28 rounded-xl" />
        </div>
        <div className="skeleton h-10 w-32 rounded-full" />
      </div>

      <div className="card mt-6 divide-y divide-ink-100 p-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-3">
            <div className="space-y-2">
              <div className="skeleton h-4 w-32" />
              <div className="skeleton h-3 w-40" />
            </div>
            <div className="skeleton h-8 w-24 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
