"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { ShieldCheck, Eye, Lock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/directory";
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      toast.info("গুগল অথেনটিকেশনে নিয়ে যাওয়া হচ্ছে...", { duration: 3000 });
      await signIn.social({
        provider: "google",
        callbackURL: callbackUrl,
      });
    } catch (err) {
      console.error("Sign in failed:", err);
      toast.error("সাইন ইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      setIsSigningIn(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl border border-sand-border p-6 sm:p-8 shadow-xl shadow-earth-dark/5">
      {/* Brand Icon */}
      <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-forest-800 to-forest-700 text-white flex items-center justify-center mx-auto mb-5 shadow-md shadow-forest-800/20">
        <Lock className="w-8 h-8 text-forest-100" />
      </div>

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-forest-800">
          গ্রাম ডিরেক্টরিতে প্রবেশ
        </h1>
        <p className="text-xs sm:text-sm text-earth-muted mt-1">
          সদস্য তালিকা ও রক্তদাতাদের তথ্য দেখতে আপনার গুগল অ্যাকাউন্ট দিয়ে সাইন
          ইন করুন।
        </p>
      </div>

      {/* Google Sign In Button */}
      <button
        type="button"
        disabled={isSigningIn}
        onClick={handleGoogleSignIn}
        className="w-full py-3.5 px-4 rounded-2xl border-2 border-sand-border hover:border-forest-800 bg-cream-base hover:bg-white text-sm font-semibold text-forest-800 transition-all flex items-center justify-center gap-3 shadow-xs active:scale-[0.99] disabled:opacity-60"
      >
        {isSigningIn ? (
          <div className="w-5 h-5 border-2 border-forest-800/20 border-t-forest-800 rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.5 0 2.8.5 3.9 1.4l2.9-2.9C17 1.8 14.7 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.4 7.5 23 12 23z"
            />
          </svg>
        )}
        <span>Google দিয়ে সাইন ইন করুন</span>
      </button>

      {/* Role Access Information */}
      <div className="mt-8 pt-6 border-t border-cream-soft space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-earth-subtle">
          ভূমিকা ও নিরাপত্তা নীতিমালা (Role Levels):
        </p>

        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-cream-base border border-sand-border">
            <span className="w-2 h-2 rounded-full bg-clay-500 mt-1 shrink-0" />
            <div>
              <p className="font-semibold text-earth-dark">
                ১. সাধারণ সদস্য (Member / Pending):
              </p>
              <p className="text-earth-muted text-[11px]">
                প্রথম সাইন ইন করার পর অ্যাকাউন্টটি তৈরি হয়। ডিরেক্টরি দেখতে
                অ্যাডমিনের অনুমোদন প্রয়োজন।
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-cream-base border border-sand-border">
            <Eye className="w-3.5 h-3.5 text-forest-700 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-earth-dark">
                ২. ডিরেক্টরি দর্শক (Viewer):
              </p>
              <p className="text-earth-muted text-[11px]">
                অনুমোদনের পর সম্পূর্ণ সদস্য তালিকা দেখতে, রক্তদাতা ফিল্টার ও
                অনুসন্ধান করতে পারবেন।
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-cream-base border border-sand-border">
            <ShieldCheck className="w-3.5 h-3.5 text-terracotta-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-earth-dark">
                ৩. অ্যাডমিনিস্ট্রেটর (Admin):
              </p>
              <p className="text-earth-muted text-[11px]">
                ডিরেক্টরি পরিদর্শন ছাড়াও সদস্যদের তথ্য সম্পাদনা (Edit) ও ডিলিট
                করার পূর্ণ সুবিধা।
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Home */}
      <div className="mt-6 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-earth-muted hover:text-forest-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>হোম পেজে ফিরে যান</span>
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 gramin-pattern">
      <Suspense
        fallback={
          <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-8 border border-sand-border animate-pulse">
            <div className="w-16 h-16 bg-sand-border rounded-2xl mx-auto mb-4" />
            <div className="h-6 bg-sand-border rounded-md w-3/4 mx-auto mb-2" />
            <div className="h-4 bg-sand-border rounded-md w-1/2 mx-auto" />
          </div>
        }
      >
        <LoginContent />
      </Suspense>
    </div>
  );
}
