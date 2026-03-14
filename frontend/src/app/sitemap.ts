import type { MetadataRoute } from "next";

import type { ListingSummary, PaginatedResponse } from "@/types/listing";

const CATEGORIES = [
  "real-estate",
  "mobile-phones-accessories",
  "automobiles",
  "computers-peripherals",
  "electronics-tvs-more",
  "furnishings-appliances",
  "apparels-accessories",
  "business-industrial",
  "jobs",
  "services",
  "sports-fitness",
  "beauty-health",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sabthok.com.np";
  const apiBase = process.env.INTERNAL_API_URL || "http://backend:8000/api";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/safety-tips`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((slug) => ({
    url: `${baseUrl}/search?category_slug=${slug}`,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const listingPages: MetadataRoute.Sitemap = [];

  try {
    let page = 1;
    let hasMore = true;

    while (hasMore && page <= 50) {
      const res = await fetch(
        `${apiBase}/listings/?page=${page}&page_size=100`,
        { next: { revalidate: 3600 } }
      );
      if (!res.ok) break;

      const data: PaginatedResponse<ListingSummary> = await res.json();

      for (const listing of data.results) {
        listingPages.push({
          url: `${baseUrl}/listing/${listing.slug}`,
          lastModified: new Date(listing.created_at),
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }

      hasMore = !!data.next;
      page++;
    }
  } catch {
    // Return whatever we have so far
  }

  return [...staticPages, ...categoryPages, ...listingPages];
}
