"use client";

import Link from "next/link";
import { useState } from "react";

interface Props {
  sellerName: string;
  sellerId: string;
  sellerPhone: string | null;
  sellerEmail?: string | null;
  sellerIsVerified?: boolean;
}

export function SellerCard({ sellerName, sellerId, sellerPhone, sellerEmail, sellerIsVerified }: Props) {
  const [showPhone, setShowPhone] = useState(false);

  const initial = (sellerName || "A").charAt(0).toUpperCase();
  const hasContact = sellerPhone || sellerEmail;

  return (
    <div className="card p-6">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
        Seller
      </h3>
      <Link
        href={`/seller/${sellerId}`}
        className="flex items-center gap-3 group"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600">
          {initial}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
              {sellerName || "Anonymous"}
            </p>
            {sellerIsVerified && (
              <svg
                className="h-4 w-4 text-blue-600"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-label="Verified Seller"
              >
                <path
                  fillRule="evenodd"
                  d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          <p className="text-xs text-brand-500">View profile</p>
        </div>
      </Link>
      <div className="mt-4 space-y-2">
        {/* Chat — WhatsApp if phone, email fallback */}
        {sellerPhone ? (
          <a
            href={`https://wa.me/${sellerPhone.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-semibold text-white transition-all hover:bg-green-700 hover:shadow-md"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.553 4.12 1.52 5.857L.057 23.616l5.932-1.557A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82c-1.977 0-3.845-.53-5.452-1.455l-.39-.232-4.052 1.063 1.082-3.953-.254-.404A9.805 9.805 0 0 1 2.18 12c0-5.422 4.398-9.82 9.82-9.82 5.422 0 9.82 4.398 9.82 9.82 0 5.422-4.398 9.82-9.82 9.82z" />
            </svg>
            Chat on WhatsApp
          </a>
        ) : sellerEmail ? (
          <a
            href={`mailto:${sellerEmail}?subject=Inquiry from Sabthok`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-700 hover:shadow-md"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
            Contact Seller
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-300 py-3 text-sm font-semibold text-gray-500 cursor-not-allowed"
          >
            Chat not available
          </button>
        )}

        {/* Show Phone Number */}
        {sellerPhone ? (
          showPhone ? (
            <a
              href={`tel:${sellerPhone}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-brand-500 bg-brand-50 py-3 text-sm font-semibold text-brand-700 transition-all hover:bg-brand-100"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
              </svg>
              {sellerPhone}
            </a>
          ) : (
            <button
              type="button"
              onClick={() => setShowPhone(true)}
              className="btn-secondary w-full"
            >
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
              </svg>
              Show Phone Number
            </button>
          )
        ) : !hasContact ? (
          <button type="button" disabled className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 py-3 text-sm text-gray-400 cursor-not-allowed">
            No contact info
          </button>
        ) : null}
      </div>
    </div>
  );
}
