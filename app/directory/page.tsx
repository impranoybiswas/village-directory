"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signIn } from "@/lib/auth-client";
import { VillageMember } from "@/lib/googleSheets";
import {
  Users,
  Search,
  Droplet,
  Phone,
  Home,
  ShieldCheck,
  Edit3,
  Trash2,
  RefreshCw,
  Clock,
  X,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

interface UserMeResponse {
  authenticated: boolean;
  role: "pending" | "member" | "viewer" | "admin" | null;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  } | null;
  userRecord?: {
    createdAt?: string;
    lastLogin?: string;
  };
}

export default function DirectoryPage() {
  const { data: session, isPending: isSessionPending } = useSession();

  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [userRecord, setUserRecord] = useState<{ createdAt?: string } | null>(
    null,
  );
  const [members, setMembers] = useState<VillageMember[]>([]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>("ALL");
  const [selectedGender, setSelectedGender] = useState<string>("ALL");

  // Sorting
  const [sortField, setSortField] = useState<keyof VillageMember>("fullName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Admin Modals
  const [editingMember, setEditingMember] = useState<VillageMember | null>(
    null,
  );
  const [deletingMember, setDeletingMember] = useState<VillageMember | null>(
    null,
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch User Role & Directory Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const userRes = await fetch("/api/user/me");
      const userData: UserMeResponse = await userRes.json();

      if (!userData.authenticated) {
        setLoading(false);
        return;
      }

      setRole(userData.role);
      setUserRecord(userData.userRecord || null);

      if (userData.role === "viewer" || userData.role === "admin") {
        const membersRes = await fetch("/api/members");
        const membersData = await membersRes.json();
        if (membersRes.ok && membersData.members) {
          setMembers(membersData.members);
        } else {
          toast.error("সদস্য তালিকা লোড করতে সমস্যা হয়েছে");
        }
      }
    } catch (err) {
      console.error("Error loading directory:", err);
      toast.error("ডাটা লোড ব্যর্থ হয়েছে। সংযোগ পরীক্ষা করুন।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadInitialData = async () => {
      try {
        const userRes = await fetch("/api/user/me");
        const userData: UserMeResponse = await userRes.json();
        if (ignore) return;

        if (!userData.authenticated) {
          setLoading(false);
          return;
        }

        setRole(userData.role);
        setUserRecord(userData.userRecord || null);

        if (userData.role === "viewer" || userData.role === "admin") {
          const membersRes = await fetch("/api/members");
          const membersData = await membersRes.json();
          if (ignore) return;
          if (membersRes.ok && membersData.members) {
            setMembers(membersData.members);
          } else {
            toast.error("সদস্য তালিকা লোড করতে সমস্যা হয়েছে");
          }
        }
      } catch (err) {
        if (!ignore) {
          console.error("Error loading directory:", err);
          toast.error("ডাটা লোড ব্যর্থ হয়েছে। সংযোগ পরীক্ষা করুন।");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      ignore = true;
    };
  }, [session]);

  // Filtering & Sorting logic
  const filteredMembers = useMemo(() => {
    return members
      .filter((m) => {
        // Query search
        const query = searchQuery.trim().toLowerCase();
        const matchesQuery =
          !query ||
          m.fullName.toLowerCase().includes(query) ||
          m.houseName.toLowerCase().includes(query) ||
          m.mobileNumber.toLowerCase().includes(query) ||
          m.guardianName.toLowerCase().includes(query);

        // Blood Group filter
        const matchesBlood =
          selectedBloodGroup === "ALL" ||
          m.bloodGroup.toUpperCase() === selectedBloodGroup.toUpperCase();

        // Gender filter
        const matchesGender =
          selectedGender === "ALL" || m.gender === selectedGender;

        return matchesQuery && matchesBlood && matchesGender;
      })
      .sort((a, b) => {
        const valA = (a[sortField] || "").toString().toLowerCase();
        const valB = (b[sortField] || "").toString().toLowerCase();
        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [
    members,
    searchQuery,
    selectedBloodGroup,
    selectedGender,
    sortField,
    sortOrder,
  ]);

  // Paginated records
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage) || 1;
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMembers.slice(start, start + itemsPerPage);
  }, [filteredMembers, currentPage, itemsPerPage]);

  const handleSort = (field: keyof VillageMember) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Admin: Update Member
  const handleUpdateMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingMember) return;
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/members/${editingMember.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingMember),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "আপডেট ব্যর্থ হয়েছে");

      setMembers((prev) =>
        prev.map((m) => (m.id === editingMember.id ? data.member : m)),
      );

      toast.success("সদস্য তথ্য সফলভাবে আপডেট হয়েছে!");
      setEditingMember(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "আপডেট করা যায়নি";
      toast.error(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  // Admin: Delete Member
  const handleDeleteMember = async () => {
    if (!deletingMember) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/members/${deletingMember.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ডিলিট ব্যর্থ হয়েছে");

      setMembers((prev) => prev.filter((m) => m.id !== deletingMember.id));
      toast.success("সদস্য তথ্য সফলভাবে মুছে ফেলা হয়েছে");
      setDeletingMember(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "মুছে ফেলা যায়নি";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = members.length;
    const bloodDonors = members.filter(
      (m) => m.bloodGroup && m.bloodGroup !== "Unknown",
    ).length;
    const uniqueHouses = new Set(members.map((m) => m.houseName.trim())).size;
    return { total, bloodDonors, uniqueHouses };
  }, [members]);

  // Loading skeleton
  if (isSessionPending || loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 gramin-pattern">
        <div className="w-12 h-12 border-3 border-forest-700/20 border-t-forest-700 rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-forest-800">
          ডিরেক্টরি ও অ্যাক্সেস লোড হচ্ছে...
        </p>
      </div>
    );
  }

  // 1. Unauthenticated View
  if (!session?.user) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 gramin-pattern">
        <div className="w-full max-w-md bg-white rounded-3xl border border-sand-border p-8 text-center shadow-xl shadow-earth-dark/5">
          <div className="w-16 h-16 rounded-2xl bg-cream-soft text-forest-800 flex items-center justify-center mx-auto mb-4 border border-sand-border">
            <Users className="w-8 h-8 text-forest-700" />
          </div>
          <h2 className="text-2xl font-bold text-forest-800 mb-2">
            সাইন ইন প্রয়োজন
          </h2>
          <p className="text-sm text-earth-muted mb-6">
            গ্রাম ডিরেক্টরি ও সদস্যদের তথ্য দেখতে অনুগ্রহ করে আপনার গুগল
            অ্যাকাউন্ট দিয়ে সাইন ইন করুন।
          </p>
          <button
            type="button"
            onClick={() =>
              signIn.social({ provider: "google", callbackURL: "/directory" })
            }
            className="w-full py-3.5 px-4 rounded-2xl bg-forest-800 hover:bg-forest-700 text-white font-medium text-sm transition-all flex items-center justify-center gap-2.5 shadow-md active:scale-95"
          >
            Google দিয়ে সাইন ইন করুন
          </button>
        </div>
      </div>
    );
  }

  // 2. Member / Pending Approval Screen
  if (role === "pending" || role === "member" || !role) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 gramin-pattern">
        <div className="w-full max-w-lg bg-white rounded-3xl border border-sand-border p-6 sm:p-8 shadow-xl shadow-earth-dark/5">
          {/* Header Warning Icon */}
          <div className="w-16 h-16 rounded-2xl bg-clay-100 text-terracotta-500 flex items-center justify-center mx-auto mb-5 border border-sand-border">
            <Clock className="w-8 h-8 text-clay-500 animate-pulse" />
          </div>

          <div className="text-center mb-6">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-clay-100 text-clay-700 border border-clay-400/40 mb-2">
              অনুমোদন অপেক্ষমাণ &bull; Access Pending
            </span>
            <h1 className="text-2xl font-bold text-forest-800">
              Access Pending Approval
            </h1>
            <p className="text-xs sm:text-sm text-terracotta-500 font-medium mt-2 leading-relaxed">
              &ldquo;Your account is registered. An administrator must upgrade
              your role in Google Sheets to grant directory access.&rdquo;
            </p>
          </div>

          {/* User Details Box */}
          <div className="bg-cream-base rounded-2xl p-4 sm:p-5 border border-sand-border space-y-3 mb-6">
            <div className="flex items-center gap-3 pb-3 border-b border-sand-border">
              {session.user.image ? (
                <Image
                  width={48}
                  height={48}
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-12 h-12 rounded-full border border-forest-700"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-terracotta-500 text-white flex items-center justify-center font-bold text-lg">
                  {session.user.name?.charAt(0) || "U"}
                </div>
              )}
              <div>
                <p className="font-bold text-sm text-forest-800">
                  {session.user.name}
                </p>
                <p className="text-xs text-earth-muted">{session.user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-earth-muted">
              <div>
                <span className="block text-[11px] text-earth-subtle">
                  বর্তমান ভূমিকা:
                </span>
                <span className="font-semibold text-clay-700">
                  সাধারণ সদস্য (Member)
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-earth-subtle">
                  নিবন্ধন সময়:
                </span>
                <span className="font-medium">
                  {userRecord?.createdAt
                    ? new Date(userRecord.createdAt).toLocaleDateString("bn-BD")
                    : "আজকে"}
                </span>
              </div>
            </div>
          </div>

          {/* Instructions for user / admin */}
          <div className="p-4 rounded-2xl bg-cream-soft border border-sand-border text-xs text-earth-muted space-y-2 mb-6">
            <p className="font-semibold text-forest-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-forest-700" />
              কীভাবে অ্যাক্সেস পাবেন?
            </p>
            <p>
              গ্রামের গোপনীয়তা ও নিরাপত্তা রক্ষার্থে শুধুমাত্র অনুমোদিত
              বাসিন্দাদের ডিরেক্টরি দেখার অনুমতি দেওয়া হয়। অ্যাডমিন গুগল
              স্প্রেডশিটের{" "}
              <code className="px-1.5 py-0.5 rounded bg-white font-mono text-[11px] text-forest-800 border border-sand-border">
                users
              </code>{" "}
              ট্যাবে আপনার রোল <strong>viewer</strong> অথবা{" "}
              <strong>admin</strong> পরিবর্তন করলেই সাথে সাথে ডিরেক্টরি উন্মুক্ত
              হবে।
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={fetchData}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>অনুমোদন চেক করুন (Check Status)</span>
            </button>

            <Link
              href="/"
              className="w-full sm:w-auto py-3 px-4 rounded-xl bg-cream-soft hover:bg-sand-border text-earth-dark text-xs sm:text-sm font-medium transition-colors text-center"
            >
              হোম পেজে ফিরুন
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authorized View (viewer or admin)
  return (
    <div className="flex-1 flex flex-col gramin-pattern py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-sand-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-forest-800">
                গ্রামবাসীদের ডিরেক্টরি
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-forest-100 text-forest-800 border border-forest-200">
                {role === "admin"
                  ? "অ্যাডমিন ভিউ (Admin)"
                  : "দর্শক ভিউ (Viewer)"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-earth-muted">
              গ্রামের সকল নিবন্ধিত সদস্য, পরিবার ও রক্তের গ্রুপের পূর্ণাঙ্গ
              তালিকা।
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/#member-form"
              className="px-4 py-2.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন সদস্য যুক্ত করুন</span>
            </Link>

            <button
              onClick={fetchData}
              title="রিফ্রেশ করুন"
              className="p-2.5 rounded-xl border border-sand-border bg-white hover:bg-cream-soft text-earth-dark transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white px-4 py-2 rounded-2xl border border-sand-border shadow-xs flex justify-between items-center">
            <div className="flex items-center gap-2 text-xs font-medium text-earth-muted ">
              <Users className="w-4 h-4 text-forest-700" />
              <span>মোট বাসিন্দা</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-forest-800">
              {stats.total}{" "}
              <span className="text-xs font-normal text-earth-subtle">জন</span>
            </p>
          </div>

          <div className="bg-white px-4 py-2 rounded-2xl border border-sand-border shadow-xs flex justify-between items-center">
            <div className="flex items-center gap-2 text-xs font-medium text-earth-muted ">
              <Home className="w-4 h-4 text-clay-500" />
              <span>পরিবার / বাড়ি</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-clay-700">
              {stats.uniqueHouses}{" "}
              <span className="text-xs font-normal text-earth-subtle">টি</span>
            </p>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-sand-border shadow-xs">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            {/* 1st Row on mobile / Flex-1 on desktop: Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-earth-subtle">
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="নাম, বাড়ির নাম বা মোবাইল নম্বর দিয়ে খুঁজুন..."
                className="w-full pl-10 sm:pl-11 pr-10 py-2.5 rounded-xl sm:rounded-2xl bg-cream-base border border-sand-border text-xs sm:text-sm text-earth-dark placeholder-earth-subtle focus:outline-hidden focus:ring-2 focus:ring-forest-700/20 focus:border-forest-700 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-earth-subtle hover:text-earth-dark cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* 2nd Row on mobile: Blood and Gender dropdowns side-by-side */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Blood Group Dropdown */}
              <div className="relative flex-1 sm:w-44">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-terracotta-500">
                  <Droplet className="w-4 h-4" />
                </div>
                <select
                  value={selectedBloodGroup}
                  onChange={(e) => {
                    setSelectedBloodGroup(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full appearance-none pl-9 pr-8 py-2.5 rounded-xl sm:rounded-2xl bg-cream-base border border-sand-border text-xs sm:text-sm font-medium text-earth-dark focus:outline-hidden focus:ring-2 focus:ring-forest-700/20 focus:border-forest-700 cursor-pointer transition-colors"
                >
                  <option value="ALL">সব রক্তের গ্রুপ</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                    (bg) => (
                      <option key={bg} value={bg}>
                        গ্রুপ {bg}
                      </option>
                    ),
                  )}
                </select>
                <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-earth-subtle">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              {/* Gender Dropdown */}
              <div className="relative flex-1 sm:w-36">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-forest-700">
                  <Users className="w-4 h-4" />
                </div>
                <select
                  value={selectedGender}
                  onChange={(e) => {
                    setSelectedGender(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full appearance-none pl-9 pr-8 py-2.5 rounded-xl sm:rounded-2xl bg-cream-base border border-sand-border text-xs sm:text-sm font-medium text-earth-dark focus:outline-hidden focus:ring-2 focus:ring-forest-700/20 focus:border-forest-700 cursor-pointer transition-colors"
                >
                  <option value="ALL">সকল লিঙ্গ</option>
                  <option value="Male">পুরুষ (Male)</option>
                  <option value="Female">মহিলা (Female)</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-earth-subtle">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              {/* Reset Filter Button */}
              {(searchQuery ||
                selectedBloodGroup !== "ALL" ||
                selectedGender !== "ALL") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedBloodGroup("ALL");
                    setSelectedGender("ALL");
                    setCurrentPage(1);
                  }}
                  title="ফিল্টার রিসেট করুন"
                  className="px-2.5 sm:px-3 py-2.5 rounded-xl sm:rounded-2xl border border-sand-border bg-cream-soft hover:bg-terracotta-50 text-terracotta-500 hover:border-terracotta-400 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">রিসেট</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Directory Results count */}
        <div className="flex items-center justify-between text-xs text-earth-muted px-1">
          <span>
            পাওয়া গেছে: <strong>{filteredMembers.length}</strong> জন বাসিন্দা
          </span>
          {totalPages > 1 && (
            <span>
              পৃষ্ঠা {currentPage} এর {totalPages}
            </span>
          )}
        </div>

        {/* Empty State */}
        {filteredMembers.length === 0 && (
          <div className="bg-white rounded-3xl border border-sand-border p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-cream-soft text-earth-subtle flex items-center justify-center mx-auto mb-3">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-forest-800">
              কোনো তথ্য পাওয়া যায়নি
            </h3>
            <p className="text-xs text-earth-muted mt-1 max-w-sm mx-auto">
              আপনার অনুসন্ধানের সাথে মিল রেখে কোনো সদস্য পাওয়া যায়নি। অন্য নাম
              বা ফিল্টার দিয়ে পুনরায় চেষ্টা করুন।
            </p>
          </div>
        )}

        {/* MOBILE VIEW: Card-Based List (< md screens) */}
        <div className="block md:hidden space-y-3">
          {paginatedMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-2xl border border-sand-border p-4 shadow-xs space-y-3"
            >
              {/* Card Top: Name & Blood Group Badge */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-forest-800 leading-tight">
                    {member.fullName}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-earth-muted mt-1">
                    <Home className="w-3.5 h-3.5 text-clay-500" />
                    <span className="font-medium text-earth-dark">
                      {member.houseName}
                    </span>
                    <span>&bull;</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                        member.gender === "Male"
                          ? "bg-forest-100 text-forest-800"
                          : "bg-clay-100 text-terracotta-500"
                      }`}
                    >
                      {member.gender === "Male" ? "পুরুষ" : "মহিলা"}
                    </span>
                  </div>
                </div>

                {/* Blood Group Badge */}
                <div
                  className={`px-2.5 py-1 rounded-xl font-bold text-xs flex items-center gap-1 shrink-0 ${
                    member.bloodGroup && member.bloodGroup !== "Unknown"
                      ? "bg-terracotta-500 text-white"
                      : "bg-cream-soft text-earth-subtle border border-sand-border"
                  }`}
                >
                  <Droplet className="w-3.5 h-3.5 fill-current" />
                  <span>{member.bloodGroup || "Unknown"}</span>
                </div>
              </div>

              {/* Guardian Info */}
              <div className="text-xs text-earth-muted bg-cream-base p-2.5 rounded-xl border border-cream-soft">
                <span className="text-earth-subtle">
                  {member.guardianType === "Husband" ? "স্বামী:" : "পিতা:"}{" "}
                </span>
                <span className="font-semibold text-earth-dark">
                  {member.guardianName || "দেওয়া নেই"}
                </span>
              </div>

              {/* Card Bottom: Quick Tap-to-Call & Admin Actions */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-cream-soft">
                {member.mobileNumber ? (
                  <a
                    href={`tel:${member.mobileNumber}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{member.mobileNumber}</span>
                  </a>
                ) : (
                  <span className="text-xs text-earth-subtle italic">
                    মোবাইল নম্বর নেই
                  </span>
                )}

                {/* Admin Actions */}
                {role === "admin" && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingMember(member)}
                      title="সম্পাদনা"
                      className="p-2 rounded-xl bg-cream-soft hover:bg-sand-border text-forest-700 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingMember(member)}
                      title="মুছে ফেলুন"
                      className="p-2 rounded-xl bg-clay-100 hover:bg-terracotta-100 text-terracotta-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP/TABLET VIEW: Structured Data Table (>= md screens) */}
        <div className="hidden md:block bg-white rounded-3xl border border-sand-border overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-cream-soft text-forest-800 text-xs font-bold uppercase tracking-wider border-b border-sand-border">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th
                    onClick={() => handleSort("fullName")}
                    className="py-3.5 px-4 cursor-pointer hover:text-forest-700"
                  >
                    নাম (Name){" "}
                    {sortField === "fullName" &&
                      (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSort("houseName")}
                    className="py-3.5 px-4 cursor-pointer hover:text-forest-700"
                  >
                    বাড়ির নাম{" "}
                    {sortField === "houseName" &&
                      (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="py-3.5 px-4">লিঙ্গ</th>
                  <th className="py-3.5 px-4">পিতা / স্বামী</th>
                  <th
                    onClick={() => handleSort("bloodGroup")}
                    className="py-3.5 px-4 cursor-pointer hover:text-forest-700"
                  >
                    রক্তের গ্রুপ{" "}
                    {sortField === "bloodGroup" &&
                      (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="py-3.5 px-4">মোবাইল নম্বর</th>
                  <th className="py-3.5 px-4 text-right">
                    {role === "admin" ? "অ্যাকশন" : "যোগাযোগ"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-soft">
                {paginatedMembers.map((member, index) => (
                  <tr
                    key={member.id}
                    className="hover:bg-cream-base transition-colors group"
                  >
                    <td className="py-3.5 px-4 text-center text-xs text-earth-subtle">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-forest-800">
                      {member.fullName}
                    </td>

                    <td className="py-3.5 px-4 text-earth-dark">
                      <div className="flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-clay-500" />
                        <span>{member.houseName}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          member.gender === "Male"
                            ? "bg-forest-100 text-forest-800"
                            : "bg-clay-100 text-terracotta-500"
                        }`}
                      >
                        {member.gender === "Male" ? "পুরুষ" : "মহিলা"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-earth-muted">
                      <span className="text-earth-subtle">
                        {member.guardianType === "Husband"
                          ? "স্বামী:"
                          : "পিতা:"}{" "}
                      </span>
                      {member.guardianName || "-"}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          member.bloodGroup && member.bloodGroup !== "Unknown"
                            ? "bg-terracotta-500 text-white shadow-2xs"
                            : "bg-cream-soft text-earth-subtle"
                        }`}
                      >
                        <Droplet className="w-3 h-3 fill-current" />
                        {member.bloodGroup || "Unknown"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs">
                      {member.mobileNumber ? (
                        <a
                          href={`tel:${member.mobileNumber}`}
                          className="text-forest-700 hover:text-forest-800 font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          {member.mobileNumber}
                        </a>
                      ) : (
                        <span className="text-earth-subtle">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {role === "admin" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingMember(member)}
                            className="p-1.5 rounded-lg text-forest-700 hover:bg-forest-100 transition-colors"
                            title="সম্পাদনা করুন"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingMember(member)}
                            className="p-1.5 rounded-lg text-terracotta-500 hover:bg-clay-100 transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : member.mobileNumber ? (
                        <a
                          href={`tel:${member.mobileNumber}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-forest-700 text-white text-xs hover:bg-forest-800 transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                          <span>কল করুন</span>
                        </a>
                      ) : (
                        <span className="text-xs text-earth-subtle">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-white border border-sand-border text-earth-dark hover:bg-cream-soft disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-xl text-xs font-semibold transition-all ${
                  currentPage === page
                    ? "bg-forest-700 text-white shadow-xs"
                    : "bg-white border border-sand-border text-earth-dark hover:bg-cream-soft"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-white border border-sand-border text-earth-dark hover:bg-cream-soft disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* ADMIN EDIT MODAL */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-sand-border shadow-2xl p-6 relative">
            <button
              onClick={() => setEditingMember(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-cream-soft text-earth-muted"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-cream-soft">
              <div className="w-10 h-10 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-forest-800">
                  সদস্য তথ্য সম্পাদনা (Admin Edit)
                </h3>
                <p className="text-xs text-earth-muted">
                  গুগল স্প্রেডশিটে পরিবর্তনসমূহ সরাসরি সংরক্ষিত হবে।
                </p>
              </div>
            </div>

            <form
              onSubmit={handleUpdateMember}
              className="space-y-4 text-xs sm:text-sm"
            >
              <div>
                <label className="block font-semibold text-earth-dark mb-1">
                  পূর্ণ নাম (Full Name)
                </label>
                <input
                  type="text"
                  required
                  value={editingMember.fullName}
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      fullName: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border bg-cream-base focus:bg-white focus:outline-hidden focus:border-forest-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-earth-dark mb-1">
                  বাড়ির নাম (House Name)
                </label>
                <input
                  type="text"
                  required
                  value={editingMember.houseName}
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      houseName: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border bg-cream-base focus:bg-white focus:outline-hidden focus:border-forest-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-earth-dark mb-1">
                    লিঙ্গ (Gender)
                  </label>
                  <select
                    value={editingMember.gender}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        gender: e.target.value as "Male" | "Female",
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-sand-border bg-cream-base focus:bg-white focus:outline-hidden focus:border-forest-700"
                  >
                    <option value="Male">পুরুষ (Male)</option>
                    <option value="Female">মহিলা (Female)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-earth-dark mb-1">
                    অভিভাবকের ধরন
                  </label>
                  <select
                    value={editingMember.guardianType}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        guardianType: e.target.value as "Father" | "Husband",
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-sand-border bg-cream-base focus:bg-white focus:outline-hidden focus:border-forest-700"
                  >
                    <option value="Father">পিতা (Father)</option>
                    <option value="Husband">স্বামী (Husband)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-earth-dark mb-1">
                  অভিভাবকের নাম (Guardian Name)
                </label>
                <input
                  type="text"
                  required
                  value={editingMember.guardianName}
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      guardianName: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border bg-cream-base focus:bg-white focus:outline-hidden focus:border-forest-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-earth-dark mb-1">
                    রক্তের গ্রুপ
                  </label>
                  <select
                    value={editingMember.bloodGroup}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        bloodGroup: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-sand-border bg-cream-base focus:bg-white focus:outline-hidden focus:border-forest-700"
                  >
                    <option value="Unknown">Unknown</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-earth-dark mb-1">
                    মোবাইল নম্বর
                  </label>
                  <input
                    type="tel"
                    required
                    value={editingMember.mobileNumber}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        mobileNumber: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border bg-cream-base font-mono focus:bg-white focus:outline-hidden focus:border-forest-700"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-cream-soft">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2.5 rounded-xl border border-sand-border hover:bg-cream-soft text-earth-muted transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-semibold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-60"
                >
                  {isUpdating ? "আপডেট হচ্ছে..." : "সংরক্ষণ করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN DELETE CONFIRMATION DIALOG */}
      {deletingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-sand-border shadow-2xl p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-clay-100 text-terracotta-500 flex items-center justify-center mx-auto mb-4 border border-sand-border">
              <AlertTriangle className="w-7 h-7 text-terracotta-500" />
            </div>

            <h3 className="text-xl font-bold text-forest-800 mb-1">
              সদস্য ডিলিট নিশ্চিতকরণ
            </h3>
            <p className="text-xs sm:text-sm text-earth-muted mb-4">
              আপনি কি নিশ্চিত যে আপনি <strong>{deletingMember.fullName}</strong>{" "}
              ({deletingMember.houseName}) এর রেকর্ডটি গুগল স্প্রেডশিট থেকে
              চিরতরে মুছে ফেলতে চান?
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingMember(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-sand-border hover:bg-cream-soft text-xs sm:text-sm font-medium text-earth-muted transition-colors"
              >
                না, বাতিল করুন
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteMember}
                className="flex-1 py-2.5 px-4 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs sm:text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {isDeleting ? "ডিলিট হচ্ছে..." : "হ্যাঁ, ডিলিট করুন"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
