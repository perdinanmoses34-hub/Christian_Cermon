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
    desc: 'Khotbah berfokus pada penggalian dan penjelasan suatu bagian Alkitab secara mendalam sesuai konteks asli.',
    structure: ['Teks', 'Konteks', 'Observasi', 'Interpretasi', 'Prinsip Utama', 'Aplikasi', 'Kesimpulan'],
  },
  {
    id: 'topikal',
    name: 'Topikal',
    tagline: 'Berfokus pada satu tema teologis',
    desc: 'Khotbah berfokus pada satu tema spesifik menggunakan rangkaian ayat Alkitab yang relevan.',
    structure: ['Tema', 'Definisi Masalah', 'Dasar Alkitab', 'Poin Utama', 'Ayat Pendukung', 'Aplikasi', 'Kesimpulan'],
  },
  {
    id: 'tekstual',
    name: 'Tekstual',
    tagline: 'Satu ayat atau perikop pendek',
    desc: 'Berfokus pada satu ayat atau bagian pendek Alkitab dan mengembangkan poin-poin khotbah berdasarkan teks tersebut.',
    structure: ['Ayat Kunci', 'Frasa Utama', 'Poin Teks', 'Ilustrasi', 'Aplikasi Konkret'],
  },
  {
    id: 'naratif',
    name: 'Naratif',
    tagline: 'Bercerita melalui alur kisah Alkitab',
    desc: 'Menggunakan kisah tokoh atau peristiwa Alkitab sebagai dasar penyampaian pesan rohani.',
    structure: ['Setting', 'Tokoh', 'Konflik', 'Perkembangan', 'Klimaks', 'Resolusi', 'Pelajaran Rohani', 'Aplikasi'],
  },
  {
    id: 'induktif',
    name: 'Induktif',
    tagline: 'Dari pertanyaan menuju kebenaran firman',
    desc: 'Dimulai dari observasi, pertanyaan, atau permasalahan jemaat, lalu menuntun kepada kesimpulan firman Tuhan.',
    structure: ['Pertanyaan / Kasus', 'Penjelajahan Teks', 'Klimaks Kebenaran', 'Kesimpulan Alkitabiah'],
  },
  {
    id: 'deduktif',
    name: 'Deduktif',
    tagline: 'Kebenaran utama dijabarkan secara logis',
    desc: 'Dimulai dengan menyatakan kebenaran utama di awal, lalu dikembangkan lewat penjelasan, argumen, dan ayat pendukung.',
    structure: ['Pernyataan Tesis Utama', 'Argumen 1 & Ayat', 'Argumen 2 & Ayat', 'Argumen 3 & Ayat', 'Aplikasi'],
  },
  {
    id: 'problem_solution',
    name: 'Problem-Solution',
    tagline: 'Krisis jemaat diselesaikan prinsip Alkitab',
    desc: 'Dimulai dengan permasalahan nyata yang dialami jemaat, kemudian menunjukkan prinsip firman Tuhan sebagai jalan keluar.',
    structure: ['Dilema Nyata', 'Penyelidikan Akar Masalah', 'Jawaban Firman Allah', 'Langkah Solusi Praktis'],
  },
  {
    id: 'kristosentris',
    name: 'Kristosentris',
    tagline: 'Berpusat pada karya keselamatan Kristus',
    desc: 'Khotbah diarahkan untuk menunjukkan hubungan teks dengan pribadi, karya penebusan Kristus, dan Injil keselamatan.',
    structure: ['Teks Asli', 'Kebutuhan Penebusan', 'Penggenapan di dalam Kristus', 'Respon Iman & Anugerah'],
  },
];

