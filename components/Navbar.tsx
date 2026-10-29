"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "@/lib/auth-client";
import {
  Users,
  Home,
  LogOut,
  User,
  ShieldCheck,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export interface UserInfo {
  role?: "pending" | "member" | "viewer" | "admin";
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch live role from Google Sheets
  useEffect(() => {
    if (!session?.user?.email) {
      return;
    }

    let ignore = false;
    fetch("/api/user/me")
      .then((res) => res.json())
      .then((data) => {
        if (!ignore && data.role) {
          setUserRole(data.role);
        }
      })
      .catch(() => {});

    return () => {
      ignore = true;
    };
  }, [session?.user?.email]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      toast.info("গুগল দিয়ে সাইন ইন করা হচ্ছে...", { duration: 3000 });
      await signIn.social({
        provider: "google",
        callbackURL: "/directory",
      });
    } catch (err) {
      console.error("Sign in error:", err);
      toast.error("সাইন ইন করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setDropdownOpen(false);
      setUserRole(null);
      toast.success("সফলভাবে সাইন আউট হয়েছেন");
      router.push("/");
    } catch {
      toast.error("সাইন আউট ব্যর্থ হয়েছে");
    }
  };

  const getRoleBadge = (role: string | null) => {
    switch (role) {
      case "admin":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-forest-800 text-white">
            <ShieldCheck className="w-3 h-3 text-forest-500" />
            অ্যাডমিন
          </span>
        );
      case "viewer":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-forest-100 text-forest-800">
            <Users className="w-3 h-3 text-forest-700" />
            দর্শক (Viewer)
          </span>
        );
      case "pending":
      case "member":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-clay-100 text-clay-700">
            <span className="w-1.5 h-1.5 rounded-full bg-clay-500 animate-pulse" />
            অপেক্ষমাণ (Pending)
          </span>
        );
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-cream-base/90 backdrop-blur-md border-b border-sand-border transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group transition-transform active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-forest-800 to-forest-700 flex items-center justify-center text-white shadow-sm shadow-forest-800/20 group-hover:scale-105 transition-transform">
              <Home className="w-5 h-5 text-forest-100" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base sm:text-lg text-forest-800 tracking-tight leading-none">
                  গ্রাম ডিরেক্টরি
                </span>
              </div>
              <p className="text-[11px] text-earth-subtle hidden sm:block">
                Village Member Management
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/"
                  ? "bg-forest-700 text-white"
                  : "text-earth-dark hover:bg-cream-soft hover:text-forest-800"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Home className="w-4 h-4" />
                তথ্য ফরম (Form)
              </span>
            </Link>

            <Link
              href="/directory"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/directory"
                  ? "bg-forest-700 text-white"
                  : "text-earth-dark hover:bg-cream-soft hover:text-forest-800"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                সদস্য তালিকা (Directory)
              </span>
            </Link>
          </nav>

          {/* Auth State Button / Dropdown */}
          <div className="flex items-center gap-2">
            {isPending ? (
              <div className="h-9 w-24 bg-sand-border animate-pulse rounded-full" />
            ) : session?.user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full border border-sand-border bg-white hover:bg-cream-soft transition-all shadow-xs"
                  aria-expanded={dropdownOpen}
                >
                  {session.user.image ? (
                    <Image
                      width={28}
                      height={28}
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="w-7 h-7 rounded-full object-cover border border-forest-700"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-terracotta-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                      {session.user.name?.charAt(0) || "U"}
                    </div>
                  )}
                  <span className="text-xs sm:text-sm font-medium text-earth-dark max-w-25 sm:max-w-28 truncate hidden xs:inline">
                    {session.user.name || "User"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-earth-subtle" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-sand-border shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2.5 border-b border-cream-soft bg-cream-base rounded-xl mb-1">
                      <p className="text-sm font-semibold text-forest-800 truncate">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-earth-muted truncate">
                        {session.user.email}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[11px] text-earth-subtle">
                          ভূমিকা (Role):
                        </span>
                        {getRoleBadge(userRole)}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setProfileModalOpen(true);
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-earth-dark hover:bg-cream-soft transition-colors"
                    >
                      <User className="w-4 h-4 text-forest-700" />
                      প্রোফাইল বিবরণ (Profile)
                    </button>

                    <Link
                      href="/directory"
                      onClick={() => setDropdownOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-earth-dark hover:bg-cream-soft transition-colors"
                    >
                      <Users className="w-4 h-4 text-forest-700" />
                      গ্রাম ডিরেক্টরি (Directory)
                    </Link>

                    <div className="my-1 border-t border-cream-soft" />

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-terracotta-500 hover:bg-clay-100 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-terracotta-500" />
                      সাইন আউট (Sign Out)
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-forest-800 hover:bg-forest-700 text-white text-xs sm:text-sm font-medium transition-all shadow-sm active:scale-95"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                <span>Google দিয়ে সাইন ইন</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-earth-muted hover:bg-cream-soft transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-sand-border bg-cream-base px-4 py-3 space-y-2 animate-in fade-in duration-150">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium ${
                pathname === "/"
                  ? "bg-forest-700 text-white"
                  : "text-earth-dark hover:bg-cream-soft"
              }`}
            >
              <Home className="w-4 h-4" />
              তথ্য ফরম (Entry Form)
            </Link>

            <Link
              href="/directory"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium ${
                pathname === "/directory"
                  ? "bg-forest-700 text-white"
                  : "text-earth-dark hover:bg-cream-soft"
              }`}
            >
              <Users className="w-4 h-4" />
              সদস্য তালিকা (Directory)
            </Link>

            {!session?.user && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleGoogleSignIn();
                }}
                className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-forest-800 text-white text-sm font-medium"
              >
                Google দিয়ে সাইন ইন
              </button>
            )}
          </div>
        )}
      </header>

      {/* Profile Modal */}
      {profileModalOpen && session?.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-cream-base rounded-3xl border border-sand-border shadow-2xl p-6 relative">
            <button
              onClick={() => setProfileModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-cream-soft text-earth-muted"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              {session.user.image ? (
                <Image
                  width={56}
                  height={56}
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-forest-700"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-terracotta-500 text-white flex items-center justify-center text-xl font-bold uppercase">
                  {session.user.name?.charAt(0) || "U"}
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-forest-800">
                  {session.user.name}
                </h3>
                <p className="text-xs text-earth-muted">{session.user.email}</p>
                <div className="mt-1">{getRoleBadge(userRole)}</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-sand-border space-y-2 text-xs text-earth-muted">
              <div className="flex justify-between py-1 border-b border-cream-soft">
                <span className="font-medium text-earth-dark">User ID:</span>
                <span className="font-mono text-[11px] truncate max-w-50">
                  {session.user.id}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-cream-soft">
                <span className="font-medium text-earth-dark">
                  অ্যাক্সেস লেভেল:
                </span>
                <span className="font-semibold text-forest-800 uppercase">
                  {userRole || "member"}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-medium text-earth-dark">ডাটাবেজ:</span>
                <span className="text-forest-700 font-medium">
                  Google Spreadsheet
                </span>
              </div>
            </div>

            {userRole === "member" && (
              <div className="mt-4 p-3.5 bg-clay-50 border border-clay-400/40 rounded-2xl text-xs text-clay-700">
                <p className="font-medium mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-clay-500"></span>
                  অনুমোদন প্রক্রিয়াধীন (Pending Approval)
                </p>
                <p>
                  আপনার অ্যাকাউন্টটি নিবন্ধিত হয়েছে। ডিরেক্টরি দেখতে অ্যাডমিন
                  কর্তৃক গুগল শিটে অনুমোদন প্রয়োজন।
                </p>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setProfileModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-cream-soft text-earth-dark hover:bg-sand-border transition-colors"
              >
                বন্ধ করুন (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
