"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { Swords, Crown, HeartPulse, Zap, Gift } from "lucide-react";
import type { DetectedEvent } from "@/hooks/use-event-detection";

interface EventFeedbackProps {
  event: DetectedEvent;
  onDismiss: () => void;
}

const CONFIG = {
  combat: {
    icon: Swords,
    bg: "bg-orange-600/90",
    format: (e: Extract<DetectedEvent, { type: "combat" }>) =>
      `Combat! +${e.gemsGained} gems${e.damageTaken > 0 ? `, -${e.damageTaken} HP` : ""}`,
  },
  boss: {
    icon: Crown,
    bg: "bg-purple-600/90",
    format: (e: Extract<DetectedEvent, { type: "combat" }>) =>
      `BOSS! +${e.gemsGained} gems${e.damageTaken > 0 ? `, -${e.damageTaken} HP` : ""}`,
  },
  heal: {
    icon: HeartPulse,
    bg: "bg-green-600/90",
    format: (e: Extract<DetectedEvent, { type: "heal" }>) =>
      `Healed! +${e.hpGained} HP`,
  },
  bad_event: {
    icon: Zap,
    bg: "bg-red-600/90",
    format: (e: Extract<DetectedEvent, { type: "bad_event" }>) =>
      `Trap! -${e.hpLost} HP`,
  },
  lucky_gacha: {
    icon: Gift,
    bg: "bg-amber-500/90",
    format: (e: Extract<DetectedEvent, { type: "lucky_gacha" }>) =>
      `Lucky! +${e.potionsGained} Potion`,
  },
} as const;

export function EventFeedback({ event, onDismiss }: EventFeedbackProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!event || !containerRef.current) return;

    const tl = gsap.timeline({
      onComplete: onDismiss,
    });

    tl.fromTo(
      containerRef.current,
      { y: 40, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.5)" }
    );
    tl.to(containerRef.current, {
      y: -20,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      delay: 2.2,
    });

    return () => { tl.kill(); };
  }, [event, onDismiss]);

  if (!event) return null;

  const key =
    event.type === "combat" && event.isBoss ? "boss" : event.type;
  const cfg = CONFIG[key];
  const Icon = cfg.icon;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const message = cfg.format(event as any);

  return (
    <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 pointer-events-none">
      <div
        ref={containerRef}
        className={`flex items-center gap-2 rounded-lg px-4 py-2.5 shadow-lg ${cfg.bg}`}
      >
        <Icon className="size-5 text-white" />
        <span className="text-sm font-bold text-white whitespace-nowrap">
          {message}
        </span>
      </div>
    </div>
  );
}