const GENERATION_STEPS = [
  'Menganalisis tema khotbah...',
  'Menganalisis teks Alkitab & latar belakang...',
  'Menentukan Big Idea (Gagasan Utama)...',
  'Menyusun outline homiletika...',
  'Mengembangkan poin-poin khotbah & eksegesis...',
  'Menambahkan aplikasi praktis & pertanyaan refleksi...',
  'Menyiapkan ilustrasi yang relevan & doa...',
  'Menyusun outline presentasi PowerPoint & speaker notes...',
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Loading & Multi-Step Progress Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl text-white">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto mb-3 animate-bounce">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-serif-title font-bold text-white">
                Menyusun Khotbah Alkitabiah
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                AI sedang menganalisis naskah firman, struktur homiletika, dan menyiapkan slide...
              </p>
            </div>

            {/* 8 Step Animated Progress List */}
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 mb-6 max-h-[320px] overflow-y-auto">
              {GENERATION_STEPS.map((step, idx) => {
                const isPassed = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 text-xs transition-all duration-300 p-2 rounded-lg ${
                      isCurrent
                        ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40 scale-[1.02]'
                        : isPassed
                        ? 'text-emerald-400'
                        : 'text-slate-500 opacity-60'
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
                    <span className="flex-1">{step}</span>
                  </div>
                );
              })}
            </div>

            <p className="text-center text-[11px] text-slate-400 italic">
              "Segala tulisan yang diilhamkan Allah memang bermanfaat untuk mengajar, untuk menyatakan kesalahan, untuk memperbaiki kelakuan dan untuk mendidik orang dalam kebenaran." (2 Timotius 3:16)
            </p>
          </div>
        </div>
      )}

      {/* Main Wizard Header */}
      <div className="mb-8">
        <button
          onClick={onCancel}
          className="text-xs font-medium text-slate-500 hover:text-slate-800 mb-2 flex items-center gap-1"
        >
          ← Kembali ke Dashboard
        </button>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-slate-900">
              Buat Khotbah Baru
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Lengkapi formulir homiletika berikut untuk menyusun khotbah yang setia pada teks firman dan relevan bagi jemaat.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            Integritas Alkitabiah Dijamin
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{errorMessage}</p>
            <p className="text-slate-600 mt-0.5">Input Anda tetap aman. Silakan periksa kembali dan klik "GENERATE KHOTBAH".</p>
          </div>
          <button
            onClick={() => setErrorMessage('')}
            className="text-rose-600 font-bold hover:underline"
          >
            Tutup
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: DASAR KHOTBAH */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h2 className="text-base font-bold text-slate-900 font-serif-title">
              Tema & Teks Alkitab
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Tema Khotbah */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Tema Khotbah <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Contoh: Hidup Dalam Iman"
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900 font-medium"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Gagasan sentral atau judul umum khotbah.
              </p>
            </div>

            {/* Ayat Alkitab Utama */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Ayat Alkitab Utama <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={mainScripture}
                onChange={(e) => setMainScripture(e.target.value)}
                placeholder="Contoh: Ibrani 11:1-6"
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900 font-medium"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Perikop atau ayat kunci yang akan dieksposisi.
              </p>
            </div>
          </div>

          {/* Ayat Pendukung / Cross References */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Ayat Pendukung / Cross References (Opsional)
              </label>
              <button
                type="button"
                onClick={handleAddSupportingScripture}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Referensi
              </button>
            </div>

            <div className="space-y-2">
              {supportingScriptures.map((ref, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={ref}
                    onChange={(e) => handleUpdateSupportingScripture(idx, e.target.value)}
                    placeholder={`Contoh: ${idx === 0 ? 'Roma 10:17' : idx === 1 ? '2 Korintus 5:7' : 'Yakobus 2:17'}`}
                    className="flex-1 px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900"
                  />
                  {supportingScriptures.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSupportingScripture(idx)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-stone-100"
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
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Tujuan Khotbah (Opsional)
            </label>
            <input
              type="text"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Contoh: Jemaat memahami arti iman dan terdorong untuk hidup berdasarkan iman kepada Tuhan."
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Apa yang ingin dicapai melalui khotbah ini dalam hidup jemaat?
            </p>
          </div>

          {/* Target Jemaat, Durasi, Bahasa */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Target Jemaat
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value as TargetAudience)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-800"
              >
                <option value="umum">Umum (Seluruh Jemaat)</option>
                <option value="dewasa">Dewasa</option>
                <option value="pemuda">Pemuda</option>
                <option value="remaja">Remaja</option>
                <option value="anak_anak">Anak-anak (Sekolah Minggu)</option>
                <option value="keluarga">Keluarga (Pasutri)</option>
                <option value="pelayan_tuhan">Pelayan Tuhan</option>
                <option value="pemimpin_gereja">Pemimpin Gereja</option>
                <option value="kelompok_sel">Kelompok Sel (Komsel)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Durasi Khotbah
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-800"
              >
                <option value="15 menit">15 menit (Renungan / Komsel)</option>
                <option value="20 menit">20 menit (Ibadah Singkat)</option>
                <option value="30 menit">30 menit (Standar Ibadah Raya)</option>
                <option value="45 menit">45 menit (Pendalaman Alkitab)</option>
                <option value="60 menit">60 menit (Seminar / KKR)</option>
                <option value="custom">Kustom Durasi</option>
              </select>
              {duration === 'custom' && (
                <input
                  type="number"
                  placeholder="Menit (contoh: 25)"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  className="mt-2 w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
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
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h2 className="text-base font-bold text-slate-900 font-serif-title">
                Pilih Metode Homiletika
              </h2>
            </div>
            <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md font-semibold border border-amber-200">
              Metode Terpilih: <strong className="capitalize">{method}</strong>
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Setiap metode memiliki arsitektur penyusunan khotbah yang unik. AI akan menyelaraskan outline dan argumen sesuai metode pilihan Anda.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {PREACHING_METHODS.map((m) => {
              const isSelected = method === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/70 shadow-md ring-2 ring-amber-500/20'
                      : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="font-bold text-slate-900 text-sm font-serif-title">
                        {m.name}
                      </h4>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] font-semibold text-amber-800 mb-1">
                      {m.tagline}
                    </p>
                    <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                      {m.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-200/80">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Struktur Alur:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {m.structure.slice(0, 4).map((st, i) => (
                        <span
                          key={i}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-white border border-stone-200 text-slate-600"
                        >
                          {st}
                        </span>
                      ))}
                      {m.structure.length > 4 && (
                        <span className="text-[9px] px-1 py-0.5 text-slate-400">
                          +{m.structure.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: GAYA KHOTBAH & KARAKTER */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h2 className="text-base font-bold text-slate-900 font-serif-title">
              Gaya Bahasa & Karakter Penyampaian
            </h2>
          </div>

          {/* Gaya Bahasa Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Pilih Gaya Bahasa Utama
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                'Pastoral',
                'Komunikatif',
                'Inspiratif',
                'Sederhana',
                'Formal',
                'Akademis',
                'Anak Muda',
                'Evangelistik',
              ].map((styleName) => {
                const isSelected = languageStyle === styleName;
                return (
                  <button
                    key={styleName}
                    type="button"
                    onClick={() => setLanguageStyle(styleName as LanguageStyle)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-slate-900 text-amber-400 border-slate-900 shadow-sm'
                        : 'bg-stone-50 hover:bg-stone-100 text-slate-700 border-stone-200'
                    }`}
                  >
                    {styleName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dual Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Slider 1: Teologis vs Praktis */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
                <span>Murni Teologis</span>
                <span className="text-amber-700 font-semibold">{theologicalToPractical}% Praktis</span>
                <span>Sangat Praktis</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={theologicalToPractical}
                onChange={(e) => setTheologicalToPractical(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 mt-2">
                {theologicalToPractical < 40
                  ? 'Fokus lebih dalam pada eksegesis doktrin dan sejarah teks.'
                  : theologicalToPractical > 70
                  ? 'Fokus kuat pada langkah konkret kehidupan harian jemaat.'
                  : 'Keseimbangan harmonis antara bobot teologis dan aplikasi nyata.'}
              </p>
            </div>

            {/* Slider 2: Serius vs Santai */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
                <span>Sangat Khidmat / Serius</span>
                <span className="text-amber-700 font-semibold">{seriousToRelaxed}% Santai</span>
                <span>Santai & Hangat</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={seriousToRelaxed}
                onChange={(e) => setSeriousToRelaxed(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 mt-2">
                {seriousToRelaxed < 40
                  ? 'Nada bicara khidmat, berwibawa, dan liturgis.'
                  : seriousToRelaxed > 70
                  ? 'Nada bicara ramah, bersahabat, penuh analogi santai.'
                  : 'Nada pastoral yang hangat, berwibawa, dan memikat hati.'}
              </p>
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>AI akan menyusun khotbah lengkap beserta slide PowerPoint siap pakai.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-stone-300 text-slate-700 hover:bg-stone-100 font-semibold text-xs transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-900/30 transition-transform transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5" />
              GENERATE KHOTBAH
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
