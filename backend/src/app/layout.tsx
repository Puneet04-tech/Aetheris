import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-900 text-white">
          {children}
        </div>
      </body>
    </html>
  );
}
