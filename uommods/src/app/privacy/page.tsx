// app/privacy/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How we collect and use data, including site performance tracking.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12 prose prose-neutral dark:prose-invert">
      <div className="privacy">
        <h1>Privacy Policy</h1>
        <p>Last updated: 03 Aug 2025</p>
        <h2>Overview</h2>
        <p>
          We care about your privacy and aim to be transparent about the data we
          collect when you use this site. The primary purpose of our tracking is
          to monitor site performance and error rates so we can improve
          reliability and your experience.
        </p>
        <h2>Data We Collect</h2>
        <p>
          We collect <strong>anonymous usage data</strong> such as page views,
          navigation patterns, load times, and errors. This is done using
          analytics tools (for example, Mixpanel) to help us understand how the
          site is used and to detect and fix problems promptly. We do not
          collect personally identifying information unless you provide it
          explicitly via a form or similar interaction.
        </p>
        <h2>How We Use the Data</h2>
        <p>The data is used solely to:</p>
        <ul>
          <li>
            Monitor and improve site performance (e.g., page speed, uptime).
          </li>
          <li>Detect, diagnose, and fix errors and reliability issues.</li>
          <li>Understand general usage trends to prioritize improvements.</li>
        </ul>
        <h2>Analytics and Tracking</h2>
        <p>
          We use third-party services such as Mixpanel to collect and aggregate
          analytics data. These tools help us track performance metrics and
          error rates. The data sent is anonymized and does not include personal
          information unless you supply it directly.
        </p>
        <h2>Do Not Track (DNT)</h2>
        <p>
          Our site does <strong>not</strong> honor browser Do Not Track signals
          by default. However, you are given a clear choice via the consent
          interface: if you decline tracking, no analytics data will be
          collected. If you explicitly consent, we may ignore the DNT signal to
          enable performance monitoring and diagnostics as described.
        </p>
        <h2>Consent and Opt-out</h2>
        <p>
          On your first visit, you will be presented with a consent banner
          allowing you to accept or decline tracking.
          <strong>Accepting</strong> enables analytics and performance
          monitoring. <strong>Declining</strong> prevents any non-essential
          tracking from occurring while allowing you to continue using the site.
          You can change or revoke your choice at any time via the preferences
          interface (if available) or by clearing your local storage / cookies.
        </p>
        <h2>Data Security</h2>
        <p>
          We take reasonable measures to protect the data we collect from
          unauthorized access, disclosure, or alteration. Access is limited to
          authorized personnel or systems necessary to perform analytics and
          maintenance.
        </p>
        <h2>Your Rights</h2>
        <p>
          Depending on your jurisdiction, you may have rights regarding your
          data, including:
        </p>
        <ul>
          <li>The right to be informed about what is collected and why.</li>
          <li>
            The right to refuse or withdraw consent for non-essential tracking.
          </li>
          <li>
            The right to request deletion of any personal data you have provided
            directly.
          </li>
        </ul>
        <h2>Third-Party Services</h2>
        <p>
          We may use third-party providers (like Mixpanel) to process analytics
          on our behalf. Their use of your data is governed by their respective
          privacy policies. We limit what is shared to only what is necessary
          for analytics and performance monitoring.
        </p>
        <h2>Changes to This Policy</h2>
        <p>
          We may update this policy from time to time. Significant changes will
          be reflected by updating the "Last updated" date above.
        </p>
        <h2>Contact</h2>
        <p>
          If you have questions or concerns about this policy or your data,
          please contact us at{" "}
          <a
            href="mailto:joshua.bode@student.manchester.ac.uk"
            className="underline text-blue-700"
          >
            joshua.bode@student.manchester.ac.uk
          </a>
          .
          <br />
          <br />
          <br />
          <a href="/" className="underline text-blue-500">
            back to site
          </a>
        </p>
      </div>
    </main>
  );
}
