import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/context/ToastContext';
import OfflineSync from '@/components/OfflineSync';

export const metadata: Metadata = {
  title: 'Auratten — QR Attendance Platform',
  description: 'Cloud-based QR code attendance tracking for institutions — built for students, teachers, and administrators.',
  icons: {
    icon: [
      { url: '/auratten-logos/favicon.png' }
    ],
    apple: [
      { url: '/auratten-logos/logo-mobile.png' }
    ]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link href="https://fonts.googleapis.com/css2?family=Varela+Round&family=Dancing+Script:wght@700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/auratten-logos/favicon.png" />
        <link rel="shortcut icon" href="/auratten-logos/favicon.png" />
        <link rel="apple-touch-icon" href="/auratten-logos/logo-mobile.png" />
      </head>
      <body suppressHydrationWarning>
        <ToastProvider>
          {children}
          <OfflineSync />
        </ToastProvider>
      </body>
    </html>
  );
}
