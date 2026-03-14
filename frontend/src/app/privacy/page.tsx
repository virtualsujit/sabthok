import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Sabthok",
  description:
    "How Sabthok collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
      >
        &larr; Back to Home
      </Link>

      <div className="card p-8 sm:p-10">
        <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-gray-500">
          Last updated: March 13, 2026
        </p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-gray-700">
          {/* 1 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              1. Information We Collect
            </h2>
            <p className="mt-2">
              When you use Sabthok, we may collect the following information:
            </p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>
                <strong>Account information</strong> &mdash; name, email
                address, and phone number provided during registration.
              </li>
              <li>
                <strong>Listing data</strong> &mdash; titles, descriptions,
                images, prices, and location details you provide when posting
                ads.
              </li>
              <li>
                <strong>Usage data</strong> &mdash; pages visited, search
                queries, device type, browser, and IP address collected
                automatically.
              </li>
              <li>
                <strong>Communications</strong> &mdash; messages exchanged with
                other users through the Platform.
              </li>
            </ul>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              2. How We Use Your Information
            </h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>To provide, maintain, and improve the Platform.</li>
              <li>To display your listings to potential buyers.</li>
              <li>
                To send important account notifications such as verification
                emails or security alerts.
              </li>
              <li>
                To detect and prevent fraud, abuse, or violations of our Terms
                of Service.
              </li>
              <li>
                To generate anonymized, aggregated analytics to understand usage
                patterns.
              </li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              3. Cookies &amp; Tracking
            </h2>
            <p className="mt-2">
              Sabthok uses cookies and similar technologies to:
            </p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>Keep you signed in across sessions.</li>
              <li>Remember your preferences (e.g., location, language).</li>
              <li>
                Collect anonymous analytics to improve the user experience.
              </li>
            </ul>
            <p className="mt-2">
              You can manage cookie preferences through your browser settings.
              Disabling cookies may affect certain features of the Platform.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              4. Third-Party Services
            </h2>
            <p className="mt-2">
              We may use third-party services for analytics, hosting, image
              storage, and email delivery. These providers have access only to
              the data necessary to perform their functions and are obligated to
              protect your information. We do not sell your personal data to
              third parties.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              5. Data Sharing
            </h2>
            <p className="mt-2">We may share your information only when:</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>
                Required by law or in response to valid legal requests by public
                authorities.
              </li>
              <li>
                Necessary to enforce our Terms of Service or protect the rights
                and safety of our users.
              </li>
              <li>
                With your explicit consent for a specific purpose.
              </li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              6. Data Security
            </h2>
            <p className="mt-2">
              We implement industry-standard security measures including
              encrypted data transmission (HTTPS), hashed passwords, and access
              controls. However, no method of electronic storage is 100% secure,
              and we cannot guarantee absolute security.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              7. Data Retention
            </h2>
            <p className="mt-2">
              We retain your personal data for as long as your account is active
              or as needed to provide services. If you delete your account, we
              will remove your personal information within 30 days, except where
              retention is required by law.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              8. Your Rights
            </h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>
                <strong>Access</strong> &mdash; request a copy of the personal
                data we hold about you.
              </li>
              <li>
                <strong>Correction</strong> &mdash; update or correct inaccurate
                information.
              </li>
              <li>
                <strong>Deletion</strong> &mdash; request deletion of your
                account and associated data.
              </li>
              <li>
                <strong>Objection</strong> &mdash; opt out of non-essential
                communications at any time.
              </li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, contact us at{" "}
              <a
                href="mailto:privacy@sabthok.com"
                className="font-medium text-brand-600 hover:text-brand-700"
              >
                privacy@sabthok.com
              </a>
              .
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              9. Children&apos;s Privacy
            </h2>
            <p className="mt-2">
              Sabthok is not intended for children under 16. We do not knowingly
              collect personal information from children. If we learn that a
              child under 16 has provided us with personal data, we will take
              steps to delete it promptly.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              10. Changes to This Policy
            </h2>
            <p className="mt-2">
              We may update this Privacy Policy from time to time. We will
              notify users of significant changes via email or a prominent
              notice on the Platform. Continued use after changes constitutes
              acceptance of the revised policy.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              11. Contact
            </h2>
            <p className="mt-2">
              For privacy-related inquiries, contact us at{" "}
              <a
                href="mailto:privacy@sabthok.com"
                className="font-medium text-brand-600 hover:text-brand-700"
              >
                privacy@sabthok.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
