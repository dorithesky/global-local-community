import type { Metadata } from 'next';
import './globals.css';
import { SiteShell } from '@/components/site-shell';
import { Analytics } from '@/components/analytics';
import { ThemeProvider } from '@/components/theme-provider';
import { SessionGuard } from '@/components/session-guard';
import { validateServerEnv } from '@/lib/env';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://living-korea.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Living In Korea',
    template: '%s | Living In Korea',
  },
  description: 'An English-first community for foreigners building everyday life in Korea.',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Living In Korea',
    description: 'An English-first community for foreigners building everyday life in Korea.',
    type: 'website',
    images: ['/living-in-korea-logo.svg'],
  },
  twitter: {
    card: 'summary',
    title: 'Living In Korea',
    description: 'An English-first community for foreigners building everyday life in Korea.',
    images: ['/living-in-korea-logo.svg'],
  },
  icons: {
    icon: '/living-in-korea-logo.svg',
    shortcut: '/living-in-korea-logo.svg',
    apple: '/living-in-korea-logo.svg',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  validateServerEnv();

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <ThemeProvider>
          <SessionGuard />
          <SiteShell>{children}</SiteShell>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
