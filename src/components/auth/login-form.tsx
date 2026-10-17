"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAction } from "@/actions/auth";
import Link from "next/link";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 w-full h-11 rounded-xl liquid-btn-primary text-white font-['Space_Grotesk'] text-sm font-semibold hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(99,102,241,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
          <span>Signing In...</span>
        </>
      ) : (
        <>
          <span className="material-symbols-outlined text-[18px]">login</span>
          <span>Sign In to Portal</span>
        </>
      )}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState(loginAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state?.error && (
        <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-center font-medium">
          {state.error}
        </div>
      )}

      <div>
        <label className="block text-xs font-['Space_Grotesk'] font-semibold text-slate-300 mb-1.5">
          Medical Email
        </label>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="e.g. admin@synapsemed.edu"
          className="w-full h-11 px-3.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-400/70 focus:bg-white/[0.07] transition-all"
        />
      </div>

      <div>
        <label className="block text-xs font-['Space_Grotesk'] font-semibold text-slate-300 mb-1.5">
          Password
        </label>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••••••"
          className="w-full h-11 px-3.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-400/70 focus:bg-white/[0.07] transition-all"
        />
      </div>

      <SubmitButton />

      <div className="mt-2 text-center text-xs text-slate-400">
        New Student?{" "}
        <Link
          href="/signup"
          className="text-sky-400 hover:text-sky-300 font-semibold underline underline-offset-4"
        >
          Create Student Account
        </Link>
      </div>
    </form>
  );
}
