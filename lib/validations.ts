import { z } from "zod";

// Bangladeshi phone regex: standard 11 digits starting with 01[3-9]
export const bdPhoneRegex = /^01[3-9]\d{8}$/;

export const memberFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "নাম অবশ্যই কমপক্ষে ২ অক্ষরের হতে হবে (Full name must be at least 2 characters)")
    .max(100, "নাম ১০০ অক্ষরের মধ্যে হতে হবে"),
  houseName: z
    .string()
    .trim()
    .min(2, "বাড়ির নাম আবশ্যক (House name is required)")
    .max(100, "বাড়ির নাম ১০০ অক্ষরের মধ্যে হতে হবে"),
  gender: z.enum(["Male", "Female"], {
    message: "অনুগ্রহ করে লিঙ্গ নির্বাচন করুন (Please select gender)",
  }),
  guardianType: z.enum(["Father", "Husband"], {
    message: "অভিভাবকের ধরন নির্বাচন করুন",
  }),
  guardianName: z
    .string()
    .trim()
    .min(2, "অভিভাবকের নাম আবশ্যক (Guardian name is required)")
    .max(100, "অভিভাবকের নাম ১০০ অক্ষরের মধ্যে হতে হবে"),
  bloodGroup: z.enum(
    ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"],
    {
      message: "রক্তের গ্রুপ নির্বাচন করুন",
    }
  ),
  mobileNumber: z
    .string()
    .trim()
    .regex(
      bdPhoneRegex,
      "সঠিক বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 01712345678)"
    ),
});

export type MemberFormData = z.infer<typeof memberFormSchema>;
