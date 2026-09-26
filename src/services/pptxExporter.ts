import PptxGenJS from 'pptxgenjs';
import { PowerPointConfig, PowerPointSlide } from '../types/sermon';

interface ColorTheme {
  bg: string;
  cardBg: string;
  title: string;
  body: string;
  accent: string;
  subtext: string;
}

const COLOR_THEMES: Record<string, ColorTheme> = {
  navy: {
    bg: '0F172A',
    cardBg: '1E293B',
    title: 'FFFFFF',
    body: 'E2E8F0',
    accent: 'F59E0B',
    subtext: '94A3B8',
  },
  blue: {
    bg: '1E3A8A',
    cardBg: '1E40AF',
    title: 'FFFFFF',
    body: 'EFF6FF',
    accent: '60A5FA',
    subtext: '93C5FD',
  },
  gold: {
    bg: '271E0B',
    cardBg: '3A2C11',
    title: 'FEF3C7',
    body: 'FDE68A',
    accent: 'F59E0B',
    subtext: 'D97706',
  },
  beige: {
    bg: 'FAF6F0',
    cardBg: 'FFFFFF',
    title: '1E293B',
    body: '334155',
    accent: 'B45309',
    subtext: '64748B',
  },
  white: {
    bg: 'FFFFFF',
    cardBg: 'F8FAFC',
    title: '0F172A',
    body: '334155',
    accent: '2563EB',
    subtext: '64748B',
  },
  dark: {
    bg: '121212',
    cardBg: '1E1E1E',
    title: 'F8FAFC',
    body: 'CBD5E1',
    accent: '38BDF8',
    subtext: '94A3B8',
  },
};

export async function exportToPowerPoint(
  sermonTitle: string,
  config: PowerPointConfig
): Promise<void> {
  const pptx = new PptxGenJS();

  // Layout aspect ratio
  if (config.aspectRatio === '4:3') {
    pptx.layout = 'LAYOUT_4x3';
  } else {
    pptx.layout = 'LAYOUT_16x9';
  }

  const theme = COLOR_THEMES[config.colorPalette] || COLOR_THEMES.navy;
  const fontFace = config.font || 'Inter';

  config.slides.forEach((slideData: PowerPointSlide, index: number) => {
    const slide = pptx.addSlide();

    // Set background color
    slide.background = { color: theme.bg };

    const isTitleSlide = index === 0 || slideData.slide_type === 'title';

    if (isTitleSlide) {
      // Header badge / Category
      slide.addText('CHRISTIAN SERMON BUILDER', {
        x: '8%',
        y: '22%',
        w: '84%',
        h: 0.4,
        fontSize: 12,
        bold: true,
        color: theme.accent,
        fontFace,
        charSpacing: 3,
        align: 'center',
      });

      // Big Title
      slide.addText(slideData.title, {
        x: '8%',
        y: '30%',
        w: '84%',
        h: 1.8,
        fontSize: 36,
        bold: true,
        color: theme.title,
        fontFace,
        align: 'center',
        valign: 'middle',
      });

      // Subtitle / Content
      if (slideData.content) {
        slide.addText(slideData.content, {
          x: '12%',
          y: '56%',
          w: '76%',
          h: 1.2,
          fontSize: 18,
          color: theme.subtext,
          fontFace,
          align: 'center',
          valign: 'top',
        });
      }

      // Decorative Accent Line
      slide.addShape(pptx.ShapeType.rect, {
        x: '42%',
        y: '52%',
        w: '16%',
        h: 0.05,
        fill: { color: theme.accent },
        line: { color: theme.accent, width: 0 },
      });
    } else {
      // Standard Slide Header
      slide.addShape(pptx.ShapeType.rect, {
        x: '6%',
        y: '8%',
        w: 0.12,
        h: 0.65,
        fill: { color: theme.accent },
        line: { color: theme.accent, width: 0 },
      });

      // Slide Title
      slide.addText(slideData.title, {
        x: '8%',
        y: '8%',
        w: '84%',
        h: 0.7,
        fontSize: 24,
        bold: true,
        color: theme.title,
        fontFace,
        valign: 'middle',
      });

      // Slide Subtitle / Category
      if (slideData.slide_type) {
        const typeLabels: Record<string, string> = {
          scripture: 'AYAT FIRMAN TUHAN',
          big_idea: 'GAGASAN UTAMA (BIG IDEA)',
          intro: 'PENDAHULUAN',
          point: 'POIN KHOTBAH',
          application: 'PENERAPAN PRAKTIS',
          reflection: 'PERTANYAAN REFLEKSI',
          conclusion: 'KESIMPULAN',
          cta: 'AJAKAN / CALL TO ACTION',
          prayer: 'DOA PENUTUP',
        };
        const label = typeLabels[slideData.slide_type] || '';
        if (label) {
          slide.addText(label, {
            x: '8%',
            y: '4%',
            w: '84%',
            h: 0.3,
            fontSize: 10,
            bold: true,
            color: theme.accent,
            fontFace,
            charSpacing: 2,
          });
        }
      }

      // Content Box (Card background)
      slide.addShape(pptx.ShapeType.roundRect, {
        x: '6%',
        y: '22%',
        w: '88%',
        h: '68%',
        rectRadius: 0.1,
        fill: { color: theme.cardBg },
        line: { color: theme.accent, width: 0.5, transparency: 70 },
      });

      // Parse bullet points
      const lines = slideData.content
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0);

      if (lines.length > 0) {
        const textItems = lines.map(line => {
          // Remove leading bullet characters if present
          const clean = line.replace(/^[•\-\*]\s*/, '').replace(/^\d+[\.\)]\s*/, '');
          return {
            text: clean,
            options: {
              bullet: lines.length > 1,
              breakLine: true,
              fontSize: lines.length > 5 ? 14 : lines.length > 3 ? 16 : 18,
              color: theme.body,
              fontFace,
              paraSpaceAfter: 12,
            },
          };
        });

        slide.addText(textItems, {
          x: '9%',
          y: '26%',
          w: '82%',
          h: '60%',
          valign: 'middle',
        });
      }
    }

    // Add speaker notes if present
    if (slideData.speaker_notes) {
      slide.addNotes(slideData.speaker_notes);
    }
  });

  const sanitizedFileName = (sermonTitle || 'Christian_Sermon')
    .replace(/[^a-zA-Z0-9_\-\s]/g, '')
    .trim()
    .replace(/\s+/g, '_');

  await pptx.writeFile({ fileName: `${sanitizedFileName}.pptx` });
}
