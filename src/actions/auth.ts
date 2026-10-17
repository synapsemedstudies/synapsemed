"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://example.supabase.co";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "dummy_service_role_key";
  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Standard Email + Password Sign In Action
 */
export async function loginAction(
  prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please provide both email and password." };
  }

  const supabase = createServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: error?.message || "Invalid email or password." };
  }

  // Clear demo cookie if present
  const cookieStore = cookies();
  cookieStore.delete("demo_role");

  // Determine user role
  const [dbUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const role = dbUser?.role || data.user.user_metadata?.role || "student";

  if (role === "admin") {
    redirect("/admin");
  } else {
    redirect("/dashboard");
  }
}

/**
 * Student Self-Registration Action
 */
export async function signupStudentAction(
  prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const fullName = (formData.get("fullName") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const rollNumber = (formData.get("rollNumber") as string)?.trim() || null;
  const batchId = null;

  if (!fullName || !email || !password) {
    return { error: "Full Name, Email, and Password are required." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  // 1. Pre-flight check: Prevent collisions in PostgreSQL database
  try {
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      return { error: "An account with this email address already exists. Please sign in instead." };
    }

    if (rollNumber) {
      const [existingRoll] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.rollNumber, rollNumber))
        .limit(1);

      if (existingRoll) {
        return { error: `Student Roll Number "${rollNumber}" is already registered to another account.` };
      }
    }
  } catch (dbCheckErr) {
    console.warn("DB pre-flight check warning:", dbCheckErr);
  }

  const supabaseAdmin = getAdminClient();
  const totpSecret = null;

  // 2. Create in Supabase Auth with collision detection
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: "student",
      roll_number: rollNumber,
      batch_id: batchId,
    },
  });

  if (authError || !authData.user) {
    const errorMsg = authError?.message || "";
    if (
      errorMsg.toLowerCase().includes("already registered") ||
      errorMsg.toLowerCase().includes("already exists") ||
      (authError as { status?: number })?.status === 422
    ) {
      return { error: "An account with this email address already exists. Please sign in instead." };
    }
    return { error: errorMsg || "Could not create authentication account. Please try again." };
  }

  // 3. Insert into PostgreSQL users table with unique constraint rollback
  try {
    await db.insert(users).values({
      id: authData.user.id,
      email,
      fullName,
      role: "student",
      rollNumber,
      batchId,
      totpSecret,
    });
  } catch (err: unknown) {
    console.error("DB Insert Error on student signup:", err);
    // Rollback auth user if DB insert fails
    try {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    } catch {
      // ignore rollback deletion error
    }

    // Inspect Postgres unique constraint violation (Error code 23505)
    const pgErr = err as { code?: string; detail?: string; message?: string };
    if (
      pgErr?.code === "23505" ||
      pgErr?.message?.toLowerCase().includes("unique") ||
      pgErr?.detail?.toLowerCase().includes("already exists")
    ) {
      if (pgErr?.detail?.includes("roll_number") || pgErr?.message?.includes("roll_number")) {
        return { error: `Student Roll Number "${rollNumber}" is already registered.` };
      }
      return { error: "An account with this email address already exists. Please sign in instead." };
    }

    return { error: "Failed to create student profile in database. Please try again." };
  }

  // 3. Automatically sign in the new student
  const supabase = createServerClient();
  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInErr) {
    redirect("/login?success=account_created");
  }

  redirect("/dashboard");
}


/**
 * Fast Demo Login for local development and review
 */
export async function loginAsDemo(role: "admin" | "student") {
  // Only allow demo login in non-production environments
  if (process.env.NODE_ENV === "production") {
    redirect("/login?error=unauthorized");
  }

  const cookieStore = cookies();
  cookieStore.set("demo_role", role, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  if (role === "admin") {
    redirect("/admin");
  } else {
    redirect("/dashboard");
  }
}

/**
 * Sign out and clear active sessions
 */
export async function logoutAction() {
  const cookieStore = cookies();
  cookieStore.delete("demo_role");

  try {
    const supabase = createServerClient();
    await supabase.auth.signOut();
  } catch {
    // ignore
  }

  redirect("/login");
}
