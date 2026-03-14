"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

import { apiFetch } from "@/lib/api";
import type {
  Category,
  ListingSummary,
  Location,
  PaginatedResponse,
} from "@/types/listing";

function useDebounce<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);
  return debounced;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-NP");
}

function SearchContent() {
  const searchParams = useSearchParams();

  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [prevUrl, setPrevUrl] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [categorySlug, setCategorySlug] = useState(
    searchParams.get("category_slug") || ""
  );
  const [minPrice, setMinPrice] = useState(
    searchParams.get("min_price") || ""
  );
  const [maxPrice, setMaxPrice] = useState(
    searchParams.get("max_price") || ""
  );
  const [condition, setCondition] = useState(
    searchParams.get("condition") || ""
  );

  const debouncedQuery = useDebounce(query, 400);

  const fetchListings = useCallback(
    async (pageNum = 1) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (debouncedQuery) params.set("q", debouncedQuery);
      if (categorySlug) params.set("category_slug", categorySlug);
      if (minPrice) params.set("min_price", minPrice);
      if (maxPrice) params.set("max_price", maxPrice);
      if (condition) params.set("condition", condition);
      if (pageNum > 1) params.set("page", String(pageNum));

      try {
        const data = await apiFetch<PaginatedResponse<ListingSummary>>(
          `/listings/?${params.toString()}`,
          { signal: controller.signal }
        );
        setListings(data.results);
        setTotalCount(data.count);
        setNextUrl(data.next);
        setPrevUrl(data.previous);
        setPage(pageNum);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError("Failed to load listings. Please try again.");
          setListings([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [debouncedQuery, categorySlug, minPrice, maxPrice, condition]
  );

  useEffect(() => {
    fetchListings(1);
  }, [fetchListings]);

  useEffect(() => {
    apiFetch<Category[]>("/categories/").then(setCategories).catch(() => {});
    apiFetch<Location[]>("/locations/").then(setLocations).catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="section-title">Browse Listings</h1>
          <p className="mt-1 text-sm text-gray-500">
            {totalCount} result{totalCount !== 1 && "s"} found
          </p>
        </div>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="btn-secondary lg:hidden"
        >
          <svg
            className="mr-1.5 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
            />
          </svg>
          Filters
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Sidebar Filters */}
        <aside
          className={`space-y-5 lg:col-span-1 ${
            filtersOpen ? "block" : "hidden lg:block"
          }`}
          role="search"
          aria-label="Listing filters"
        >
          <div className="card p-5">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="search-input"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500"
                >
                  Search
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
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
                    id="search-input"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Keywords..."
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="category-select"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500"
                >
                  Category
                </label>
                <select
                  id="category-select"
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value)}
                  className="input-field"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Price Range (Rs.)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min"
                    min="0"
                    aria-label="Minimum price"
                    className="input-field"
                  />
                  <span className="flex items-center text-gray-400">-</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max"
                    min="0"
                    aria-label="Maximum price"
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="condition-select"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500"
                >
                  Condition
                </label>
                <select
                  id="condition-select"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="input-field"
                >
                  <option value="">Any Condition</option>
                  <option value="new">Brand New</option>
                  <option value="like_new">Like New</option>
                  <option value="used">Used</option>
                </select>
              </div>

              <button
                onClick={() => fetchListings(1)}
                className="btn-primary w-full"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="lg:col-span-3">
          {error && (
            <div
              className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600"
              role="alert"
            >
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card animate-pulse overflow-hidden">
                  <div className="aspect-[4/3] bg-gray-200" />
                  <div className="p-4">
                    <div className="h-5 w-24 rounded-lg bg-gray-200" />
                    <div className="mt-2 h-4 w-full rounded-lg bg-gray-200" />
                    <div className="mt-2 h-3 w-20 rounded-lg bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="card py-20 text-center">
              <svg
                className="mx-auto h-16 w-16 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
              <p className="mt-4 text-lg font-medium text-gray-500">
                No listings found
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Try adjusting your filters or search terms
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
                          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
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
                      {listing.is_featured && (
                        <span className="badge-featured absolute left-2 top-2 shadow-sm">
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-lg font-bold text-brand-600">
                        Rs. {Number(listing.price).toLocaleString("en-NP")}
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

              {/* Pagination */}
              {(prevUrl || nextUrl) && (
                <div className="mt-8 flex items-center justify-center gap-3">
                  <button
                    onClick={() => fetchListings(page - 1)}
                    disabled={!prevUrl}
                    className="btn-secondary disabled:opacity-30"
                  >
                    <svg
                      className="mr-1 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 19.5 8.25 12l7.5-7.5"
                      />
                    </svg>
                    Previous
                  </button>
                  <span className="rounded-lg bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
                    Page {page}
                  </span>
                  <button
                    onClick={() => fetchListings(page + 1)}
                    disabled={!nextUrl}
                    className="btn-secondary disabled:opacity-30"
                  >
                    Next
                    <svg
                      className="ml-1 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m8.25 4.5 7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 w-40 rounded-lg bg-gray-200" />
            <div className="mt-2 h-4 w-24 rounded-lg bg-gray-200" />
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card overflow-hidden">
                  <div className="aspect-[4/3] bg-gray-200" />
                  <div className="p-4">
                    <div className="h-5 w-24 rounded-lg bg-gray-200" />
                    <div className="mt-2 h-4 rounded-lg bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
