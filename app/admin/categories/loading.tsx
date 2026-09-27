export default function AdminCategoriesLoading() {
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

      <div className="card mt-6 flex items-end gap-3 p-6">
        <div className="skeleton h-10 flex-1 rounded-xl" />
        <div className="skeleton h-10 w-20 rounded-full" />
      </div>

      <div className="card mt-6 divide-y divide-ink-100">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4">
            <div className="space-y-2">
              <div className="skeleton h-4 w-24" />
              <div className="skeleton h-3 w-32" />
            </div>
            <div className="skeleton h-8 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
