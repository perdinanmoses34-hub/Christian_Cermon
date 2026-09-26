import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Plus,
  Trash2,
  Clock,
  Users,
  Compass,
  Layers,
  ArrowRight,
  Sliders,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Info,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { PreachingMethod, TargetAudience, LanguageStyle, Sermon } from '../types/sermon';
import { generateSermonApi } from '../services/api';

interface CreateSermonWizardProps {
  currentUser: any;
  initialData?: { scripture?: string; theme?: string; objective?: string };
  onSuccess: (sermon: Sermon) => void;
  onCancel: () => void;
}

const PREACHING_METHODS: Array<{
  id: PreachingMethod;
  name: string;
  tagline: string;
  desc: string;
  structure: string[];
}> = [
  {
    id: 'ekspositori',
    name: 'Ekspositori',
    tagline: 'Penggalian mendalam dari teks Alkitab',
    desc: 'Khotbah berfokus pada penggalian dan penjelasan bagian Alkitab sesuai konteks asli.',
    structure: ['Teks', 'Konteks', 'Observasi', 'Interpretasi', 'Aplikasi'],
  },
  {
    id: 'topikal',
    name: 'Topikal',
    tagline: 'Berfokus pada satu tema teologis',
    desc: 'Khotbah berfokus pada satu tema spesifik menggunakan rangkaian ayat yang relevan.',
    structure: ['Tema', 'Dasar Alkitab', 'Poin Utama', 'Aplikasi', 'Kesimpulan'],
  },
  {
    id: 'tekstual',
    name: 'Tekstual',
    tagline: 'Satu ayat atau perikop pendek',
    desc: 'Berfokus pada klausul ayat pendek dan mengembangkan poin berdasarkan teks tersebut.',
    structure: ['Ayat Kunci', 'Frasa Utama', 'Poin Teks', 'Aplikasi Konkret'],
  },
  {
    id: 'naratif',
    name: 'Naratif',
    tagline: 'Bercerita melalui alur kisah Alkitab',
    desc: 'Menggunakan alur kisah tokoh atau peristiwa Alkitab sebagai dasar pesan rohani.',
    structure: ['Tokoh', 'Konflik', 'Klimaks', 'Pelajaran Rohani', 'Aplikasi'],
  },
  {
    id: 'induktif',
    name: 'Induktif',
    tagline: 'Dari pertanyaan menuju kebenaran firman',
    desc: 'Dimulai dari pergumulan jemaat, lalu menuntun kepada kesimpulan firman Tuhan.',
    structure: ['Pertanyaan / Kasus', 'Penjelajahan Teks', 'Klimaks Kebenaran'],
  },
  {
    id: 'deduktif',
    name: 'Deduktif',
    tagline: 'Kebenaran utama dijabarkan logis',
    desc: 'Menyatakan kebenaran utama di awal, lalu dikembangkan lewat argumen dan ayat pendukung.',
    structure: ['Pernyataan Tesis Utama', 'Argumen 1 & Ayat', 'Argumen 2', 'Aplikasi'],
  },
  {
    id: 'problem_solution',
    name: 'Problem-Solution',
    tagline: 'Krisis jemaat dijawab prinsip Alkitab',
    desc: 'Dimulai dengan masalah nyata jemaat, kemudian menunjukkan prinsip firman sebagai solusi.',
    structure: ['Dilema Nyata', 'Akar Masalah', 'Jawaban Firman', 'Solusi Praktis'],
  },
  {
    id: 'kristosentris',
    name: 'Kristosentris',
    tagline: 'Berpusat pada karya keselamatan Kristus',
    desc: 'Menunjukkan hubungan teks firman dengan karya penebusan Kristus dan Injil.',
    structure: ['Teks Asli', 'Kebutuhan Penebusan', 'Penggenapan di Kristus', 'Respon Iman'],
  },
];

const GENERATION_STEPS = [
  'Menganalisis tema khotbah...',
  'Menganalisis teks Alkitab & konteks aslinya...',
  'Menentukan Big Idea (Gagasan Utama)...',
  'Menyusun struktur outline homiletika...',
  'Mengembangkan poin-poin khotbah & eksegesis...',
  'Menambahkan aplikasi kehidupan & pertanyaan refleksi...',
  'Menyiapkan ilustrasi yang relevan & doa...',
  'Menyusun slide PowerPoint & speaker notes mimbar...',
];

