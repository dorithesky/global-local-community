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
        description="These terms govern your access to and use of Living In Korea."
      />
      <section className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-sm sm:p-6">
        <div className="prose prose-slate max-w-none text-sm leading-7 text-[var(--text-secondary)] prose-headings:text-[var(--text-primary)]">
          <p><strong>Effective date:</strong> April 14, 2026</p>

          <h2>1. Who we are</h2>
          <p>Living In Korea is an English-first community platform for foreigners living in Korea. In these Terms, “Living In Korea”, “we”, “us”, and “our” refer to the operator of the platform.</p>

          <h2>2. Acceptance of these Terms</h2>
          <p>By creating an account, accessing, or using Living In Korea, you agree to these Terms and our Privacy Policy. If you do not agree, do not use the platform.</p>

          <h2>3. Eligibility</h2>
          <p>You must be at least 14 years old to use Living In Korea. By using the platform, you confirm that you meet this minimum age requirement and that you are legally able to agree to these Terms.</p>

          <h2>4. Your account</h2>
          <p>You are responsible for the activity that happens through your account and for keeping your login credentials secure. You must provide accurate information when creating and maintaining your account.</p>

          <h2>5. Community rules</h2>
          <p>You may not use Living In Korea to post, share, request, or promote content that is unlawful, abusive, deceptive, infringing, or harmful. This includes harassment, hate speech, impersonation, spam, scams, illegal transactions, and copyright violations.</p>

          <h2>6. Content you post</h2>
          <p>You keep ownership of the content you post. By posting content on Living In Korea, you give us a non-exclusive, worldwide, royalty-free license to host, store, display, reproduce, and distribute that content as needed to operate and improve the platform.</p>

          <h2>7. Moderation and enforcement</h2>
          <p>We may review, remove, limit, or restrict content or accounts that violate these Terms, our policies, or applicable law. We may also suspend or terminate accounts to protect users, the platform, or legal compliance.</p>

          <h2>8. Availability and changes</h2>
          <p>We may update, suspend, or discontinue features of Living In Korea at any time. We do not guarantee uninterrupted availability or error-free operation.</p>

          <h2>9. No professional advice</h2>
          <p>Content on Living In Korea is provided for general community discussion and information only. It is not legal, immigration, medical, tax, employment, or other professional advice.</p>

          <h2>10. Limitation of liability</h2>
          <p>To the maximum extent permitted by law, Living In Korea is provided “as is” and “as available.” We are not liable for indirect, incidental, special, consequential, or punitive damages arising from your use of the platform.</p>

          <h2>11. Governing law</h2>
          <p>These Terms are governed by the laws of the Republic of Korea, without regard to conflict of law principles.</p>

          <h2>12. Contact</h2>
          <p>If you have questions about these Terms, contact: <a href="mailto:scottchmoon@gmail.com">scottchmoon@gmail.com</a></p>
        </div>
      </section>
    </div>
  );
}
