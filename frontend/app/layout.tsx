import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./client";

export const metadata: Metadata = {
  title: "Aetheris - The Unified Professional Ecosystem",
  description: "Connect, collaborate, and grow in the ultimate professional platform that combines the best of LinkedIn, GitHub, Behance, Discord, and more.",
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className="h-full antialiased scroll-smooth"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col mesh-background">
        <Providers>
          <main className="flex-1">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
