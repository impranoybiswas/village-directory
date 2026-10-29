import { betterAuth } from "better-auth";
import { getAuthDb } from "./db";
import { syncUserLogin } from "./googleSheets";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  database: getAuthDb(),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            if (user && user.email) {
              await syncUserLogin({
                id: user.id,
                name: user.name || "Unknown",
                email: user.email,
              });
            }
          } catch (err) {
            console.error("Failed to sync new user to Google Sheets:", err);
          }
        },
      },
    },
    session: {
      create: {
        after: async (session) => {
          try {
            const db = getAuthDb();
            const userRow = db
              .prepare('SELECT email, name FROM "user" WHERE id = ?')
              .get(session.userId) as { email: string; name: string } | undefined;
            if (userRow && userRow.email) {
              await syncUserLogin({
                id: session.userId,
                name: userRow.name || "Member",
                email: userRow.email,
              });
            }
          } catch (err) {
            console.error("Failed to sync session login to Google Sheets:", err);
          }
        },
      },
    },
  },
});
