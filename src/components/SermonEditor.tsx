import React, { useState, useEffect, useRef } from 'react';
import {
  Save,
  Presentation,
  ListOrdered,
  Copy,
  Printer,
  Sparkles,
  ChevronRight,
  BookOpen,
  Info,
  ShieldCheck,
  Plus,
  Trash2,
  Check,
  ArrowLeft,
  FileDown,
  Quote,
  Layers,
  HelpCircle,
  MoreVertical,
  Type,
  ZoomIn,
  ZoomOut,
  X,
  Share2,
} from 'lucide-react';
import { Sermon, MainPoint, User } from '../types/sermon';
import { saveSermon, askAiAssistantApi } from '../services/api';

interface SermonEditorProps {
  initialSermon: Sermon;
  currentUser: User;
  onBackToDashboard: () => void;
  onOpenPowerPoint: (sermon: Sermon) => void;
  onOpenOutline: (sermon: Sermon) => void;
}

export const SermonEditor: React.FC<SermonEditorProps> = ({
  initialSermon,
  currentUser,
  onBackToDashboard,
  onOpenPowerPoint,
  onOpenOutline,
}) => {
  const [sermon, setSermon] = useState<Sermon>(initialSermon);
  const [activeSection, setActiveSection] = useState<string>('big_idea');
  const [mobileTab, setMobileTab] = useState<'editor' | 'outline' | 'ai'>('editor');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [showFullVerseText, setShowFullVerseText] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // AI Assistant state
  const [aiInstruction, setAiInstruction] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [aiError, setAiError] = useState('');

  // Auto-save debouncer
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setSaveStatus('saving');
    const timer = setTimeout(async () => {
      try {
        await saveSermon(sermon, currentUser);
        setSaveStatus('saved');
      } catch (err) {
        console.error('Auto-save error', err);
        setSaveStatus('saved');
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [sermon, currentUser]);

  // Handle updates to sermon fields
  const updateField = (field: keyof Sermon, value: any) => {
    setSermon((prev) => ({
      ...prev,
      [field]: value,
      updated_at: new Date().toISOString(),
    }));
  };

  const updateMainPoint = (pointId: string, field: keyof MainPoint, value: any) => {
    setSermon((prev) => ({
      ...prev,
      main_points: prev.main_points.map((pt) =>
        pt.id === pointId ? { ...pt, [field]: value } : pt
      ),
      updated_at: new Date().toISOString(),
    }));
  };

  const addNewMainPoint = () => {
    const newPointNumber = sermon.main_points.length + 1;
    const newPoint: MainPoint = {
      id: `point-${Date.now()}`,
      title: `Poin ${newPointNumber}: Judul Poin Baru`,
      biblical_basis: [sermon.main_scripture],
      explanation: 'Uraikan penjelasan teks dan prinsip teologis firman di sini.',
      interpretation: 'Uraikan makna penafsiran menurut konteks aslinya.',
      illustration: 'Tambahkan ilustrasi kehidupan nyata yang mendukung.',
      application: 'Tuliskan penerapan praktis konkret bagi jemaat.',
      transition: 'Tuliskan kalimat transisi menuju bagian berikutnya.',
    };

    setSermon((prev) => ({
      ...prev,
      main_points: [...prev.main_points, newPoint],
    }));
    setActiveSection(newPoint.id);
    setMobileTab('editor');
  };

  const removeMainPoint = (pointId: string) => {
    if (sermon.main_points.length <= 1) {
      alert('Khotbah minimal harus memiliki 1 poin utama.');
      return;
    }
    setSermon((prev) => ({
      ...prev,
      main_points: prev.main_points.filter((pt) => pt.id !== pointId),
    }));
    setActiveSection('big_idea');
  };

  // Get current content string for selected section for AI Assistant
  const getCurrentSectionContent = (): { name: string; content: string; setter: (val: string) => void } => {
    if (activeSection === 'big_idea') {
      return {
        name: 'Gagasan Utama (Big Idea)',
        content: sermon.big_idea,
        setter: (val) => updateField('big_idea', val),
      };
    }
    if (activeSection === 'objective') {
      return {
        name: 'Tujuan Khotbah',
        content: sermon.objective || '',
        setter: (val) => updateField('objective', val),
      };
    }
    if (activeSection === 'introduction') {
      return {
        name: 'Pendahuluan Khotbah',
        content: sermon.introduction,
        setter: (val) => updateField('introduction', val),
      };
    }
    if (activeSection === 'context') {
      return {
        name: 'Konteks Alkitab & Historis',
        content: sermon.context,
        setter: (val) => updateField('context', val),
      };
    }
    if (activeSection === 'text_explanation') {
      return {
        name: 'Penjelasan Teks',
        content: sermon.text_explanation || '',
        setter: (val) => updateField('text_explanation', val),
      };
    }
    if (activeSection === 'conclusion') {
      return {
        name: 'Kesimpulan Khotbah',
        content: sermon.conclusion,
        setter: (val) => updateField('conclusion', val),
      };
    }
    if (activeSection === 'call_to_action') {
      return {
        name: 'Ajakan (Call to Action)',
        content: sermon.call_to_action,
        setter: (val) => updateField('call_to_action', val),
      };
    }
    if (activeSection === 'closing_prayer') {
      return {
        name: 'Doa Penutup',
        content: sermon.closing_prayer,
        setter: (val) => updateField('closing_prayer', val),
      };
    }

    // Main Point search
    const point = sermon.main_points.find((p) => p.id === activeSection);
    if (point) {
      return {
        name: point.title,
        content: `${point.explanation}\n\n[Interpretasi]: ${point.interpretation}\n\n[Ilustrasi]: ${point.illustration}\n\n[Aplikasi]: ${point.application}`,
        setter: (val) => updateMainPoint(point.id, 'explanation', val),
      };
    }

    return {
      name: 'Naskah Khotbah',
      content: sermon.introduction,
      setter: (val) => updateField('introduction', val),
    };
  };

  const handleAskAi = async (customPrompt?: string) => {
    const promptToUse = customPrompt || aiInstruction;
    if (!promptToUse.trim()) return;

    setAiLoading(true);
    setAiError('');
    setAiSuggestion('');

    try {
      const currentSec = getCurrentSectionContent();
      const refined = await askAiAssistantApi(
        currentSec.name,
        currentSec.content,
        promptToUse,
        sermon
      );
      setAiSuggestion(refined);
    } catch (err: any) {
      setAiError(err.message || 'Gagal memproses bantuan AI.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyAiSuggestion = () => {
    if (!aiSuggestion) return;
    const currentSec = getCurrentSectionContent();
    currentSec.setter(aiSuggestion);
    setAiSuggestion('');
    setAiInstruction('');
    setMobileTab('editor');
  };

  // Copy full sermon to clipboard
  const handleCopyFullSermon = () => {
    const fullText = `JUDUL: ${sermon.title}
TEKS ALKITAB: ${sermon.main_scripture}
AYAT PENDUKUNG: ${sermon.supporting_scriptures.join(', ')}
METODE: ${sermon.method.toUpperCase()} | DURASI: ${sermon.duration} | JEMAAT: ${sermon.audience}

BIG IDEA (GAGASAN UTAMA):
${sermon.big_idea}

TUJUAN KHOTBAH:
${sermon.objective || '-'}

PENDAHULUAN:
${sermon.introduction}

KONTEKS ALKITAB:
${sermon.context}

POIN-POIN KHOTBAH:
${sermon.main_points
  .map(
    (pt, i) => `
POIN ${i + 1}: ${pt.title}
Dasar Ayat: ${pt.biblical_basis.join(', ')}
Eksegesis: ${pt.explanation}
Ilustrasi: ${pt.illustration}
Aplikasi: ${pt.application}
Transisi: ${pt.transition}
`
  )
  .join('\n')}

PERTANYAAN REFLEKSI:
${sermon.reflection_questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

KESIMPULAN:
${sermon.conclusion}

AJAKAN (CALL TO ACTION):
${sermon.call_to_action}

DOA PENUTUP:
${sermon.closing_prayer}

---
Christian Sermon Builder | Soli Deo Gloria`;

    navigator.clipboard.writeText(fullText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
    setIsMobileMenuOpen(false);
  };

  const handlePrintSermon = () => {
    setIsMobileMenuOpen(false);
    window.print();
  };

  // Font size classes for sermon body
  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'large':
        return 'text-base sm:text-lg leading-relaxed';
      case 'xlarge':
        return 'text-lg sm:text-xl leading-loose';
      case 'normal':
      default:
        return 'text-xs sm:text-sm leading-relaxed';
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col pb-safe md:pb-8">
      {/* Top App Bar */}
      <header className="bg-slate-900 border-b border-slate-800 text-white px-3 sm:px-6 py-2.5 sm:py-3 sticky top-0 md:top-16 z-30 shadow-md safe-area-top">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Left Slot: Back Arrow + Title */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              onClick={onBackToDashboard}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition-transform shrink-0"
              aria-label="Kembali ke Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="min-w-0 flex-1">
              <input
                type="text"
                value={sermon.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="font-serif-title font-bold text-xs sm:text-base md:text-lg bg-transparent border-b border-transparent hover:border-slate-600 focus:border-amber-400 focus:outline-none text-white w-full truncate"
                placeholder="Judul Khotbah..."
              />
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400 truncate">
                <span className="text-amber-400 font-semibold">{sermon.main_scripture}</span>
                <span>•</span>
                <span className="capitalize">{sermon.method}</span>
                <span>•</span>
                <span>{sermon.duration}</span>
              </div>
            </div>
          </div>

          {/* Right Slot: Save status & Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Save Status Indicator */}
            <div className="flex items-center gap-1 px-1.5 py-1 rounded-md bg-slate-800/80 text-[10px] text-slate-300">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  saveStatus === 'saved' ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'
                }`}
              />
              <span className="hidden sm:inline">
                {saveStatus === 'saved' ? 'Tersimpan' : 'Menyimpan...'}
              </span>
            </div>

            {/* Slide PPT Button */}
            <button
              onClick={() => onOpenPowerPoint(sermon)}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs active:scale-95"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Slide PPT</span>
            </button>

            {/* Desktop Actions */}
            <button
              onClick={() => onOpenOutline(sermon)}
              className="hidden lg:flex px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold items-center gap-1.5 border border-slate-700"
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Outline</span>
            </button>

            <button
              onClick={handleCopyFullSermon}
              className="hidden sm:flex px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold items-center gap-1.5 border border-slate-700"
            >
              {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copySuccess ? 'Tersalin' : 'Salin'}</span>
            </button>

            {/* Mobile 3-dot More Menu */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95"
              aria-label="Menu Opsi Khotbah"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Segmented Tabs Bar: [ Naskah ] [ Poin ] [ Asisten AI ] */}
      <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-2 py-1.5 flex items-center justify-around gap-1.5 sticky top-[49px] z-20 shadow-xs">
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium text-center transition-all active:scale-95 ${
            mobileTab === 'editor'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
              : 'text-slate-300 hover:bg-slate-900'
          }`}
        >
          Naskah
        </button>
        <button
          onClick={() => setMobileTab('outline')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium text-center transition-all active:scale-95 ${
            mobileTab === 'outline'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
              : 'text-slate-300 hover:bg-slate-900'
          }`}
        >
          Poin ({sermon.main_points.length})
        </button>
        <button
          onClick={() => setMobileTab('ai')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium text-center transition-all active:scale-95 ${
            mobileTab === 'ai'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
              : 'text-slate-300 hover:bg-slate-900'
          }`}
        >
          Asisten AI
        </button>
      </div>

      {/* Main 3-Column Workspace */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* LEFT COLUMN: Section Navigation (3 cols) */}
        <aside className={`lg:col-span-3 space-y-4 ${mobileTab === 'outline' ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs p-4 sticky top-36">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Struktur Khotbah
              </span>
              <button
                onClick={addNewMainPoint}
                className="text-[11px] font-bold text-amber-800 flex items-center gap-1 bg-amber-100/70 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300/80 active:scale-95"
              >
                <Plus className="w-3 h-3 stroke-[2.5]" /> Poin Baru
              </button>
            </div>

            <nav className="space-y-1 text-xs max-h-[calc(100vh-240px)] overflow-y-auto pr-1">
              <button
                onClick={() => {
                  setActiveSection('big_idea');
                  setMobileTab('editor');
                }}
                className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-colors flex items-center justify-between ${
                  activeSection === 'big_idea'
                    ? 'bg-amber-100 text-amber-900 font-bold border-l-4 border-amber-600'
                    : 'text-slate-700 hover:bg-stone-50'
                }`}
              >
                <span>★ Big Idea (Pesan Sentral)</span>
              </button>

              <button
                onClick={() => {
                  setActiveSection('objective');
                  setMobileTab('editor');
                }}
                className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-colors flex items-center justify-between ${
                  activeSection === 'objective'
                    ? 'bg-amber-100 text-amber-900 font-bold border-l-4 border-amber-600'
                    : 'text-slate-700 hover:bg-stone-50'
                }`}
              >
                <span>Tujuan Khotbah</span>
              </button>

              <button
                onClick={() => {
                  setActiveSection('introduction');
                  setMobileTab('editor');
                }}
                className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-colors flex items-center justify-between ${
                  activeSection === 'introduction'
                    ? 'bg-amber-100 text-amber-900 font-bold border-l-4 border-amber-600'
                    : 'text-slate-700 hover:bg-stone-50'
                }`}
              >
                <span>Pendahuluan</span>
              </button>

              <button
                onClick={() => {
                  setActiveSection('context');
                  setMobileTab('editor');
                }}
                className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-colors flex items-center justify-between ${
                  activeSection === 'context'
                    ? 'bg-amber-100 text-amber-900 font-bold border-l-4 border-amber-600'
                    : 'text-slate-700 hover:bg-stone-50'
                }`}
              >
                <span>Konteks Alkitab</span>
              </button>

              <button
                onClick={() => {
                  setActiveSection('text_explanation');
                  setMobileTab('editor');
                }}
                className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-colors flex items-center justify-between ${
                  activeSection === 'text_explanation'
                    ? 'bg-amber-100 text-amber-900 font-bold border-l-4 border-amber-600'
                    : 'text-slate-700 hover:bg-stone-50'
                }`}
              >
                <span>Penjelasan Teks</span>
              </button>

              {/* Main Points Divider */}
              <div className="pt-2 pb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3">
                  Poin-Poin Firman
                </span>
              </div>

              {sermon.main_points.map((pt, idx) => (
                <button
                  key={pt.id}
                  onClick={() => {
                    setActiveSection(pt.id);
                    setMobileTab('editor');
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-colors flex items-center justify-between ${
                    activeSection === pt.id
                      ? 'bg-amber-100 text-amber-900 font-bold border-l-4 border-amber-600'
                      : 'text-slate-700 hover:bg-stone-50'
                  }`}
                >
                  <span className="truncate pr-1">
                    {idx + 1}. {pt.title}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              ))}

              <div className="pt-2 pb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3">
                  Penutup & Penerapan
                </span>
              </div>

              <button
                onClick={() => {
                  setActiveSection('applications');
                  setMobileTab('editor');
                }}
                className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-colors flex items-center justify-between ${
                  activeSection === 'applications'
                    ? 'bg-amber-100 text-amber-900 font-bold border-l-4 border-amber-600'
                    : 'text-slate-700 hover:bg-stone-50'
                }`}
              >
                <span>Aplikasi Praktis</span>
              </button>

              <button
                onClick={() => {
                  setActiveSection('reflections');
                  setMobileTab('editor');
                }}
                className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-colors flex items-center justify-between ${
                  activeSection === 'reflections'
                    ? 'bg-amber-100 text-amber-900 font-bold border-l-4 border-amber-600'
                    : 'text-slate-700 hover:bg-stone-50'
                }`}
              >
                <span>Pertanyaan Refleksi</span>
              </button>

              <button
                onClick={() => {
                  setActiveSection('conclusion');
                  setMobileTab('editor');
                }}
                className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-colors flex items-center justify-between ${
                  activeSection === 'conclusion'
                    ? 'bg-amber-100 text-amber-900 font-bold border-l-4 border-amber-600'
                    : 'text-slate-700 hover:bg-stone-50'
                }`}
              >
                <span>Kesimpulan</span>
              </button>

              <button
                onClick={() => {
                  setActiveSection('call_to_action');
                  setMobileTab('editor');
                }}
                className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-colors flex items-center justify-between ${
                  activeSection === 'call_to_action'
                    ? 'bg-amber-100 text-amber-900 font-bold border-l-4 border-amber-600'
                    : 'text-slate-700 hover:bg-stone-50'
                }`}
              >
                <span>Ajakan (Call to Action)</span>
              </button>

              <button
                onClick={() => {
                  setActiveSection('closing_prayer');
                  setMobileTab('editor');
                }}
                className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-colors flex items-center justify-between ${
                  activeSection === 'closing_prayer'
                    ? 'bg-amber-100 text-amber-900 font-bold border-l-4 border-amber-600'
                    : 'text-slate-700 hover:bg-stone-50'
                }`}
              >
                <span>Doa Penutup</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* CENTER COLUMN: Section Editor (6 cols) */}
        <main className={`lg:col-span-6 space-y-4 ${mobileTab === 'editor' ? 'block' : 'hidden lg:block'}`}>
          {/* Quick Pulpit Reading Font Size Bar */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-stone-200/90 text-xs">
            <span className="text-slate-500 font-medium">Ukuran Teks Mimbar:</span>
            <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200">
              <button
                onClick={() => setFontSize('normal')}
                className={`px-2 py-0.5 rounded-md font-semibold text-xs ${
                  fontSize === 'normal' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
                }`}
              >
                A Normal
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-2 py-0.5 rounded-md font-semibold text-xs ${
                  fontSize === 'large' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
                }`}
              >
                A+ Besar
              </button>
              <button
                onClick={() => setFontSize('xlarge')}
                className={`px-2 py-0.5 rounded-md font-semibold text-xs ${
                  fontSize === 'xlarge' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
                }`}
              >
                A++ Mimbar
              </button>
            </div>
          </div>

          {/* Biblical Integrity Disclaimer Box */}
          <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-semibold">Catatan Homiletika:</strong> Verifikasi kembali konteks ayat Alkitab dan aplikasi firman sebelum disampaikan di hadapan jemaat.
            </div>
          </div>

          {/* Cross References bar */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-slate-800">Teks Utama & Ayat Pendukung</span>
              </div>
              <button
                onClick={() => setShowFullVerseText(!showFullVerseText)}
                className="text-[11px] font-semibold text-amber-700 hover:underline"
              >
                {showFullVerseText ? 'Ringkas' : 'Baca Teks Firman'}
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
                Utama: {sermon.main_scripture}
              </span>
              {sermon.supporting_scriptures.map((ref, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-stone-100 text-slate-700 text-xs font-medium border border-stone-200"
                >
                  {ref}
                </span>
              ))}
            </div>

            {showFullVerseText && (
              <div className="mt-3 p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-slate-700 italic leading-relaxed">
                Teks firman Tuhan ({sermon.main_scripture}): Silakan buka naskah Alkitab terjemahan resmi (misal: TB2-LAI) untuk eksposisi ayat yang lengkap saat berkhotbah.
              </div>
            )}
          </div>

          {/* SECTION DYNAMIC EDITORS */}
          {activeSection === 'big_idea' && (
            <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="border-b border-stone-100 pb-2 flex items-center justify-between">
                <h3 className="font-serif-title font-bold text-sm sm:text-base text-slate-900">
                  Gagasan Utama (Big Idea)
                </h3>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Pesan Sentral
                </span>
              </div>
              <p className="text-xs text-slate-500">
                1 kalimat sentral yang merangkum keseluruhan pesan firman yang akan dibawa pulang oleh jemaat.
              </p>
              <textarea
                rows={3}
                value={sermon.big_idea}
                onChange={(e) => updateField('big_idea', e.target.value)}
                className={`w-full p-3.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 font-medium text-slate-900 ${getFontSizeClass()}`}
              />
            </div>
          )}

          {activeSection === 'objective' && (
            <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="border-b border-stone-100 pb-2">
                <h3 className="font-serif-title font-bold text-sm sm:text-base text-slate-900">
                  Tujuan Khotbah
                </h3>
              </div>
              <textarea
                rows={3}
                value={sermon.objective || ''}
                onChange={(e) => updateField('objective', e.target.value)}
                placeholder="Apa yang ingin dicapai melalui khotbah ini?"
                className={`w-full p-3.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900 ${getFontSizeClass()}`}
              />
            </div>
          )}

          {activeSection === 'introduction' && (
            <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="border-b border-stone-100 pb-2 flex items-center justify-between">
                <h3 className="font-serif-title font-bold text-sm sm:text-base text-slate-900">
                  Pendahuluan Khotbah
                </h3>
                <span className="text-xs text-slate-400">Pancingan Perhatian (Hook)</span>
              </div>
              <p className="text-xs text-slate-500">
                Membangun relevansi kehidupan sehari-hari jemaat dan mengarahkan mereka kepada teks Alkitab.
              </p>
              <textarea
                rows={8}
                value={sermon.introduction}
                onChange={(e) => updateField('introduction', e.target.value)}
                className={`w-full p-3.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900 ${getFontSizeClass()}`}
              />
            </div>
          )}

          {activeSection === 'context' && (
            <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="border-b border-stone-100 pb-2">
                <h3 className="font-serif-title font-bold text-sm sm:text-base text-slate-900">
                  Konteks Alkitab & Historis
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Penulis, penerima surat/kitab, latar belakang sejarah, dan konteks teologis asli.
              </p>
              <textarea
                rows={7}
                value={sermon.context}
                onChange={(e) => updateField('context', e.target.value)}
                className={`w-full p-3.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900 ${getFontSizeClass()}`}
              />
            </div>
          )}

          {activeSection === 'text_explanation' && (
            <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="border-b border-stone-100 pb-2">
                <h3 className="font-serif-title font-bold text-sm sm:text-base text-slate-900">
                  Penjelasan Teks
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Uraian sistematis bagian teks firman Tuhan menurut metodologi {sermon.method}.
              </p>
              <textarea
                rows={7}
                value={sermon.text_explanation || ''}
                onChange={(e) => updateField('text_explanation', e.target.value)}
                placeholder="Penjelasan teks firman..."
                className={`w-full p-3.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900 ${getFontSizeClass()}`}
              />
            </div>
          )}

          {/* Point Editor if activeSection matches a MainPoint */}
          {sermon.main_points.map((pt, idx) => {
            if (activeSection !== pt.id) return null;
            return (
              <div key={pt.id} className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs space-y-4">
                <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h3 className="font-serif-title font-bold text-sm sm:text-base text-slate-900">
                      Poin Utama {idx + 1}
                    </h3>
                  </div>

                  <button
                    onClick={() => removeMainPoint(pt.id)}
                    className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold hover:bg-rose-50 px-2 py-1 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Hapus Poin
                  </button>
                </div>

                {/* Judul Poin */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Judul Poin Khotbah</label>
                  <input
                    type="text"
                    value={pt.title}
                    onChange={(e) => updateMainPoint(pt.id, 'title', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900"
                  />
                </div>

                {/* Dasar Ayat */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dasar Ayat</label>
                  <input
                    type="text"
                    value={pt.biblical_basis.join(', ')}
                    onChange={(e) =>
                      updateMainPoint(
                        pt.id,
                        'biblical_basis',
                        e.target.value.split(',').map((s) => s.trim())
                      )
                    }
                    className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900 font-medium"
                  />
                </div>

                {/* Penjelasan Eksegesis */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Penjelasan Teks (Eksegesis)
                  </label>
                  <textarea
                    rows={5}
                    value={pt.explanation}
                    onChange={(e) => updateMainPoint(pt.id, 'explanation', e.target.value)}
                    className={`w-full p-3.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900 ${getFontSizeClass()}`}
                  />
                </div>

                {/* Interpretasi */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Interpretasi & Makna Teologis
                  </label>
                  <textarea
                    rows={4}
                    value={pt.interpretation}
                    onChange={(e) => updateMainPoint(pt.id, 'interpretation', e.target.value)}
                    className={`w-full p-3.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900 ${getFontSizeClass()}`}
                  />
                </div>

                {/* Ilustrasi */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ilustrasi Kehidupan Nyata
                  </label>
                  <textarea
                    rows={4}
                    value={pt.illustration}
                    onChange={(e) => updateMainPoint(pt.id, 'illustration', e.target.value)}
                    className={`w-full p-3.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900 ${getFontSizeClass()}`}
                  />
                </div>

                {/* Aplikasi */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Penerapan Praktis
                  </label>
                  <textarea
                    rows={4}
                    value={pt.application}
                    onChange={(e) => updateMainPoint(pt.id, 'application', e.target.value)}
                    className={`w-full p-3.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900 ${getFontSizeClass()}`}
                  />
                </div>

                {/* Transisi */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Transisi ke Poin Berikutnya
                  </label>
                  <input
                    type="text"
                    value={pt.transition}
                    onChange={(e) => updateMainPoint(pt.id, 'transition', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 italic"
                  />
                </div>
              </div>
            );
          })}

          {activeSection === 'applications' && (
            <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs space-y-4">
              <div className="border-b border-stone-100 pb-2">
                <h3 className="font-serif-title font-bold text-sm sm:text-base text-slate-900">
                  Aplikasi Praktis Kehidupan Jemaat
                </h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pribadi</label>
                  <textarea
                    rows={3}
                    value={sermon.applications?.personal || ''}
                    onChange={(e) =>
                      updateField('applications', { ...sermon.applications, personal: e.target.value })
                    }
                    className={`w-full p-3 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-500 ${getFontSizeClass()}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Keluarga</label>
                  <textarea
                    rows={3}
                    value={sermon.applications?.family || ''}
                    onChange={(e) =>
                      updateField('applications', { ...sermon.applications, family: e.target.value })
                    }
                    className={`w-full p-3 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-500 ${getFontSizeClass()}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pekerjaan & Usaha</label>
                  <textarea
                    rows={3}
                    value={sermon.applications?.workplace || ''}
                    onChange={(e) =>
                      updateField('applications', { ...sermon.applications, workplace: e.target.value })
                    }
                    className={`w-full p-3 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-500 ${getFontSizeClass()}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pelayanan Gereja</label>
                  <textarea
                    rows={3}
                    value={sermon.applications?.ministry || ''}
                    onChange={(e) =>
                      updateField('applications', { ...sermon.applications, ministry: e.target.value })
                    }
                    className={`w-full p-3 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-500 ${getFontSizeClass()}`}
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'reflections' && (
            <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="border-b border-stone-100 pb-2">
                <h3 className="font-serif-title font-bold text-sm sm:text-base text-slate-900">
                  Pertanyaan Refleksi Pribadi
                </h3>
              </div>
              <div className="space-y-2.5">
                {sermon.reflection_questions.map((q, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-stone-200 text-slate-700 text-xs flex items-center justify-center font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={q}
                      onChange={(e) => {
                        const updated = [...sermon.reflection_questions];
                        updated[idx] = e.target.value;
                        updateField('reflection_questions', updated);
                      }}
                      className="flex-1 px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'conclusion' && (
            <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="border-b border-stone-100 pb-2">
                <h3 className="font-serif-title font-bold text-sm sm:text-base text-slate-900">
                  Kesimpulan Khotbah
                </h3>
              </div>
              <textarea
                rows={6}
                value={sermon.conclusion}
                onChange={(e) => updateField('conclusion', e.target.value)}
                className={`w-full p-3.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900 ${getFontSizeClass()}`}
              />
            </div>
          )}

          {activeSection === 'call_to_action' && (
            <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="border-b border-stone-100 pb-2">
                <h3 className="font-serif-title font-bold text-sm sm:text-base text-slate-900">
                  Ajakan (Call to Action)
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Panggilan konkret bagi jemaat untuk merespons firman Tuhan hari ini.
              </p>
              <textarea
                rows={4}
                value={sermon.call_to_action}
                onChange={(e) => updateField('call_to_action', e.target.value)}
                className={`w-full p-3.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900 ${getFontSizeClass()}`}
              />
            </div>
          )}

          {activeSection === 'closing_prayer' && (
            <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="border-b border-stone-100 pb-2">
                <h3 className="font-serif-title font-bold text-sm sm:text-base text-slate-900">
                  Doa Penutup
                </h3>
              </div>
              <textarea
                rows={6}
                value={sermon.closing_prayer}
                onChange={(e) => updateField('closing_prayer', e.target.value)}
                className={`w-full p-3.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900 italic ${getFontSizeClass()}`}
              />
            </div>
          )}
        </main>

        {/* RIGHT COLUMN: AI Assistant (3 cols) */}
        <aside className={`lg:col-span-3 space-y-4 ${mobileTab === 'ai' ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-white shadow-xl sticky top-36">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">AI Sermon Assistant</h4>
                <p className="text-[10px] text-amber-400 font-medium">
                  {getCurrentSectionContent().name}
                </p>
              </div>
            </div>

            {/* Quick Action Chips */}
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
              Aksi Cepat AI
            </p>
            <div className="grid grid-cols-2 gap-1.5 mb-4">
              <button
                type="button"
                onClick={() => handleAskAi('Perbaiki bagian ini agar lebih mengalir dan terstruktur')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 text-left border border-slate-700/80 transition-colors active:scale-95"
              >
                ⚡ Alur lebih rapi
              </button>
              <button
                type="button"
                onClick={() => handleAskAi('Buat lebih praktis dengan contoh langkah harian')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 text-left border border-slate-700/80 transition-colors active:scale-95"
              >
                ⚡ Lebih praktis
              </button>
              <button
                type="button"
                onClick={() => handleAskAi('Buat lebih teologis dan dalam secara eksegesis Alkitab')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 text-left border border-slate-700/80 transition-colors active:scale-95"
              >
                ⚡ Lebih teologis
              </button>
              <button
                type="button"
                onClick={() => handleAskAi('Tambahkan ilustrasi nyata yang menyentuh hati')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 text-left border border-slate-700/80 transition-colors active:scale-95"
              >
                ⚡ Tambah ilustrasi
              </button>
            </div>

            {/* Custom Prompt Textarea */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Instruksi Khusus
              </label>
              <textarea
                rows={3}
                value={aiInstruction}
                onChange={(e) => setAiInstruction(e.target.value)}
                placeholder="Contoh: Perpendek paragraf ini dan beri analogi gembala..."
                className="w-full p-2.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                disabled={aiLoading || !aiInstruction.trim()}
                onClick={() => handleAskAi()}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-95"
              >
                {aiLoading ? (
                  <span>Memproses dengan AI...</span>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Jalankan Asisten AI</span>
                  </>
                )}
              </button>
            </div>

            {aiError && (
              <div className="mt-3 p-2.5 bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs rounded-xl">
                {aiError}
              </div>
            )}

            {aiSuggestion && (
              <div className="mt-4 p-3.5 bg-slate-800/90 border border-amber-500/40 rounded-xl space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between pb-1 border-b border-slate-700">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Saran AI
                  </span>
                  <button
                    onClick={() => setAiSuggestion('')}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    Tutup
                  </button>
                </div>
                <div className="text-xs text-slate-200 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-line bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60">
                  {aiSuggestion}
                </div>
                <button
                  type="button"
                  onClick={handleApplyAiSuggestion}
                  className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Terapkan ke Bagian Ini</span>
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Floating Bottom Action Bar for Mobile Preachers */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-3 py-2 shadow-2xl safe-area-bottom">
        <div className="flex items-center justify-between gap-2 max-w-lg mx-auto">
          <button
            onClick={addNewMainPoint}
            className="flex-1 py-2 px-2.5 rounded-xl bg-slate-800 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>+ Poin</span>
          </button>

          <button
            onClick={() => onOpenPowerPoint(sermon)}
            className="flex-1 py-2 px-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>Slide PPT</span>
          </button>

          <button
            onClick={handleCopyFullSermon}
            className="flex-1 py-2 px-2.5 rounded-xl bg-slate-800 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95"
          >
            {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copySuccess ? 'Tersalin' : 'Salin'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Bottom Sheet for Extra Actions */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/70 backdrop-blur-xs animate-fadeIn sm:hidden">
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 shadow-2xl safe-area-bottom space-y-3 text-white">
            <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-2" />
            <div className="pb-2 border-b border-slate-800">
              <p className="font-serif-title font-bold text-sm text-white truncate">
                {sermon.title}
              </p>
              <p className="text-xs text-amber-400">{sermon.main_scripture}</p>
            </div>

            <div className="space-y-1 text-xs font-semibold">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenOutline(sermon);
                }}
                className="w-full text-left p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 flex items-center gap-3 text-slate-200 active:scale-[0.98]"
              >
                <ListOrdered className="w-4 h-4 text-amber-400" />
                <span>Lihat Outline Mimbar Rapi</span>
              </button>

              <button
                onClick={handleCopyFullSermon}
                className="w-full text-left p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 flex items-center gap-3 text-slate-200 active:scale-[0.98]"
              >
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Salin Seluruh Naskah Khotbah</span>
              </button>

              <button
                onClick={handlePrintSermon}
                className="w-full text-left p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 flex items-center gap-3 text-slate-200 active:scale-[0.98]"
              >
                <Printer className="w-4 h-4 text-slate-400" />
                <span>Cetak / Cetak PDF</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onBackToDashboard();
                }}
                className="w-full text-left p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 flex items-center gap-3 text-slate-400 active:scale-[0.98]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Tutup & Kembali ke Dashboard</span>
              </button>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
