"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";

interface CombatEvent {
  type: "combat";
  gemsGained: number;
  damageTaken: number;
  isBoss: boolean;
}

interface BattleAnimationModalProps {
  event: CombatEvent;
  floor: number;
  onComplete: () => void;
}

/* ─── SVG: Knight (player) ─── */
function KnightSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 80" fill="none" className={className}>
      {/* Helmet */}
      <rect x="20" y="2" width="24" height="20" rx="4" fill="#A0A0B8" />
      <rect x="24" y="10" width="16" height="6" rx="1" fill="#3B3A50" />
      <rect x="30" y="4" width="4" height="6" rx="1" fill="#6D678F" />
      {/* Body / Armor */}
      <rect x="16" y="22" width="32" height="28" rx="4" fill="#6D678F" />
      <rect x="24" y="26" width="16" height="8" rx="2" fill="#5a5478" />
      <rect x="28" y="36" width="8" height="10" rx="1" fill="#5a5478" />
      {/* Sword arm (right) */}
      <rect x="48" y="24" width="8" height="20" rx="3" fill="#A0A0B8" />
      {/* Sword */}
      <rect x="50" y="8" width="4" height="18" rx="1" fill="#E0E0E8" />
      <rect x="46" y="22" width="12" height="4" rx="1" fill="#8B7E4F" />
      <circle cx="52" cy="8" r="2" fill="#E0E0E8" />
      {/* Shield arm (left) */}
      <rect x="8" y="24" width="8" height="18" rx="3" fill="#A0A0B8" />
      {/* Shield */}
      <rect x="2" y="26" width="12" height="14" rx="3" fill="#4A7BCC" />
      <rect x="6" y="30" width="4" height="6" rx="1" fill="#6BA3E8" />
      {/* Legs */}
      <rect x="20" y="50" width="10" height="16" rx="3" fill="#5a5478" />
      <rect x="34" y="50" width="10" height="16" rx="3" fill="#5a5478" />
      {/* Boots */}
      <rect x="18" y="62" width="14" height="6" rx="2" fill="#3B3A50" />
      <rect x="32" y="62" width="14" height="6" rx="2" fill="#3B3A50" />
    </svg>
  );
}

/* ─── SVG: Slime (normal enemy) ─── */
function SlimeSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 56" fill="none" className={className}>
      {/* Body blob */}
      <ellipse cx="32" cy="36" rx="28" ry="20" fill="#5DBF4D" />
      <ellipse cx="32" cy="38" rx="24" ry="16" fill="#72D660" />
      {/* Shine */}
      <ellipse cx="22" cy="30" rx="6" ry="4" fill="#A0EE90" opacity="0.6" />
      {/* Eyes */}
      <ellipse cx="24" cy="32" rx="5" ry="6" fill="white" />
      <ellipse cx="40" cy="32" rx="5" ry="6" fill="white" />
      <ellipse cx="25" cy="33" rx="3" ry="4" fill="#1a1a2e" />
      <ellipse cx="41" cy="33" rx="3" ry="4" fill="#1a1a2e" />
      {/* Mouth */}
      <path d="M26 42 Q32 46 38 42" stroke="#2a6e1e" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Drip */}
      <ellipse cx="12" cy="50" rx="4" ry="3" fill="#5DBF4D" opacity="0.5" />
      <ellipse cx="50" cy="52" rx="3" ry="2" fill="#5DBF4D" opacity="0.4" />
    </svg>
  );
}

