import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  role: "admin" | "student";
  rollNumber: string | null;
  batchId: string | null;
}

/**
 * Get current authenticated user, supporting Supabase SSR Auth
 * and local demo session cookies for seamless testing.
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = cookies();
  const demoRole = cookieStore.get("demo_role")?.value;

  // Local demo session for instant verification/prototyping
  if (demoRole === "admin") {
    return {
      id: "00000000-0000-0000-0000-000000000001",
      email: "admin@synapsemed.edu",
      fullName: "Dr. A. Vance",
      role: "admin",
      rollNumber: null,
      batchId: "batch-2025",
    };
  } else if (demoRole === "student") {
    return {
      id: "00000000-0000-0000-0000-000000000002",
      email: "student@synapsemed.edu",
      fullName: "Alex Rivera",
      role: "student",
      rollNumber: "MED-2025-084",
      batchId: "batch-2025",
    };
  }

  try {
    const supabase = createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser || !authUser.email) {
      return null;
    }

    // Fetch user details and role from Drizzle DB
    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, authUser.email))
      .limit(1);

    if (dbUser) {
      return {
        id: dbUser.id,
        email: dbUser.email,
        fullName: dbUser.fullName,
        role: dbUser.role as "admin" | "student",
        rollNumber: dbUser.rollNumber,
        batchId: dbUser.batchId,
      };
    }

    // Default metadata fallback if user exists in auth but not yet in DB table
    const metaRole = (authUser.user_metadata?.role as "admin" | "student") || "student";
    return {
      id: authUser.id,
      email: authUser.email,
      fullName: authUser.user_metadata?.full_name || authUser.email.split("@")[0],
      role: metaRole,
      rollNumber: authUser.user_metadata?.roll_number || null,
      batchId: authUser.user_metadata?.batch_id || null,
    };
  } catch {
    // If Supabase connection fails or is offline, return null
    return null;
  }
}

/**
 * Require an authenticated admin user.
 * Redirects to /login if unauthenticated, or throws/redirects if unauthorized.
 */
export async function requireAdmin(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?error=unauthenticated");
  }
  if (user.role !== "admin") {
    redirect("/dashboard?error=unauthorized");
  }
  return user;
}

/**
 * Require an authenticated student user.
 * Redirects to /login if unauthenticated, or redirects if unauthorized.
 */
export async function requireStudent(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?error=unauthenticated");
  }
  if (user.role !== "student") {
    redirect("/admin?error=unauthorized");
  }
  return user;
}
