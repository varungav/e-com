export default function ShopLoading() {
  return (
    <div>
      <div className="mb-8">
        <div className="skeleton h-7 w-24" />
        <div className="skeleton mt-2 h-4 w-56" />
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="skeleton h-6 w-32" />
        <div className="flex gap-2">
          <div className="skeleton h-8 w-16 rounded-full" />
          <div className="skeleton h-8 w-24 rounded-full" />
          <div className="skeleton h-8 w-20 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card overflow-hidden">
            <div className="skeleton aspect-square w-full rounded-none" />
            <div className="space-y-2 p-4">
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
