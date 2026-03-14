"use client";

import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [error, setError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const handleGoogleCallback = useCallback(
    async (response: { credential: string }) => {
      setError("");
      setGoogleLoading(true);
      try {
        const data = await apiFetch<{
          access: string;
          refresh: string;
          is_new_user: boolean;
        }>("/auth/google/", {
          method: "POST",
          body: JSON.stringify({ id_token: response.credential }),
        });
        login(data.access, data.refresh);
        router.push(data.is_new_user ? "/dashboard" : "/");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Google login failed.";
        setError(message);
      } finally {
        setGoogleLoading(false);
      }
    },
    [login, router]
  );

  const initGoogle = useCallback(() => {
    if (!GOOGLE_CLIENT_ID || !window.google?.accounts) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCallback,
    });
    if (googleBtnRef.current) {
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        width: googleBtnRef.current.offsetWidth,
        text: "continue_with",
        shape: "pill",
      });
    }
  }, [handleGoogleCallback]);

  useEffect(() => {
    if (window.google?.accounts) initGoogle();
  }, [initGoogle]);

  return (
    <>
      {GOOGLE_CLIENT_ID && (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={initGoogle}
        />
      )}
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-lg font-bold text-white shadow-md">
                S
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-gray-900">
                Sab<span className="text-brand-600">thok</span>
              </span>
            </Link>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              Welcome to Sabthok
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Sign in to manage your listings
            </p>
          </div>

          {/* Card */}
          <div className="card p-6 sm:p-8">
            {error && (
              <div
                className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                role="alert"
              >
                {error}
              </div>
            )}

            {/* Google Sign-In */}
            <div
              ref={googleBtnRef}
              className="flex items-center justify-center"
            />

            {googleLoading && (
              <p className="mt-3 text-center text-sm text-gray-500">
                Signing in with Google...
              </p>
            )}

            {!GOOGLE_CLIENT_ID && (
              <p className="text-center text-sm text-gray-500">
                Google Sign-In is not configured.
              </p>
            )}

            <p className="mt-6 text-center text-xs text-gray-400">
              By signing in, you agree to our{" "}
              <Link
                href="/terms"
                className="underline hover:text-gray-600"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="underline hover:text-gray-600"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
