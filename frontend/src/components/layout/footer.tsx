import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold text-white">
                S
              </div>
              <span className="text-lg font-extrabold text-white">
                Sab<span className="text-brand-400">thok</span>
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              Nepal&apos;s commission-free classifieds marketplace. Buy and sell
              anything locally.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/search" className="hover:text-white transition-colors">
                  Browse Listings
                </Link>
              </li>
              <li>
                <Link href="/post-ad" className="hover:text-white transition-colors">
                  Post an Ad
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  My Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Popular Categories
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/search?category_slug=real-estate" className="hover:text-white transition-colors">
                  Real Estate
                </Link>
              </li>
              <li>
                <Link href="/search?category_slug=automobiles" className="hover:text-white transition-colors">
                  Automobiles
                </Link>
              </li>
              <li>
                <Link href="/search?category_slug=mobile-phones-accessories" className="hover:text-white transition-colors">
                  Mobile Phones
                </Link>
              </li>
              <li>
                <Link href="/search?category_slug=electronics-tvs-more" className="hover:text-white transition-colors">
                  Electronics
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Support
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/safety-tips" className="hover:text-white transition-colors">
                  Safety Tips
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-6 sm:flex-row">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Sabthok. All rights reserved.
          </p>
          <p className="text-xs text-gray-500">
            Made with care in Nepal
          </p>
        </div>
      </div>
    </footer>
  );
}
