import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// Required for Leaflet maps to render correctly in Next.js
import "leaflet/dist/leaflet.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Weather App - Full Stack",
  description: "AI Engineer Intern Technical Assessment for PM Accelerator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50/50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 min-h-screen flex flex-col font-sans selection:bg-blue-500/30`}
      >
        <header className="w-full bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-200/50 dark:border-white/5 transition-all">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center py-4 px-6 md:px-8 gap-4">
            <h1 className="text-xl font-semibold tracking-tight">
              SkyCast.
            </h1>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              <p>AI Engineer Intern Assessment by <strong>Harshit</strong></p>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8">
          {children}
        </main>

        <footer className="w-full border-t border-gray-200/50 dark:border-white/5 py-12 px-6 mt-16 bg-white/30 dark:bg-[#0a0a0a]/30">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="max-w-md">
              <h2 className="text-sm font-semibold tracking-wide uppercase text-gray-400 dark:text-gray-500 mb-3">About PM Accelerator</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                The Product Manager Accelerator Program supports PM professionals through every stage of their career, helping students and leaders alike fulfill their aspirations.
              </p>
            </div>
            <div className="text-sm font-medium text-gray-400 dark:text-gray-500 flex-shrink-0 mt-auto">
              &copy; {new Date().getFullYear()} SkyCast
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
