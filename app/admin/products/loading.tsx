export default function AdminProductsLoading() {
  return (
    <div>
      <div className="mb-6 flex gap-2">
        <div className="skeleton h-9 w-28 rounded-full" />
        <div className="skeleton h-9 w-24 rounded-full" />
        <div className="skeleton h-9 w-24 rounded-full" />
        <div className="skeleton h-9 w-24 rounded-full" />
        <div className="skeleton h-9 w-24 rounded-full" />
      </div>

      <div className="flex items-center justify-between">
        <div className="skeleton h-7 w-40" />
        <div className="skeleton h-10 w-32 rounded-full" />
      </div>

      <div className="card mt-6 divide-y divide-ink-100">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4">
            <div className="skeleton h-4 w-32" />
            <div className="skeleton h-4 w-16" />
            <div className="skeleton h-4 w-10" />
            <div className="skeleton h-5 w-16 rounded-full" />
            <div className="flex gap-2">
              <div className="skeleton h-8 w-14 rounded-full" />
              <div className="skeleton h-8 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
