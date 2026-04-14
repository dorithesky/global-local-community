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

          <h2>1. Operator and scope</h2>
          <p>Living In Korea is an English-first online community designed for foreigners living in the Republic of Korea. These Terms and Conditions govern your access to and use of the Living In Korea website, applications, content, features, and related services (collectively, the “Service”). In these Terms, “Living In Korea,” “we,” “us,” and “our” refer to the operator of the Service.</p>

          <h2>2. Acceptance of Terms</h2>
          <p>By accessing or using the Service, creating an account, posting content, or otherwise interacting with the Service, you agree to be bound by these Terms and our Privacy Policy. If you do not agree, you must not access or use the Service.</p>

          <h2>3. Eligibility</h2>
          <p>You must be at least 14 years old to use the Service. By using the Service, you represent and warrant that you satisfy this minimum age requirement and have the legal capacity to enter into these Terms.</p>

          <h2>4. Accounts and account security</h2>
          <p>To access certain features, you may be required to create an account or authenticate through a third-party identity provider. You are responsible for maintaining the confidentiality of your login credentials, for all activity conducted through your account, and for ensuring that the information associated with your account remains reasonably accurate and current.</p>
          <p>You must not share your account, impersonate another person, or create an account by unauthorized or deceptive means.</p>

          <h2>5. Community standards and prohibited conduct</h2>
          <p>You may not use the Service to post, transmit, request, distribute, or otherwise engage in content or conduct that is unlawful, abusive, fraudulent, infringing, deceptive, threatening, defamatory, hateful, sexually exploitative, or otherwise harmful. Prohibited conduct includes, without limitation:</p>
          <ul>
            <li>harassment, hate speech, threats, or targeted abuse;</li>
            <li>spam, scams, phishing, impersonation, or other deceptive conduct;</li>
            <li>content that infringes intellectual property or privacy rights;</li>
            <li>promotion of unlawful goods, services, or transactions;</li>
            <li>attempts to interfere with, probe, reverse engineer, overload, scrape, or bypass the security or integrity of the Service; and</li>
            <li>use of bots, scripts, or automation in a manner that disrupts the Service or violates our policies.</li>
          </ul>

          <h2>6. User content and license</h2>
          <p>You retain ownership of content you submit, post, upload, or otherwise make available through the Service (“User Content”). However, by submitting User Content, you grant Living In Korea a non-exclusive, worldwide, royalty-free, sublicensable license to host, store, reproduce, adapt, publish, display, distribute, and otherwise use that User Content as reasonably necessary to operate, secure, improve, moderate, and promote the Service.</p>
          <p>You represent and warrant that you have all rights necessary to submit the User Content and to grant the foregoing license.</p>

          <h2>7. Moderation, restriction, and enforcement</h2>
          <p>We may, in our sole discretion and without prior notice where appropriate, review, moderate, remove, restrict, de-rank, disable access to, or refuse to publish any User Content, and may suspend, restrict, or terminate any account, where we reasonably believe such action is necessary to enforce these Terms, protect users, preserve platform integrity, respond to abuse, comply with law, or mitigate risk.</p>
          <p>We may also preserve and use relevant records in connection with abuse prevention, moderation, legal compliance, and dispute resolution.</p>

          <h2>8. Availability and service changes</h2>
          <p>The Service is provided on an “as available” basis. We may add, modify, suspend, or discontinue any aspect of the Service at any time, with or without notice. We do not guarantee uninterrupted availability, compatibility, security, or error-free operation.</p>

          <h2>9. Third-party services and authentication providers</h2>
          <p>The Service may rely on third-party service providers, including hosting, infrastructure, storage, authentication, analytics, communications, and security vendors. Your use of third-party sign-in methods or third-party-linked functionality may also be subject to those third parties’ terms and policies.</p>

          <h2>10. No professional advice</h2>
          <p>Content available through the Service is provided for general informational and community discussion purposes only. It does not constitute legal, immigration, employment, tax, medical, financial, or other professional advice, and should not be relied upon as a substitute for qualified professional counsel.</p>

          <h2>11. Disclaimers</h2>
          <p>To the maximum extent permitted by applicable law, the Service and all content made available through it are provided “as is” and “as available,” without warranties of any kind, whether express, implied, statutory, or otherwise, including implied warranties of merchantability, fitness for a particular purpose, title, non-infringement, availability, accuracy, or security.</p>

          <h2>12. Limitation of liability</h2>
          <p>To the fullest extent permitted by law, Living In Korea and its operators, service providers, and affiliates shall not be liable for any indirect, incidental, consequential, special, exemplary, or punitive damages, or for any loss of profits, revenues, goodwill, data, or business opportunity, arising out of or relating to the Service, these Terms, or your access to or use of the Service, even if advised of the possibility of such damages.</p>
          <p>Nothing in these Terms excludes or limits liability to the extent such exclusion or limitation is prohibited by applicable law.</p>

          <h2>13. Indemnity</h2>
          <p>You agree to defend, indemnify, and hold harmless Living In Korea and its operators from and against claims, liabilities, damages, losses, and expenses, including reasonable legal fees, arising out of or related to your User Content, your misuse of the Service, or your violation of these Terms or applicable law.</p>

          <h2>14. Termination</h2>
          <p>We may suspend or terminate your access to the Service at any time if we reasonably determine that you have violated these Terms, created risk for the Service or its users, or engaged in conduct that is unlawful, abusive, or harmful. Sections that by their nature should survive termination shall survive, including provisions relating to licenses, disclaimers, limitation of liability, indemnity, enforcement, and governing law.</p>

          <h2>15. Changes to these Terms</h2>
          <p>We may amend these Terms from time to time. The updated version will be effective when posted unless a later effective date is stated. Your continued use of the Service after revised Terms become effective constitutes acceptance of the revised Terms.</p>

          <h2>16. Governing law</h2>
          <p>These Terms are governed by and construed in accordance with the laws of the Republic of Korea, without regard to conflict of laws principles.</p>

          <h2>17. Contact</h2>
          <p>If you have questions regarding these Terms, you may contact us at <a href="mailto:scottchmoon@gmail.com">scottchmoon@gmail.com</a>.</p>
        </div>
      </section>
    </div>
  );
}
