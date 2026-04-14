import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description: 'Terms and Conditions for Living In Korea.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsPage() {
  return (
    <div className="space-y-5 pb-24 lg:space-y-6 lg:pb-8">
      <PageHeader
        eyebrow="Legal"
        title="Terms and Conditions"
        description="These Terms and Conditions govern access to and use of Living In Korea."
      />
      <section className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-sm sm:p-6">
        <div className="prose prose-slate max-w-none text-sm leading-7 text-[var(--text-secondary)] prose-headings:text-[var(--text-primary)]">
          <p><strong>Effective date:</strong> April 14, 2026</p>

          <h2>1. Scope and binding effect</h2>
          <p>These Terms and Conditions (these “Terms”) govern your access to and use of the Living In Korea website, applications, content, features, communications, and related services (collectively, the “Service”). By accessing, browsing, registering for, or using the Service, you acknowledge that you have read, understood, and agreed to be bound by these Terms and the Privacy Policy. If you do not agree, you must not access or use the Service.</p>

          <h2>2. Operator</h2>
          <p>Living In Korea is an English-first community platform oriented toward foreigners building and managing everyday life in the Republic of Korea. In these Terms, “Living In Korea,” “we,” “us,” and “our” refer to the operator of the Service.</p>

          <h2>3. Eligibility</h2>
          <p>You may use the Service only if you are at least 14 years old and are legally capable of entering into a binding agreement under applicable law. By using the Service, you represent and warrant that you satisfy these eligibility requirements.</p>

          <h2>4. Accounts, credentials, and responsibility</h2>
          <p>Certain features of the Service require an authenticated account. You are responsible for maintaining the confidentiality and security of your login credentials, for all activity occurring through your account, and for ensuring that information associated with your account remains reasonably accurate and current.</p>
          <p>You may not transfer, share, sell, lend, or otherwise make your account available to another person. You may not impersonate another individual or entity or create an account through deceptive, automated, or unauthorized means.</p>

          <h2>5. Acceptable use and prohibited conduct</h2>
          <p>You may not use the Service in a manner that is unlawful, abusive, fraudulent, infringing, deceptive, harmful, or operationally disruptive. Without limitation, you must not:</p>
          <ul>
            <li>post or transmit harassment, hate speech, threats, defamation, sexually exploitative content, or targeted abuse;</li>
            <li>engage in impersonation, phishing, scams, spam, coordinated manipulation, or other deceptive conduct;</li>
            <li>post or solicit unlawful goods, unlawful services, or unlawful transactions;</li>
            <li>upload or distribute content that infringes intellectual property, privacy, publicity, or other rights;</li>
            <li>probe, scan, test, reverse engineer, scrape, bypass, or interfere with the security, integrity, or operation of the Service;</li>
            <li>use bots, scripts, automation, or bulk activity in a manner that circumvents restrictions or disrupts the Service; or</li>
            <li>attempt to gain unauthorized access to accounts, data, systems, or moderation tooling.</li>
          </ul>

          <h2>6. User content</h2>
          <p>The Service may permit you to submit, upload, publish, transmit, store, or otherwise make available posts, comments, profile information, images, reports, and other materials (“User Content”). You retain any ownership rights you may have in your User Content, subject to the license granted below.</p>

          <h2>7. License to user content</h2>
          <p>By submitting User Content through the Service, you grant Living In Korea a non-exclusive, worldwide, royalty-free, sublicensable license to host, store, reproduce, adapt, display, publish, distribute, moderate, and otherwise use that User Content as reasonably necessary to operate, secure, improve, administer, and promote the Service.</p>
          <p>You represent and warrant that you have all rights, permissions, and authority necessary to submit the User Content and to grant the foregoing license.</p>

          <h2>8. Moderation and enforcement authority</h2>
          <p>We reserve the right, in our sole discretion and without prior notice where appropriate, to review, screen, remove, decline to publish, restrict, de-rank, disable access to, or otherwise take action regarding any User Content, account, or activity where we reasonably believe such action is necessary to enforce these Terms, protect users, preserve platform integrity, respond to abuse, mitigate legal or operational risk, or comply with applicable law or lawful requests.</p>
          <p>We may also investigate suspected misuse, preserve relevant records, and cooperate with appropriate authorities or third parties where legally required or reasonably necessary to protect the Service, users, or the public.</p>

          <h2>9. Service changes and availability</h2>
          <p>The Service is evolving and may change over time. We may add, modify, suspend, limit, or discontinue any feature, functionality, or portion of the Service at any time, with or without notice. We do not guarantee uninterrupted availability, compatibility, accuracy, security, or error-free operation.</p>

          <h2>10. Third-party services</h2>
          <p>The Service may rely on third-party infrastructure, authentication providers, content delivery services, communications providers, storage vendors, analytics tools, and security vendors. Your use of third-party sign-in methods or third-party-linked functionality may also be subject to those third parties’ own terms, privacy notices, and operational practices.</p>

          <h2>11. No professional advice</h2>
          <p>The Service and content available through it are provided for general informational and community discussion purposes only. They do not constitute legal, immigration, employment, tax, medical, financial, or other professional advice, and must not be relied upon as a substitute for appropriately qualified professional counsel.</p>

          <h2>12. Disclaimer of warranties</h2>
          <p>To the maximum extent permitted by applicable law, the Service and all related content, functionality, and materials are provided on an “as is” and “as available” basis, without warranties of any kind, whether express, implied, statutory, or otherwise, including warranties of merchantability, fitness for a particular purpose, title, non-infringement, availability, accuracy, reliability, or security.</p>

          <h2>13. Limitation of liability</h2>
          <p>To the fullest extent permitted by law, Living In Korea and its operators, service providers, affiliates, and representatives shall not be liable for any indirect, incidental, consequential, special, exemplary, punitive, or similar damages, or for any loss of profits, revenue, goodwill, data, business opportunity, or anticipated savings, arising out of or relating to the Service, your use of or inability to use the Service, User Content, moderation decisions, or these Terms, even if advised of the possibility of such damages.</p>
          <p>Nothing in these Terms excludes or limits liability to the extent such exclusion or limitation is prohibited under applicable law.</p>

          <h2>14. Indemnification</h2>
          <p>You agree to defend, indemnify, and hold harmless Living In Korea and its operators from and against claims, demands, actions, liabilities, losses, damages, costs, and expenses, including reasonable legal fees, arising out of or relating to your User Content, your use of the Service, your violation of these Terms, or your violation of applicable law or third-party rights.</p>

          <h2>15. Suspension and termination</h2>
          <p>We may suspend, limit, or terminate your access to the Service, in whole or in part, at any time where we reasonably determine that you have violated these Terms, created risk for the Service or its users, or engaged in unlawful, abusive, deceptive, or harmful conduct. Termination or suspension may occur without prior notice where circumstances warrant. Provisions that by their nature should survive termination shall survive, including provisions relating to User Content licenses, disclaimers, limitation of liability, indemnification, enforcement, and governing law.</p>

          <h2>16. Amendments</h2>
          <p>We may revise these Terms from time to time. The revised version will become effective upon posting or on the later effective date specified in the updated Terms. Your continued use of the Service after revised Terms become effective constitutes acceptance of the revised Terms.</p>

          <h2>17. Governing law</h2>
          <p>These Terms and any non-contractual obligations arising out of or in connection with them shall be governed by and construed in accordance with the laws of the Republic of Korea, without regard to conflict of laws principles.</p>

          <h2>18. Contact</h2>
          <p>If you have questions regarding these Terms, you may contact us at <a href="mailto:scottchmoon@gmail.com">scottchmoon@gmail.com</a>.</p>
        </div>
      </section>
    </div>
  );
}