/* ─── SVG: Demon (boss) ─── */
function DemonSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 72 80" fill="none" className={className}>
      {/* Horns */}
      <path d="M14 20 L6 2 L20 16Z" fill="#CC3333" />
      <path d="M58 20 L66 2 L52 16Z" fill="#CC3333" />
      {/* Head */}
      <rect x="16" y="12" width="40" height="24" rx="6" fill="#991111" />
      {/* Eyes */}
      <ellipse cx="28" cy="24" rx="5" ry="4" fill="#FFD700" />
      <ellipse cx="44" cy="24" rx="5" ry="4" fill="#FFD700" />
      <ellipse cx="29" cy="24" rx="2" ry="3" fill="#1a0505" />
      <ellipse cx="45" cy="24" rx="2" ry="3" fill="#1a0505" />
      {/* Mouth / fangs */}
      <path d="M24 32 L28 38 L32 32 L36 38 L40 32 L44 38 L48 32" stroke="#FFD700" strokeWidth="2" fill="none" />
      {/* Body */}
      <rect x="12" y="36" width="48" height="28" rx="6" fill="#7A0A0A" />
      <rect x="24" y="40" width="24" height="12" rx="3" fill="#991111" />
      {/* Arms */}
      <rect x="0" y="38" width="12" height="22" rx="4" fill="#991111" />
      <rect x="60" y="38" width="12" height="22" rx="4" fill="#991111" />
      {/* Claws */}
      <path d="M0 56 L-2 64 L4 58Z" fill="#CC3333" />
      <path d="M8 56 L6 64 L12 58Z" fill="#CC3333" />
      <path d="M64 56 L62 64 L68 58Z" fill="#CC3333" />
      <path d="M72 56 L70 64 L76 58Z" fill="#CC3333" />
      {/* Legs */}
      <rect x="18" y="64" width="14" height="14" rx="4" fill="#7A0A0A" />
      <rect x="40" y="64" width="14" height="14" rx="4" fill="#7A0A0A" />
    </svg>
  );
}

/* ─── Slash effect SVG ─── */
function SlashSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 48" fill="none" className={className}>
      <path d="M8 4 L32 20 L6 24 L34 36 L10 44" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M12 8 L28 22 L10 28 L30 38" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
    </svg>
  );
}

/* ─── Damage number ─── */
function DamageNumber({
  value,
  color,
  innerRef,
}: {
  value: string;
  color: string;
  innerRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={innerRef}
      className={`absolute text-2xl font-black ${color} opacity-0 pointer-events-none`}
      style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
    >
      {value}
    </div>
  );
}

