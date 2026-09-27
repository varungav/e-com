export default function AccountLoading() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="skeleton h-7 w-32" />

      <div className="card mt-6 p-6">
        <div className="skeleton h-5 w-20" />
        <div className="mt-3 space-y-2">
          <div className="skeleton h-4 w-1/2" />
          <div className="skeleton h-4 w-2/3" />
          <div className="skeleton h-4 w-1/3" />
        </div>
      </div>

      <div className="card mt-6 p-6">
        <div className="skeleton h-5 w-32" />
        <div className="mt-3 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="skeleton h-4 w-40" />
              <div className="skeleton h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
