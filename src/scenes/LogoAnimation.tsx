// LogoAnimation — kapanış kartı animasyonu, Dr. Tuba Öztürk Demir logosu.
// Referans: Instagram logo draw-on animasyonu (stroke-dashoffset).
// PNG logo için: radial clip reveal + sparkle pulse + scale breath + fade-out.
// Kullanım: standalone Remotion composition (ayrı kapanış sahnesi).
import React from "react";
import {
  AbsoluteFill, Easing, Img, interpolate, spring, staticFile,
  useCurrentFrame, useVideoConfig,
} from "remotion";
import { color, font } from "../theme/theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const expo = Easing.bezier(0.16, 1, 0.3, 1);
const snap = Easing.bezier(0.34, 1.56, 0.64, 1);

// ── Sparkle yıldız — referans logodaki +/× şekilleri ───────────────────────
const Spark: React.FC<{ x: number; y: number; size: number; delay: number; rotation?: number }> = ({
  x, y, size, delay, rotation = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(frame, [delay, delay + Math.round(0.35 * fps)], [0, 1], { ...clamp, easing: snap });
  const pulse = interpolate(
    frame,
    [delay + Math.round(0.4 * fps), delay + Math.round(1.2 * fps), delay + Math.round(2.0 * fps)],
    [1, 1.18, 1],
    { ...clamp, easing: Easing.bezier(0.45, 0, 0.55, 1) }
  );
  const s = size * p * pulse;
  return (
    <svg
      style={{
        position: "absolute",
        left: x - s / 2,
        top: y - s / 2,
        rotate: `${rotation}deg`,
        filter: `drop-shadow(0 0 ${s * 0.4}px ${color.accent}88)`,
      }}
      width={s} height={s} viewBox="0 0 24 24"
    >
      {/* 4-kollu yıldız (+) */}
      <path
        d="M12 2 L13 11 L22 12 L13 13 L12 22 L11 13 L2 12 L11 11 Z"
        fill={color.accent}
        opacity={0.9}
      />
    </svg>
  );
};

// ── Yuvarlak ışıma halkası ────────────────────────────────────────────────────
const GlowRing: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(frame, [delay, delay + Math.round(1.2 * fps)], [0, 1], { ...clamp, easing: expo });
  const r = 240 + p * 80;
  return (
    <svg
      style={{ position: "absolute", left: "50%", top: "50%", translate: "-50% -50%", pointerEvents: "none" }}
      width={r * 2} height={r * 2} viewBox={`0 0 ${r * 2} ${r * 2}`}
    >
      <circle cx={r} cy={r} r={r - 4} fill="none" stroke={color.accent}
        strokeWidth={3} strokeOpacity={(1 - p) * 0.3} />
    </svg>
  );
};

// ── Ana bileşen ───────────────────────────────────────────────────────────────
export const LogoAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- zamanlama ---
  const IN_DUR   = Math.round(0.7 * fps);   // logo zoom-in süresi
  const HOLD     = Math.round(2.4 * fps);   // logo duruyor
  const OUT_START = IN_DUR + HOLD;
  const OUT_DUR  = Math.round(0.9 * fps);   // scale-down fade

  // logo giriş: scale 0.3 → 1 + opacity 0 → 1
  const logoScale = spring({ frame, fps, from: 0.3, to: 1,
    config: { mass: 0.9, damping: 14, stiffness: 180 }, delay: 0 });
  const logoOpIn  = interpolate(frame, [0, IN_DUR], [0, 1], { ...clamp, easing: expo });

  // logo çıkış: scale 1 → 0.6 + opacity 1 → 0
  const logoOpOut = interpolate(frame, [OUT_START, OUT_START + OUT_DUR], [0, 1], { ...clamp, easing: expo });
  const logoScaleOut = interpolate(frame, [OUT_START, OUT_START + OUT_DUR], [1, 0.6], { ...clamp, easing: expo });

  const logoOp    = logoOpIn * (1 - logoOpOut);
  const finalScale = frame < OUT_START ? logoScale : logoScaleOut;

  // metin satırları (handle + site) — sonra giriyor
  const textDelay = Math.round(0.5 * fps);
  const textP = interpolate(frame, [textDelay, textDelay + Math.round(0.4 * fps)], [0, 1], { ...clamp, easing: expo });

  // arka plan parlaklık: hafif radial glow merkeze
  const bgGlow = interpolate(frame, [0, IN_DUR], [0, 1], { ...clamp, easing: expo });

  return (
    <AbsoluteFill style={{ background: color.backdrop }}>
      {/* Sıcak radial glow zeminde */}
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse 820px 820px at 50% 48%, ${color.accent}18 0%, transparent 70%)`,
        opacity: bgGlow,
      }} />

      {/* İnce accent çember — referanstaki büyüyen halka */}
      <GlowRing delay={Math.round(0.3 * fps)} />

      {/* Sparkle yıldızlar — referans logodaki konumlarla eşleşmiş */}
      <Spark x={395} y={235} size={48} delay={Math.round(0.28 * fps)} rotation={0} />
      <Spark x={275} y={295} size={34} delay={Math.round(0.42 * fps)} rotation={22} />
      <Spark x={1480} y={225} size={28} delay={Math.round(0.55 * fps)} rotation={-15} />
      <Spark x={1540} y={310} size={42} delay={Math.round(0.38 * fps)} rotation={10} />
      <Spark x={1510} y={180} size={18} delay={Math.round(0.65 * fps)} rotation={45} />
      <Spark x={340}  y={340} size={22} delay={Math.round(0.72 * fps)} rotation={-30} />

      {/* Logo + metin bloğu — dikey ortalı */}
      <AbsoluteFill style={{
        display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 40,
      }}>
        {/* Logo PNG — reveal maskesi clip-path ile */}
        <div style={{
          opacity: logoOp,
          scale: String(finalScale),
          transformOrigin: "center center",
          filter: `drop-shadow(0 0 ${logoOp * 40}px ${color.accent}44)`,
          clipPath: `circle(${interpolate(frame, [0, IN_DUR], [0, 55], { ...clamp, easing: expo })}% at 50% 50%)`,
        }}>
          <Img src={staticFile("logo-t.png")} style={{ width: 320, height: "auto" }} />
        </div>

        {/* Handle ve site — logo görünürken text slide-up */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
          opacity: textP * logoOp,
          translate: `0px ${(1 - textP) * 24}px`,
        }}>
          <div style={{
            fontFamily: font.display,
            fontWeight: 700, fontSize: 52, letterSpacing: -0.8, lineHeight: 1,
            color: color.text,
          }}>
            @drtubaozturkdemir
          </div>
          <div style={{
            fontFamily: font.text,
            fontWeight: 500, fontSize: 30, letterSpacing: 0.5,
            color: color.textMuted,
          }}>
            drtubaozturkdemir.com
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
