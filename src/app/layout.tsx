import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SAT Blog Generator',
  description: 'AI-powered blog writing tool for SAT preparation content',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <header className="border-b bg-white/80 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4">
              <h1 className="text-2xl font-bold text-primary">
                📝 SAT Blog Generator
              </h1>
              <p className="text-sm text-muted-foreground">
                Generate SEO-optimized blog content for SAT preparation
              </p>
            </div>
          </header>
          <main className="container mx-auto px-4 py-8">{children}</main>
          <footer className="border-t bg-white/80 backdrop-blur-sm mt-auto">
            <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
              Powered by Claude AI · {new Date().getFullYear()}
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