export const CreateSermonWizard: React.FC<CreateSermonWizardProps> = ({
  currentUser,
  initialData,
  onSuccess,
  onCancel,
}) => {
  // Form State
  const [theme, setTheme] = useState(initialData?.theme || '');
  const [mainScripture, setMainScripture] = useState(initialData?.scripture || '');
  const [supportingScriptures, setSupportingScriptures] = useState<string[]>(['']);
  const [objective, setObjective] = useState(initialData?.objective || '');
  const [audience, setAudience] = useState<TargetAudience>('dewasa');
  const [duration, setDuration] = useState('30 menit');
  const [customDuration, setCustomDuration] = useState('');
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const [method, setMethod] = useState<PreachingMethod>('ekspositori');

  // Style State
  const [languageStyle, setLanguageStyle] = useState<LanguageStyle>('Pastoral');
  const [theologicalToPractical, setTheologicalToPractical] = useState(60);
  const [seriousToRelaxed, setSeriousToRelaxed] = useState(40);

  // Generation Progress State
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle Supporting Scripture inputs
  const handleAddSupportingScripture = () => {
    setSupportingScriptures([...supportingScriptures, '']);
  };

  const handleUpdateSupportingScripture = (index: number, value: string) => {
    const updated = [...supportingScriptures];
    updated[index] = value;
    setSupportingScriptures(updated);
  };

  const handleRemoveSupportingScripture = (index: number) => {
    const updated = supportingScriptures.filter((_, i) => i !== index);
    setSupportingScriptures(updated.length > 0 ? updated : ['']);
  };

  // Step progression animation when generating
  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      setCurrentStepIndex(0);
      interval = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < GENERATION_STEPS.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 1600);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!theme.trim()) {
      setErrorMessage('Harap masukkan Tema Khotbah.');
      return;
    }
    if (!mainScripture.trim()) {
      setErrorMessage('Harap masukkan Ayat Alkitab Utama.');
      return;
    }

    setErrorMessage('');
    setIsGenerating(true);

    const cleanSupporting = supportingScriptures.map((s) => s.trim()).filter((s) => s.length > 0);
    const effectiveDuration = duration === 'custom' ? (customDuration ? `${customDuration} menit` : '30 menit') : duration;

    try {
      const payload = {
        theme,
        main_scripture: mainScripture,
        supporting_scriptures: cleanSupporting,
        objective,
        audience,
        duration: effectiveDuration,
        language,
        method,
        style: {
          languageStyle,
          theologicalToPractical,
          seriousToRelaxed,
        },
      };

      const newSermon = await generateSermonApi(payload, currentUser);
      setIsGenerating(false);
      onSuccess(newSermon);
    } catch (err: any) {
      console.error('Generation error:', err);
      setIsGenerating(false);
      setErrorMessage(
        err.message || 'Maaf, khotbah belum berhasil dibuat. Silakan coba lagi.'
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8 pb-32 md:pb-12 animate-fadeIn w-full max-w-full overflow-x-hidden">
      {/* Loading & Multi-Step Progress Overlay: Material Dialog */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-5 sm:p-7 shadow-2xl text-white max-h-[90vh] flex flex-col overflow-hidden">
            <div className="text-center mb-4 shrink-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto mb-2.5 animate-bounce">
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-serif-title font-bold text-white">
                Menyusun Khotbah Alkitabiah
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                AI menganalisis firman, merancang homiletika, & membuat slide PPT...
              </p>
            </div>

            {/* 8 Step Animated Progress List */}
            <div className="space-y-2 bg-slate-950/70 p-3 sm:p-4 rounded-2xl border border-slate-800/80 overflow-y-auto flex-1 text-xs">
              {GENERATION_STEPS.map((step, idx) => {
                const isPassed = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2.5 text-xs p-2 rounded-xl transition-all duration-300 ${
                      isCurrent
                        ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                        : isPassed
                        ? 'text-emerald-400'
                        : 'text-slate-500 opacity-50'
                    }`}
                  >
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : isCurrent ? (
                      <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0 flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </div>
                    )}
                    <span className="flex-1 truncate">{step}</span>
                  </div>
                );
              })}
            </div>

            <p className="text-center text-[11px] text-amber-400/80 mt-3 shrink-0">
              Proses memerlukan waktu sekitar 15-30 detik...
            </p>
          </div>
        </div>
      )}

      {/* Main Wizard Header */}
      <div className="mb-4 sm:mb-8">
        <button
          onClick={onCancel}
          className="hidden sm:inline-flex text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2 items-center gap-1.5 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard</span>
        </button>

        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-lg sm:text-2xl md:text-3xl font-serif-title font-bold text-slate-900 tracking-tight">
              Susun Khotbah Baru
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Lengkapi tema, ayat, dan metode homiletika untuk menyusun naskah firman.
            </p>
          </div>
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Alkitabiah</span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{errorMessage}</p>
            <p className="text-slate-600 mt-0.5">Periksa input Anda dan klik tombol "Buat Khotbah Sekarang".</p>
          </div>
          <button
            onClick={() => setErrorMessage('')}
            className="text-rose-600 font-bold hover:underline"
          >
            Tutup
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-7">
        {/* SECTION 1: DASAR KHOTBAH */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 font-serif-title">
              Tema & Teks Alkitab
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tema Khotbah */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Tema Khotbah <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Contoh: Hidup Dalam Iman yang Sejati"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900 font-medium"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Gagasan sentral atau tema pokok firman Tuhan.
              </p>
            </div>

            {/* Ayat Alkitab Utama */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Ayat Alkitab Utama <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={mainScripture}
                onChange={(e) => setMainScripture(e.target.value)}
                placeholder="Contoh: Ibrani 11:1-6 atau Yohanes 3:16"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900 font-medium"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Perikop atau ayat kunci yang akan dieksposisi.
              </p>
            </div>
          </div>

          {/* Ayat Pendukung */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800">
                Ayat Pendukung (Opsional)
              </label>
              <button
                type="button"
                onClick={handleAddSupportingScripture}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Tambah Ayat
              </button>
            </div>

            <div className="space-y-2">
              {supportingScriptures.map((scripture, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={scripture}
                    onChange={(e) => handleUpdateSupportingScripture(idx, e.target.value)}
                    placeholder="Contoh: Roma 10:17 atau 2 Korintus 5:7"
                    className="flex-1 px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900"
                  />
                  {supportingScriptures.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSupportingScripture(idx)}
                      className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                      aria-label="Hapus Ayat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tujuan Khotbah */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Tujuan Khotbah
            </label>
            <input
              type="text"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Contoh: Jemaat berani mengambil langkah iman konkret di tengah pergumulan."
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900"
            />
          </div>

          {/* Target Jemaat, Durasi, Bahasa */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Target Jemaat
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-800"
              >
                <option value="umum">Umum</option>
                <option value="dewasa">Dewasa</option>
                <option value="pemuda">Pemuda</option>
                <option value="remaja">Remaja</option>
                <option value="anak_anak">Anak-anak</option>
                <option value="keluarga">Keluarga</option>
                <option value="pelayan_tuhan">Pelayan Tuhan</option>
                <option value="pemimpin_gereja">Pemimpin Gereja</option>
                <option value="kelompok_sel">Kelompok Sel</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Durasi Khotbah
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-800"
              >
                <option value="15 menit">15 menit (Renungan Singkat)</option>
                <option value="20 menit">20 menit (Ibadah Singkat)</option>
                <option value="30 menit">30 menit (Standar Ibadah Raya)</option>
                <option value="45 menit">45 menit (Pendalaman Alkitab)</option>
                <option value="60 menit">60 menit (Seminar / KKR)</option>
                <option value="custom">Kustom Menit</option>
              </select>
              {duration === 'custom' && (
                <input
                  type="number"
                  placeholder="Jumlah menit (contoh: 25)"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  className="mt-1.5 w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Bahasa Naskah
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-800"
              >
                <option value="id">Bahasa Indonesia</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: PILIH METODE KHOTBAH */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 font-serif-title">
                Pilih Metode Homiletika
              </h2>
            </div>
            <span className="text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg font-bold border border-amber-200 capitalize">
              {method}
            </span>
          </div>

          <p className="text-xs text-slate-500">
            AI akan menyelaraskan kerangka argumen, tafsiran, dan alur poin sesuai metodologi yang Anda pilih.
          </p>

          {/* Proportional 2-column on mobile, 4-column on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {PREACHING_METHODS.map((m) => {
              const isSelected = method === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`p-2.5 sm:p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between active:scale-[0.98] ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/70 shadow-xs ring-1 ring-amber-500'
                      : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm font-serif-title truncate">
                        {m.name}
                      </h4>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] sm:text-[11px] font-semibold text-amber-700 line-clamp-1">
                      {m.tagline}
                    </p>
                    <p className="hidden sm:block text-[11px] text-slate-600 line-clamp-2 leading-relaxed mt-1">
                      {m.desc}
                    </p>
                  </div>

                  <div className="pt-1.5 mt-1.5 border-t border-stone-200/60 hidden sm:flex flex-wrap gap-1">
                    {m.structure.slice(0, 3).map((st, i) => (
                      <span key={i} className="text-[9px] bg-stone-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {st}
                      </span>
                    ))}
                    {m.structure.length > 3 && (
                      <span className="text-[9px] text-slate-400">+{m.structure.length - 3}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: KARAKTER & GAYA BAHASA */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 font-serif-title">
              Gaya Bahasa & Nada Khotbah
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Gaya Komunikasi
              </label>
              <select
                value={languageStyle}
                onChange={(e) => setLanguageStyle(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-800"
              >
                <option value="Pastoral">Pastoral (Menghibur & Menggembalakan)</option>
                <option value="Akademik / Pengajaran">Akademik / Pengajaran (Mendalam & Teliti)</option>
                <option value="Inspiratif / Penguatan">Inspiratif / Penguatan (Memotivasi & Menguatkan)</option>
                <option value="Konfrontatif / Peringatan">Konfrontatif / Kenabian (Mengoreksi & Menegur)</option>
                <option value="Evangelistik">Evangelistik (Membawa Jiwa Pada Keselamatan)</option>
              </select>
            </div>

            {/* Slider Teologis vs Praktis */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                <span>Skala Teologis vs Praktis</span>
                <span className="text-amber-700 font-mono">{theologicalToPractical}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="80"
                value={theologicalToPractical}
                onChange={(e) => setTheologicalToPractical(Number(e.target.value))}
                className="w-full accent-amber-600 h-2 bg-stone-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 gap-1">
                <span className="truncate">Teologis (20%)</span>
                <span className="truncate px-1">Seimbang</span>
                <span className="truncate">Praktis (80%)</span>
              </div>
            </div>

            {/* Slider Serius vs Santai */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                <span>Skala Serius vs Relaks</span>
                <span className="text-amber-700 font-mono">{seriousToRelaxed}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                value={seriousToRelaxed}
                onChange={(e) => setSeriousToRelaxed(Number(e.target.value))}
                className="w-full accent-amber-600 h-2 bg-stone-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 gap-1">
                <span className="truncate">Khidmat</span>
                <span className="truncate px-1">Seimbang</span>
                <span className="truncate">Santai</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Submit Button */}
        <div className="hidden md:flex items-center justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-3 rounded-xl border border-stone-300 text-slate-700 font-semibold text-xs hover:bg-stone-100 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isGenerating}
            className="px-7 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-xl shadow-amber-900/30 flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
          >
            <Sparkles className="w-4 h-4" />
            <span>Buat Khotbah Sekarang (AI)</span>
          </button>
        </div>

        {/* Mobile Sticky Bottom CTA Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-stone-200 z-30 shadow-lg safe-area-bottom">
          <div className="max-w-md mx-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="py-2.5 px-4 rounded-xl border border-stone-300 text-slate-700 font-semibold text-xs active:scale-95"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-900/20 flex items-center justify-center gap-2 active:scale-98 transition-transform"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Menyusun...' : 'Buat Khotbah Sekarang (AI)'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
