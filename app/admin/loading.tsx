export default function AdminLoading() {
  return (
    <div>
      <div className="skeleton h-7 w-48" />
      <div className="skeleton mt-2 h-4 w-64" />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card p-6">
            <div className="skeleton h-4 w-20" />
            <div className="skeleton mt-2 h-8 w-12" />
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="card p-6">
            <div className="skeleton h-5 w-24" />
            <div className="skeleton mt-2 h-4 w-40" />
          </div>
        ))}
      </div>
    </div>
  );
}
