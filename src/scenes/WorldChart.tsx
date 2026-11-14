// WorldChart — full-screen animation scene for regional/global data (longevity, clinical study origins,
// treatment adoption rates…). A simplified globe silhouette sits behind growing horizontal bars.
// Pure functions of the frame; all values from event content — nothing invented.
// Place it as an L4 scene (side: "full", layer: 2) where the speech cites a global statistic.
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { color, radius, type } from "../theme/theme";
import type { EventOf } from "../plan/schema";
import { useLocal } from "../events/shared";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const expo = Easing.bezier(0.16, 1, 0.3, 1);
const inOut = Easing.bezier(0.65, 0, 0.35, 1);

// ── simplified world silhouette (SVG, decorative — no place names, no country boundaries) ──────
const GlobeSilhouette: React.FC<{ opacity: number }> = ({ opacity }) => (
  <svg
    style={{ position: "absolute", right: 100, top: "50%", translate: "0 -50%", opacity }}
    width={520} height={520} viewBox="0 0 520 520"
  >
    {/* outer circle */}
    <circle cx={260} cy={260} r={240} fill="none" stroke={color.accent} strokeWidth={1.2} strokeOpacity={0.18} />
    {/* latitude lines */}
    {[0.25, 0.5, 0.75].map((f) => (
      <ellipse key={f} cx={260} cy={260} rx={240 * Math.sin(Math.PI * f)} ry={22 * Math.sin(Math.PI * f) + 4}
        fill="none" stroke={color.accent} strokeWidth={0.9} strokeOpacity={0.1} />
    ))}
    {/* longitude arcs (simplified) */}
    {[-90, -45, 0, 45, 90].map((deg) => {
      const rad = (deg * Math.PI) / 180;
      const rx = 240 * Math.abs(Math.cos(rad));
      return <ellipse key={deg} cx={260} cy={260} rx={rx} ry={240}
        fill="none" stroke={color.accent} strokeWidth={0.9} strokeOpacity={0.08} />;
    })}
    {/* very simplified continent blobs (decorative, schematic) */}
    <path d="M120,160 Q150,120 200,130 Q240,120 250,160 Q260,190 230,200 Q200,210 170,200 Q130,195 120,160Z"
      fill={color.accent} opacity={0.09} />
    <path d="M200,220 Q220,215 240,230 Q255,245 245,265 Q230,280 215,270 Q200,260 200,240Z"
      fill={color.accent} opacity={0.09} />
    <path d="M270,130 Q320,110 370,130 Q410,150 400,190 Q390,230 350,235 Q310,240 285,215 Q265,195 270,160Z"
      fill={color.accent} opacity={0.09} />
    <path d="M340,250 Q380,240 400,260 Q415,275 405,295 Q390,315 365,310 Q340,305 335,285 Q330,265 340,250Z"
      fill={color.accent} opacity={0.09} />
    <path d="M110,240 Q130,225 155,235 Q175,245 170,265 Q165,285 145,290 Q120,290 112,268Z"
      fill={color.accent} opacity={0.07} />
  </svg>
);

// ── bar row ───────────────────────────────────────────────────────────────────────────────────
const BAR_MAX_W = 820;

const BarRow: React.FC<{ region: string; display: string; value: number; maxVal: number; atFrame: number; emphasis: boolean }> = ({
  region, display, value, maxVal, atFrame, emphasis,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [atFrame, atFrame + 28], [0, 1], { ...clamp, easing: expo });
  const barW = (value / maxVal) * BAR_MAX_W * p;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <div style={{ width: 300, ...type.body, fontSize: 26, textAlign: "right", flexShrink: 0, color: emphasis ? color.text : color.textMuted }}>
        {region}
      </div>
      <div style={{ position: "relative", height: 36, flex: "none", width: BAR_MAX_W }}>
        <div style={{ position: "absolute", inset: 0, background: `${color.line}44`, borderRadius: radius.sm }} />
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: barW, borderRadius: radius.sm,
          background: emphasis
            ? `linear-gradient(90deg, ${color.accent}99 0%, ${color.accent} 100%)`
            : `${color.line}`,
          boxShadow: emphasis ? `0 0 20px ${color.accent}44` : "none",
        }} />
      </div>
      <div style={{ ...type.body, fontSize: 27, fontWeight: 700, color: emphasis ? color.accent : color.textMuted, flexShrink: 0 }}>
        {p > 0.3 ? display : ""}
      </div>
    </div>
  );
};

// ── WorldChart ────────────────────────────────────────────────────────────────────────────────
export const WorldChart: React.FC<{ event: EventOf<"world-chart"> }> = ({ event }) => {
  const L = useLocal(event);
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { kicker, title, bars, footnote } = event.content;

  const inP = interpolate(frame, [0, Math.round(0.45 * fps)], [0, 1], { ...clamp, easing: expo });
  const outP = interpolate(frame, [durationInFrames - Math.round(0.3 * fps), durationInFrames - 1], [0, 1], { ...clamp, easing: inOut });
  const globeP = interpolate(frame, [0, Math.round(0.9 * fps)], [0, 1], { ...clamp, easing: inOut });

  const maxVal = Math.max(...bars.map((b) => b.value));

  return (
    <AbsoluteFill style={{ opacity: inP * (1 - outP) }}>
      <AbsoluteFill style={{ background: color.backdrop }} />
      <GlobeSilhouette opacity={globeP * 0.7} />
      {/* left panel: kicker + title + bars + footnote */}
      <AbsoluteFill style={{ alignItems: "flex-start", justifyContent: "center", padding: "0 0 0 110px", flexDirection: "column", gap: 28 }}>
        {/* kicker */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 24, height: 4, borderRadius: 2, background: color.accent, flex: "none" }} />
          <span style={{ ...type.kicker, color: color.accent, fontSize: 19 }}>{kicker}</span>
        </div>
        {/* title */}
        <div style={{ ...type.headline, fontSize: 50, lineHeight: 1.06, letterSpacing: -0.6, maxWidth: 920 }}>{title}</div>
        {/* bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 8 }}>
          {bars.map((b, i) => (
            <BarRow key={b.region}
              region={b.region}
              display={b.display}
              value={b.value}
              maxVal={maxVal}
              atFrame={L(b.at)}
              emphasis={b.value === maxVal}
            />
          ))}
        </div>
        {/* footnote */}
        {footnote ? (
          <div style={{ ...type.note, color: color.dim, marginTop: 4 }}>{footnote}</div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
