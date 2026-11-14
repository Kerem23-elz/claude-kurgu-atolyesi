// Reels-specific visual effects for Dr. Tuba Öztürk Demir's medikal estetik channel.
// FrameBreak : angular corner frame that "breaks" outward — Reels hook & reveal moments
// StoryGlass : frosted-glass warm panel for V1 band overlay over footage
// DigitalZoom: re-export helper (the actual zoom runs in scripts/90-shorts.mjs; this component
//              adds a text callout synced to a punch-in moment)
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { color, motion, radius, type } from "../theme/theme";
import type { EventOf } from "../plan/schema";
import { useLocal } from "./shared";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const expo = Easing.bezier(0.16, 1, 0.3, 1);
const snap = Easing.bezier(0.34, 1.56, 0.64, 1);

// ── FrameBreak ─────────────────────────────────────────────────────────────────────────────────
// Full-screen angular frame with corner brackets. At `breakAt` the brackets fly outward and the
// text punches past them. Use for cold-open hooks and climax reveals (side: "full", layer: 2).
export const FrameBreak: React.FC<{ event: EventOf<"frame-break"> }> = ({ event }) => {
  const L = useLocal(event);
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { text, breakAt, sub } = event.content;

  const bf = L(breakAt);
  const inP = interpolate(frame, [0, Math.round(0.44 * fps)], [0, 1], { ...clamp, easing: expo });
  const breakP = interpolate(frame, [bf, bf + Math.round(0.26 * fps)], [0, 1], { ...clamp, easing: snap });
  const outP = interpolate(frame, [durationInFrames - Math.round(0.2 * fps), durationInFrames - 1], [0, 1], clamp);

  const W = 1920, H = 1080;
  const FX = 290, FY = 170; // frame inset
  const ARM = 88;            // corner bracket arm length
  const SW = 4.5;            // stroke width
  const off = breakP * 60;   // how far each corner travels outward

  type Corner = { x: number; y: number; d: string };
  const corners: Corner[] = [
    { x: FX - off, y: FY - off, d: `M0,${ARM} L0,0 L${ARM},0` },              // TL
    { x: W - FX - ARM + off, y: FY - off, d: `M0,0 L${ARM},0 L${ARM},${ARM}` }, // TR
    { x: FX - off, y: H - FY - ARM + off, d: `M0,0 L0,${ARM} L${ARM},${ARM}` }, // BL
    { x: W - FX - ARM + off, y: H - FY - ARM + off, d: `M${ARM},0 L${ARM},${ARM} L0,${ARM}` }, // BR
  ];

  return (
    <AbsoluteFill style={{ opacity: inP * (1 - outP) }}>
      <AbsoluteFill style={{ background: "rgba(9,6,2,0.90)" }} />
      {corners.map((c, i) => (
        <svg key={i} style={{ position: "absolute", left: c.x, top: c.y, opacity: 1 - breakP * 0.65 }}
          width={ARM} height={ARM} viewBox={`0 0 ${ARM} ${ARM}`}>
          <path d={c.d} fill="none" stroke={color.accent} strokeWidth={SW} strokeLinecap="square" />
        </svg>
      ))}
      <AbsoluteFill style={{
        alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 30,
        scale: String(1 + breakP * 0.055),
      }}>
        <div style={{
          ...type.headline, fontSize: 110, lineHeight: 1.0, letterSpacing: -2.8,
          color: color.text, textAlign: "center", maxWidth: 1300,
          textShadow: `0 0 ${breakP * 50}px ${color.accent}44`,
        }}>
          {text}
        </div>
        {sub ? (
          <div style={{
            ...type.body, fontSize: 36, color: color.textMuted,
            textAlign: "center", opacity: breakP, maxWidth: 1000,
          }}>
            {sub}
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── StoryGlass ─────────────────────────────────────────────────────────────────────────────────
// Warm frosted-glass side panel. Semi-transparent card with accent border glow — mirrors the
// Instagram Story notification aesthetic. Good for V1 Reels band (above the speaker's head).
// The blur simulates backdrop-filter which Remotion's headless renderer honours where supported.
export const StoryGlass: React.FC<{ event: EventOf<"story-glass"> }> = ({ event }) => {
  const L = useLocal(event);
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { kicker, headline, sub, subAt } = event.content;

  const side = event.side === "left" ? "left" : "right";
  const dir = side === "left" ? -1 : 1;
  const inP = interpolate(frame, [0, Math.round(0.30 * fps)], [0, 1], { ...clamp, easing: expo });
  const outP = interpolate(frame, [durationInFrames - Math.round(0.18 * fps), durationInFrames - 1], [0, 1], clamp);
  const subP = subAt !== undefined
    ? interpolate(frame, [L(subAt), L(subAt) + Math.round(0.28 * fps)], [0, 1], { ...clamp, easing: expo })
    : 1;

  return (
    <div style={{
      position: "absolute",
      top: 70,
      [side]: 58,
      width: 500,
      boxSizing: "border-box",
      padding: "26px 30px 28px",
      borderRadius: radius.lg,
      background: "rgba(26,15,5,0.76)",
      border: `1px solid rgba(235,124,20,0.32)`,
      boxShadow: `0 24px 60px rgba(0,0,0,0.44), inset 0 1px 0 rgba(255,244,227,0.07), 0 0 0 0.5px rgba(235,124,20,0.12)`,
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      display: "flex",
      flexDirection: "column",
      gap: 14,
      color: color.text,
      opacity: inP * (1 - outP),
      translate: `${(1 - inP) * motion.slide * dir}px 0px`,
    }}>
      {kicker ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 20, height: 3, borderRadius: 2, background: color.accent, flex: "none" }} />
          <span style={{ ...type.kicker, fontSize: 17, color: color.accent }}>{kicker}</span>
        </div>
      ) : null}
      <div style={{ ...type.headline, fontSize: 42, lineHeight: 1.08, letterSpacing: -0.4 }}>{headline}</div>
      {sub ? (
        <div style={{ ...type.body, fontSize: 25, color: color.textMuted, lineHeight: 1.32, opacity: subP }}>
          {sub}
        </div>
      ) : null}
    </div>
  );
};
