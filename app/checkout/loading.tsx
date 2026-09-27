export default function CheckoutLoading() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="skeleton h-7 w-28" />
      <div className="skeleton mt-2 h-4 w-72" />

      <div className="card mt-6 p-6">
        <div className="skeleton h-5 w-32" />
        <div className="mt-3 space-y-2">
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-2/3" />
        </div>
      </div>

      <div className="card mt-6 space-y-4 p-6">
        <div className="skeleton h-5 w-36" />
        <div className="skeleton h-10 w-full rounded-xl" />
        <div className="skeleton h-20 w-full rounded-xl" />
        <div className="skeleton h-11 w-full rounded-full" />
      </div>
    </div>
  );
}
