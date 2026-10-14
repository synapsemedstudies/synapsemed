"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function loginAsDemo(role: "admin" | "student") {
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

export async function logoutAction() {
  const cookieStore = cookies();
  cookieStore.delete("demo_role");

  try {
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch {
    // ignore
  }

  redirect("/login");
}
