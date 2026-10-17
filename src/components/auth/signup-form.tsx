"use client";

import { useFormState, useFormStatus } from "react-dom";
import { signupStudentAction } from "@/actions/auth";
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
          <span>Creating Account...</span>
        </>
      ) : (
        <>
          <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
          <span>Register Student Account</span>
        </>
      )}
    </button>
  );
}

export function SignupForm() {
  const [state, formAction] = useFormState(signupStudentAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-3.5">
      {state?.error && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] text-rose-400 shrink-0 mt-0.5">
              error
            </span>
            <span className="leading-snug">{state.error}</span>
          </div>
          {(state.error.includes("already exists") || state.error.includes("already registered")) && (
            <Link
              href="/login"
              className="mt-1 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-white font-semibold text-center transition-all inline-flex items-center justify-center gap-1.5"
            >
              <span>Sign In to existing account</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          )}
        </div>
      )}

      <div>
        <label className="block text-xs font-['Space_Grotesk'] font-semibold text-slate-300 mb-1">
          Full Name
        </label>
        <input
          name="fullName"
          type="text"
          required
          placeholder="Enter your full name"
          className="w-full h-10 px-3.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-400/70 focus:bg-white/[0.07] transition-all"
        />
      </div>

      <div>
        <label className="block text-xs font-['Space_Grotesk'] font-semibold text-slate-300 mb-1">
          Medical College Email
        </label>
        <input
          name="email"
          type="email"
          required
          placeholder="student@synapsemed.edu"
          className="w-full h-10 px-3.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-400/70 focus:bg-white/[0.07] transition-all"
        />
      </div>

      <div>
        <label className="block text-xs font-['Space_Grotesk'] font-semibold text-slate-300 mb-1">
          Roll / Student ID (Optional)
        </label>
        <input
          name="rollNumber"
          type="text"
          placeholder="e.g. MED-084"
          className="w-full h-10 px-3.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-400/70 focus:bg-white/[0.07] transition-all"
        />
      </div>

      <div>
        <label className="block text-xs font-['Space_Grotesk'] font-semibold text-slate-300 mb-1">
          Create Password
        </label>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="At least 6 characters"
          className="w-full h-10 px-3.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-400/70 focus:bg-white/[0.07] transition-all"
        />
      </div>

      <SubmitButton />

      <div className="mt-2 text-center text-xs text-slate-400">
        Already registered?{" "}
        <Link
          href="/login"
          className="text-sky-400 hover:text-sky-300 font-semibold underline underline-offset-4"
        >
          Sign In Here
        </Link>
      </div>
    </form>
  );
}
