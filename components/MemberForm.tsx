"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { memberFormSchema, MemberFormData } from "@/lib/validations";
import {
  User,
  Home,
  Phone,
  Droplet,
  Send,
  CheckCircle2,
  AlertCircle,
  HeartHandshake,
} from "lucide-react";
import { toast } from "sonner";

interface MemberFormProps {
  onSuccess?: () => void;
}

export default function MemberForm({ onSuccess }: MemberFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      fullName: "",
      houseName: "",
      gender: "Male",
      guardianType: "Father",
      guardianName: "",
      bloodGroup: "Unknown",
      mobileNumber: "",
    },
  });

  const selectedGender = watch("gender");
  const selectedGuardianType = watch("guardianType");

  // Handler for gender change to dynamically update guardian field default
  const handleGenderChange = (gender: "Male" | "Female") => {
    setValue("gender", gender, { shouldValidate: true });
    if (gender === "Male") {
      setValue("guardianType", "Father", { shouldValidate: true });
    } else {
      setValue("guardianType", "Husband", { shouldValidate: true });
    }
  };

  const onSubmit = async (data: MemberFormData) => {
    setIsSubmitting(true);
    const toastId = toast.loading("তথ্য সংরক্ষণ করা হচ্ছে...", {
      description: "গুগল স্প্রেডশিটে ডাটা পাঠানো হচ্ছে",
    });

    try {
      const response = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "সংরক্ষণ করতে ব্যর্থ হয়েছে");
      }

      // Optimistic toast success
      toast.success("সদস্য তথ্য সফলভাবে সংরক্ষিত হয়েছে!", {
        id: toastId,
        description: `${data.fullName} (${data.houseName}) এর তথ্য ডাটাবেজে যুক্ত হয়েছে।`,
        duration: 4000,
        icon: <CheckCircle2 className="w-5 h-5 text-forest-700" />,
      });

      // Automatic form reset
      reset({
        fullName: "",
        houseName: "",
        gender: "Male",
        guardianType: "Father",
        guardianName: "",
        bloodGroup: "Unknown",
        mobileNumber: "",
      });

      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "একটি ত্রুটি ঘটেছে";
      toast.error("তথ্য সংরক্ষণ করা যায়নি", {
        id: toastId,
        description: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl border border-sand-border p-5 sm:p-8 shadow-md shadow-earth-dark/5">
      {/* Header Inside Card */}
      <div className="flex items-center gap-3 pb-6 border-b border-cream-soft">
        <div className="w-12 h-12 rounded-2xl bg-forest-100 text-forest-800 flex items-center justify-center shrink-0">
          <HeartHandshake className="w-6 h-6 text-forest-700" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-forest-800">
            গ্রামবাসীর তথ্য নিবন্ধন ফরম
          </h2>
          <p className="text-xs sm:text-sm text-earth-muted">
            Village Resident Data Registration &bull; সব তথ্য সঠিক ও নির্ভরযোগ্য দিন
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold text-earth-dark mb-1.5">
            পূর্ণ নাম (Full Name) <span className="text-terracotta-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-earth-subtle">
              <User className="w-5 h-5" />
            </div>
            <input
              type="text"
              {...register("fullName")}
              placeholder="যেমন: প্রনয় বিশ্বাস"
              className={`w-full pl-11 pr-4 py-3 rounded-2xl bg-cream-base border text-sm text-earth-dark placeholder-earth-subtle transition-all focus:outline-hidden focus:ring-2 focus:ring-forest-700/20 focus:bg-white ${
                errors.fullName
                  ? "border-terracotta-500 focus:border-terracotta-500"
                  : "border-sand-border focus:border-forest-700"
              }`}
            />
          </div>
          {errors.fullName && (
            <p className="mt-1.5 text-xs text-terracotta-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.fullName.message}
            </p>
          )}
        </div>

        {/* House Name / Barir Nam */}
        <div>
          <label className="block text-sm font-semibold text-earth-dark mb-1.5">
            বাড়ির নাম (House Name / Barir Nam) <span className="text-terracotta-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-earth-subtle">
              <Home className="w-5 h-5" />
            </div>
            <input
              type="text"
              {...register("houseName")}
              placeholder="যেমন: বিশ্বাস বাড়ি / মাস্টার বাড়ি"
              className={`w-full pl-11 pr-4 py-3 rounded-2xl bg-cream-base border text-sm text-earth-dark placeholder-earth-subtle transition-all focus:outline-hidden focus:ring-2 focus:ring-forest-700/20 focus:bg-white ${
                errors.houseName
                  ? "border-terracotta-500 focus:border-terracotta-500"
                  : "border-sand-border focus:border-forest-700"
              }`}
            />
          </div>
          {errors.houseName && (
            <p className="mt-1.5 text-xs text-terracotta-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.houseName.message}
            </p>
          )}
        </div>

        {/* Gender Selection (Radio Group) */}
        <div>
          <label className="block text-sm font-semibold text-earth-dark mb-2">
            লিঙ্গ (Gender) <span className="text-terracotta-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleGenderChange("Male")}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-sm font-medium transition-all ${
                selectedGender === "Male"
                  ? "bg-forest-800 text-white border-forest-800 shadow-xs"
                  : "bg-cream-base text-earth-dark border-sand-border hover:bg-cream-soft"
              }`}
            >
              <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedGender === "Male" ? "border-white bg-forest-500" : "border-earth-subtle"}`} />
              পুরুষ (Male)
            </button>

            <button
              type="button"
              onClick={() => handleGenderChange("Female")}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-sm font-medium transition-all ${
                selectedGender === "Female"
                  ? "bg-forest-800 text-white border-forest-800 shadow-xs"
                  : "bg-cream-base text-earth-dark border-sand-border hover:bg-cream-soft"
              }`}
            >
              <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedGender === "Female" ? "border-white bg-forest-500" : "border-earth-subtle"}`} />
              মহিলা (Female)
            </button>
          </div>
          {errors.gender && (
            <p className="mt-1.5 text-xs text-terracotta-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.gender.message}
            </p>
          )}
        </div>

        {/* Dynamic Guardian Field */}
        <div className="p-4 rounded-2xl bg-cream-base border border-sand-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <label className="text-sm font-semibold text-forest-800">
              {selectedGender === "Male"
                ? "পিতার নাম (Father's Name)"
                : "স্বামী / পিতার নাম (Husband's / Father's Name)"}{" "}
              <span className="text-terracotta-500">*</span>
            </label>

            {/* Toggle guardianType if Female */}
            {selectedGender === "Female" && (
              <div className="inline-flex rounded-xl bg-white p-1 border border-sand-border">
                <button
                  type="button"
                  onClick={() => setValue("guardianType", "Husband")}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                    selectedGuardianType === "Husband"
                      ? "bg-forest-700 text-white"
                      : "text-earth-muted hover:text-forest-800"
                  }`}
                >
                  স্বামীর নাম
                </button>
                <button
                  type="button"
                  onClick={() => setValue("guardianType", "Father")}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                    selectedGuardianType === "Father"
                      ? "bg-forest-700 text-white"
                      : "text-earth-muted hover:text-forest-800"
                  }`}
                >
                  পিতার নাম
                </button>
              </div>
            )}
          </div>

          <input
            type="text"
            {...register("guardianName")}
            placeholder={
              selectedGender === "Male"
                ? "পিতার পূর্ণ নাম লিখুন"
                : selectedGuardianType === "Husband"
                ? "স্বামীর পূর্ণ নাম লিখুন"
                : "পিতার পূর্ণ নাম লিখুন"
            }
            className={`w-full px-4 py-3 rounded-xl bg-white border text-sm text-earth-dark placeholder-earth-subtle transition-all focus:outline-hidden focus:ring-2 focus:ring-forest-700/20 ${
              errors.guardianName
                ? "border-terracotta-500 focus:border-terracotta-500"
                : "border-sand-border focus:border-forest-700"
            }`}
          />

          {errors.guardianName && (
            <p className="mt-1.5 text-xs text-terracotta-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.guardianName.message}
            </p>
          )}
        </div>

        {/* Blood Group Dropdown */}
        <div>
          <label className="block text-sm font-semibold text-earth-dark mb-1.5">
            রক্তের গ্রুপ (Blood Group) <span className="text-terracotta-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-terracotta-500">
              <Droplet className="w-5 h-5 fill-terracotta-500/20" />
            </div>
            <select
              {...register("bloodGroup")}
              className={`w-full pl-11 pr-8 py-3 rounded-2xl bg-cream-base border text-sm text-earth-dark transition-all focus:outline-hidden focus:ring-2 focus:ring-forest-700/20 focus:bg-white appearance-none cursor-pointer ${
                errors.bloodGroup
                  ? "border-terracotta-500 focus:border-terracotta-500"
                  : "border-sand-border focus:border-forest-700"
              }`}
            >
              <option value="Unknown">জানা নেই (Unknown)</option>
              <option value="A+">A+ (এ পজিটিভ)</option>
              <option value="A-">A- (এ নেগেটিভ)</option>
              <option value="B+">B+ (বি পজিটিভ)</option>
              <option value="B-">B- (বি নেগেটিভ)</option>
              <option value="AB+">AB+ (এবি পজিটিভ)</option>
              <option value="AB-">AB- (এবি নেগেটিভ)</option>
              <option value="O+">O+ (ও পজিটিভ)</option>
              <option value="O-">O- (ও নেগেটিভ)</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-earth-subtle">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
          {errors.bloodGroup && (
            <p className="mt-1.5 text-xs text-terracotta-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.bloodGroup.message}
            </p>
          )}
        </div>

        {/* Mobile Number */}
        <div>
          <label className="block text-sm font-semibold text-earth-dark mb-1.5">
            মোবাইল নম্বর (Mobile Number) <span className="text-terracotta-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-forest-700">
              <Phone className="w-5 h-5" />
            </div>
            <input
              type="tel"
              {...register("mobileNumber")}
              placeholder="017XXXXXXXX"
              maxLength={11}
              className={`w-full pl-11 pr-4 py-3 rounded-2xl bg-cream-base border text-sm text-earth-dark placeholder-earth-subtle font-mono tracking-wider transition-all focus:outline-hidden focus:ring-2 focus:ring-forest-700/20 focus:bg-white ${
                errors.mobileNumber
                  ? "border-terracotta-500 focus:border-terracotta-500"
                  : "border-sand-border focus:border-forest-700"
              }`}
            />
          </div>
          <p className="mt-1 text-[11px] text-earth-subtle">
            ১১ ডিজিটের বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 01712345678)
          </p>
          {errors.mobileNumber && (
            <p className="mt-1.5 text-xs text-terracotta-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.mobileNumber.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-2xl bg-linear-to-r from-forest-800 to-forest-700 hover:from-forest-900 hover:to-forest-800 text-white font-semibold text-base flex items-center justify-center gap-2.5 shadow-md shadow-forest-800/20 active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>সংরক্ষণ হচ্ছে...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>তথ্য জমা দিন (Submit Data)</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
