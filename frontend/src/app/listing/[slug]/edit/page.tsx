"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import type { Category, ListingDetail, Location } from "@/types/listing";

export default function EditListingPage() {
  const { slug } = useParams<{ slug: string }>();
  const { token, user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [priceType, setPriceType] = useState("fixed");
  const [condition, setCondition] = useState("used");
  const [categoryId, setCategoryId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  const fetchListing = useCallback(async () => {
    if (!token) return;
    try {
      const listing = await apiFetch<ListingDetail>(
        `/listings/${slug}/`,
        { token }
      );
      setTitle(listing.title);
      setDescription(listing.description);
      setPrice(listing.price);
      setPriceType(listing.price_type);
      setCondition(listing.condition);
      setCategoryId(listing.category.id);
      setLocationId(listing.location.id);
    } catch {
      setError("Failed to load listing.");
    } finally {
      setLoading(false);
    }
  }, [token, slug]);

  useEffect(() => {
    apiFetch<Category[]>("/categories/").then(setCategories).catch(() => {});
    apiFetch<Location[]>("/locations/").then(setLocations).catch(() => {});
    fetchListing();
  }, [fetchListing]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    setError("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("price_type", priceType);
    formData.append("condition", condition);
    formData.append("category", categoryId);
    formData.append("location", locationId);

    try {
      await apiFetch(`/listings/${slug}/edit/`, {
        method: "PATCH",
        body: formData,
        token,
      });
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch {
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return <div className="py-20 text-center text-gray-400">Loading...</div>;
  }

  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-green-600">Changes Saved!</h1>
        <p className="mt-2 text-gray-600">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Listing</h1>
        <Link href="/dashboard" className="btn-secondary text-sm">
          Cancel
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600" role="alert">
          {error}
        </div>
      )}

      <div className="card space-y-5 p-6">
        <div>
          <label htmlFor="edit-title" className="mb-1 block text-sm font-medium">
            Title
          </label>
          <input
            id="edit-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border px-4 py-3"
            maxLength={200}
          />
        </div>

        <div>
          <label htmlFor="edit-description" className="mb-1 block text-sm font-medium">
            Description
          </label>
          <textarea
            id="edit-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full rounded-lg border px-4 py-3"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="edit-price" className="mb-1 block text-sm font-medium">
              Price (Rs.)
            </label>
            <input
              id="edit-price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>
          <div>
            <label htmlFor="edit-price-type" className="mb-1 block text-sm font-medium">
              Type
            </label>
            <select
              id="edit-price-type"
              value={priceType}
              onChange={(e) => setPriceType(e.target.value)}
              className="rounded-lg border px-4 py-3"
            >
              <option value="fixed">Fixed</option>
              <option value="negotiable">Negotiable</option>
            </select>
          </div>
        </div>

        <fieldset>
          <legend className="mb-1 text-sm font-medium">Condition</legend>
          <div className="flex gap-3">
            {[
              { value: "new", label: "Brand New" },
              { value: "like_new", label: "Like New" },
              { value: "used", label: "Used" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setCondition(opt.value)}
                className={`rounded-lg border px-4 py-2 text-sm ${
                  condition === opt.value
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : ""
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="edit-category" className="mb-1 block text-sm font-medium">
            Category
          </label>
          <select
            id="edit-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-lg border px-4 py-3"
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="edit-location" className="mb-1 block text-sm font-medium">
            Location
          </label>
          <select
            id="edit-location"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            className="w-full rounded-lg border px-4 py-3"
          >
            <option value="">Select location</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <Link
            href="/dashboard"
            className="flex-1 rounded-lg border py-3 text-center font-medium"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !title.trim() || !description.trim() || !price || !categoryId || !locationId}
            className="flex-1 rounded-lg bg-blue-600 py-3 font-medium text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
