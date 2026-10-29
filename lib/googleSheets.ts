import { google, sheets_v4 } from "googleapis";

let sheetsClient: sheets_v4.Sheets | null = null;
let membersSheetId: number | null = null;
let usersSheetId: number | null = null;

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: "pending" | "member" | "viewer" | "admin";
  createdAt: string;
  lastLogin: string;
}

export interface VillageMember {
  id: string;
  fullName: string;
  houseName: string;
  gender: "Male" | "Female";
  guardianType: "Father" | "Husband";
  guardianName: string;
  bloodGroup: string;
  mobileNumber: string;
  submittedByEmail: string;
  createdAt: string;
  updatedAt: string;
}

function getSheets(): sheets_v4.Sheets {
  if (sheetsClient) return sheetsClient;

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!email || !privateKey) {
    throw new Error(
      "Missing Google Service Account credentials (GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY)."
    );
  }

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  sheetsClient = google.sheets({ version: "v4", auth });
  return sheetsClient;
}

function getSpreadsheetId(): string {
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) {
    throw new Error("Missing GOOGLE_SHEET_ID in environment variables.");
  }
  return id;
}

/**
 * Ensure sheets metadata and cached sheet IDs are populated
 */
async function ensureMetadata() {
  const sheets = getSheets();
  const spreadsheetId = getSpreadsheetId();

  if (membersSheetId !== null && usersSheetId !== null) {
    return;
  }

  const res = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetList = res.data.sheets || [];

  for (const sheet of sheetList) {
    const title = sheet.properties?.title;
    const sId = sheet.properties?.sheetId ?? null;
    if (title === "members" && sId !== null) membersSheetId = sId;
    if (title === "users" && sId !== null) usersSheetId = sId;
  }

  // Create if missing
  const toAdd: string[] = [];
  if (membersSheetId === null) toAdd.push("members");
  if (usersSheetId === null) toAdd.push("users");

  if (toAdd.length > 0) {
    const requests = toAdd.map((title) => ({
      addSheet: { properties: { title } },
    }));
    const updateRes = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests },
    });

    updateRes.data.replies?.forEach((reply) => {
      const p = reply.addSheet?.properties;
      if (p?.title === "members" && p.sheetId !== undefined) membersSheetId = p.sheetId;
      if (p?.title === "users" && p.sheetId !== undefined) usersSheetId = p.sheetId;
    });

    // Write headers if we created them
    if (toAdd.includes("users")) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "users!A1:F1",
        valueInputOption: "RAW",
        requestBody: {
          values: [["id", "name", "email", "role", "createdAt", "lastLogin"]],
        },
      });
    }
    if (toAdd.includes("members")) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "members!A1:K1",
        valueInputOption: "RAW",
        requestBody: {
          values: [
            [
              "id",
              "fullName",
              "houseName",
              "gender",
              "guardianType",
              "guardianName",
              "bloodGroup",
              "mobileNumber",
              "submittedByEmail",
              "createdAt",
              "updatedAt",
            ],
          ],
        },
      });
    }
  }
}

// -------------------------------------------------------------
// USER / ROLE OPERATIONS
// -------------------------------------------------------------

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const sheets = getSheets();
  const spreadsheetId = getSpreadsheetId();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "users!A2:F",
  });

  const rows = res.data.values || [];
  const targetEmail = email.trim().toLowerCase();

  for (const row of rows) {
    const rowEmail = (row[2] || "").trim().toLowerCase();
    if (rowEmail === targetEmail) {
      return {
        id: row[0] || "",
        name: row[1] || "",
        email: row[2] || "",
        role: (row[3] || "member") as UserRecord["role"],
        createdAt: row[4] || "",
        lastLogin: row[5] || "",
      };
    }
  }

  return null;
}

export async function syncUserLogin({
  id,
  name,
  email,
}: {
  id: string;
  name: string;
  email: string;
}): Promise<UserRecord> {
  const sheets = getSheets();
  const spreadsheetId = getSpreadsheetId();
  await ensureMetadata();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "users!A2:F",
  });

  const rows = res.data.values || [];
  const targetEmail = email.trim().toLowerCase();
  const now = new Date().toISOString();

  let foundRowIndex = -1;
  let existingUser: UserRecord | null = null;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowEmail = (row[2] || "").trim().toLowerCase();
    if (rowEmail === targetEmail) {
      foundRowIndex = i + 2; // 1-based index (header is 1)
      existingUser = {
        id: row[0] || id,
        name: row[1] || name,
        email: row[2] || email,
        role: (row[3] || "member") as UserRecord["role"],
        createdAt: row[4] || now,
        lastLogin: now,
      };
      break;
    }
  }

  if (existingUser && foundRowIndex > 1) {
    // Update lastLogin in Google Sheet (Column F)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `users!F${foundRowIndex}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[now]],
      },
    });
    return existingUser;
  }

  // New user -> assign 'member' by default
  const newUser: UserRecord = {
    id,
    name,
    email,
    role: "member",
    createdAt: now,
    lastLogin: now,
  };

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "users!A:F",
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [[id, name, email, "member", now, now]],
    },
  });

  return newUser;
}

