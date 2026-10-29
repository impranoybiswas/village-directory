import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "গ্রাম ডিরেক্টরি | Village Directory",
  description:
    "গ্রামের বাসিন্দাদের ডিজিটাল তথ্যভাণ্ডার, রক্তের গ্রুপ ও যোগাযোগের ডিরেক্টরি - Village Resident Directory & Member Management System",
  keywords: [
    "Village Directory",
    "গ্রাম ডিরেক্টরি",
    "Blood Group Finder",
    "Village Management",
  ],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bn"
      suppressHydrationWarning
      className={`${geist.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-cream-base text-earth-dark"
      >
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <footer className="border-t border-sand-border bg-cream-soft py-6 px-4 text-center text-sm text-earth-muted">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-forest-700 inline-block"></span>
              <p className="font-medium text-forest-800">
                গ্রাম ডিরেক্টরি &bull; Village Directory
              </p>
            </div>
            <p className="text-xs text-earth-subtle">
              মুজাফরাবাদ পল্লী উন্নয়ন সংস্থা &copy;{new Date().getFullYear()} 
            </p>
          </div>
        </footer>
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            style: {
              borderRadius: "12px",
              fontFamily: "inherit",
            },
          }}
        />
      </body>
    </html>
  );
}
