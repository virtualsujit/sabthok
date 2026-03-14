import Link from "next/link";

export const metadata = {
  title: "Safety Tips | Sabthok",
  description:
    "Stay safe while buying and selling on Sabthok. Tips for secure transactions in Nepal.",
};

export default function SafetyTipsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
      >
        &larr; Back to Home
      </Link>

      <div className="card p-8 sm:p-10">
        <h1 className="text-3xl font-bold text-gray-900">Safety Tips</h1>
        <p className="mt-2 text-sm text-gray-500">
          Follow these guidelines to stay safe while buying and selling on
          Sabthok.
        </p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-gray-700">
          {/* Meeting */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              Meet in Public Places
            </h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>
                Always meet buyers or sellers in a well-lit, public location
                such as a busy chowk, shopping mall, or bank premises.
              </li>
              <li>
                Avoid meeting at your home or in isolated areas, especially for
                first-time transactions.
              </li>
              <li>
                Consider meeting near a police station or a location with CCTV
                cameras for high-value items.
              </li>
              <li>
                Inform a friend or family member about the meeting details
                &mdash; where, when, and with whom.
              </li>
            </ul>
          </section>

          {/* Inspect */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              Inspect Before You Pay
            </h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>
                Thoroughly inspect the item in person before handing over any
                money.
              </li>
              <li>
                For electronics, test all features (screen, battery, charging,
                connectivity) on the spot.
              </li>
              <li>
                For vehicles, request maintenance records, check the blue book,
                and consider a test drive.
              </li>
              <li>
                Compare the item against the listing description and photos.
                Ask about any discrepancies.
              </li>
            </ul>
          </section>

          {/* Payments */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              Never Send Advance Money
            </h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>
                Do not transfer money, send eSewa/Khalti payments, or provide
                any deposit before seeing and inspecting the item.
              </li>
              <li>
                Be wary of sellers who insist on advance payment, claim the item
                is in high demand, or pressure you to pay quickly.
              </li>
              <li>
                Legitimate sellers will let you inspect the item before any
                money changes hands.
              </li>
              <li>
                For high-value purchases, consider using a bank for the
                transaction so there is a paper trail.
              </li>
            </ul>
          </section>

          {/* Scams */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              Recognize Common Scams
            </h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>
                <strong>Too-good-to-be-true prices</strong> &mdash; if a deal
                seems unrealistically cheap, it probably is. Research the
                market value first.
              </li>
              <li>
                <strong>Fake urgency</strong> &mdash; scammers create pressure
                with phrases like &quot;someone else is about to buy it&quot; or
                &quot;offer ends today.&quot;
              </li>
              <li>
                <strong>Phishing links</strong> &mdash; never click on
                suspicious links sent through chat. Sabthok will never ask for
                your password via message.
              </li>
              <li>
                <strong>Fake payment confirmations</strong> &mdash; verify
                transfers in your own bank or wallet app, not through
                screenshots shared by the buyer.
              </li>
            </ul>
          </section>

          {/* Personal info */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              Protect Your Personal Information
            </h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>
                Share only the information needed for the transaction. Avoid
                giving out your full address, citizenship number, or bank
                details.
              </li>
              <li>
                Use the Sabthok messaging system rather than sharing personal
                phone numbers or social media until you trust the other party.
              </li>
              <li>
                Use a strong, unique password for your Sabthok account and do
                not share it with anyone.
              </li>
            </ul>
          </section>

          {/* Seller tips */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              Tips for Sellers
            </h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>
                Be honest in your listing description. Mention any defects or
                issues to avoid disputes later.
              </li>
              <li>
                Confirm payment has been received in your bank or wallet before
                handing over the item.
              </li>
              <li>
                Be cautious of buyers who overpay and ask for a refund of the
                difference &mdash; this is a common scam.
              </li>
              <li>
                Keep records of the transaction (chat messages, receipts) in
                case of disputes.
              </li>
            </ul>
          </section>

          {/* Reporting */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              Report Suspicious Activity
            </h2>
            <p className="mt-2">
              If you encounter a suspicious listing, user, or believe you have
              been scammed, please report it immediately. You can flag a listing
              directly on the Platform or contact us at{" "}
              <a
                href="mailto:safety@sabthok.com"
                className="font-medium text-brand-600 hover:text-brand-700"
              >
                safety@sabthok.com
              </a>
              . For criminal matters, file a report with Nepal Police&apos;s
              Cyber Bureau.
            </p>
          </section>

          {/* Disclaimer */}
          <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <h2 className="text-sm font-semibold text-amber-800">
              Disclaimer
            </h2>
            <p className="mt-1 text-sm text-amber-700">
              Sabthok is a classifieds platform that connects buyers and
              sellers. We do not verify the identity of users or the quality of
              listed items. All transactions are conducted at your own risk.
              Please exercise caution and good judgment.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
