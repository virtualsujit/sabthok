import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ImageGallery } from "@/components/listing/image-gallery";
import { SellerCard } from "@/components/listing/seller-card";
import { apiFetch } from "@/lib/api";
import type { ListingDetail, ListingSummary } from "@/types/listing";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getListing(slug: string): Promise<ListingDetail | null> {
  try {
    return await apiFetch<ListingDetail>(
      `/listings/${slug}/`,
      { next: { revalidate: 3600 } },
      true
    );
  } catch {
    return null;
  }
}

function truncateAtSentence(text: string, max: number): string {
  if (text.length <= max) return text;
  const truncated = text.slice(0, max);
  const lastPeriod = truncated.lastIndexOf(".");
  return lastPeriod > max / 2
    ? truncated.slice(0, lastPeriod + 1)
    : truncated + "...";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing) return { title: "Listing Not Found" };

  const description = truncateAtSentence(listing.description, 160);

  return {
    title: listing.title,
    description,
    alternates: { canonical: `/listing/${listing.slug}` },
    openGraph: {
      title: listing.title,
      description,
      type: "article",
      images: listing.images[0]?.image ? [listing.images[0].image] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: listing.title,
      description,
    },
  };
}

function formatPrice(price: string, priceType: string): string {
  const formatted = Number(price).toLocaleString("en-NP");
  return priceType === "negotiable"
    ? `Rs. ${formatted}`
    : `Rs. ${formatted}`;
}

function conditionLabel(condition: string): string {
  const map: Record<string, string> = {
    new: "Brand New",
    like_new: "Like New",
    used: "Used",
  };
  return map[condition] || condition;
}

function conditionColor(condition: string): string {
  const map: Record<string, string> = {
    new: "bg-green-100 text-green-700",
    like_new: "bg-blue-100 text-blue-700",
    used: "bg-gray-100 text-gray-700",
  };
  return map[condition] || "bg-gray-100 text-gray-700";
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString("en-NP");
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, "");
}

function ProductJsonLd({ listing }: { listing: ListingDetail }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description.slice(0, 500),
    image: listing.images.map((img) => img.image),
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: "NPR",
      availability:
        listing.status === "active"
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
      itemCondition:
        listing.condition === "new"
          ? "https://schema.org/NewCondition"
          : "https://schema.org/UsedCondition",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function BreadcrumbJsonLd({
  breadcrumbs,
}: {
  breadcrumbs: { name: string; slug: string }[];
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "/" },
      ...breadcrumbs.map((b, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: b.name,
        item: `/search?category_slug=${b.slug}`,
      })),
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function ListingPage({ params }: Props) {
  const { slug } = await params;
  const listing = await getListing(slug);

  if (!listing) notFound();

  const safeDescription = stripHtml(listing.description);

  return (
    <>
      <ProductJsonLd listing={listing} />
      <BreadcrumbJsonLd breadcrumbs={listing.breadcrumbs} />

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="mb-5 flex items-center gap-1.5 text-sm text-gray-500"
        >
          <Link href="/" className="transition-colors hover:text-brand-600">
            Home
          </Link>
          {listing.breadcrumbs.map((crumb) => (
            <span key={crumb.slug} className="flex items-center gap-1.5">
              <svg
                className="h-3.5 w-3.5 text-gray-400"
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
              <Link
                href={`/search?category_slug=${crumb.slug}`}
                className="transition-colors hover:text-brand-600"
              >
                {crumb.name}
              </Link>
            </span>
          ))}
        </nav>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Image Gallery */}
          <div className="lg:col-span-2">
            <ImageGallery images={listing.images} title={listing.title} />

            {/* Description */}
            <div className="card mt-5 p-6">
              <h2 className="mb-3 text-lg font-bold text-gray-900">
                Description
              </h2>
              <p className="whitespace-pre-line leading-relaxed text-gray-600">
                {safeDescription}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Price & Info Card */}
            <div className="card p-6">
              <p className="text-3xl font-extrabold text-brand-600">
                {formatPrice(listing.price, listing.price_type)}
              </p>
              {listing.price_type === "negotiable" && (
                <span className="badge-negotiable mt-2">Negotiable</span>
              )}
              <h1 className="mt-3 text-xl font-bold text-gray-900">
                {listing.title}
              </h1>

              <div className="mt-4 flex flex-wrap gap-2">
                <span
                  className={`badge ${conditionColor(listing.condition)}`}
                >
                  {conditionLabel(listing.condition)}
                </span>
              </div>

              <div className="mt-5 space-y-3 border-t pt-4">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <svg
                    className="h-[18px] w-[18px] shrink-0 text-gray-400"
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
                  <span>{listing.location.name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <svg
                    className="h-[18px] w-[18px] shrink-0 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                  <span>{listing.views_count} views</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <svg
                    className="h-[18px] w-[18px] shrink-0 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                  <span>Posted {timeAgo(listing.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Seller Card */}
            <SellerCard
              sellerName={listing.seller_name}
              sellerId={listing.seller_id}
              sellerPhone={listing.seller_phone}
              sellerEmail={listing.seller_email}
              sellerIsVerified={listing.seller_is_verified}
            />

            {/* Safety Tips */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-amber-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                  />
                </svg>
                <h3 className="text-sm font-bold text-amber-800">
                  Safety Tips
                </h3>
              </div>
              <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-amber-700">
                <li className="flex items-start gap-1.5">
                  <span className="mt-1 block h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                  Meet in a safe, public location
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="mt-1 block h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                  Check the item before you pay
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="mt-1 block h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                  Never send money in advance
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Similar Listings */}
        {listing.similar_listings && listing.similar_listings.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-5 text-xl font-bold text-gray-900">
              Similar Listings
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {listing.similar_listings.map((item: ListingSummary) => (
                <Link
                  key={item.id}
                  href={`/listing/${item.slug}`}
                  className="card-hover group overflow-hidden"
                >
                  <div className="relative aspect-[4/3] bg-gray-100">
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <svg
                          className="h-10 w-10 text-gray-300"
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
                    {item.price_type === "negotiable" && (
                      <span className="absolute left-2 top-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                        Negotiable
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-bold text-brand-600">
                      Rs. {Number(item.price).toLocaleString("en-NP")}
                    </p>
                    <h3 className="mt-0.5 truncate text-sm font-medium text-gray-900">
                      {item.title}
                    </h3>
                    <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-500">
                      <svg
                        className="h-3 w-3"
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
                      {item.location.name}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
