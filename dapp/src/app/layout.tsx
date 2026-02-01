import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/general/Header";
import { BottomNav } from "@/components/general/BottomNav";
import { SuiProvider } from "@/contexts/SuiProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-[100dvh] flex flex-col`}
      >
        <SuiProvider>
          <Header />
          <main className="flex-1 w-full overflow-auto p-2xs pb-16">
            {children}
          </main>
          <BottomNav />
        </SuiProvider>
      </body>
    </html>
  );
}
