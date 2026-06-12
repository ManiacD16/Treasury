import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Treasury Withdrawal Dashboard',
  description: 'Multi-signature treasury withdrawal request and approval UI'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
