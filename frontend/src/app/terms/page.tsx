import Link from "next/link";

export const metadata = {
  title: "Terms of Service | Sabthok",
  description:
    "Terms and conditions for using Sabthok, Nepal's commission-free classifieds marketplace.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
      >
        &larr; Back to Home
      </Link>

      <div className="card p-8 sm:p-10">
        <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
        <p className="mt-2 text-sm text-gray-500">
          Last updated: March 13, 2026
        </p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-gray-700">
          {/* 1 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              1. Acceptance of Terms
            </h2>
            <p className="mt-2">
              By accessing or using Sabthok (&quot;the Platform&quot;), you
              agree to be bound by these Terms of Service. If you do not agree,
              please do not use the Platform. Sabthok reserves the right to
              update these terms at any time; continued use after changes
              constitutes acceptance.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              2. User Accounts
            </h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>You must be at least 16 years old to create an account.</li>
              <li>
                You are responsible for maintaining the confidentiality of your
                login credentials.
              </li>
              <li>
                Each person may maintain only one active account. Duplicate
                accounts may be suspended without notice.
              </li>
              <li>
                Sabthok may suspend or terminate accounts that violate these
                terms or engage in fraudulent activity.
              </li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              3. Listing Rules
            </h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>
                Listings must accurately describe the item or service being
                offered, including condition, price, and location.
              </li>
              <li>
                Sellers must have the legal right to sell the listed item.
              </li>
              <li>
                Duplicate or spam listings are not allowed and may be removed.
              </li>
              <li>
                Images must be of the actual item. Stock photos or misleading
                images are prohibited.
              </li>
              <li>
                Sabthok reserves the right to remove any listing that violates
                these terms or is reported by the community.
              </li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              4. Prohibited Items &amp; Content
            </h2>
            <p className="mt-2">
              The following may not be listed or traded on Sabthok:
            </p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>
                Illegal goods or substances under the laws of Nepal.
              </li>
              <li>Weapons, ammunition, or explosives.</li>
              <li>Counterfeit, stolen, or pirated goods.</li>
              <li>
                Drugs, pharmaceuticals (without proper licensing), or hazardous
                materials.
              </li>
              <li>
                Adult content, obscene material, or services of a sexual nature.
              </li>
              <li>
                Wildlife, endangered species, or products derived from them.
              </li>
              <li>
                Any item that infringes on intellectual property rights.
              </li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              5. Transactions &amp; Payments
            </h2>
            <p className="mt-2">
              Sabthok is a classifieds platform that connects buyers and
              sellers. We do not process payments or act as an intermediary in
              transactions. All transactions are conducted directly between
              users. Sabthok is not responsible for the quality, safety, or
              legality of items listed, the accuracy of listings, or the ability
              of buyers or sellers to complete a transaction.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              6. User Conduct
            </h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>
                Do not harass, threaten, or abuse other users.
              </li>
              <li>
                Do not use the Platform to spam, phish, or distribute malware.
              </li>
              <li>
                Do not attempt to circumvent any security or access-control
                features.
              </li>
              <li>
                Do not scrape, crawl, or use automated tools to access the
                Platform without written permission.
              </li>
            </ul>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              7. Limitation of Liability
            </h2>
            <p className="mt-2">
              Sabthok is provided on an &quot;as is&quot; and &quot;as
              available&quot; basis. To the fullest extent permitted by law,
              Sabthok disclaims all warranties, express or implied. We shall not
              be liable for any indirect, incidental, special, consequential, or
              punitive damages arising from your use of or inability to use the
              Platform, including but not limited to loss of profits, data, or
              goodwill.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              8. Intellectual Property
            </h2>
            <p className="mt-2">
              All content, branding, and code on Sabthok are the property of
              Sabthok or its licensors. Users retain ownership of content they
              post but grant Sabthok a non-exclusive, royalty-free license to
              display and distribute that content on the Platform.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              9. Dispute Resolution
            </h2>
            <p className="mt-2">
              Any disputes arising from use of the Platform shall be governed by
              the laws of Nepal. Users agree to attempt to resolve disputes
              amicably before pursuing legal action. Sabthok may, at its
              discretion, mediate disputes between users but is under no
              obligation to do so.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              10. Contact
            </h2>
            <p className="mt-2">
              If you have questions about these Terms, please reach out to us at{" "}
              <a
                href="mailto:support@sabthok.com"
                className="font-medium text-brand-600 hover:text-brand-700"
              >
                support@sabthok.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
