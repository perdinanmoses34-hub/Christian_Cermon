/**
 * Christian Sermon Builder - Curated Visual Artwork & Slide Image Library
 * Generates theme-matched Christian sacred artwork and slide visuals.
 */

export interface SlideVisual {
  id: string;
  theme: string;
  title: string;
  svg: string;
}

// Helper to encode SVG to clean Data URI
export function encodeSvgToDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

export const CHRISTIAN_SCENES: Record<string, { title: string; prompt: string; getSvg: (themeTitle?: string) => string }> = {
  title_cross_dawn: {
    title: 'Salib Fajar Kemenangan',
    prompt: 'Siluet salib kayu agung di atas bukit batu saat fajar keemasan merekah, sinar mentari fajar memancar dari balik salib, atmosfer kudus dan penuh harapan surgawi.',
    getSvg: (t = 'Khotbah Kristen') => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="100%" height="100%">
  <defs>
    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0a1128"/>
      <stop offset="40%" stop-color="#1c2541"/>
      <stop offset="70%" stop-color="#793c20"/>
      <stop offset="90%" stop-color="#c96d24"/>
      <stop offset="100%" stop-color="#e9a443"/>
    </linearGradient>
    <radialGradient id="sunBurst" cx="50%" cy="58%" r="45%">
      <stop offset="0%" stop-color="#fff5cc" stop-opacity="0.95"/>
      <stop offset="25%" stop-color="#fdbb43" stop-opacity="0.8"/>
      <stop offset="55%" stop-color="#d46119" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#1c2541" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="hillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#18131d"/>
      <stop offset="100%" stop-color="#09060b"/>
    </linearGradient>
  </defs>
  <!-- Sky -->
  <rect width="1280" height="720" fill="url(#skyGrad)"/>
  <!-- Sun & Divine Rays -->
  <circle cx="640" cy="420" r="320" fill="url(#sunBurst)"/>
  <path d="M640 420 L300 0 L360 0 Z" fill="#ffd470" opacity="0.12"/>
  <path d="M640 420 L600 0 L680 0 Z" fill="#ffd470" opacity="0.16"/>
  <path d="M640 420 L920 0 L980 0 Z" fill="#ffd470" opacity="0.12"/>
  <path d="M640 420 L120 180 L180 140 Z" fill="#ffd470" opacity="0.1"/>
  <path d="M640 420 L1100 140 L1160 180 Z" fill="#ffd470" opacity="0.1"/>
  <!-- Distant Mountains -->
  <path d="M0 580 Q 320 480, 640 530 T 1280 500 L 1280 720 L 0 720 Z" fill="#141a2e" opacity="0.7"/>
  <!-- Main Hill -->
  <path d="M0 640 Q 300 520, 640 500 Q 980 520, 1280 640 L 1280 720 L 0 720 Z" fill="url(#hillGrad)"/>
  <!-- The Holy Cross -->
  <g fill="#0c0a0e">
    <!-- Vertical beam -->
    <rect x="625" y="240" width="30" height="290" rx="3"/>
    <!-- Horizontal beam -->
    <rect x="545" y="315" width="190" height="28" rx="3"/>
    <!-- Center aura -->
    <circle cx="640" cy="329" r="65" stroke="#fec257" stroke-width="2.5" fill="none" opacity="0.45"/>
    <circle cx="640" cy="329" r="95" stroke="#fec257" stroke-width="1.5" stroke-dasharray="8 6" fill="none" opacity="0.3"/>
  </g>
  <!-- Accent Stars / Glow -->
  <circle cx="280" cy="140" r="2" fill="#fff" opacity="0.7"/>
  <circle cx="980" cy="120" r="2.5" fill="#fff" opacity="0.8"/>
  <circle cx="450" cy="90" r="1.5" fill="#fff" opacity="0.6"/>
</svg>`,
  },

  open_bible_light: {
    title: 'Kitab Suci & Terang Ilahi',
    prompt: 'Naskah Alkitab kuno terbuka di atas meja kayu rustic berukir, memancarkan cahaya keemasan lembut, ditemani ranting zaitun lambang damai dan nyala lilin suci.',
    getSvg: () => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="100%" height="100%">
  <defs>
    <radialGradient id="bibleGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fff8db" stop-opacity="0.9"/>
      <stop offset="30%" stop-color="#f5a623" stop-opacity="0.6"/>
      <stop offset="70%" stop-color="#732f05" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#0d1117" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="pageGradLeft" x1="100%" y1="0%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#e8dcc4"/>
      <stop offset="100%" stop-color="#fdf9ea"/>
    </linearGradient>
    <linearGradient id="pageGradRight" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#e8dcc4"/>
      <stop offset="100%" stop-color="#fdf9ea"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="#0b0f19"/>
  <!-- Warm glow in background -->
  <circle cx="640" cy="380" r="380" fill="url(#bibleGlow)"/>
  <!-- Candle on right -->
  <rect x="940" y="240" width="35" height="180" rx="6" fill="#f4ebd9"/>
  <ellipse cx="957" cy="240" rx="17.5" ry="6" fill="#e5dac3"/>
  <path d="M957 240 Q 957 215, 957 205 Q 965 220, 957 240 Z" fill="#ff7a00"/>
  <circle cx="957" cy="215" r="30" fill="#fec257" opacity="0.35"/>
  <!-- Open Bible Pages -->
  <!-- Left Page -->
  <path d="M340 330 C 440 310, 560 320, 635 365 L 635 550 C 560 505, 440 500, 340 520 Z" fill="url(#pageGradLeft)" filter="drop-shadow(0 15px 25px rgba(0,0,0,0.6))"/>
  <!-- Right Page -->
  <path d="M940 330 C 840 310, 720 320, 645 365 L 645 550 C 720 505, 840 500, 940 520 Z" fill="url(#pageGradRight)" filter="drop-shadow(0 15px 25px rgba(0,0,0,0.6))"/>
  <!-- Bible Spine / Center Shadow -->
  <path d="M635 365 L 645 365 L 645 550 L 635 550 Z" fill="#9c7a4e"/>
  <!-- Scripture text lines on left page -->
  <line x1="390" y1="365" x2="590" y2="365" stroke="#7d6b53" stroke-width="3" stroke-linecap="round" opacity="0.75"/>
  <line x1="390" y1="385" x2="600" y2="385" stroke="#7d6b53" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
  <line x1="390" y1="405" x2="585" y2="405" stroke="#7d6b53" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
  <line x1="390" y1="425" x2="595" y2="425" stroke="#7d6b53" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
  <line x1="390" y1="445" x2="570" y2="445" stroke="#7d6b53" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
  <line x1="390" y1="465" x2="590" y2="465" stroke="#7d6b53" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
  <line x1="390" y1="485" x2="540" y2="485" stroke="#7d6b53" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
  <!-- Scripture text lines on right page -->
  <line x1="680" y1="365" x2="890" y2="365" stroke="#7d6b53" stroke-width="3" stroke-linecap="round" opacity="0.75"/>
  <line x1="680" y1="385" x2="880" y2="385" stroke="#7d6b53" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
  <line x1="680" y1="405" x2="895" y2="405" stroke="#7d6b53" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
  <line x1="680" y1="425" x2="870" y2="425" stroke="#7d6b53" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
  <line x1="680" y1="445" x2="890" y2="445" stroke="#7d6b53" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
  <line x1="680" y1="465" x2="860" y2="465" stroke="#7d6b53" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
  <line x1="680" y1="485" x2="810" y2="485" stroke="#7d6b53" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
  <!-- Olive Branch on left corner -->
  <path d="M260 520 Q 320 480, 390 470" stroke="#485c2c" stroke-width="3" fill="none"/>
  <ellipse cx="330" cy="485" rx="14" ry="7" fill="#698539" transform="rotate(-30 330 485)"/>
  <ellipse cx="360" cy="475" rx="14" ry="7" fill="#698539" transform="rotate(-15 360 475)"/>
  <ellipse cx="300" cy="505" rx="14" ry="7" fill="#526b2b" transform="rotate(-40 300 505)"/>
  <!-- Text Label -->
  <text x="640" y="630" font-family="serif" font-size="22" font-weight="bold" fill="#f8d689" text-anchor="middle" letter-spacing="4">VERBUM DEI • FIRMAN YANG HIDUP</text>
</svg>`,
  },

  faith_pathway: {
    title: 'Langkah Ketaatan & Iman',
    prompt: 'Jalan setapak berbatu melintasi bukit hijau dan pegunungan fajar, menuju gerbang cahaya keemasan, melambangkan perjalanan iman dan ketaatan tanpa henti.',
    getSvg: () => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="100%" height="100%">
  <defs>
    <linearGradient id="dawnSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0f2027"/>
      <stop offset="50%" stop-color="#203a43"/>
      <stop offset="100%" stop-color="#2c5364"/>
    </linearGradient>
    <radialGradient id="beaconGlow" cx="50%" cy="35%" r="35%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="30%" stop-color="#ffe699"/>
      <stop offset="70%" stop-color="#e69500" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#0f2027" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#dawnSky)"/>
  <!-- Light Portal / Beacon on Summit -->
  <circle cx="640" cy="260" r="260" fill="url(#beaconGlow)"/>
  <!-- Distant Summit -->
  <polygon points="640,240 450,440 830,440" fill="#1b2a38"/>
  <polygon points="640,240 600,440 830,440" fill="#13202c"/>
  <polygon points="260,340 80,500 440,500" fill="#152432"/>
  <polygon points="1020,340 840,500 1200,500" fill="#152432"/>
  <!-- Foothills -->
  <path d="M0 500 Q 300 460, 640 470 T 1280 480 L 1280 720 L 0 720 Z" fill="#1e3a2b"/>
  <!-- The Winding Path of Faith -->
  <path d="M640 380 Q 610 440, 660 480 Q 720 530, 590 580 Q 520 630, 640 720 L 710 720 Q 600 630, 670 580 Q 790 530, 700 480 Q 650 440, 645 380 Z" fill="#d4af37" opacity="0.85"/>
  <!-- Little Lamp on the Path -->
  <circle cx="640" cy="270" r="12" fill="#fff" filter="drop-shadow(0 0 15px #ffd700)"/>
  <!-- Subtle Cross on Summit -->
  <rect x="638" y="225" width="4" height="28" fill="#ffd700"/>
  <rect x="630" y="233" width="20" height="3" fill="#ffd700"/>
  <text x="640" y="670" font-family="sans-serif" font-size="18" font-weight="bold" fill="#f8f9fa" opacity="0.9" text-anchor="middle" letter-spacing="3">BERJALAN KARENA PERCAYA, BUKAN MELIHAT (2 KORINTUS 5:7)</text>
</svg>`,
  },

  shepherd_waters: {
    title: 'Gembala yang Baik & Air Tenang',
    prompt: 'Lembah hijau subur dengan air tenang yang mengalir jernih, tongkat gembala berakar di batu karang, langit cerah membentang damai, menggambarkan Mazmur 23.',
    getSvg: () => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="100%" height="100%">
  <defs>
    <linearGradient id="pastureSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1a365d"/>
      <stop offset="50%" stop-color="#2b6cb0"/>
      <stop offset="100%" stop-color="#bee3f8"/>
    </linearGradient>
    <linearGradient id="streamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#3182ce"/>
      <stop offset="50%" stop-color="#90cdf4"/>
      <stop offset="100%" stop-color="#3182ce"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#pastureSky)"/>
  <!-- Rolling Green Hills -->
  <path d="M0 400 Q 320 300, 700 370 T 1280 340 L 1280 720 L 0 720 Z" fill="#22543d"/>
  <path d="M0 450 Q 400 390, 800 450 T 1280 430 L 1280 720 L 0 720 Z" fill="#276749"/>
  <path d="M0 520 Q 300 470, 640 520 T 1280 500 L 1280 720 L 0 720 Z" fill="#2f855a"/>
  <!-- Still Waters Stream -->
  <path d="M580 440 C 620 480, 560 540, 650 600 C 720 650, 680 690, 720 720 L 590 720 C 560 680, 590 640, 520 590 C 460 530, 540 480, 560 440 Z" fill="url(#streamGrad)" opacity="0.9"/>
  <!-- Shepherd Staff on Foreground Rock -->
  <ellipse cx="280" cy="580" rx="90" ry="40" fill="#4a5568"/>
  <!-- Staff with crook -->
  <path d="M280 300 C 260 280, 230 290, 230 320 C 230 340, 250 350, 265 350 L 265 590" stroke="#ecc94b" stroke-width="8" stroke-linecap="round" fill="none"/>
  <circle cx="280" cy="300" r="14" fill="#d69e2e" opacity="0.4"/>
  <text x="640" y="660" font-family="serif" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="3">TUHAN ADALAH GEMBALAKU, TAKKAN KEKURANGAN AKU</text>
</svg>`,
  },

  holy_spirit_dove: {
    title: 'Roh Kudus & Api Kebangunan',
    prompt: 'Burung merpati putih suci turun dari langit dengan sayap terbentang anggun, dinaungi tujuh berkas cahaya keemasan dan lidah api kasih karunia.',
    getSvg: () => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="100%" height="100%">
  <defs>
    <radialGradient id="doveBurst" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="30%" stop-color="#fed7aa"/>
      <stop offset="65%" stop-color="#c2410c" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1280" height="720" fill="#0f172a"/>
  <!-- Divine Radiance -->
  <circle cx="640" cy="320" r="340" fill="url(#doveBurst)"/>
  <!-- Seven Golden Rays of Grace -->
  <polygon points="640,320 200,720 260,720" fill="#f59e0b" opacity="0.2"/>
  <polygon points="640,320 380,720 440,720" fill="#f59e0b" opacity="0.25"/>
  <polygon points="640,320 560,720 620,720" fill="#f59e0b" opacity="0.3"/>
  <polygon points="640,320 660,720 720,720" fill="#f59e0b" opacity="0.3"/>
  <polygon points="640,320 840,720 900,720" fill="#f59e0b" opacity="0.25"/>
  <polygon points="640,320 1020,720 1080,720" fill="#f59e0b" opacity="0.2"/>
  <!-- The Holy Dove Silhouette -->
  <g fill="#ffffff" filter="drop-shadow(0 0 20px rgba(254, 215, 170, 0.9))">
    <!-- Body & Head -->
    <ellipse cx="640" cy="320" rx="22" ry="38"/>
    <circle cx="640" cy="275" r="14"/>
    <!-- Beak -->
    <polygon points="640,260 636,268 644,268"/>
    <!-- Left Wing -->
    <path d="M625 310 C 560 250, 440 240, 360 280 C 430 320, 520 340, 620 340 Z"/>
    <!-- Right Wing -->
    <path d="M655 310 C 720 250, 840 240, 920 280 C 850 320, 760 340, 660 340 Z"/>
    <!-- Tail Feathers -->
    <polygon points="640,350 600,420 680,420"/>
  </g>
  <!-- Olive twig in beak -->
  <path d="M638 262 Q 620 255, 605 260" stroke="#84cc16" stroke-width="2.5" fill="none"/>
  <ellipse cx="612" cy="257" rx="5" ry="2.5" fill="#84cc16" transform="rotate(-20 612 257)"/>
  <text x="640" y="560" font-family="serif" font-size="22" font-weight="bold" fill="#fde68a" text-anchor="middle" letter-spacing="4">DIPENUHI DENGAN KUASA ROH KUDUS</text>
</svg>`,
  },

  prayer_hands_altar: {
    title: 'Doa Khidmat & Mezbah Penyembahan',
    prompt: 'Siluet tangan yang terkatup dalam doa khidmat di hadapan mezbah bait suci dengan dupa yang membubung dan cahaya keemasan penuh hadirat Allah.',
    getSvg: () => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="100%" height="100%">
  <defs>
    <radialGradient id="altarGlow" cx="50%" cy="45%" r="45%">
      <stop offset="0%" stop-color="#fffbeb"/>
      <stop offset="35%" stop-color="#f59e0b" stop-opacity="0.8"/>
      <stop offset="70%" stop-color="#78350f" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#020617" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1280" height="720" fill="#030712"/>
  <circle cx="640" cy="320" r="320" fill="url(#altarGlow)"/>
  <!-- Sanctuary Pillars -->
  <rect x="120" y="80" width="70" height="580" fill="#0f172a" rx="4"/>
  <rect x="1090" y="80" width="70" height="580" fill="#0f172a" rx="4"/>
  <!-- Altar Table in Foreground -->
  <rect x="420" y="520" width="440" height="140" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
  <rect x="460" y="500" width="360" height="25" rx="4" fill="#334155"/>
  <!-- Sacred Candle on Altar -->
  <rect x="625" y="440" width="30" height="65" fill="#f8fafc" rx="4"/>
  <circle cx="640" cy="415" r="16" fill="#f59e0b" filter="drop-shadow(0 0 12px #fbbf24)"/>
  <circle cx="640" cy="415" r="7" fill="#fff"/>
  <!-- Incense Smoke Rising -->
  <path d="M640 400 Q 610 330, 660 270 T 630 160" stroke="#fef08a" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.6"/>
  <path d="M645 400 Q 675 320, 625 250 T 655 140" stroke="#fef08a" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.4"/>
  <!-- Floating Warm Particles -->
  <circle cx="580" cy="280" r="2.5" fill="#fef08a" opacity="0.8"/>
  <circle cx="700" cy="250" r="2" fill="#fef08a" opacity="0.7"/>
  <circle cx="620" cy="200" r="3" fill="#fef08a" opacity="0.9"/>
  <text x="640" y="630" font-family="serif" font-size="20" font-weight="bold" fill="#fde68a" text-anchor="middle" letter-spacing="3">MEZBAH DOA & PERSEKUTUAN KUDUS</text>
</svg>`,
  },

  harvest_wheat_field: {
    title: 'Ladang Menguning & Tuaian Jiwa',
    prompt: 'Hamparan ladang gandum menguning keemasan siap dituai di bawah langit biru cerah dengan sinar mentari yang menghangatkan, melambangkan misi dan tuaian jiwa.',
    getSvg: () => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="100%" height="100%">
  <defs>
    <linearGradient id="harvestSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e3a8a"/>
      <stop offset="50%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#bae6fd"/>
    </linearGradient>
    <linearGradient id="wheatGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#854d0e"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#harvestSky)"/>
  <circle cx="1020" cy="180" r="85" fill="#fef08a" filter="drop-shadow(0 0 35px #fde047)"/>
  <!-- Distant Barn / Church steeple -->
  <polygon points="280,380 320,380 300,310" fill="#1e293b"/>
  <rect x="290" y="380" width="20" height="40" fill="#334155"/>
  <!-- Field hills -->
  <path d="M0 450 Q 400 380, 800 440 T 1280 400 L 1280 720 L 0 720 Z" fill="#ca8a04"/>
  <path d="M0 510 Q 300 460, 700 510 T 1280 470 L 1280 720 L 0 720 Z" fill="#a16207"/>
  <!-- Wheat Stems in Foreground -->
  <g stroke="#fef08a" stroke-width="4" stroke-linecap="round">
    <line x1="200" y1="720" x2="240" y2="480"/>
    <line x1="260" y1="720" x2="280" y2="470"/>
    <line x1="340" y1="720" x2="330" y2="460"/>
    <line x1="600" y1="720" x2="590" y2="450"/>
    <line x1="660" y1="720" x2="680" y2="470"/>
    <line x1="940" y1="720" x2="920" y2="460"/>
    <line x1="1040" y1="720" x2="1060" y2="480"/>
  </g>
  <!-- Wheat Heads -->
  <g fill="url(#wheatGrad)">
    <ellipse cx="240" cy="460" rx="14" ry="28"/>
    <ellipse cx="280" cy="450" rx="14" ry="28"/>
    <ellipse cx="330" cy="440" rx="14" ry="28"/>
    <ellipse cx="590" cy="430" rx="14" ry="28"/>
    <ellipse cx="680" cy="450" rx="14" ry="28"/>
    <ellipse cx="920" cy="440" rx="14" ry="28"/>
    <ellipse cx="1060" cy="460" rx="14" ry="28"/>
  </g>
  <text x="640" y="650" font-family="serif" font-size="22" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="3">LIHATLAH LADANG-LADANG TELAH MENGUNING & SIAP DITUAI</text>
</svg>`,
  },
};

/**
 * Return an image data URL matched appropriately to the slide type and theme.
 */
export function getThematicSlideArtwork(slideType?: string, title?: string): { url: string; prompt: string } {
  let key = 'title_cross_dawn';

  switch (slideType) {
    case 'title':
      key = 'title_cross_dawn';
      break;
    case 'intro':
      key = 'faith_pathway';
      break;
    case 'scripture':
    case 'context':
    case 'commentary':
    case 'word_study':
      key = 'open_bible_light';
      break;
    case 'big_idea':
      key = 'faith_pathway';
      break;
    case 'point':
      // Rotate between meaningful scenes based on title hash or keywords
      if (title?.toLowerCase().includes('kasih') || title?.toLowerCase().includes('damai') || title?.toLowerCase().includes('gembala')) {
        key = 'shepherd_waters';
      } else if (title?.toLowerCase().includes('roh') || title?.toLowerCase().includes('kuasa') || title?.toLowerCase().includes('api')) {
        key = 'holy_spirit_dove';
      } else if (title?.toLowerCase().includes('tuaian') || title?.toLowerCase().includes('misi') || title?.toLowerCase().includes('buah')) {
        key = 'harvest_wheat_field';
      } else {
        key = 'faith_pathway';
      }
      break;
    case 'application':
    case 'cta':
      key = 'harvest_wheat_field';
      break;
    case 'reflection':
    case 'prayer':
    case 'conclusion':
      key = 'prayer_hands_altar';
      break;
    default:
      key = 'faith_pathway';
      break;
  }

  const scene = CHRISTIAN_SCENES[key] || CHRISTIAN_SCENES.title_cross_dawn;
  return {
    url: encodeSvgToDataUri(scene.getSvg(title)),
    prompt: scene.prompt,
  };
}
