"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/gacha", label: "Gacha", src: "/shop.png" },
  { href: "/inventory", label: "Gear", src: "/gear.png" },
  { href: "/battle", label: "Battle", src: "/battle.png" },
  { href: "/pet", label: "Pet", src: "/pet.png" },
  { href: "/marketplace", label: "Market", src: "/shop.png" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="shrink-0 border-t bg-[#3A374A] pb-[max(0.5rem,env(safe-area-inset-bottom))] border-t-2 border-t-[#6D678F]"
      aria-label="Main navigation"
    >
      <div className="flex h-14 items-center justify-around py-8 pt-10">
        {TABS.map(({ href, label, src }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs transition-colors",
                "touch-manipulation active:bg-muted",
                "focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#3A374A]",
                isActive
                  ? "text-white font-medium"
                  : "text-muted-foreground hover:text-white/80"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <img
                src={src}
                alt=""
                width={40}
                height={40}
                className={cn(
                  "shrink-0 object-contain",
                  !isActive && "opacity-40"
                )}
                aria-hidden
              />
              <span className="font-pixelify text-lg">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
