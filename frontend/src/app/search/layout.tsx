import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Listings",
  description:
    "Browse thousands of classified ads across Nepal. Find deals on real estate, vehicles, electronics, jobs, and more on Sabthok.",
  openGraph: {
    title: "Browse Listings | Sabthok",
    description:
      "Browse thousands of classified ads across Nepal. Find deals on real estate, vehicles, electronics, jobs, and more.",
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
