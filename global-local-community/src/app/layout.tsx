import type { Metadata } from 'next';
import './globals.css';
import { SiteShell } from '@/components/site-shell';
import { Analytics } from '@/components/analytics';

export const metadata: Metadata = {
  title: 'Global Local Community',
  description: 'A high-signal community platform for foreigners living in Korea.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteShell>{children}</SiteShell>
        <Analytics />
      </body>
    </html>
  );
}
