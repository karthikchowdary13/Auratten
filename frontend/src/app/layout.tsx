import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/context/ToastContext';
import OfflineSync from '@/components/OfflineSync';

export const metadata: Metadata = {
  title: 'Auratten — QR Attendance Platform',
  description: 'Cloud-based QR code attendance tracking for institutions — built for students, teachers, and administrators.',
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
      </head>
      <body>
        <ToastProvider>
          {children}
          <OfflineSync />
        </ToastProvider>
      </body>
    </html>
  );
}
