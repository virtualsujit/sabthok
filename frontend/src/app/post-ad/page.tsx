"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import type { Category, Location } from "@/types/listing";

type Step = 1 | 2 | 3;

interface ImagePreview {
  file: File;
  url: string;
}

export default function PostAdPage() {
  const { token, user, isLoading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [priceType, setPriceType] = useState("fixed");
  const [condition, setCondition] = useState("used");
  const [categoryId, setCategoryId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [images, setImages] = useState<ImagePreview[]>([]);

  useEffect(() => {
    apiFetch<Category[]>("/categories/").then(setCategories).catch(() => {});
    apiFetch<Location[]>("/locations/").then(setLocations).catch(() => {});
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  const handleImageDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      );
      addImages(files);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [images.length]
  );

  const addImages = (files: File[]) => {
    const remaining = 10 - images.length;
    if (remaining <= 0) return;

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const validFiles: File[] = [];
    const rejected: string[] = [];

    for (const file of files.slice(0, remaining)) {
      if (file.size > MAX_SIZE) {
        rejected.push(`${file.name} exceeds 5MB`);
      } else if (!file.type.startsWith("image/")) {
        rejected.push(`${file.name} is not an image`);
      } else {
        validFiles.push(file);
      }
    }

    if (rejected.length > 0) {
      setError(rejected.join(", "));
    }

    const newPreviews = validFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async () => {
    if (!token) {
      setError("Please log in to post an ad.");
      return;
    }

    setSubmitting(true);
    setError("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("price_type", priceType);
    formData.append("condition", condition);
    formData.append("category", categoryId);
    formData.append("location", locationId);
    images.forEach((img) => formData.append("images", img.file));

    try {
      await apiFetch("/listings/create/", {
        method: "POST",
        body: formData,
        token,
      });
      setSuccess(true);
    } catch {
      setError("Failed to post ad. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center text-gray-400">Loading...</div>;
  }

  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-green-600">Ad Submitted!</h1>
        <p className="mt-2 text-gray-600">
          Your ad is under review and will be published shortly.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 text-white"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Post an Ad</h1>

      {/* Step Indicator */}
      <div
        className="mb-8 flex gap-2"
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={3}
        aria-label={`Step ${step} of 3`}
      >
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full ${
              s <= step ? "bg-blue-600" : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600" role="alert">
          {error}
        </div>
      )}

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label htmlFor="ad-title" className="mb-1 block text-sm font-medium">
              Title
            </label>
            <input
              id="ad-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What are you selling?"
              className="w-full rounded-lg border px-4 py-3"
              maxLength={200}
              minLength={3}
              required
            />
          </div>
          <div>
            <label htmlFor="ad-category" className="mb-1 block text-sm font-medium">
              Category
            </label>
            <select
              id="ad-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border px-4 py-3"
              required
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
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
                  role="radio"
                  aria-checked={condition === opt.value}
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
          <button
            onClick={() => setStep(2)}
            disabled={!title.trim() || title.trim().length < 3 || !categoryId}
            className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white disabled:opacity-50"
          >
            Next: Details & Price
          </button>
        </div>
      )}

      {/* Step 2: Details & Price */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label htmlFor="ad-description" className="mb-1 block text-sm font-medium">
              Description
            </label>
            <textarea
              id="ad-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Describe your item in detail..."
              className="w-full rounded-lg border px-4 py-3"
              minLength={10}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="ad-price" className="mb-1 block text-sm font-medium">
                Price (Rs.)
              </label>
              <input
                id="ad-price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full rounded-lg border px-4 py-3"
              />
            </div>
            <div>
              <label htmlFor="ad-price-type" className="mb-1 block text-sm font-medium">
                Type
              </label>
              <select
                id="ad-price-type"
                value={priceType}
                onChange={(e) => setPriceType(e.target.value)}
                className="rounded-lg border px-4 py-3"
              >
                <option value="fixed">Fixed</option>
                <option value="negotiable">Negotiable</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="ad-location" className="mb-1 block text-sm font-medium">
              Location
            </label>
            <select
              id="ad-location"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full rounded-lg border px-4 py-3"
              required
            >
              <option value="">Select location</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 rounded-lg border py-3 font-medium"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={
                !description.trim() ||
                description.trim().length < 10 ||
                !price ||
                Number(price) < 0 ||
                !locationId
              }
              className="flex-1 rounded-lg bg-blue-600 py-3 font-medium text-white disabled:opacity-50"
            >
              Next: Photos
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Photos & Submit */}
      {step === 3 && (
        <div className="space-y-4">
          <div
            onDrop={handleImageDrop}
            onDragOver={(e) => e.preventDefault()}
            className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center"
          >
            <p className="text-gray-500">
              Drag & drop images here, or{" "}
              <label className="cursor-pointer text-blue-600 underline">
                browse
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files && addImages(Array.from(e.target.files))
                  }
                />
              </label>
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Max 10 images, 5MB each ({images.length}/10 added)
            </p>
          </div>

          {images.length > 0 && (
            <div className="flex flex-wrap gap-3" role="list" aria-label="Uploaded images">
              {images.map((img, i) => (
                <div
                  key={i}
                  role="listitem"
                  className="group relative h-24 w-24 rounded-lg border"
                >
                  <Image
                    src={img.url}
                    alt={`Upload ${i + 1}`}
                    fill
                    className="rounded-lg object-cover"
                    sizes="96px"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    aria-label={`Remove image ${i + 1}`}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow focus:opacity-100 group-hover:opacity-100 sm:opacity-0"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex-1 rounded-lg border py-3 font-medium"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 rounded-lg bg-green-600 py-3 font-medium text-white disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Post Ad"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
