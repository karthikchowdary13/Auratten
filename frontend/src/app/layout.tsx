import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/context/ToastContext';
import OfflineSync from '@/components/OfflineSync';
import PrismBackground from '@/components/PrismBackground';

export const metadata: Metadata = {
  title: 'Auratten',
  description: 'Smart Attendance, Powered by QR.',
  icons: {
    icon: [
      { url: '/auratten-logos/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/auratten-logos/favicon.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/auratten-logos/favicon.png',
    apple: '/auratten-logos/logo-mobile.png',
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:ital,wght@1,700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/auratten-logos/favicon.png" />
        <link rel="shortcut icon" href="/auratten-logos/favicon.png" />
        <link rel="apple-touch-icon" href="/auratten-logos/logo-mobile.png" />
      </head>
      <body suppressHydrationWarning className="min-h-screen bg-background relative selection:bg-primary/30 selection:text-white">
        <ToastProvider>
          {/* Fixed background layer */}
          <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
            <PrismBackground 
              animationType="3drotate"
              scale={3.5}
              glow={0.6}
              noise={0.3}
              timeScale={0.3}
              bloom={0.8}
            />
            {/* Subtle overlay to darken and blend further for readability */}
            <div className="absolute inset-0 bg-background/70 backdrop-blur-[1px]" />
          </div>

          {/* Content layer */}
          <div className="relative z-10 flex flex-col min-h-screen">
            {children}
            <OfflineSync />
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
