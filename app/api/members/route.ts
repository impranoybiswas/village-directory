import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { connection } from "next/server";
import { auth } from "@/lib/auth";
import {
  getMembers,
  addMember,
  getUserByEmail,
  syncUserLogin,
} from "@/lib/googleSheets";
import { memberFormSchema } from "@/lib/validations";

export async function GET() {
  await connection();
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in to view the directory." },
        { status: 401 }
      );
    }

    let userRecord = await getUserByEmail(session.user.email);
    if (!userRecord) {
      userRecord = await syncUserLogin({
        id: session.user.id,
        name: session.user.name || "User",
        email: session.user.email,
      });
    }

    const role = userRecord.role;

    // Check role access
    if (role !== "viewer" && role !== "admin") {
      return NextResponse.json(
        {
          error: "Access Pending Approval",
          role,
          message:
            "Your account is registered. An administrator must upgrade your role in Google Sheets to grant directory access.",
        },
        { status: 403 }
      );
    }

    const members = await getMembers();
    return NextResponse.json({
      members,
      role,
      user: session.user,
    });
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: "Failed to load directory members from Google Sheets." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  await connection();
  try {
    const body = await request.json();
    const validatedData = memberFormSchema.parse(body);

    // Check if user is logged in
    const reqHeaders = await headers();
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });

    const submittedByEmail = session?.user?.email || "Public";

    const newMember = await addMember({
      fullName: validatedData.fullName,
      houseName: validatedData.houseName,
      gender: validatedData.gender,
      guardianType: validatedData.guardianType,
      guardianName: validatedData.guardianName,
      bloodGroup: validatedData.bloodGroup,
      mobileNumber: validatedData.mobileNumber,
      submittedByEmail,
    });

    return NextResponse.json(
      { success: true, member: newMember },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating member record:", error);
    if (error && typeof error === "object" && "issues" in error) {
      return NextResponse.json(
        { error: "Validation failed", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to save village member record to Google Sheets." },
      { status: 500 }
    );
  }
}
