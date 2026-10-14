---
name: liquid-glass-ui
description: Enforces Selective Liquid Glass UI tokens, specular inner borders, high-contrast reading surfaces, and the 3-layer mobile GPU blur cap across all pages and components.
---
# Selective Liquid Glass UI Skill

When building or styling any layout, page, or component:
1. Render a fixed ambient background in the root layout (`bg-slate-950` with subtle blurred radial gradient orbs in `indigo-500/15`, `cyan-500/10`, and `violet-500/15`) so translucent glass layers have rich depth to refract.
2. Use `<GlassCard>` (`backdrop-blur-xl bg-white/10 dark:bg-slate-900/45 border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_8px_32px_rgba(0,0,0,0.25)] rounded-2xl`) for floating navbars, sidebars, KPI cards, timer pills, and dropzones.
3. Use `<ReadingSurface>` (`bg-white/95 dark:bg-slate-950/90 border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-xl`) for inner PDF note canvases, quiz question stems, answer options, and explanations to guarantee WCAG >= 4.5:1 readability.
4. Never exceed 3 simultaneous `backdrop-blur` layers in a single viewport, and never place `backdrop-blur` on repeating `<tr>` or list rows.
