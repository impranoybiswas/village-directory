import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByEmail, syncUserLogin } from "@/lib/googleSheets";

export async function GET() {
  await connection();
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        role: null,
      });
    }

    let userRecord = await getUserByEmail(session.user.email);
    if (!userRecord) {
      userRecord = await syncUserLogin({
        id: session.user.id,
        name: session.user.name || "User",
        email: session.user.email,
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: session.user,
      role: userRecord.role,
      userRecord,
    });
  } catch (error) {
    console.error("Error fetching current user info:", error);
    return NextResponse.json(
      { error: "Failed to retrieve user session details" },
      { status: 500 }
    );
  }
}
