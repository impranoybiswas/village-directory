import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "গ্রাম ডিরেক্টরি | মুজাফরাবাদ পল্লী উন্নয়ন সংস্থা",
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
        <Footer />
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
