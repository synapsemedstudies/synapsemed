import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { AmbientBackdrop } from "@/components/ui/glass";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SynapseMed — College Notes & Medical Quiz Portal",
  description: "Peer-reviewed clinical summaries, core diagnostic frameworks, and pharmacotherapy guidelines for medical students.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="bg-[#07080f] text-[#e2e8f0] font-sans antialiased min-h-screen relative overflow-x-hidden selection:bg-indigo-500/40 selection:text-white">
        <AmbientBackdrop />
        <div className="relative z-10 flex min-h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
