export default function HomeLoading() {
  return (
    <div>
      <div className="skeleton -mx-4 -mt-10 mb-20 h-72 rounded-b-3xl sm:-mx-6" />

      <div className="mb-6 flex items-end justify-between">
        <div className="space-y-2">
          <div className="skeleton h-5 w-40" />
          <div className="skeleton h-4 w-24" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
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
