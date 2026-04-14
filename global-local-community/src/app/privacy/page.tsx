import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Living In Korea.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="space-y-5 pb-24 lg:space-y-6 lg:pb-8">
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        description="This Privacy Policy explains how Living In Korea collects, uses, discloses, and safeguards personal information."
      />
      <section className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-sm sm:p-6">
        <div className="prose prose-slate max-w-none text-sm leading-7 text-[var(--text-secondary)] prose-headings:text-[var(--text-primary)]">
          <p><strong>Effective date:</strong> April 14, 2026</p>

          <h2>1. Scope</h2>
          <p>This Privacy Policy describes how Living In Korea collects, uses, stores, discloses, and otherwise processes personal information in connection with the Living In Korea website, applications, and related services (collectively, the “Service”).</p>

          <h2>2. Information we collect</h2>
          <p>Depending on how you use the Service, we may collect the following categories of information:</p>
          <ul>
            <li><strong>Account and authentication data:</strong> email address, authentication provider details, basic third-party sign-in profile data made available to us (such as display name or avatar), and account identifiers.</li>
            <li><strong>Profile information:</strong> display name, username, city, occupation, origin country, life-stage or visa context, biography, immediate needs/preferences, avatar image, and onboarding status.</li>
            <li><strong>Community content:</strong> posts, comments, replies, uploaded images, bookmarks, likes, reports, moderation notes, sanctions, and related interaction records.</li>
            <li><strong>Preference and consent data:</strong> notification settings, marketing consent preferences, and third-party email delivery consent preferences.</li>
            <li><strong>Technical and security data:</strong> redacted IP-derived information, user-agent data, request paths, security-event records, moderation and workflow events, session-related information, and abuse-prevention signals.</li>
            <li><strong>Support and communications data:</strong> communications you send to us or moderation-related context associated with your account or activity.</li>
          </ul>

          <h2>3. How we collect information</h2>
          <p>We collect information directly from you, automatically through your interaction with the Service, from authentication providers you choose to use, and from service providers that help us host, secure, store, and operate the Service.</p>

          <h2>4. How we use information</h2>
          <p>We use personal information as reasonably necessary to:</p>
          <ul>
            <li>provide, maintain, and improve the Service;</li>
            <li>create and manage user accounts and profiles;</li>
            <li>display public community content and limited profile information;</li>
            <li>operate interactive features such as posts, comments, likes, bookmarks, reports, and uploads;</li>
            <li>personalize aspects of the user experience, including feed and content prioritization;</li>
            <li>detect, investigate, prevent, and respond to abuse, fraud, spam, policy violations, and security incidents;</li>
            <li>moderate content and enforce our Terms and community rules;</li>
            <li>send operational, authentication, account, moderation, and, where permitted, marketing communications;</li>
            <li>comply with legal obligations, resolve disputes, and protect our rights, users, and platform integrity; and</li>
            <li>analyze performance, reliability, and usage trends to improve the Service.</li>
          </ul>

          <h2>5. Public and member-visible information</h2>
          <p>Some information you choose to provide through the Service is intended to be visible to others. Public posts, comments, and certain limited profile elements may be visible to visitors, users, and, where permitted by our platform configuration, search engines. Other profile details are visible only to signed-in members or administrators, depending on the relevant feature and access controls.</p>

          <h2>6. Security, moderation, and fraud prevention</h2>
          <p>We maintain logs, workflow records, moderation records, and security-event signals in order to operate the Service, monitor reliability, investigate misuse, rate-limit abusive behavior, detect suspicious patterns, and enforce community and platform rules. Where feasible, certain technical identifiers such as IP-related information are stored in redacted form rather than full raw form.</p>

          <h2>7. Cookies, sessions, and similar technologies</h2>
          <p>We and our service providers use cookies, session tokens, and related technologies to authenticate users, maintain sessions, protect accounts, remember preferences, and support core platform functionality. If these technologies are disabled, parts of the Service may not function properly.</p>

          <h2>8. How we disclose information</h2>
          <p>We may disclose personal information:</p>
          <ul>
            <li>to service providers and infrastructure vendors that support hosting, storage, authentication, content delivery, communications, analytics, and security;</li>
            <li>to moderators or administrators as necessary to investigate reports, enforce policies, or resolve operational issues;</li>
            <li>where required by applicable law, legal process, governmental request, or regulatory obligation;</li>
            <li>to protect the rights, safety, security, and integrity of users, the Service, or the public; and</li>
            <li>in connection with a merger, acquisition, financing, reorganization, or sale of all or part of the Service or its assets, subject to applicable legal constraints.</li>
          </ul>
          <p>We do not state here that we “sell” personal information. If our practices materially change, this Policy should be updated before such processing begins.</p>

          <h2>9. Data retention</h2>
          <p>We retain personal information for as long as reasonably necessary for the purposes described in this Policy, including to operate the Service, maintain account history, investigate abuse, comply with legal obligations, resolve disputes, and enforce agreements. Retention periods may vary based on the type of data, the sensitivity of the information, and the operational or legal reason for retaining it.</p>

          <h2>10. Your choices and requests</h2>
          <p>You may update certain account, profile, notification, and consent settings through the Service. You may also contact us regarding privacy-related questions or requests using the contact details below. Because the Service includes public community features, removal of content from active display may not always eliminate historical, logged, backup, moderation, or legal-retention copies immediately.</p>

          <h2>11. International processing</h2>
          <p>Living In Korea operates from the Republic of Korea and uses service providers that may process information in other jurisdictions. By using the Service, you understand that personal information may be processed in Korea and in other countries where our service providers operate, subject to applicable safeguards and legal requirements.</p>

          <h2>12. Children</h2>
          <p>The Service is intended for users who are at least 14 years old. We do not knowingly offer the Service to children below that age threshold. If we become aware that personal information has been collected from a child below the minimum permitted age in violation of this Policy, we may take steps to delete or restrict the relevant information and account.</p>

          <h2>13. Security</h2>
          <p>We use administrative, technical, and organizational measures designed to protect personal information. No method of transmission or storage is completely secure, and we cannot guarantee absolute security. Users are responsible for maintaining the confidentiality of their credentials and using the Service responsibly.</p>

          <h2>14. Changes to this Privacy Policy</h2>
          <p>We may revise this Privacy Policy from time to time. The updated version will be posted with a revised effective date. Your continued use of the Service after an updated Privacy Policy becomes effective constitutes acknowledgment of the revised Policy to the extent permitted by law.</p>

          <h2>15. Contact</h2>
          <p>If you have questions or requests relating to this Privacy Policy, please contact us at <a href="mailto:scottchmoon@gmail.com">scottchmoon@gmail.com</a>.</p>
        </div>
      </section>
    </div>
  );
}
