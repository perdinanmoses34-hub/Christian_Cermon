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
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [showFullVerseText, setShowFullVerseText] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

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
        name: 'Pendahuluan',
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
    if (activeSection === 'call_to_action') {
      return {
        name: 'Ajakan (Call to Action)',
        content: sermon.call_to_action,
        setter: (val) => updateField('call_to_action', val),
      };
    }
    if (activeSection === 'conclusion') {
      return {
        name: 'Kesimpulan',
        content: sermon.conclusion,
        setter: (val) => updateField('conclusion', val),
      };
    }
    if (activeSection === 'closing_prayer') {
      return {
        name: 'Doa Penutup',
        content: sermon.closing_prayer,
        setter: (val) => updateField('closing_prayer', val),
      };
    }

    // Check if it's one of the main points
    const point = sermon.main_points.find((p) => p.id === activeSection);
    if (point) {
      return {
        name: point.title,
        content: `${point.explanation}\n\n[Ilustrasi]: ${point.illustration}\n\n[Aplikasi]: ${point.application}`,
        setter: (val) => updateMainPoint(point.id, 'explanation', val),
      };
    }

    return {
      name: 'Naskah Khotbah',
      content: sermon.big_idea,
      setter: (val) => updateField('big_idea', val),
    };
  };

  // AI Assistant Request
  const handleAskAi = async (customPrompt?: string) => {
    const promptToUse = customPrompt || aiInstruction;
    if (!promptToUse.trim()) return;

    setAiLoading(true);
    setAiError('');
    setAiSuggestion('');

    const currentSec = getCurrentSectionContent();
    try {
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
  };

  const handlePrintSermon = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      {/* Top Header Bar */}
      <header className="bg-slate-900 border-b border-slate-800 text-white px-4 sm:px-6 py-3 sticky top-16 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToDashboard}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={sermon.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  className="font-serif-title font-bold text-base sm:text-lg bg-transparent border-b border-transparent hover:border-slate-600 focus:border-amber-400 focus:outline-none text-white max-w-sm sm:max-w-md"
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="text-amber-400 font-semibold">{sermon.main_scripture}</span>
                <span>•</span>
                <span className="capitalize">{sermon.method}</span>
                <span>•</span>
                <span>{sermon.duration}</span>
              </div>
            </div>
          </div>

          {/* Status & Actions */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 text-xs text-slate-300 mr-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  saveStatus === 'saved' ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'
                }`}
              />
              <span>{saveStatus === 'saved' ? 'Saved' : 'Saving...'}</span>
            </div>

            <button
              onClick={() => onOpenOutline(sermon)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <ListOrdered className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Outline</span>
            </button>

            <button
              onClick={() => onOpenPowerPoint(sermon)}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>Generate PowerPoint</span>
            </button>

            <button
              onClick={handleCopyFullSermon}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Salin Seluruh Naskah Khotbah"
            >
              {copySuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={handlePrintSermon}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Cetak Khotbah"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main 3-Column Workspace */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Section Navigation (3 cols) */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 sticky top-36">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Daftar Isi Khotbah
              </span>
              <button
                onClick={addNewMainPoint}
                className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200"
              >
                <Plus className="w-3 h-3" /> Poin
              </button>
            </div>

            <nav className="space-y-1 text-xs max-h-[calc(100vh-240px)] overflow-y-auto pr-1">
              <button
                onClick={() => setActiveSection('big_idea')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-between ${
                  activeSection === 'big_idea'
                    ? 'bg-amber-100 text-amber-900 font-bold border-l-4 border-amber-600'
                    : 'text-slate-700 hover:bg-stone-50'
                }`}
              >
                <span>★ Big Idea & Pesan Sentral</span>
              </button>

              <button
                onClick={() => setActiveSection('objective')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-between ${
                  activeSection === 'objective'
                    ? 'bg-amber-100 text-amber-900 font-bold border-l-4 border-amber-600'
                    : 'text-slate-700 hover:bg-stone-50'
                }`}
              >
                <span>Tujuan Khotbah</span>
              </button>

              <button
                onClick={() => setActiveSection('introduction')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-between ${
                  activeSection === 'introduction'
                    ? 'bg-amber-100 text-amber-900 font-bold border-l-4 border-amber-600'
                    : 'text-slate-700 hover:bg-stone-50'
                }`}
              >
                <span>Pendahuluan & Hook</span>
              </button>

              <button
                onClick={() => setActiveSection('context')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-between ${
                  activeSection === 'context'
                    ? 'bg-amber-100 text-amber-900 font-bold border-l-4 border-amber-600'
                    : 'text-slate-700 hover:bg-stone-50'
                }`}
              >
                <span>Konteks Alkitab & Historis</span>
              </button>

              <button
                onClick={() => setActiveSection('text_explanation')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-between ${
                  activeSection === 'text_explanation'
                    ? 'bg-amber-100 text-amber-900 font-bold border-l-4 border-amber-600'
                    : 'text-slate-700 hover:bg-stone-50'
                }`}
              >
                <span>Penjelasan Teks</span>
              </button>

              {/* Main Points */}
              <div className="pt-2 pb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3">
                  Poin Utama ({sermon.main_points.length})
                </span>
              </div>

              {sermon.main_points.map((pt, idx) => (
                <button
                  key={pt.id}
                  onClick={() => setActiveSection(pt.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-between truncate ${
                    activeSection === pt.id
                      ? 'bg-amber-100 text-amber-900 font-bold border-l-4 border-amber-600'
                      : 'text-slate-700 hover:bg-stone-50'
                  }`}
                >
                  <span className="truncate">
                    {idx + 1}. {pt.title.replace(/^Poin\s*\d+[:\-]\s*/i, '')}
                  </span>
                </button>
              ))}

              <div className="pt-2 pb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3">
                  Penutup & Penerapan
                </span>
              </div>

              <button
                onClick={() => setActiveSection('applications')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-between ${
                  activeSection === 'applications'
                    ? 'bg-amber-100 text-amber-900 font-bold border-l-4 border-amber-600'
                    : 'text-slate-700 hover:bg-stone-50'
                }`}
              >
                <span>Aplikasi Praktis</span>
              </button>

              <button
                onClick={() => setActiveSection('reflections')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-between ${
                  activeSection === 'reflections'
                    ? 'bg-amber-100 text-amber-900 font-bold border-l-4 border-amber-600'
                    : 'text-slate-700 hover:bg-stone-50'
                }`}
              >
                <span>Pertanyaan Refleksi</span>
              </button>

              <button
                onClick={() => setActiveSection('conclusion')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-between ${
                  activeSection === 'conclusion'
                    ? 'bg-amber-100 text-amber-900 font-bold border-l-4 border-amber-600'
                    : 'text-slate-700 hover:bg-stone-50'
                }`}
              >
                <span>Kesimpulan</span>
              </button>

              <button
                onClick={() => setActiveSection('call_to_action')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-between ${
                  activeSection === 'call_to_action'
                    ? 'bg-amber-100 text-amber-900 font-bold border-l-4 border-amber-600'
                    : 'text-slate-700 hover:bg-stone-50'
                }`}
              >
                <span>Ajakan (Call to Action)</span>
              </button>

              <button
                onClick={() => setActiveSection('closing_prayer')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-between ${
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
        <main className="lg:col-span-6 space-y-5">
          {/* Biblical Integrity Disclaimer Box */}
          <div className="bg-amber-50/70 border border-amber-200/90 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-semibold">Catatan Homiletika:</strong> "Khotbah ini dibuat sebagai alat bantu persiapan. Verifikasi kembali interpretasi, konteks, referensi Alkitab, dan penerapannya sebelum digunakan dalam pelayanan mimbar."
            </div>
          </div>

          {/* Cross References bar */}
          <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-slate-800">Ayat Alkitab & Cross References</span>
              </div>
              <button
                onClick={() => setShowFullVerseText(!showFullVerseText)}
                className="text-[11px] font-semibold text-amber-700 hover:underline"
              >
                {showFullVerseText ? 'Tampilkan Referensi Saja' : 'Tampilkan Teks Firman'}
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
                Utama: {sermon.main_scripture}
              </span>
              {sermon.supporting_scriptures.map((ref, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded bg-stone-100 text-slate-700 text-xs font-medium border border-stone-200"
                >
                  {ref}
                </span>
              ))}
            </div>

            {showFullVerseText && (
              <div className="mt-3 p-3 rounded-lg bg-stone-50 border border-stone-200 text-xs text-slate-700 italic leading-relaxed">
                Teks firman Tuhan ({sermon.main_scripture}): Silakan buka naskah Alkitab terjemahan resmi (misal: TB2-LAI) untuk eksposisi ayat yang lengkap saat berkhotbah.
              </div>
            )}
          </div>

          {/* SECTION DYNAMIC EDITORS */}
          {activeSection === 'big_idea' && (
            <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm space-y-3">
              <div className="border-b border-stone-100 pb-2 flex items-center justify-between">
                <h3 className="font-serif-title font-bold text-base text-slate-900">
                  Gagasan Utama (Big Idea)
                </h3>
                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  1 Kalimat Sentral Khotbah
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Kalimat tesis tunggal yang merangkum keseluruhan pesan firman yang akan dibawa pulang oleh jemaat.
              </p>
              <textarea
                rows={3}
                value={sermon.big_idea}
                onChange={(e) => updateField('big_idea', e.target.value)}
                className="w-full p-3 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 font-medium text-slate-800 leading-relaxed"
              />
            </div>
          )}

          {activeSection === 'objective' && (
            <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm space-y-3">
              <div className="border-b border-stone-100 pb-2">
                <h3 className="font-serif-title font-bold text-base text-slate-900">
                  Tujuan Khotbah
                </h3>
              </div>
              <textarea
                rows={3}
                value={sermon.objective || ''}
                onChange={(e) => updateField('objective', e.target.value)}
                placeholder="Apa yang ingin dicapai melalui khotbah ini?"
                className="w-full p-3 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-800 leading-relaxed"
              />
            </div>
          )}

          {activeSection === 'introduction' && (
            <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm space-y-3">
              <div className="border-b border-stone-100 pb-2 flex items-center justify-between">
                <h3 className="font-serif-title font-bold text-base text-slate-900">
                  Pendahuluan Khotbah
                </h3>
                <span className="text-xs text-slate-400">Pancingan Perhatian (Hook)</span>
              </div>
              <p className="text-xs text-slate-500">
                Membangun relevansi kehidupan sehari-hari jemaat dan mengarahkan mereka kepada teks Alkitab.
              </p>
              <textarea
                rows={7}
                value={sermon.introduction}
                onChange={(e) => updateField('introduction', e.target.value)}
                className="w-full p-3 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-800 leading-relaxed"
              />
            </div>
          )}

          {activeSection === 'context' && (
            <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm space-y-3">
              <div className="border-b border-stone-100 pb-2">
                <h3 className="font-serif-title font-bold text-base text-slate-900">
                  Konteks Alkitab & Historis
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Penulis, penerima surat/kitab, latar belakang sejarah, konteks sastra, dan tujuan penulisan asli.
              </p>
              <textarea
                rows={6}
                value={sermon.context}
                onChange={(e) => updateField('context', e.target.value)}
                className="w-full p-3 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-800 leading-relaxed"
              />
            </div>
          )}

          {activeSection === 'text_explanation' && (
            <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm space-y-3">
              <div className="border-b border-stone-100 pb-2">
                <h3 className="font-serif-title font-bold text-base text-slate-900">
                  Penjelasan Teks
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Uraian sistematis bagian teks firman Tuhan menurut metodologi homiletika {sermon.method}.
              </p>
              <textarea
                rows={6}
                value={sermon.text_explanation || ''}
                onChange={(e) => updateField('text_explanation', e.target.value)}
                placeholder="Penjelasan teks umum..."
                className="w-full p-3 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-800 leading-relaxed"
              />
            </div>
          )}

          {/* Point Editor if activeSection matches a MainPoint */}
          {sermon.main_points.map((pt, idx) => {
            if (activeSection !== pt.id) return null;
            return (
              <div key={pt.id} className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm space-y-4">
                <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h3 className="font-serif-title font-bold text-base text-slate-900">
                      Poin Utama {idx + 1}
                    </h3>
                  </div>

                  <button
                    onClick={() => removeMainPoint(pt.id)}
                    className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium hover:bg-rose-50 px-2 py-1 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Hapus Poin
                  </button>
                </div>

                {/* Judul Poin */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Judul Poin</label>
                  <input
                    type="text"
                    value={pt.title}
                    onChange={(e) => updateMainPoint(pt.id, 'title', e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm font-semibold bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900"
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
                    className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500 text-slate-800"
                  />
                </div>

                {/* Penjelasan Eksegesis / Tafsiran */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Penjelasan & Penafsiran Firman
                  </label>
                  <textarea
                    rows={4}
                    value={pt.explanation}
                    onChange={(e) => updateMainPoint(pt.id, 'explanation', e.target.value)}
                    className="w-full p-3 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-800 leading-relaxed"
                  />
                </div>

                {/* Ilustrasi */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ilustrasi yang Mendukung
                  </label>
                  <textarea
                    rows={3}
                    value={pt.illustration}
                    onChange={(e) => updateMainPoint(pt.id, 'illustration', e.target.value)}
                    className="w-full p-3 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-800 leading-relaxed"
                  />
                </div>

                {/* Aplikasi Poin */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Penerapan Praktis Poin Ini
                  </label>
                  <textarea
                    rows={3}
                    value={pt.application}
                    onChange={(e) => updateMainPoint(pt.id, 'application', e.target.value)}
                    className="w-full p-3 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-800 leading-relaxed"
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
                    className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500 text-slate-800 italic"
                  />
                </div>
              </div>
            );
          })}

          {activeSection === 'applications' && (
            <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm space-y-4">
              <div className="border-b border-stone-100 pb-2">
                <h3 className="font-serif-title font-bold text-base text-slate-900">
                  Aplikasi Praktis Kehidupan Jemaat
                </h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pribadi</label>
                  <textarea
                    rows={2}
                    value={sermon.applications?.personal || ''}
                    onChange={(e) =>
                      updateField('applications', { ...sermon.applications, personal: e.target.value })
                    }
                    className="w-full p-2.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Keluarga</label>
                  <textarea
                    rows={2}
                    value={sermon.applications?.family || ''}
                    onChange={(e) =>
                      updateField('applications', { ...sermon.applications, family: e.target.value })
                    }
                    className="w-full p-2.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pekerjaan & Bisnis</label>
                  <textarea
                    rows={2}
                    value={sermon.applications?.workplace || ''}
                    onChange={(e) =>
                      updateField('applications', { ...sermon.applications, workplace: e.target.value })
                    }
                    className="w-full p-2.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pelayanan Gereja</label>
                  <textarea
                    rows={2}
                    value={sermon.applications?.ministry || ''}
                    onChange={(e) =>
                      updateField('applications', { ...sermon.applications, ministry: e.target.value })
                    }
                    className="w-full p-2.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'reflections' && (
            <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm space-y-3">
              <div className="border-b border-stone-100 pb-2">
                <h3 className="font-serif-title font-bold text-base text-slate-900">
                  Pertanyaan Refleksi Pribadi (3-5 Pertanyaan)
                </h3>
              </div>
              <div className="space-y-2">
                {sermon.reflection_questions.map((q, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-stone-200 text-slate-700 text-xs flex items-center justify-center font-bold">
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
                      className="flex-1 px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500 text-slate-800"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'conclusion' && (
            <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm space-y-3">
              <div className="border-b border-stone-100 pb-2">
                <h3 className="font-serif-title font-bold text-base text-slate-900">
                  Kesimpulan Khotbah
                </h3>
              </div>
              <textarea
                rows={5}
                value={sermon.conclusion}
                onChange={(e) => updateField('conclusion', e.target.value)}
                className="w-full p-3 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-800 leading-relaxed"
              />
            </div>
          )}

          {activeSection === 'call_to_action' && (
            <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm space-y-3">
              <div className="border-b border-stone-100 pb-2">
                <h3 className="font-serif-title font-bold text-base text-slate-900">
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
                className="w-full p-3 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-800 leading-relaxed"
              />
            </div>
          )}

          {activeSection === 'closing_prayer' && (
            <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm space-y-3">
              <div className="border-b border-stone-100 pb-2">
                <h3 className="font-serif-title font-bold text-base text-slate-900">
                  Doa Penutup
                </h3>
              </div>
              <textarea
                rows={6}
                value={sermon.closing_prayer}
                onChange={(e) => updateField('closing_prayer', e.target.value)}
                className="w-full p-3 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-800 leading-relaxed italic"
              />
            </div>
          )}
        </main>

        {/* RIGHT COLUMN: AI Assistant (3 cols) */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white shadow-xl sticky top-36">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">AI Sermon Assistant</h4>
                <p className="text-[10px] text-amber-400">
                  Fokus pada: {getCurrentSectionContent().name}
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
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 text-left border border-slate-700/80 transition-colors"
              >
                ⚡ Perbaiki bagian ini
              </button>
              <button
                type="button"
                onClick={() => handleAskAi('Buat lebih praktis dengan contoh langkah harian')}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 text-left border border-slate-700/80 transition-colors"
              >
                ⚡ Buat lebih praktis
              </button>
              <button
                type="button"
                onClick={() => handleAskAi('Buat lebih teologis dan dalam secara eksegesis Alkitab')}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 text-left border border-slate-700/80 transition-colors"
              >
                ⚡ Lebih teologis
              </button>
              <button
                type="button"
                onClick={() => handleAskAi('Tambahkan ilustrasi nyata yang menyentuh hati')}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 text-left border border-slate-700/80 transition-colors"
              >
                ⚡ Tambah ilustrasi
              </button>
              <button
                type="button"
                onClick={() => handleAskAi('Sesuaikan bahasa dan analogi agar relevan untuk pemuda')}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 text-left border border-slate-700/80 transition-colors"
              >
                ⚡ Untuk pemuda
              </button>
              <button
                type="button"
                onClick={() => handleAskAi('Periksa konsistensi dengan teks Alkitab dan pastikan tidak ada interpretasi keliru')}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 text-left border border-slate-700/80 transition-colors"
              >
                ⚡ Periksa teks Alkitab
              </button>
            </div>

            {/* Custom Prompt Textarea */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Instruksi Kustom ke AI
              </label>
              <textarea
                rows={3}
                value={aiInstruction}
                onChange={(e) => setAiInstruction(e.target.value)}
                placeholder="Tuliskan permintaan khusus Anda... (contoh: 'Perpendek paragraf ini dan tambahkan analogi pelaut')"
                className="w-full p-2.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                disabled={aiLoading || !aiInstruction.trim()}
                onClick={() => handleAskAi()}
                className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {aiLoading ? (
                  <span>Memproses dengan AI...</span>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Jalankan AI Assistant</span>
                  </>
                )}
              </button>
            </div>

            {aiError && (
              <div className="mt-3 p-2 rounded bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                {aiError}
              </div>
            )}

            {/* AI Suggestion Preview Box */}
            {aiSuggestion && (
              <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">
                  Hasil Rekomendasi AI:
                </span>
                <div className="p-2.5 rounded-lg bg-slate-800/90 border border-slate-700 text-xs text-slate-200 max-h-48 overflow-y-auto leading-relaxed whitespace-pre-wrap">
                  {aiSuggestion}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleApplyAiSuggestion}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                  >
                    Terapkan Hasil Ini
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiSuggestion('')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs"
                  >
                    Tolak
                  </button>
                </div>
              </div>
            )}

            <p className="text-[10px] text-slate-500 mt-4 italic">
              AI hanya mengubah bagian yang diminta dan tidak merombak seluruh khotbah tanpa persetujuan Anda.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
