import type { Metadata } from 'next';
import './globals.css';
import { AppStateProvider } from '@/lib/AppStateContext';
import { HeaderWrapper } from '@/components/HeaderWrapper';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'ZENVO Games — PSN, Steam, Xbox Gift Cards & Gaming Top-Up Bangladesh',
  description:
    'ZENVO Games is your trusted digital gaming store in Chattogram, Bangladesh. Buy PSN Gift Cards, Steam Gift Cards & Game Keys, Xbox Gift Cards, PS Plus Subscriptions, and gaming top-ups with fast digital delivery.',
  metadataBase: new URL('https://zenvo.gg'),
  keywords: [
    'PSN gift card Bangladesh',
    'Steam gift card Bangladesh',
    'Xbox gift card Bangladesh',
    'PS Plus Bangladesh',
    'gaming top up',
    'free fire diamonds',
    'PUBG UC Bangladesh',
    'digital game store Bangladesh',
    'ZENVO Games',
    'Chattogram gaming store',
  ],
  authors: [{ name: 'ZENVO Games' }],
  openGraph: {
    title: 'ZENVO Games — PSN, Steam, Xbox Gift Cards & Gaming Top-Up',
    description: 'Trusted digital gaming store in Bangladesh. PSN, Steam, Xbox, PS Plus & more — instant delivery.',
    type: 'website',
    siteName: 'ZENVO Games',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZENVO Games — Digital Gaming Store Bangladesh',
    description: 'PSN, Steam, Xbox Gift Cards & Gaming Top-Ups with instant delivery.',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#070a10',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-zenvo-bg text-zenvo-text font-sans antialiased flex flex-col">
        <AppStateProvider>
          <HeaderWrapper />
          <main className="flex-1">{children}</main>
          <Footer />
        </AppStateProvider>
      </body>
    </html>
  );
}
