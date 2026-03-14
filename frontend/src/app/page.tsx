import Image from "next/image";
import Link from "next/link";

import { apiFetch } from "@/lib/api";
import { formatPrice, timeAgo } from "@/lib/format";
import type { ListingSummary, PaginatedResponse } from "@/types/listing";

// Revalidate every 5 minutes — classifieds don't need sub-minute freshness
export const revalidate = 300;

const CATEGORIES = [
  { name: "Real Estate", slug: "real-estate", icon: "🏠" },
  { name: "Mobile Phones & Accessories", slug: "mobile-phones-accessories", icon: "📱" },
  { name: "Automobiles", slug: "automobiles", icon: "🚗" },
  { name: "Computers & Peripherals", slug: "computers-peripherals", icon: "💻" },
  { name: "Electronics, TVs & More", slug: "electronics-tvs-more", icon: "📺" },
  { name: "Furnishings & Appliances", slug: "furnishings-appliances", icon: "🛋️" },
  { name: "Apparels & Accessories", slug: "apparels-accessories", icon: "👕" },
  { name: "Business & Industrial", slug: "business-industrial", icon: "🏭" },
  { name: "Jobs", slug: "jobs", icon: "💼" },
  { name: "Services", slug: "services", icon: "🔨" },
  { name: "Sports & Fitness", slug: "sports-fitness", icon: "⚽" },
  { name: "Beauty & Health", slug: "beauty-health", icon: "💆" },
];

async function getRecentListings(): Promise<ListingSummary[]> {
  try {
    const data = await apiFetch<PaginatedResponse<ListingSummary>>(
      "/listings/?page_size=12",
      { next: { revalidate: 30 } },
      true
    );
    return data.results;
  } catch {
    return [];
  }
}

const CATEGORY_COLORS: Record<string, string> = {
  "real-estate": "from-emerald-500 to-teal-600",
  "mobile-phones-accessories": "from-blue-500 to-indigo-600",
  automobiles: "from-red-500 to-rose-600",
  "computers-peripherals": "from-slate-500 to-gray-700",
  "electronics-tvs-more": "from-cyan-500 to-blue-600",
  "furnishings-appliances": "from-amber-500 to-orange-600",
  "apparels-accessories": "from-pink-500 to-fuchsia-600",
  "business-industrial": "from-stone-500 to-stone-700",
  jobs: "from-violet-500 to-purple-600",
  services: "from-sky-500 to-cyan-600",
  "sports-fitness": "from-lime-500 to-green-600",
  "beauty-health": "from-rose-400 to-pink-600",
};

export default async function HomePage() {
  const listings = await getRecentListings();

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900">
        {/* Decorative shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/5" />
          <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-white/5" />
          <div className="absolute right-1/4 top-1/3 h-40 w-40 rounded-full bg-white/5" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-16 text-center sm:pb-20 sm:pt-28">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Buy & Sell{" "}
            <span className="relative">
              <span className="relative z-10">Anything</span>
              <span className="absolute bottom-1 left-0 z-0 h-3 w-full bg-accent-500/40 sm:h-4" />
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100 sm:text-xl">
            Nepal&apos;s commission-free classifieds marketplace
          </p>

          {/* Search Bar */}
          <form
            action="/search"
            className="mx-auto mt-8 flex max-w-2xl gap-2 rounded-2xl bg-white p-2 shadow-xl sm:mt-10"
          >
            <div className="flex flex-1 items-center gap-2 rounded-xl px-4">
              <svg
                className="h-5 w-5 shrink-0 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
              <input
                name="q"
                type="text"
                placeholder="What are you looking for?"
                className="w-full bg-transparent py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="btn-primary rounded-xl px-6 py-3 text-base shadow-md"
            >
              Search
            </button>
          </form>

          {/* Quick stats */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-blue-200 sm:gap-10">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <span>100% Free</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
              <span>Zero Commission</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              <span>Local Deals</span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4">
        {/* Category Grid */}
        <section className="-mt-8 relative z-10 mb-12 sm:-mt-10">
          <div className="grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-4">
            {CATEGORIES.map((cat) => {
              const gradient =
                CATEGORY_COLORS[cat.slug] || "from-gray-500 to-gray-600";
              return (
                <Link
                  key={cat.slug}
                  href={`/search?category_slug=${cat.slug}`}
                  className="card-hover group flex flex-col items-center gap-1.5 px-2 py-3 text-center sm:gap-2 sm:px-5 sm:py-5"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-lg text-white shadow-sm transition-transform group-hover:scale-110 sm:h-14 sm:w-14 sm:text-2xl`}
                  >
                    {cat.icon || "📦"}
                  </div>
                  <span className="text-[11px] font-semibold leading-tight text-gray-900 sm:text-sm">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Recently Added */}
        <section className="mb-16">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="section-title">Recently Added</h2>
              <p className="mt-1 text-sm text-gray-500">
                Fresh listings from across Nepal
              </p>
            </div>
            <Link
              href="/search"
              className="btn-secondary hidden sm:inline-flex"
            >
              View all
              <svg
                className="ml-1.5 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                href={`/listing/${listing.slug}`}
                className="card-hover group overflow-hidden"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  {listing.thumbnail ? (
                    <Image
                      src={listing.thumbnail}
                      alt={listing.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-300">
                      <svg
                        className="h-12 w-12"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Badges overlay */}
                  <div className="absolute left-2 top-2 flex flex-col gap-1">
                    {listing.is_featured && (
                      <span className="badge-featured shadow-sm">
                        <svg
                          className="mr-1 h-3 w-3"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Featured
                      </span>
                    )}
                    {listing.price_type === "negotiable" && (
                      <span className="badge-negotiable shadow-sm">
                        Negotiable
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-lg font-bold text-brand-600">
                    {formatPrice(listing.price)}
                  </p>
                  <h3 className="mt-1 truncate text-sm font-semibold text-gray-900">
                    {listing.title}
                  </h3>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                        />
                      </svg>
                      {listing.location.name}
                    </span>
                    <span>{timeAgo(listing.created_at)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile View All */}
          <div className="mt-6 text-center sm:hidden">
            <Link href="/search" className="btn-secondary">
              View all listings
              <svg
                className="ml-1.5 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="mb-16">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-accent-500 to-accent-600 p-8 text-center text-white shadow-lg sm:p-12">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Got something to sell?
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-orange-100">
              Post your ad for free and reach thousands of buyers across Nepal.
              No fees, no commissions.
            </p>
            <Link
              href="/post-ad"
              className="mt-6 inline-flex items-center rounded-xl bg-white px-6 py-3 font-semibold text-accent-600 shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <svg
                className="mr-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Post Your Free Ad
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
