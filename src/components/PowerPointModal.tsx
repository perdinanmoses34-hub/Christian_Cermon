import React, { useState } from 'react';
import {
  X,
  Presentation,
  Download,
  Copy,
  Printer,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Palette,
  Type,
  Maximize2,
  Check,
  AlertCircle,
  FileText,
  Sliders,
} from 'lucide-react';
import {
  Sermon,
  PowerPointSlide,
  PPTTemplate,
  PPTColorPalette,
  PPTFont,
} from '../types/sermon';
import { exportToPowerPoint } from '../services/pptxExporter';
import { regeneratePowerPointApi } from '../services/api';

interface PowerPointModalProps {
  sermon: Sermon;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSermon: (updated: Sermon) => void;
}

const TEMPLATES: PPTTemplate[] = [
  'Modern Church',
  'Minimalist',
  'Elegant',
  'Dark',
  'Youth',
  'Classic',
  'Nature',
  'Christian',
];

const COLOR_PALETTES: Array<{ id: PPTColorPalette; label: string; bgClass: string; borderClass: string }> = [
  { id: 'navy', label: 'Deep Navy', bgClass: 'bg-slate-900', borderClass: 'border-amber-400' },
  { id: 'blue', label: 'Royal Blue', bgClass: 'bg-blue-900', borderClass: 'border-blue-400' },
  { id: 'gold', label: 'Sacred Gold', bgClass: 'bg-amber-950', borderClass: 'border-amber-500' },
  { id: 'beige', label: 'Soft Beige', bgClass: 'bg-stone-200', borderClass: 'border-stone-400' },
  { id: 'white', label: 'Pure White', bgClass: 'bg-white', borderClass: 'border-slate-300' },
  { id: 'dark', label: 'Charcoal Dark', bgClass: 'bg-neutral-950', borderClass: 'border-neutral-700' },
];

const FONTS: PPTFont[] = ['Inter', 'Poppins', 'Montserrat', 'Merriweather', 'Playfair Display'];

