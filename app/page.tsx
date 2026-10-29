import Link from "next/link";
import MemberForm from "@/components/MemberForm";
import {
  Users,
  Droplet,
  Home,
  ShieldCheck,
  PhoneCall,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col gramin-pattern">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-b from-forest-800 to-forest-700 text-white pt-12 pb-20 px-4 sm:px-6">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none blur-2xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-clay-500/10 pointer-events-none blur-2xl" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-medium text-forest-100 mb-6">
            <span className="w-2 h-2 rounded-full bg-forest-500 animate-pulse" />
            <span>আমাদের গ্রাম, আমাদের বন্ধন &bull; ডিজিটাল তথ্যভাণ্ডার</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight sm:leading-tight mb-4">
            গ্রাম ডিরেক্টরি ও বাসিন্দা <br className="hidden sm:inline" />
            <span className="text-clay-500">ব্যবস্থাপনা প্ল্যাটফর্ম</span>
          </h1>

          {/* Tagline */}
          <p className="text-sm sm:text-lg text-forest-100/90 max-w-2xl mx-auto leading-relaxed mb-8">
            গ্রামের প্রতিটি পরিবারের তথ্য একত্রীকরণ, জরুরী রক্তের প্রয়োজনে
            রক্তদাতা অনুসন্ধান ও সামাজিক যোগাযোগের ডিজিটাল তথ্যভাণ্ডার।
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
            <a
              href="#member-form"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold text-sm sm:text-base transition-all shadow-lg shadow-terracotta-500/30 active:scale-95 flex items-center justify-center gap-2"
            >
              <span>নতুন সদস্য নিবন্ধন করুন</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <Link
              href="/directory"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-semibold text-sm sm:text-base transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4 text-forest-100" />
              <span>ডিরেক্টরি ও রক্তদাতা খুঁজুন</span>
            </Link>
          </div>

          {/* Feature Highlights Bar */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="flex items-center gap-2 mb-1">
                <Home className="w-4 h-4 text-clay-500" />
                <span className="text-xs font-semibold text-forest-100">
                  বাড়ির নাম
                </span>
              </div>
              <p className="text-[11px] text-white/70">
                বাড়িভিত্তিক সুবিন্যস্ত তথ্য
              </p>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="flex items-center gap-2 mb-1">
                <Droplet className="w-4 h-4 text-terracotta-500" />
                <span className="text-xs font-semibold text-forest-100">
                  রক্তের গ্রুপ
                </span>
              </div>
              <p className="text-[11px] text-white/70">
                জরুরী প্রয়োজনে রক্তদাতা
              </p>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="flex items-center gap-2 mb-1">
                <PhoneCall className="w-4 h-4 text-forest-500" />
                <span className="text-xs font-semibold text-forest-100">
                  সরাসরি কল
                </span>
              </div>
              <p className="text-[11px] text-white/70">মোবাইলে এক ক্লিকে কল</p>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-clay-500" />
                <span className="text-xs font-semibold text-forest-100">
                  নিরাপদ ডাটা
                </span>
              </div>
              <p className="text-[11px] text-white/70">Google Sheets ডাটাবেজ</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content: Member Collection Form Section */}
      <section
        id="member-form"
        className="py-12 sm:py-16 px-4 sm:px-6 -mt-8 relative z-20"
      >
        <div className="max-w-4xl mx-auto">
          {/* Section Subtitle */}
          <div className="text-center mb-8">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-clay-100 text-clay-700 border border-sand-border mb-2">
              তথ্য সংগ্রহ ও নিবন্ধন
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-forest-800">
              গ্রামের বাসিন্দা বা পরিবারের তথ্য যুক্ত করুন
            </h2>
            <p className="text-xs sm:text-sm text-earth-muted mt-1 max-w-lg mx-auto">
              নিচের ফরমটি পূরণ করে সহজেই আপনার পরিবার বা পরিচিত প্রতিবেশীর তথ্য
              সংরক্ষণ করুন।
            </p>
          </div>

          {/* Registration Form Component */}
          <MemberForm />

          {/* Transparency & Community Notice */}
          <div className="mt-8 p-4 sm:p-6 rounded-3xl bg-cream-soft border border-sand-border max-w-2xl mx-auto flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-clay-500/20 flex items-center justify-center shrink-0 text-clay-700 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-xs text-earth-muted space-y-1">
              <p className="font-semibold text-forest-800">
                গোপনীয়তা ও অনুমোদন নীতি:
              </p>
              <p>
                জমা দেওয়া তথ্য সরাসরি ক্লাউড গুগল স্প্রেডশিটে সংরক্ষিত হয়। তথ্য 
                ডিরেক্টরি তালিকা দেখতে আপনার গুগল অ্যাকাউন্ট দিয়ে সাইন ইন করুন।
                অননুমোদিত অ্যাক্সেস রোধে অ্যাডমিনের অনুমোদন প্রয়োজন।
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
