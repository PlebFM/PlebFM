import '../styles/globals.css';
import { Metadata, Viewport } from 'next';
import { Footer } from './ui/Footer';
import { AvatarPreloader } from './ui/AvatarPreloader';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical avatar assets */}
        <link
          rel="preload"
          href="/Avatar/Loading.png"
          as="image"
          type="image/png"
        />
      </head>
      <body>
        {children}
        {/* Preload other avatars after page load */}
        <AvatarPreloader />
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: 'Home',
  description: 'Welcome to Next.js',
  icons: {
    icon: '/pleb-fm-favicon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
};
