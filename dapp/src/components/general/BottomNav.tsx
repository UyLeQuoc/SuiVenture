"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dice1, Package, Swords, Cat } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/gacha", label: "Gacha", icon: Dice1 },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/battle", label: "Battle", icon: Swords },
  { href: "/pet", label: "Pet", icon: Cat },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      aria-label="Main navigation"
    >
      <div className="flex h-14 items-center justify-around">
        {TABS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs transition-colors",
                "touch-manipulation active:bg-muted",
                isActive
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
