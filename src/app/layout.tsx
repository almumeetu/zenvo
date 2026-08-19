import type { Metadata } from 'next';
import './globals.css';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { AppStateProvider } from '@/lib/AppStateContext';
import { HeaderWrapper } from '@/components/HeaderWrapper';
import { Footer } from '@/components/Footer';
import { BackToTop } from '@/components/BackToTop';
import { GamingPreloader } from '@/components/GamingPreloader';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ZENOV Games — PSN, Steam, Xbox Gift Cards & Gaming Top-Up Bangladesh',
  description:
    'ZENOV Games is your trusted digital gaming store in Chattogram, Bangladesh. Buy PSN Gift Cards, Steam Gift Cards & Game Keys, Xbox Gift Cards, PS Plus Subscriptions, and gaming top-ups with fast digital delivery.',
  metadataBase: new URL('https://zenov.gg'),
  keywords: [
    'PSN gift card Bangladesh',
    'Steam gift card Bangladesh',
    'Xbox gift card Bangladesh',
    'PS Plus Bangladesh',
    'gaming top up',
    'free fire diamonds',
    'PUBG UC Bangladesh',
    'digital game store Bangladesh',
    'ZENOV Games',
    'Chattogram gaming store',
  ],
  authors: [{ name: 'ZENOV Games' }],
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'ZENOV Games — PSN, Steam, Xbox Gift Cards & Gaming Top-Up',
    description: 'Trusted digital gaming store in Bangladesh. PSN, Steam, Xbox, PS Plus & more — instant delivery.',
    type: 'website',
    siteName: 'ZENOV Games',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZENOV Games — Digital Gaming Store Bangladesh',
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
      <body className={`${inter.variable} ${jetbrainsMono.variable} min-h-screen bg-zenov-bg text-zenov-text font-sans antialiased flex flex-col`}>
        <GamingPreloader />
        <AppStateProvider>
          <HeaderWrapper />
          <main className="flex-1">{children}</main>
          <Footer />
          <BackToTop />
        </AppStateProvider>
      </body>
    </html>
  );
}
