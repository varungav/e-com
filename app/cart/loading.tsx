export default function CartLoading() {
  return (
    <div>
      <div className="skeleton h-7 w-32" />

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card flex items-center gap-4 p-4">
              <div className="skeleton h-20 w-20 flex-shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-1/3" />
                <div className="skeleton h-4 w-1/5" />
              </div>
              <div className="skeleton h-9 w-24 rounded-full" />
            </div>
          ))}
        </div>

        <div className="card h-fit p-6">
          <div className="skeleton h-5 w-32" />
          <div className="skeleton mt-4 h-4 w-full" />
          <div className="skeleton mt-6 h-11 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}
