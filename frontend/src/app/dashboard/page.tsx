"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import type { ListingSummary, PaginatedResponse } from "@/types/listing";

type Tab = "listings" | "watchlist" | "settings";

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  pending: "Pending",
  sold: "Sold",
  hidden: "Hidden",
  rejected: "Rejected",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  sold: "bg-gray-100 text-gray-700",
  hidden: "bg-red-100 text-red-700",
  rejected: "bg-red-100 text-red-700",
};

export default function DashboardPage() {
  const { token, user, isLoading } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("listings");
  const [myListings, setMyListings] = useState<ListingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  // Settings state
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
    if (user) {
      setFullName(user.full_name || "");
    }
  }, [isLoading, user, router]);

  const fetchMyListings = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<PaginatedResponse<ListingSummary>>(
        "/listings/mine/",
        { token }
      );
      setMyListings(data.results);
    } catch {
      setError("Failed to load your listings.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (tab === "listings") {
      fetchMyListings();
    }
  }, [tab, fetchMyListings]);

  const handleDeleteListing = async (slug: string, title: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"? This action cannot be undone.`
    );
    if (!confirmed || !token) return;

    setDeletingSlug(slug);
    try {
      await apiFetch(`/listings/${slug}/delete/`, {
        method: "DELETE",
        token,
      });
      await fetchMyListings();
    } catch {
      setError("Failed to delete listing. Please try again.");
    } finally {
      setDeletingSlug(null);
    }
  };

  const handleSaveProfile = async () => {
    if (!token) return;
    setSaving(true);
    setSaveMsg("");
    try {
      await apiFetch("/auth/profile/", {
        method: "PATCH",
        body: JSON.stringify({ full_name: fullName }),
        token,
      });
      setSaveMsg("Profile updated successfully.");
    } catch {
      setSaveMsg("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center text-gray-400">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border bg-gray-50 p-1" role="tablist">
        {(["listings", "watchlist", "settings"] as Tab[]).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md py-2 text-sm font-medium capitalize ${
              tab === t ? "bg-white shadow" : "text-gray-500"
            }`}
          >
            {t === "listings" ? "My Ads" : t}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600" role="alert">
          {error}
        </div>
      )}

      {/* My Ads Tab */}
      {tab === "listings" && (
        <div role="tabpanel">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex animate-pulse items-center gap-4 rounded-lg border bg-white p-4">
                  <div className="h-16 w-16 rounded-lg bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 rounded bg-gray-200" />
                    <div className="h-3 w-32 rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : myListings.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-gray-500">You haven&apos;t posted any ads yet.</p>
              <Link
                href="/post-ad"
                className="btn-primary mt-4 inline-block"
              >
                Post Your First Ad
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myListings.map((listing) => (
                <div
                  key={listing.id}
                  className="card flex items-center gap-4 p-4"
                >
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {listing.thumbnail && (
                      <Image
                        src={listing.thumbnail}
                        alt={listing.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/listing/${listing.slug}`}
                      className="font-medium hover:text-blue-600"
                    >
                      {listing.title}
                    </Link>
                    <p className="text-sm text-gray-500">
                      Rs. {Number(listing.price).toLocaleString("en-NP")} &middot;{" "}
                      {listing.views_count} views
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[listing.status] || ""}`}
                  >
                    {STATUS_LABELS[listing.status] || listing.status}
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/listing/${listing.slug}/edit`}
                      className="btn-secondary rounded-lg px-3 py-1.5 text-xs font-medium"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteListing(listing.slug, listing.title)}
                      disabled={deletingSlug === listing.slug}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
                    >
                      {deletingSlug === listing.slug ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Watchlist Tab */}
      {tab === "watchlist" && (
        <div role="tabpanel" className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pink-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-8 w-8 text-pink-400"
            >
              <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-700">
            Watchlist Coming Soon
          </h3>
          <p className="mx-auto max-w-sm text-sm text-gray-500">
            Soon you&apos;ll be able to save your favourite listings and get
            notified when prices drop. Stay tuned!
          </p>
          <Link
            href="/search"
            className="btn-primary mt-6 inline-block"
          >
            Browse Listings
          </Link>
        </div>
      )}

      {/* Settings Tab */}
      {tab === "settings" && (
        <div role="tabpanel" className="card p-6">
          <h2 className="mb-4 text-lg font-semibold">Profile Settings</h2>

          {saveMsg && (
            <div
              className={`mb-4 rounded-lg p-3 text-sm ${
                saveMsg.includes("success")
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-600"
              }`}
              role="alert"
            >
              {saveMsg}
            </div>
          )}

          <div className="space-y-4">
            {user?.email && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-500">
                  Email
                </label>
                <p className="text-sm">{user.email}</p>
              </div>
            )}
            {user?.phone && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-500">
                  Phone
                </label>
                <p className="text-sm">{user.phone}</p>
              </div>
            )}
            <div>
              <label htmlFor="profile-name" className="mb-1 block text-sm font-medium">
                Full Name
              </label>
              <input
                id="profile-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border px-4 py-2"
                placeholder="Your name"
              />
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