// -------------------------------------------------------------
// MEMBERS (VILLAGE RESIDENTS) OPERATIONS
// -------------------------------------------------------------

export async function getMembers(): Promise<VillageMember[]> {
  const sheets = getSheets();
  const spreadsheetId = getSpreadsheetId();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "members!A2:K",
  });

  const rows = res.data.values || [];
  return rows
    .filter((row) => row && row[0] && row[1]) // valid row has id and fullName
    .map((row) => {
      let mobile = (row[7] || "").toString().replace(/^'/, "").trim();
      if (mobile.length === 10 && mobile.startsWith("1")) {
        mobile = "0" + mobile;
      }
      return {
        id: row[0] || "",
        fullName: row[1] || "",
        houseName: row[2] || "",
        gender: (row[3] || "Male") as "Male" | "Female",
        guardianType: (row[4] || "Father") as "Father" | "Husband",
        guardianName: row[5] || "",
        bloodGroup: row[6] || "Unknown",
        mobileNumber: mobile,
        submittedByEmail: row[8] || "Public",
        createdAt: row[9] || "",
        updatedAt: row[10] || "",
      };
    });
}

export async function addMember(
  data: Omit<VillageMember, "id" | "createdAt" | "updatedAt">
): Promise<VillageMember> {
  const sheets = getSheets();
  const spreadsheetId = getSpreadsheetId();
  await ensureMetadata();

  const id = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newMember: VillageMember = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  };

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "members!A:K",
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [
        [
          newMember.id,
          newMember.fullName,
          newMember.houseName,
          newMember.gender,
          newMember.guardianType,
          newMember.guardianName,
          newMember.bloodGroup,
          `'${newMember.mobileNumber}`,
          newMember.submittedByEmail,
          newMember.createdAt,
          newMember.updatedAt,
        ],
      ],
    },
  });

  return newMember;
}

export async function updateMember(
  id: string,
  data: Partial<Omit<VillageMember, "id" | "createdAt">>
): Promise<VillageMember | null> {
  const sheets = getSheets();
  const spreadsheetId = getSpreadsheetId();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "members!A2:K",
  });

  const rows = res.data.values || [];
  let targetRowIndex = -1;
  let currentRecord: VillageMember | null = null;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row[0] === id) {
      targetRowIndex = i + 2; // 1-based, row 1 is header
      currentRecord = {
        id: row[0],
        fullName: row[1] || "",
        houseName: row[2] || "",
        gender: (row[3] || "Male") as "Male" | "Female",
        guardianType: (row[4] || "Father") as "Father" | "Husband",
        guardianName: row[5] || "",
        bloodGroup: row[6] || "Unknown",
        mobileNumber: row[7] || "",
        submittedByEmail: row[8] || "Public",
        createdAt: row[9] || "",
        updatedAt: row[10] || "",
      };
      break;
    }
  }

  if (!currentRecord || targetRowIndex < 2) {
    return null;
  }

  const now = new Date().toISOString();
  const updated: VillageMember = {
    ...currentRecord,
    ...data,
    updatedAt: now,
  };

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `members!A${targetRowIndex}:K${targetRowIndex}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        [
          updated.id,
          updated.fullName,
          updated.houseName,
          updated.gender,
          updated.guardianType,
          updated.guardianName,
          updated.bloodGroup,
          `'${updated.mobileNumber}`,
          updated.submittedByEmail,
          updated.createdAt,
          updated.updatedAt,
        ],
      ],
    },
  });

  return updated;
}

export async function deleteMember(id: string): Promise<boolean> {
  const sheets = getSheets();
  const spreadsheetId = getSpreadsheetId();
  await ensureMetadata();

  if (membersSheetId === null) {
    throw new Error("Unable to resolve sheetId for 'members'");
  }

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "members!A2:A",
  });

  const rows = res.data.values || [];
  let targetRowIndex = -1;

  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] === id) {
      targetRowIndex = i + 1; // 0-based row index in sheet, row 0 is header, so row 2 is index 1
      break;
    }
  }

  if (targetRowIndex === -1) {
    return false;
  }

  // Delete row using deleteDimension
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: membersSheetId,
              dimension: "ROWS",
              startIndex: targetRowIndex,
              endIndex: targetRowIndex + 1,
            },
          },
        },
      ],
    },
  });

  return true;
}