export const PowerPointModal: React.FC<PowerPointModalProps> = ({
  sermon,
  isOpen,
  onClose,
  onUpdateSermon,
}) => {
  const powerpoint = sermon.powerpoint || {
    template: 'Modern Church',
    colorPalette: 'navy',
    font: 'Inter',
    aspectRatio: '16:9',
    slides: [],
  };

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [template, setTemplate] = useState<PPTTemplate>(powerpoint.template || 'Modern Church');
  const [colorPalette, setColorPalette] = useState<PPTColorPalette>(powerpoint.colorPalette || 'navy');
  const [font, setFont] = useState<PPTFont>(powerpoint.font || 'Inter');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '4:3'>(powerpoint.aspectRatio || '16:9');

  const [slides, setSlides] = useState<PowerPointSlide[]>(
    powerpoint.slides && powerpoint.slides.length > 0
      ? powerpoint.slides
      : [
          {
            id: 's-1',
            title: sermon.title,
            content: `${sermon.main_scripture}\n${sermon.big_idea}`,
            speaker_notes: 'Buka khotbah dengan doa dan salam kepada jemaat.',
            slide_type: 'title',
          },
        ]
  );

  const [isExporting, setIsExporting] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  if (!isOpen) return null;

  const currentSlide = slides[currentSlideIndex] || slides[0];

  const updateCurrentSlide = (field: keyof PowerPointSlide, value: string) => {
    const updated = [...slides];
    updated[currentSlideIndex] = {
      ...updated[currentSlideIndex],
      [field]: value,
    };
    setSlides(updated);
    onUpdateSermon({
      ...sermon,
      powerpoint: {
        template,
        colorPalette,
        font,
        aspectRatio,
        slides: updated,
      },
    });
  };

  const handleAddSlide = () => {
    const newSlide: PowerPointSlide = {
      id: `slide-${Date.now()}`,
      title: 'Slide Baru',
      content: '• Poin firman penting 1\n• Poin firman penting 2',
      speaker_notes: 'Catatan pembicara untuk mimbar...',
      slide_type: 'point',
    };
    const updated = [...slides, newSlide];
    setSlides(updated);
    setCurrentSlideIndex(updated.length - 1);
    onUpdateSermon({
      ...sermon,
      powerpoint: {
        template,
        colorPalette,
        font,
        aspectRatio,
        slides: updated,
      },
    });
  };

  const handleDeleteSlide = (index: number) => {
    if (slides.length <= 1) return;
    const updated = slides.filter((_, i) => i !== index);
    setSlides(updated);
    setCurrentSlideIndex(Math.max(0, index - 1));
    onUpdateSermon({
      ...sermon,
      powerpoint: {
        template,
        colorPalette,
        font,
        aspectRatio,
        slides: updated,
      },
    });
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= slides.length) return;
    const updated = [...slides];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    setSlides(updated);
    setCurrentSlideIndex(target);
    onUpdateSermon({
      ...sermon,
      powerpoint: {
        template,
        colorPalette,
        font,
        aspectRatio,
        slides: updated,
      },
    });
  };

  // Download PPTX
  const handleDownloadPptx = async () => {
    setIsExporting(true);
    setErrorMessage('');
    try {
      const config = {
        template,
        colorPalette,
        font,
        aspectRatio,
        slides,
      };
      await exportToPowerPoint(sermon.title, config);
    } catch (err: any) {
      console.error('PPTX export error:', err);
      setErrorMessage('PowerPoint belum berhasil dibuat. Khotbah Anda tetap tersimpan.');
    } finally {
      setIsExporting(false);
    }
  };

  // Regenerate slides using AI
  const handleRegenerateWithAi = async () => {
    setIsRegenerating(true);
    setErrorMessage('');
    try {
      const regenerated = await regeneratePowerPointApi(sermon, {
        template,
        colorPalette,
        font,
        aspectRatio,
      });
      if (regenerated && regenerated.slides && regenerated.slides.length > 0) {
        setSlides(regenerated.slides);
        setCurrentSlideIndex(0);
        onUpdateSermon({
          ...sermon,
          powerpoint: regenerated,
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal membuat ulang PowerPoint.');
    } finally {
      setIsRegenerating(false);
    }
  };

  // Slide visual styling according to color palette
  const getSlideThemeStyles = () => {
    switch (colorPalette) {
      case 'blue':
        return {
          bg: 'bg-blue-950',
          card: 'bg-blue-900/60 border-blue-700/60',
          text: 'text-white',
          subtext: 'text-blue-200',
          accent: 'text-sky-400',
          line: 'bg-sky-400',
        };
      case 'gold':
        return {
          bg: 'bg-amber-950',
          card: 'bg-amber-900/60 border-amber-700/60',
          text: 'text-amber-100',
          subtext: 'text-amber-200',
          accent: 'text-amber-400',
          line: 'bg-amber-400',
        };
      case 'beige':
        return {
          bg: 'bg-stone-200',
          card: 'bg-white border-stone-300',
          text: 'text-slate-900',
          subtext: 'text-slate-700',
          accent: 'text-amber-800',
          line: 'bg-amber-700',
        };
      case 'white':
        return {
          bg: 'bg-white',
          card: 'bg-stone-50 border-stone-200',
          text: 'text-slate-900',
          subtext: 'text-slate-700',
          accent: 'text-blue-600',
          line: 'bg-blue-600',
        };
      case 'dark':
        return {
          bg: 'bg-neutral-950',
          card: 'bg-neutral-900 border-neutral-800',
          text: 'text-white',
          subtext: 'text-neutral-300',
          accent: 'text-sky-400',
          line: 'bg-sky-400',
        };
      case 'navy':
      default:
        return {
          bg: 'bg-slate-950',
          card: 'bg-slate-900/90 border-slate-800',
          text: 'text-white',
          subtext: 'text-slate-300',
          accent: 'text-amber-400',
          line: 'bg-amber-400',
        };
    }
  };

  const themeStyle = getSlideThemeStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-title font-bold text-base sm:text-lg text-white">
                PowerPoint Slide Builder & Preview
              </h3>
              <p className="text-xs text-slate-400">
                {sermon.title} • {slides.length} Slides Siap Mimbar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRegenerateWithAi}
              disabled={isRegenerating}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-amber-500/30"
              title="Buat Ulang Slide dengan AI"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isRegenerating ? 'Menyusun...' : 'Generate Ulang AI'}</span>
            </button>

            <button
              onClick={handleDownloadPptx}
              disabled={isExporting}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-900/30 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Mengekspor...' : 'Download .PPTX'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="bg-rose-950/80 border-b border-rose-800 px-4 py-2 text-rose-300 text-xs flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {errorMessage}
            </span>
            <button
              onClick={handleDownloadPptx}
              className="underline font-semibold hover:text-white ml-2"
            >
              Generate Again
            </button>
          </div>
        )}

        {/* Toolbar: Template, Color, Font, Aspect Ratio */}
        <div className="p-3 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Template Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Template:</span>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value as PPTTemplate)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {TEMPLATES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Color Palette Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Warna:</span>
              <div className="flex items-center gap-1">
                {COLOR_PALETTES.map((cp) => (
                  <button
                    key={cp.id}
                    type="button"
                    onClick={() => setColorPalette(cp.id)}
                    title={cp.label}
                    className={`w-5 h-5 rounded-full ${cp.bgClass} border-2 ${
                      colorPalette === cp.id ? 'ring-2 ring-amber-400 border-white scale-110' : 'border-slate-700'
                    } transition-all`}
                  />
                ))}
              </div>
            </div>

            {/* Font Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Font:</span>
              <select
                value={font}
                onChange={(e) => setFont(e.target.value as PPTFont)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {FONTS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            {/* Aspect Ratio */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Rasio:</span>
              <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                <button
                  type="button"
                  onClick={() => setAspectRatio('16:9')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    aspectRatio === '16:9' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  16:9
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio('4:3')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    aspectRatio === '4:3' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  4:3
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddSlide}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Slide
            </button>
          </div>
        </div>

        {/* Main Content: Left Thumbnails + Center Slide Canvas + Right Speaker Notes */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
          {/* Thumbnails Sidebar (3 cols) */}
          <div className="md:col-span-3 border-r border-slate-800 bg-slate-950/40 p-3 overflow-y-auto space-y-2 max-h-[580px]">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Daftar Slide ({slides.length})
            </p>
            {slides.map((s, idx) => {
              const isSelected = idx === currentSlideIndex;
              return (
                <div
                  key={s.id || idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'border-amber-500 bg-slate-800 shadow-md ring-1 ring-amber-500/30'
                      : 'border-slate-800/80 bg-slate-900/60 hover:bg-slate-800/60'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-200 truncate">{s.title}</p>
                    <p className="text-[10px] text-slate-400 truncate line-clamp-1 mt-0.5">
                      {s.content.replace(/\n/g, ' ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleMoveSlide(idx, 'up')}
                      disabled={idx === 0}
                      className="p-0.5 text-slate-500 hover:text-white disabled:opacity-20"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleMoveSlide(idx, 'down')}
                      disabled={idx === slides.length - 1}
                      className="p-0.5 text-slate-500 hover:text-white disabled:opacity-20"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    {slides.length > 1 && (
                      <button
                        onClick={() => handleDeleteSlide(idx)}
                        className="p-0.5 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Center: Live Rendered Slide Canvas (6 cols) */}
          <div className="md:col-span-6 p-4 sm:p-6 bg-slate-950/80 flex flex-col justify-between overflow-y-auto">
            {/* The Slide Frame Mockup */}
            <div className="flex-1 flex items-center justify-center">
              <div
                className={`w-full ${
                  aspectRatio === '4:3' ? 'aspect-[4/3] max-w-lg' : 'aspect-video max-w-xl'
                } ${themeStyle.bg} rounded-2xl shadow-2xl border border-slate-700/80 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden transition-all`}
                style={{ fontFamily: font }}
              >
                {/* Decorative Cross / Accent */}
                <div className="absolute top-4 right-5 opacity-20 text-3xl font-cinzel">✝</div>

                {currentSlideIndex === 0 || currentSlide?.slide_type === 'title' ? (
                  // TITLE SLIDE LAYOUT
                  <div className="my-auto text-center space-y-4">
                    <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest ${themeStyle.accent}`}>
                      CHRISTIAN SERMON BUILDER
                    </span>
                    <input
                      type="text"
                      value={currentSlide?.title || ''}
                      onChange={(e) => updateCurrentSlide('title', e.target.value)}
                      className={`w-full font-serif-title text-xl sm:text-3xl font-bold ${themeStyle.text} text-center bg-transparent border-b border-transparent hover:border-slate-500 focus:outline-none`}
                    />
                    <div className={`w-16 h-1 ${themeStyle.line} mx-auto rounded-full`} />
                    <textarea
                      rows={3}
                      value={currentSlide?.content || ''}
                      onChange={(e) => updateCurrentSlide('content', e.target.value)}
                      className={`w-full text-xs sm:text-sm ${themeStyle.subtext} text-center bg-transparent border border-transparent hover:border-slate-500/40 rounded p-1 focus:outline-none`}
                    />
                  </div>
                ) : (
                  // STANDARD CONTENT SLIDE LAYOUT
                  <div className="space-y-4 h-full flex flex-col">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-slate-700/40">
                      <div className={`w-1 h-6 ${themeStyle.line} rounded-full`} />
                      <input
                        type="text"
                        value={currentSlide?.title || ''}
                        onChange={(e) => updateCurrentSlide('title', e.target.value)}
                        className={`font-serif-title font-bold text-base sm:text-xl ${themeStyle.text} bg-transparent border-b border-transparent hover:border-slate-500 focus:outline-none flex-1`}
                      />
                    </div>

                    <div className={`flex-1 rounded-xl p-4 ${themeStyle.card} border flex flex-col justify-center`}>
                      <textarea
                        rows={7}
                        value={currentSlide?.content || ''}
                        onChange={(e) => updateCurrentSlide('content', e.target.value)}
                        className={`w-full h-full bg-transparent text-xs sm:text-sm ${themeStyle.text} leading-relaxed focus:outline-none resize-none font-medium`}
                      />
                    </div>
                  </div>
                )}

                {/* Slide Number footer */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2">
                  <span>{template}</span>
                  <span>
                    Slide {currentSlideIndex + 1} / {slides.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Slide Navigation Buttons */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800">
              <button
                onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                disabled={currentSlideIndex === 0}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 disabled:opacity-30 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Slide Sebelumnya
              </button>

              <span className="text-xs text-slate-400 font-medium">
                Slide {currentSlideIndex + 1} dari {slides.length}
              </span>

              <button
                onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
                disabled={currentSlideIndex === slides.length - 1}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 disabled:opacity-30 flex items-center gap-1"
              >
                Slide Berikutnya <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right: Speaker Notes Editor (3 cols) */}
          <div className="md:col-span-3 border-l border-slate-800 bg-slate-900 p-4 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <FileText className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Speaker Notes (Mimbar)
                </h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Teks naskah ini akan tersimpan di dalam fitur <strong>Speaker Notes</strong> PowerPoint asli saat di-download. Hanya terbaca oleh pengkhotbah di layar presenter.
              </p>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Catatan Pembicara Slide Ini:
                </label>
                <textarea
                  rows={12}
                  value={currentSlide?.speaker_notes || ''}
                  onChange={(e) => updateCurrentSlide('speaker_notes', e.target.value)}
                  placeholder="Tuliskan arahan khotbah, penekanan intonasi, atau naskah lengkap slide ini..."
                  className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 italic">
              Slide ringkas untuk jemaat, naskah mendalam di speaker notes.
            </div>
          </div>
        </div>

        {/* Footer info bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400">
          <span>
            Kompatibel dengan: <strong>Microsoft PowerPoint</strong>, <strong>Google Slides</strong>, <strong>Apple Keynote</strong>, <strong>LibreOffice</strong>.
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const outlineText = slides.map((s, i) => `Slide ${i+1}: ${s.title}\n${s.content}\nNotes: ${s.speaker_notes}`).join('\n\n');
                navigator.clipboard.writeText(outlineText);
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
              }}
              className="text-amber-400 hover:underline flex items-center gap-1 font-medium"
            >
              {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              Salin Naskah Slide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
