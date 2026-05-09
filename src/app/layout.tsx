import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Quick Fixture Generator — Tournament Bracket Builder',
  description: 'Build beautiful tournament fixtures with auto group generation, visual brackets, and winner progression.',
  keywords: 'tournament, fixture, bracket, football, sports, group stage, knockout',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
