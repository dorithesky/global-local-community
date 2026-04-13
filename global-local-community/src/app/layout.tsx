import type { Metadata } from 'next';
import './globals.css';
import { SiteShell } from '@/components/site-shell';
import { Analytics } from '@/components/analytics';
import { ThemeProvider } from '@/components/theme-provider';
import { SessionGuard } from '@/components/session-guard';
import { validateServerEnv } from '@/lib/env';

export const metadata: Metadata = {
  title: 'Global Local Community',
  description: 'A high-signal community platform for foreigners living in Korea.',
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
