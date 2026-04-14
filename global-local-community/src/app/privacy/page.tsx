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

          <h2>1. Scope and application</h2>
          <p>This Privacy Policy describes how Living In Korea collects, uses, stores, discloses, and otherwise processes personal information in connection with the Living In Korea website, applications, and related services (collectively, the “Service”). This Policy applies to information processed in connection with your use of the Service, whether collected directly from you, automatically through your interaction with the Service, or through service providers and authentication providers used to operate the Service.</p>

          <h2>2. Categories of information we collect</h2>
          <p>Depending on how you use the Service, we may collect and process the following categories of information:</p>
          <ul>
            <li><strong>Account and authentication information:</strong> email address, account identifiers, authentication records, and limited profile information made available by the sign-in provider you choose to use, such as display name or avatar.</li>
            <li><strong>Profile information:</strong> username, display name, city, occupation, origin country, life-stage or visa-context information, biography, immediate-need preference, avatar image, and onboarding status.</li>
            <li><strong>Community and interaction information:</strong> posts, comments, replies, likes, bookmarks, uploaded images, reports, and other content or interaction data you submit or generate through the Service.</li>
            <li><strong>Preference and consent information:</strong> notification preferences, marketing consent preferences, and third-party email delivery consent preferences.</li>
            <li><strong>Moderation and trust-and-safety information:</strong> moderation records, moderator notes, sanctions, role-management records, workflow events, security-event records, and abuse-prevention signals associated with use of the Service.</li>
            <li><strong>Technical and service-operation information:</strong> session-related data, request paths, user-agent data, and redacted IP-derived information used to operate, secure, and troubleshoot the Service.</li>
            <li><strong>Support and communications information:</strong> messages, inquiries, or other communications you send to us, including privacy or moderation-related requests.</li>
          </ul>

          <h2>3. How information is collected</h2>
          <p>We collect information: (a) directly from you when you register, complete your profile, post content, upload media, report content, adjust settings, or contact us; (b) automatically when you access or use the Service; (c) from authentication providers when you sign in using a third-party identity provider; and (d) from vendors and service providers that support hosting, infrastructure, storage, delivery, security, and related operations.</p>

          <h2>4. Purposes of processing</h2>
          <p>We may process personal information as reasonably necessary to:</p>
          <ul>
            <li>provide, maintain, administer, and improve the Service;</li>
            <li>create, authenticate, and manage user accounts and profiles;</li>
            <li>operate community features, including posts, comments, replies, likes, bookmarks, uploads, and reports;</li>
            <li>display public content and limited profile information in accordance with Service design and visibility settings;</li>
            <li>personalize aspects of the Service, including feed ordering and content prioritization;</li>
            <li>moderate content, investigate reports, enforce our Terms, and protect users and platform integrity;</li>
            <li>detect, prevent, investigate, and respond to abuse, fraud, spam, security incidents, and other harmful or unauthorized activity;</li>
            <li>send service-related, authentication, moderation, and account communications, and, where permitted, marketing communications;</li>
            <li>comply with legal obligations, respond to lawful requests, resolve disputes, and protect our legal rights and legitimate interests; and</li>
            <li>analyze usage, performance, reliability, and service health.</li>
          </ul>

          <h2>5. Public, member-only, and restricted visibility</h2>
          <p>The Service includes public-facing and member-facing features. Public posts, comments, and certain limited profile elements may be visible to visitors, users, and, where permitted by platform configuration, search engines. Other information may be visible only to signed-in members, moderators, administrators, or service operators where access is necessary for operation, moderation, support, legal compliance, or security purposes.</p>

          <h2>6. Security, moderation, and fraud prevention</h2>
          <p>We maintain operational, moderation, workflow, and security records in order to run the Service, monitor performance, investigate reports, enforce policies, rate-limit abusive behavior, detect suspicious patterns, and respond to security or trust-and-safety events. Where feasible, certain technical identifiers, including IP-related information, may be stored in redacted form rather than as full raw values.</p>

          <h2>7. Cookies and similar technologies</h2>
          <p>We and our service providers use cookies, session tokens, and related technologies to authenticate users, maintain sessions, remember preferences, enable core functionality, and support service security and performance. If such technologies are disabled, some features of the Service may not operate correctly.</p>

          <h2>8. Disclosure of information</h2>
          <p>We may disclose personal information:</p>
          <ul>
            <li>to infrastructure, hosting, authentication, storage, delivery, communications, analytics, and security vendors that provide services on our behalf;</li>
            <li>to moderators, administrators, contractors, or advisors where access is reasonably necessary for moderation, platform operations, support, security, or legal compliance;</li>
            <li>where required by applicable law, regulation, legal process, or lawful governmental request;</li>
            <li>where reasonably necessary to protect the rights, property, safety, users, Service integrity, or the public; and</li>
            <li>in connection with an actual or proposed merger, financing, acquisition, reorganization, sale of assets, or other strategic transaction, subject to applicable legal constraints.</li>
          </ul>
          <p>This Policy does not state that we sell personal information. If our practices materially change, the Policy should be revised before such processing begins.</p>

          <h2>9. Retention</h2>
          <p>We retain personal information for as long as reasonably necessary for the purposes described in this Policy, including to operate the Service, maintain account records, support moderation and abuse investigations, preserve security and workflow records, comply with legal obligations, resolve disputes, and enforce contractual or policy rights. Retention periods may vary depending on the nature of the data, the sensitivity of the information, the reason for collection, and applicable legal or operational requirements.</p>

          <h2>10. User choices and requests</h2>
          <p>You may update certain account, profile, notification, and consent settings through the Service. You may also contact us regarding privacy-related questions or requests using the contact information below. Because the Service includes public content, moderation workflows, security records, and backup or archival processes, removing information from active display may not immediately eliminate historical, backup, moderation, or legally retained copies.</p>

          <h2>11. International processing</h2>
          <p>Living In Korea operates from the Republic of Korea and uses service providers that may process information in other jurisdictions. By using the Service, you understand that information may be processed in Korea and in other countries where our service providers or infrastructure providers operate, subject to applicable safeguards and legal requirements.</p>

          <h2>12. Children</h2>
          <p>The Service is intended for users who are at least 14 years old. We do not knowingly provide the Service to children below that age threshold. If we become aware that information has been collected from a child below the minimum permitted age in a manner inconsistent with this Policy, we may take steps to restrict or delete the relevant account and information, subject to applicable law.</p>

          <h2>13. Security measures and limitations</h2>
          <p>We use administrative, technical, and organizational measures designed to help protect personal information. No method of transmission, storage, or electronic processing is completely secure, and we do not guarantee absolute security. Users are responsible for maintaining the confidentiality of their credentials and for using the Service responsibly.</p>

          <h2>14. Policy updates</h2>
          <p>We may revise this Privacy Policy from time to time. The revised version will be posted with an updated effective date and will apply from the stated effective date. Your continued use of the Service after the revised Policy becomes effective constitutes acknowledgment of the updated Policy to the extent permitted by law.</p>

          <h2>15. Contact</h2>
          <p>If you have questions or requests regarding this Privacy Policy, you may contact us at <a href="mailto:scottchmoon@gmail.com">scottchmoon@gmail.com</a>.</p>
        </div>
      </section>
    </div>
  );
}
