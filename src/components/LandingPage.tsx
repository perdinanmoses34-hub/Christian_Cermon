import React from 'react';
import {
  BookOpen,
  Sparkles,
  Presentation,
  CheckCircle2,
  Scroll,
  Layers,
  FileDown,
  History,
  ShieldCheck,
  ArrowRight,
  Flame,
  Clock,
  Compass,
  FileText,
  BookmarkCheck,
} from 'lucide-react';

interface LandingPageProps {
  onStartNow: () => void;
  onOpenHowItWorks: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartNow, onOpenHowItWorks }) => {
  return (
    <div className="bg-stone-50 min-h-screen">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8 border-b border-amber-500/20">
        {/* Subtle decorative background light & cross pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-wide uppercase mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Asisten Khotbah Berbasis Teologi Alkitabiah
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif-title font-bold tracking-tight text-white leading-tight sm:leading-tight mb-6">
            Buat Khotbah yang <span className="text-amber-400 underline decoration-amber-500/40 decoration-wavy underline-offset-8">Sistematis</span>, Alkitabiah, dan Relevan dengan Bantuan AI
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
            Masukkan tema dan ayat Alkitab, pilih metode khotbah, dan biarkan AI membantu menyusun khotbah lengkap serta presentasi PowerPoint siap mimbar.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartNow}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base shadow-xl shadow-amber-900/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3 cursor-pointer"
            >
              <Sparkles className="w-5 h-5" />
              Buat Khotbah Sekarang
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenHowItWorks}
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-base transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-5 h-5 text-amber-400" />
              Lihat Cara Kerja
            </button>
          </div>

          {/* Value Props Bar */}
          <div className="mt-14 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
              <span className="text-xs text-slate-300 font-medium">8 Metode Homiletika Valid</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
              <span className="text-xs text-slate-300 font-medium">PowerPoint .PPTX Otomatis</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
              <span className="text-xs text-slate-300 font-medium">Integritas Konteks Alkitab</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
              <span className="text-xs text-slate-300 font-medium">Speaker Notes Siap Mimbar</span>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT PREVIEW SHOWCASE */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-16 relative z-20">
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden p-3 sm:p-5">
          <div className="bg-slate-950 rounded-xl border border-slate-800/80 p-6 text-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                  ✝
                </div>
                <div>
                  <h3 className="font-serif-title text-base sm:text-lg font-bold text-white">
                    Hidup Dalam Iman yang Sejati
                  </h3>
                  <p className="text-xs text-amber-400">Ibrani 11:1-6 • Metode Ekspositori • Dewasa</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 px-2.5 py-1 rounded-md font-medium">
                  Auto Saved
                </span>
                <span className="text-xs bg-amber-500 text-slate-950 px-3 py-1 rounded-md font-semibold">
                  11 Slides PPTX Ready
                </span>
              </div>
            </div>

            {/* Simulated 3 Column Preview */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4 text-xs">
              {/* Left Column: Outline */}
              <div className="md:col-span-3 bg-slate-900/90 rounded-lg p-3 border border-slate-800 space-y-2">
                <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Struktur Outline</p>
                <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium">
                  ★ Big Idea & Tujuan
                </div>
                <div className="p-2 rounded bg-slate-800 text-slate-300">
                  I. Memandang Janji Allah
                </div>
                <div className="p-2 rounded bg-slate-800 text-slate-300">
                  II. Ketaatan Tindakan Nyata
                </div>
                <div className="p-2 rounded bg-slate-800 text-slate-300">
                  III. Upah Kekal dari Allah
                </div>
                <div className="p-2 rounded bg-slate-800 text-slate-400">
                  IV. Aplikasi & Doa Penutup
                </div>
              </div>

              {/* Center Column: Sermon Content */}
              <div className="md:col-span-6 bg-slate-900/50 rounded-lg p-4 border border-slate-800">
                <div className="bg-amber-500/10 border-l-4 border-amber-500 p-3 rounded-r-md mb-3">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">Big Idea</span>
                  <p className="text-xs text-amber-100 font-medium mt-0.5">
                    "Iman yang sejati bukan sekadar persetujuan akal, melainkan penyerahan diri seutuhnya yang dibuktikan lewat ketaatan firman di tengah ketidakpastian."
                  </p>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  <strong className="text-white">Eksposisi Kata: </strong>
                  Kata Yunani <em>hupostasis</em> dalam Ibrani 11:1 adalah istilah hukum untuk akta kepemilikan. Iman memberi orang percaya kepastian masa depan karena bersandar pada karakter Allah yang setia...
                </p>
                <div className="mt-3 p-2.5 rounded bg-slate-800/80 border border-slate-700/60 text-slate-300">
                  <span className="text-[10px] text-amber-400 font-semibold block">Ilustrasi Mimbar:</span>
                  Seperti seorang anak kecil di tebing kolam yang melompat ke pelukan ayahnya tanpa ragu, bukan karena air tidak dalam, melainkan karena mengenal tangan sang ayah.
                </div>
              </div>

              {/* Right Column: AI Assistant */}
              <div className="md:col-span-3 bg-slate-900/90 rounded-lg p-3 border border-slate-800 space-y-2">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Homiletics Assistant
                </div>
                <p className="text-[11px] text-slate-400">Aksi cepat perbaikan naskah:</p>
                <div className="space-y-1.5">
                  <div className="p-1.5 rounded bg-slate-800 text-slate-300 text-[11px] hover:border-amber-500/50 border border-slate-700 cursor-pointer">
                    ⚡ Buat lebih praktis untuk jemaat
                  </div>
                  <div className="p-1.5 rounded bg-slate-800 text-slate-300 text-[11px] hover:border-amber-500/50 border border-slate-700 cursor-pointer">
                    ⚡ Tambahkan ilustrasi kehidupan kerja
                  </div>
                  <div className="p-1.5 rounded bg-slate-800 text-slate-300 text-[11px] hover:border-amber-500/50 border border-slate-700 cursor-pointer">
                    ⚡ Periksa konsistensi teks Alkitab
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE 9 FEATURES LIST */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-2">
            FITUR UTAMA LENGKAP
          </h2>
          <p className="text-3xl sm:text-4xl font-serif-title font-bold text-slate-900">
            Dirancang Khusus untuk Pelayan Firman Tuhan
          </p>
          <p className="mt-3 text-slate-600 text-base">
            Mulai dari pendalaman eksegesis teks, penyusunan outline sistematis, hingga presentasi slide PowerPoint siap pakai dalam hitungan detik.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 font-serif-title">AI Sermon Generator</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Menghasilkan naskah khotbah utuh mencakup Big Idea, Konteks Historis, Eksegesis Teks, 2-4 Poin Utama dengan ilustrasi & aplikasi, serta doa penutup.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 font-serif-title">Berbagai Metode Khotbah</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Dukungan penuh untuk 8 metode: Ekspositori, Topikal, Tekstual, Naratif, Induktif, Deduktif, Problem-Solution, dan Kristosentris.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 mb-4">
              <BookmarkCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 font-serif-title">Biblical Cross References</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Menghubungkan ayat Alkitab utama dengan ayat-ayat pendukung yang relevan secara teologis tanpa mencabut ayat dari konteksnya.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-4">
              <Scroll className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 font-serif-title">Sermon Outline Interaktif</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Susunan poin utama I, II, III dan sub-poin A, B, C yang rapi, dapat diedit, diatur ulang, dicetak, atau disalin dalam format teks mimbar.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 font-serif-title">AI Sermon Editor</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Editor teks 3-kolom dengan navigasi cepat per seksi dan asisten AI pintar untuk menyederhanakan teks, menambahkan ilustrasi, atau memperdalam teologi.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 mb-4">
              <Presentation className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 font-serif-title">PowerPoint Generator</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Mengubah naskah khotbah menjadi slide presentasi berkualitas tinggi dengan pemisahan teks slide ringkas dan speaker notes (catatan pembicara).
            </p>
          </div>

          {/* Feature 7 */}
          <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 mb-4">
              <FileDown className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 font-serif-title">Download .PPTX Langsung</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Ekspor slide nyata dalam format standar .pptx yang dapat langsung dibuka dan disunting di Microsoft PowerPoint, Google Slides, maupun Keynote.
            </p>
          </div>

          {/* Feature 8 */}
          <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-700 mb-4">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 font-serif-title">Sermon History & Riwayat</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Simpan seluruh khotbah Anda dengan aman di cloud. Cari berdasarkan tema, saring berdasarkan metode, target jemaat, atau tanggal penyampaian.
            </p>
          </div>

          {/* Feature 9 */}
          <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 font-serif-title">Auto Save & Integritas Alkitab</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Pekerjaan Anda tersimpan otomatis setiap saat. AI dilindungi pedoman homiletika ketat untuk tidak mengarang kutipan ayat dan menjaga kehormatan Firman.
            </p>
          </div>
        </div>
      </section>

      {/* 8 PREACHING METHODS SHOWCASE */}
      <section className="py-20 bg-stone-100/80 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-2">
              FLEKSIBILITAS HOMILETIKA
            </h2>
            <p className="text-3xl font-serif-title font-bold text-slate-900">
              8 Metode Khotbah Terstruktur
            </p>
            <p className="mt-2 text-slate-600 text-sm">
              Pilih metode yang paling sesuai dengan kebutuhan jemaat dan karakteristik teks firman Tuhan yang Anda persiapkan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">01</span>
              <h4 className="font-serif-title font-bold text-slate-900 mt-2 text-base">Ekspositori</h4>
              <p className="text-xs text-slate-600 mt-1">
                Penggalian mendalam atas suatu bagian firman Tuhan sesuai konteks, makna tata bahasa, dan maksud asli penulis.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">02</span>
              <h4 className="font-serif-title font-bold text-slate-900 mt-2 text-base">Topikal</h4>
              <p className="text-xs text-slate-600 mt-1">
                Berfokus pada satu tema teologis atau kehidupan tertentu, didukung oleh ayat-ayat Alkitab lintas kitab yang selaras.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">03</span>
              <h4 className="font-serif-title font-bold text-slate-900 mt-2 text-base">Tekstual</h4>
              <p className="text-xs text-slate-600 mt-1">
                Berfokus pada satu atau dua ayat inti, di mana pokok-pokok khotbah diturunkan langsung dari klausul teks tersebut.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">04</span>
              <h4 className="font-serif-title font-bold text-slate-900 mt-2 text-base">Naratif</h4>
              <p className="text-xs text-slate-600 mt-1">
                Menyampaikan pesan melalui alur kisah tokoh Alkitab: setting, ketegangan, resolusi iman, dan relevansinya bagi kita.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">05</span>
              <h4 className="font-serif-title font-bold text-slate-900 mt-2 text-base">Induktif</h4>
              <p className="text-xs text-slate-600 mt-1">
                Dimulai dari observasi pergumulan nyata jemaat, lalu secara bertahap menuntun jemaat menemukan jawaban Firman Tuhan.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">06</span>
              <h4 className="font-serif-title font-bold text-slate-900 mt-2 text-base">Deduktif</h4>
              <p className="text-xs text-slate-600 mt-1">
                Menyatakan kebenaran utama di awal secara tegas, kemudian dijabarkan lewat argumen Alkitab dan pembuktian teologis.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">07</span>
              <h4 className="font-serif-title font-bold text-slate-900 mt-2 text-base">Problem-Solution</h4>
              <p className="text-xs text-slate-600 mt-1">
                Mengangkat krisis atau tantangan moral spesifik jemaat zaman kini, lalu menguraikan solusi keselamatan dari Alkitab.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">08</span>
              <h4 className="font-serif-title font-bold text-slate-900 mt-2 text-base">Kristosentris</h4>
              <p className="text-xs text-slate-600 mt-1">
                Menyoroti karya penebusan Kristus dan Injil anugerah sebagai pusat dari setiap pengajaran Alkitab Perjanjian Lama & Baru.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BIBLICAL INTEGRITY BANNER */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900 text-slate-200 rounded-2xl p-8 border border-amber-500/30 flex flex-col md:flex-row items-center gap-6 shadow-xl">
          <div className="w-16 h-16 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-serif-title font-bold text-white mb-2">
              Komitmen Integritas Alkitabiah
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              "Khotbah ini dibuat sebagai alat bantu persiapan. Verifikasi kembali interpretasi, konteks, referensi Alkitab, dan penerapannya sebelum digunakan dalam pelayanan mimbar."
            </p>
            <p className="text-xs text-amber-400/90 mt-2 font-medium">
              Sistem AI kami dipandu secara ketat untuk tidak mengarang ayat fiktif, menghormati konteks historis naskah, dan mengutamakan Injil Kristus.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-slate-950 text-white py-20 px-4 sm:px-6 text-center border-t border-slate-800">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-serif-title font-bold mb-4">
            Siapkan Khotbah Minggu Ini dengan Percaya Diri
          </h2>
          <p className="text-slate-400 text-base mb-8">
            Dapatkan khotbah yang terstruktur rapi, mendalam secara Alkitabiah, serta presentasi PowerPoint dalam hitungan menit.
          </p>
          <button
            onClick={onStartNow}
            className="px-9 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base shadow-xl shadow-amber-900/40 transition-transform transform hover:scale-105 inline-flex items-center gap-3 cursor-pointer"
          >
            <Sparkles className="w-5 h-5" />
            Mulai Buat Khotbah Sekarang
          </button>
        </div>
      </section>
    </div>
  );
};
