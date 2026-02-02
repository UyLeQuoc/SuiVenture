import type { Metadata } from "next";
import { Pixelify_Sans, Geist_Mono } from "next/font/google";
import { Header } from "@/components/general/Header";
import { BottomNav } from "@/components/general/BottomNav";
import { SuiProvider } from "@/contexts/SuiProvider";
import "./globals.css";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";

const pixelifySans = Pixelify_Sans({
  variable: "--font-pixelify-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SuiVenture",
  description:
    "Rogue-like dice dungeon crawler on Sui. Connect → Gacha Gear/Pet → Equip → Battle.",
};

/** Phone frame size (mobile-first). */
const PHONE_WIDTH = 390;
const PHONE_MAX_HEIGHT = "100dvh";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${pixelifySans.variable} ${geistMono.variable} font-pixelify antialiased min-h-[100dvh] flex flex-col items-center justify-center overflow-x-hidden`}
      >
        {/* Animated background: Lucide icon grid, depth-of-field */}
        <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
          <ShootingStars 
            starHeight={2}
            maxDelay={100} 
          />
          <StarsBackground />
        </div>
        <SuiProvider>
          {/* Fixed phone frame: mobile-first centered device */}
          <div
            className="relative flex w-full max-w-[var(--phone-width)] min-h-[var(--phone-min-height)]
             max-h-[var(--phone-max-height)] flex-col rounded-sm border border-black bg-background shadow-2xl shadow-black/30 overflow-hidden"
            style={
              {
                "--phone-width": `${PHONE_WIDTH}px`,
                "--phone-min-height": "100dvh",
                "--phone-max-height": PHONE_MAX_HEIGHT,
              } as React.CSSProperties
            }
          >
            <Header />
            <main className="flex-1 w-full overflow-auto p-2xs pb-16 min-h-0 bg-[#1D1C21]">
              {children}
            </main>
            <BottomNav />
          </div>
        </SuiProvider>
      </body>
    </html>
  );
}
