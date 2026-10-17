import { GlassCard, ReadingSurface } from "@/components/ui/glass";
import { loginAsDemo } from "@/actions/auth";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; redirect?: string; success?: string };
}) {
  const isDev = process.env.NODE_ENV !== "production";

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 sm:py-12 overflow-y-auto">
      <div className="w-full max-w-md my-auto">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-[1.5px] shadow-[0_0_30px_rgba(99,102,241,0.6)] mb-4">
            <div className="w-full h-full rounded-[14px] bg-[#0c0e1a]/85 backdrop-blur-md flex items-center justify-center">
              <span className="material-symbols-outlined text-sky-200 text-[28px]">
                neurology
              </span>
            </div>
          </div>
          <h1 className="font-['Space_Grotesk'] text-3xl font-bold tracking-tight text-white">
            Synapse<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-300">Med</span>
          </h1>
          <p className="text-slate-400 text-xs font-['Space_Grotesk'] uppercase tracking-widest mt-1">
            College Notes & Quiz Portal
          </p>
        </div>

        {/* Notifications */}
        {searchParams.error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-center font-medium">
            {searchParams.error === "unauthorized"
              ? "Access denied. Insufficient role permissions."
              : "Authentication required to access this portal."}
          </div>
        )}

        {searchParams.success === "account_created" && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs text-center font-medium">
            Account created successfully! Please sign in below.
          </div>
        )}

        {/* Liquid Glass Login Shell */}
        <GlassCard className="p-7">
          <h2 className="font-['Space_Grotesk'] text-lg font-bold text-white mb-2">
            Sign In to Portal
          </h2>
          <p className="text-slate-400 text-xs mb-6">
            Enter your institutional credentials below.
          </p>

          <LoginForm />

          {/* Quick Demo Login Switcher (Development Only) */}
          {isDev && (
            <div className="mt-6 pt-5 border-t border-white/[0.08]">
              <span className="block text-center text-[10px] font-['Space_Grotesk'] font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Local Testing Shortcuts (Dev Only)
              </span>
              <div className="grid grid-cols-2 gap-3">
                <form action={loginAsDemo.bind(null, "student")}>
                  <button
                    type="submit"
                    className="w-full py-2 px-3 rounded-xl liquid-btn-primary text-white text-xs font-['Space_Grotesk'] font-semibold hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-[0_4px_16px_rgba(99,102,241,0.3)]"
                  >
                    <span className="material-symbols-outlined text-[15px]">school</span>
                    <span>Student View</span>
                  </button>
                </form>

                <form action={loginAsDemo.bind(null, "admin")}>
                  <button
                    type="submit"
                    className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-['Space_Grotesk'] font-semibold active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[15px]">admin_panel_settings</span>
                    <span>Admin View</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Security Note */}
        <ReadingSurface className="mt-4 p-3 text-center text-[11px] text-slate-400 bg-black/40 border-white/5">
          Role-Based Access Control (RBAC) enforced at Edge Middleware & Server Actions.
        </ReadingSurface>
      </div>
    </div>
  );
}
