import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { connection } from "next/server";
import { auth } from "@/lib/auth";
import {
  getUserByEmail,
  updateMember,
  deleteMember,
} from "@/lib/googleSheets";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  await connection();
  try {
    const { id } = await params;
    const reqHeaders = await headers();
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userRecord = await getUserByEmail(session.user.email);
    if (!userRecord || userRecord.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden. Admin privileges required to edit records." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updated = await updateMember(id, body);

    if (!updated) {
      return NextResponse.json(
        { error: "Member record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, member: updated });
  } catch (error) {
    console.error("Error updating member:", error);
    return NextResponse.json(
      { error: "Failed to update member in Google Sheets." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  await connection();
  try {
    const { id } = await params;
    const reqHeaders = await headers();
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userRecord = await getUserByEmail(session.user.email);
    if (!userRecord || userRecord.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden. Admin privileges required to delete records." },
        { status: 403 }
      );
    }

    const deleted = await deleteMember(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Member not found or could not be removed" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Member deleted successfully." });
  } catch (error) {
    console.error("Error deleting member:", error);
    return NextResponse.json(
      { error: "Failed to delete member from Google Sheets." },
      { status: 500 }
    );
  }
}
