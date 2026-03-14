"use client";

import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Mode = "login" | "register";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint =
        mode === "login" ? "/auth/login/" : "/auth/register/";
      const body: Record<string, string> =
        mode === "login"
          ? { email, password }
          : { email, password, full_name: fullName };

      const data = await apiFetch<{
        access: string;
        refresh: string;
        is_new_user: boolean;
      }>(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      });

      login(data.access, data.refresh);
      router.push(data.is_new_user ? "/dashboard" : "/");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

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
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {mode === "login"
              ? "Log in to manage your listings"
              : "Join Nepal's free classifieds marketplace"}
          </p>
        </div>

        {/* Form Card */}
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
          {GOOGLE_CLIENT_ID && (
            <>
              <div
                ref={googleBtnRef}
                className="flex items-center justify-center"
              />
              {googleLoading && (
                <p className="text-center text-sm text-gray-500">
                  Signing in with Google...
                </p>
              )}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-3 text-gray-400">or</span>
                </div>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label
                  htmlFor="full-name"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <input
                  id="full-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ram Sharma"
                  className="input-field"
                  autoComplete="name"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="input-field"
                autoComplete="email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  mode === "register" ? "Min 6 characters" : "Enter password"
                }
                required
                minLength={mode === "register" ? 6 : undefined}
                className="input-field"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="btn-primary w-full py-3 text-base disabled:opacity-50"
            >
              {loading
                ? mode === "login"
                  ? "Logging in..."
                  : "Creating account..."
                : mode === "login"
                  ? "Log In"
                  : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                  className="font-semibold text-brand-600 hover:text-brand-700"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className="font-semibold text-brand-600 hover:text-brand-700"
                >
                  Log in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
