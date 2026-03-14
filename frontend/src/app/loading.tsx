export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="animate-pulse">
        <div className="mb-10 rounded-3xl bg-gray-200 p-8">
          <div className="mx-auto h-10 w-64 rounded-xl bg-gray-300" />
          <div className="mx-auto mt-4 h-5 w-80 rounded-lg bg-gray-300" />
          <div className="mx-auto mt-6 h-14 max-w-2xl rounded-2xl bg-gray-300" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="aspect-[4/3] bg-gray-200" />
              <div className="p-4">
                <div className="h-5 w-24 rounded-lg bg-gray-200" />
                <div className="mt-2 h-4 w-full rounded-lg bg-gray-200" />
                <div className="mt-2 h-3 w-20 rounded-lg bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
