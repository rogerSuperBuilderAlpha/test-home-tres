import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TTB Label Verification | AI-Powered Label Compliance',
  description: 'AI-powered alcohol label verification app that simulates the TTB label approval process. Verify brand name, product type, alcohol content, and compliance requirements.',
  keywords: 'TTB, alcohol labels, label verification, compliance, OCR, AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    TTB Label Verification
                  </h1>
                  <p className="text-sm text-gray-600">
                    AI-Powered Alcohol Label Compliance Checker
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-grow">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="text-center text-sm text-gray-600">
                <p>
                  Built with Next.js, TypeScript, and OpenAI Vision API
                </p>
                <p className="mt-1">
                  This is a demonstration project for TTB label verification purposes.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

