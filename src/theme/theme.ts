// MARKA TOKENLARI — Uzm. Dr. Tuba Öztürk Demir · Medikal Estetik & Longevity
// "Doğal Güzelliğin Bilimle Buluştuğu Yer" · Turuncu-krem sıcaklığı, zarif serif başlık
// Tüm bileşenler değerleri buradan okur. Single source of truth.
//
// Fontlar local olarak public/fonts/ klasöründen yüklenir (proxy CA sorunundan kaçınmak için).
// Remotion'ın continueRender/delayRender mekanizması Root.tsx'te yönetilir.
import { continueRender, delayRender, staticFile } from "remotion";

// Font family isimleri @remotion/google-fonts paket meta verisiyle eşleşmeli
export const FONT_DISPLAY = "Cormorant Garamond";
export const FONT_TEXT = "DM Sans";
export const FONT_MONO = "JetBrains Mono";

// Çağrıldığında local CSS dosyasını document'e ekler ve render'ı bekletir.
export function loadLocalFonts(): void {
  if (typeof document === "undefined") return;
  const id = "__local-fonts-css__";
  if (document.getElementById(id)) return; // zaten yüklendi
  const handle = delayRender("local-fonts");
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = staticFile("fonts/fonts.css");
  link.onload = () => continueRender(handle);
  link.onerror = () => continueRender(handle); // font olmasa da devam et
  document.head.appendChild(link);
}

export const font = {
  display: `"${FONT_DISPLAY}", Georgia, serif`,
  text: `"${FONT_TEXT}", sans-serif`,
  mono: `"${FONT_MONO}", ui-monospace, monospace`,
};

// sRGB authoring values. In the HLG master, #FFFFFF maps to 203 cd/m² (75 % HLG) — never pure white surfaces.
export const color = {
  ink: "#1A0F05",        // panel surface — sıcak koyu kahve
  inkRaised: "#2A1800",  // panel içi yükseltilmiş yüzey
  line: "#3D2410",       // panel kenarlık / ayırıcı
  text: "#FFF4E3",       // krem beyaz metin — sıcak, göz yormaz
  textMuted: "#C4A882",  // ikincil metin, kicker
  accent: "#EB7C14",     // turuncu — logodaki ana renk
  accentInk: "#3D1800",  // vurgu üzerinde metin zemini
  negative: "#D94F2A",   // yalnızca ✗ ve üstü çizili iddialar
  backdrop: "#120900",   // tam ekran arkaplan
  dim: "#5C3D1E",        // geçmiş adımlar, superseded
  board: "#1A0F05",      // v2 stage board
} as const;

export const space = { xs: 6, sm: 10, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const radius = { sm: 10, md: 14, lg: 20 } as const;

export const type = {
  kicker: { fontFamily: font.text, fontWeight: 700, fontSize: 19, letterSpacing: 2.4, textTransform: "uppercase" as const },
  headline: { fontFamily: font.display, fontWeight: 700, fontSize: 48, lineHeight: 1.06, letterSpacing: -0.4 },
  title: { fontFamily: font.display, fontWeight: 600, fontSize: 38, lineHeight: 1.1, letterSpacing: -0.2 },
  body: { fontFamily: font.text, fontWeight: 500, fontSize: 27, lineHeight: 1.3 },
  small: { fontFamily: font.text, fontWeight: 500, fontSize: 21, lineHeight: 1.32 },
  note: { fontFamily: font.text, fontWeight: 500, fontSize: 17, lineHeight: 1.3, letterSpacing: 0.3 },
  number: { fontFamily: font.display, fontWeight: 700, fontSize: 64, lineHeight: 1, letterSpacing: -1.2 },
  log: { fontFamily: font.mono, fontWeight: 700, fontSize: 15, letterSpacing: 1.6, textTransform: "uppercase" as const },
  code: { fontFamily: font.mono, fontWeight: 500, fontSize: 24, lineHeight: 1.5 },
} as const;

// Reels format: 1080×1920 vertical. layout.width/height burada native değil (GraphicsLayer 1920×1080 render eder,
// ShortOverlay ayrı 1080×1920 composition'ıdır). Margin ve paneller 1920×1080 design unit cinsinden.
export const layout = {
  width: 1920,
  height: 1080,
  margin: 58,
  panelTop: 70,
  panelWidth: 500,
  panelWidthLeft: 500,
  panelMaxHeight: 640,
} as const;

// Dengeli-yoğun tempo: enter 0.28 s (medikal estetik — bilgi akıyor ama panik yok)
export const motion = {
  enter: 0.28,
  exit: 0.18,
  itemEnter: 0.22,
  slide: 22,  // px entrance travel — zarif, fazla titremez
  bezierEnter: [0.16, 1, 0.3, 1] as const,
  bezierExit: [0.4, 0, 1, 1] as const,
} as const;
