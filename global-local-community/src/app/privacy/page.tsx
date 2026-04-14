import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Living In Korea.',
};

export default function PrivacyPage() {
  return (
    <div className="space-y-5 pb-24 lg:space-y-6 lg:pb-8">
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        description="This policy explains how Living In Korea collects, uses, and protects your information."
      />
      <section className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-sm sm:p-6">
        <div className="prose prose-slate max-w-none text-sm leading-7 text-[var(--text-secondary)] prose-headings:text-[var(--text-primary)]">
          <p><strong>Effective date:</strong> April 14, 2026</p>

          <h2>1. What we collect</h2>
          <p>We may collect account information, profile details, content you post, reports, settings, technical logs, and basic usage data needed to operate the platform.</p>

          <h2>2. How we use your information</h2>
          <p>We use your information to provide the platform, personalize your experience, moderate community content, maintain security, prevent abuse, communicate with you, and improve Living In Korea.</p>

          <h2>3. Content visibility</h2>
          <p>Information you choose to post publicly, including profile details and community posts, may be visible to other users and, where applicable, to search engines or visitors.</p>

          <h2>4. Cookies and authentication</h2>
          <p>We use authentication cookies and related session technologies to keep you signed in, protect your account, and operate core features.</p>

          <h2>5. Sharing</h2>
          <p>We may share data with service providers that help us host, authenticate, store, secure, or operate the platform. We may also disclose information if required by law or necessary to protect users, rights, or safety.</p>

          <h2>6. Retention</h2>
          <p>We keep information for as long as reasonably necessary to operate the platform, comply with legal obligations, resolve disputes, and enforce our policies.</p>

          <h2>7. Your choices</h2>
          <p>You can update parts of your profile and settings from your account. If you want help with privacy-related questions or requests, contact us using the email below.</p>

          <h2>8. Children</h2>
          <p>Living In Korea is intended for users aged 14 and older. We do not knowingly provide the platform to children below that age threshold.</p>

          <h2>9. International use</h2>
          <p>Living In Korea operates from the Republic of Korea. By using the platform, you understand that your information may be processed in Korea and in other places where our service providers operate.</p>

          <h2>10. Changes to this policy</h2>
          <p>We may update this Privacy Policy from time to time. Continued use of the platform after updates means the revised policy will apply.</p>

          <h2>11. Contact</h2>
          <p>If you have questions about this Privacy Policy, contact: <a href="mailto:scottchmoon@gmail.com">scottchmoon@gmail.com</a></p>
        </div>
      </section>
    </div>
  );
}
