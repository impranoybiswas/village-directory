"use client";

import { useState, useEffect } from "react";

export default function Footer() {
  const [year, setYear] = useState<number>(2026);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t border-sand-border bg-cream-soft py-6 px-4 text-center text-sm text-earth-muted">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-forest-700 inline-block"></span>
          <p className="font-medium text-forest-800">
            গ্রাম ডিরেক্টরি &bull; Village Directory
          </p>
        </div>
        <p className="text-xs text-earth-subtle">
          মুজাফরাবাদ পল্লী উন্নয়ন সংস্থা &copy; {year}
        </p>
      </div>
    </footer>
  );
}