export function BattleAnimationModal({
  event,
  floor,
  onComplete,
}: BattleAnimationModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const enemyRef = useRef<HTMLDivElement>(null);
  const slashPlayerRef = useRef<HTMLDivElement>(null);
  const slashEnemyRef = useRef<HTMLDivElement>(null);
  const dmgPlayerRef = useRef<HTMLDivElement>(null);
  const dmgEnemyRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ onComplete });

    // Phase 0: Overlay + title fade in
    tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 });
    tl.fromTo(
      titleRef.current,
      { y: -20, opacity: 0, scale: 0.8 },
      { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" },
      "-=0.1"
    );

    // Phase 1: Characters enter from sides
    tl.fromTo(
      playerRef.current,
      { x: -120, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.35, ease: "power2.out" },
      "-=0.1"
    );
    tl.fromTo(
      enemyRef.current,
      { x: 120, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.35, ease: "power2.out" },
      "-=0.3"
    );

    // Phase 2: Player attacks → slash on enemy
    tl.to(playerRef.current, { x: 40, duration: 0.15, ease: "power3.in" });
    tl.fromTo(
      slashEnemyRef.current,
      { opacity: 0, scale: 0.3, rotation: -30 },
      { opacity: 1, scale: 1.2, rotation: 10, duration: 0.2, ease: "power2.out" }
    );
    tl.to(playerRef.current, { x: 0, duration: 0.2, ease: "power2.out" }, "-=0.05");
    // Enemy recoil
    tl.to(enemyRef.current, { x: 15, duration: 0.08, ease: "power2.out" }, "-=0.2");
    tl.to(enemyRef.current, { x: 0, duration: 0.15, ease: "elastic.out(1, 0.5)" }, "-=0.05");
    // Slash fades
    tl.to(slashEnemyRef.current, { opacity: 0, duration: 0.15 }, "-=0.1");
    // +gems damage number floats up on enemy
    tl.fromTo(
      dmgEnemyRef.current,
      { y: 0, opacity: 0 },
      { y: -30, opacity: 1, duration: 0.3, ease: "power2.out" }
    );
    tl.to(dmgEnemyRef.current, { opacity: 0, duration: 0.2, delay: 0.3 });

    // Phase 3: Enemy attacks back (if damage taken)
    if (event.damageTaken > 0) {
      tl.to(enemyRef.current, { x: -40, duration: 0.15, ease: "power3.in" });
      tl.fromTo(
        slashPlayerRef.current,
        { opacity: 0, scale: 0.3, rotation: 30 },
        { opacity: 1, scale: 1.2, rotation: -10, duration: 0.2, ease: "power2.out" }
      );
      tl.to(enemyRef.current, { x: 0, duration: 0.2, ease: "power2.out" }, "-=0.05");
      // Player recoil
      tl.to(playerRef.current, { x: -15, duration: 0.08, ease: "power2.out" }, "-=0.2");
      tl.to(playerRef.current, { x: 0, duration: 0.15, ease: "elastic.out(1, 0.5)" }, "-=0.05");
      tl.to(slashPlayerRef.current, { opacity: 0, duration: 0.15 }, "-=0.1");
      // -HP damage number floats up on player
      tl.fromTo(
        dmgPlayerRef.current,
        { y: 0, opacity: 0 },
        { y: -30, opacity: 1, duration: 0.3, ease: "power2.out" }
      );
      tl.to(dmgPlayerRef.current, { opacity: 0, duration: 0.2, delay: 0.2 });
    }

    // Phase 4: Enemy defeated (scale down + fade)
    tl.to(enemyRef.current, {
      scale: 0,
      rotation: 20,
      opacity: 0,
      duration: 0.3,
      ease: "back.in(2)",
    });

    // Phase 5: Result text
    tl.fromTo(
      resultRef.current,
      { scale: 0.5, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(2)" }
    );

    // Phase 6: Auto-dismiss
    tl.to(overlayRef.current, { opacity: 0, duration: 0.3, delay: 1.0 });

    return () => { tl.kill(); };
  }, [event, onComplete]);

  const isBoss = event.isBoss;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/80" />

      <div className="relative z-10 w-[360px] h-[280px]">
        {/* Title */}
        <div ref={titleRef} className="absolute top-0 left-0 right-0 text-center">
          <span
            className={`text-lg font-black ${isBoss ? "text-purple-400" : "text-orange-400"}`}
          >
            {isBoss ? `BOSS - Floor ${floor}` : "Combat!"}
          </span>
        </div>

        {/* Arena */}
        <div className="absolute top-10 left-0 right-0 bottom-10 flex items-center justify-between px-6">
          {/* Player side */}
          <div className="relative flex flex-col items-center">
            <div ref={playerRef} className="relative">
              <KnightSVG className="w-20 h-24" />
              {/* Slash on player */}
              <div
                ref={slashPlayerRef}
                className="absolute inset-0 flex items-center justify-center opacity-0"
              >
                <SlashSVG className="w-12 h-14" />
              </div>
            </div>
            {/* Damage on player */}
            <DamageNumber
              innerRef={dmgPlayerRef}
              value={`-${event.damageTaken}`}
              color="text-red-400"
            />
            <span className="text-[10px] text-gray-400 mt-1">You</span>
          </div>

          {/* VS */}
          <div className="text-gray-600 font-black text-xl">VS</div>

          {/* Enemy side */}
          <div className="relative flex flex-col items-center">
            <div ref={enemyRef} className="relative">
              {isBoss ? (
                <DemonSVG className="w-22 h-24" />
              ) : (
                <SlimeSVG className="w-20 h-18" />
              )}
              {/* Slash on enemy */}
              <div
                ref={slashEnemyRef}
                className="absolute inset-0 flex items-center justify-center opacity-0"
              >
                <SlashSVG className="w-12 h-14" />
              </div>
            </div>
            {/* Gems on enemy */}
            <DamageNumber
              innerRef={dmgEnemyRef}
              value={`+${event.gemsGained} gems`}
              color="text-cyan-300"
            />
            <span className="text-[10px] text-gray-400 mt-1">
              {isBoss ? "Boss" : `Enemy F${floor}`}
            </span>
          </div>
        </div>

        {/* Result */}
        <div
          ref={resultRef}
          className="absolute bottom-0 left-0 right-0 text-center opacity-0"
        >
          <div
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white ${
              isBoss ? "bg-purple-600/90" : "bg-orange-600/90"
            }`}
          >
            <span>Victory!</span>
            <span className="text-cyan-200">+{event.gemsGained} gems</span>
            {event.damageTaken > 0 && (
              <span className="text-red-300">-{event.damageTaken} HP</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
