import type { Metadata } from 'next';
import { Montserrat, Noto_Sans_SC } from 'next/font/google';
import './globals.css';

const noto = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  title: '3DThinkPro — 3D-Printed Motorcycle Seats',
  description: 'HIVE lattice motorcycle seats. A complete seat, not a cover. Built for your bike.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${noto.variable} ${montserrat.variable}`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
