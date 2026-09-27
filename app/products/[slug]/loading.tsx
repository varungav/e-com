export default function ProductLoading() {
  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
      <div className="skeleton aspect-square w-full rounded-2xl" />

      <div>
        <div className="skeleton h-8 w-3/4" />
        <div className="skeleton mt-4 h-7 w-24" />
        <div className="mt-6 space-y-2">
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-2/3" />
        </div>
        <div className="skeleton mt-6 h-6 w-28 rounded-full" />
        <div className="skeleton mt-8 h-11 w-40 rounded-full" />
      </div>
    </div>
  );
}
