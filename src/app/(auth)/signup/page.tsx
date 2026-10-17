import { GlassCard, ReadingSurface } from "@/components/ui/glass";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 sm:py-12 overflow-y-auto">
      <div className="w-full max-w-md my-auto">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-[1.5px] shadow-[0_0_30px_rgba(99,102,241,0.6)] mb-3">
            <div className="w-full h-full rounded-[14px] bg-[#0c0e1a]/85 backdrop-blur-md flex items-center justify-center">
              <span className="material-symbols-outlined text-sky-200 text-[28px]">
                school
              </span>
            </div>
          </div>
          <h1 className="font-['Space_Grotesk'] text-3xl font-bold tracking-tight text-white">
            Student <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-300">Registration</span>
          </h1>
          <p className="text-slate-400 text-xs font-['Space_Grotesk'] uppercase tracking-widest mt-1">
            Join SynapseMed Learning Portal
          </p>
        </div>

        {/* Liquid Glass Signup Shell */}
        <GlassCard className="p-7">
          <h2 className="font-['Space_Grotesk'] text-lg font-bold text-white mb-1.5">
            Create Student Profile
          </h2>
          <p className="text-slate-400 text-xs mb-5">
            Fill in your college details to unlock notes and timed quizzes.
          </p>

          <SignupForm />
        </GlassCard>

        {/* Security Note */}
        <ReadingSurface className="mt-4 p-3 text-center text-[11px] text-slate-400 bg-black/40 border-white/5">
          Student accounts have personal quiz progress tracking and mistake notebook indexing.
        </ReadingSurface>
      </div>
    </div>
  );
}
