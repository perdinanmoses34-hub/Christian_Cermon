import React from 'react';
import { X, BookOpen, Sparkles, ShieldCheck, Presentation, Layers, CheckCircle2, ArrowRight } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartNow: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose, onStartNow }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif-title font-bold text-lg text-white">
                Cara Kerja Christian Sermon Builder
              </h3>
              <p className="text-xs text-slate-400">
                Alur persiapan khotbah yang sistematis, bertanggung jawab, dan siap mimbar.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs sm:text-sm text-slate-300">
          {/* 4 Steps */}
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-xs">
                1
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Masukkan Tema & Ayat Alkitab</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tentukan tema firman Tuhan, perikop utama (misal: <em>Ibrani 11:1-6</em>), target jemaat (Dewasa, Pemuda, Anak-anak), dan durasi khotbah (15 - 60 menit).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-xs">
                2
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Pilih Metode Homiletika</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pilih salah satu dari 8 metode: <em>Ekspositori</em>, <em>Topikal</em>, <em>Tekstual</em>, <em>Naratif</em>, <em>Induktif</em>, <em>Deduktif</em>, <em>Problem-Solution</em>, atau <em>Kristosentris</em>. Tentukan pula gaya bahasa dan proporsi teologis-praktis.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-xs">
                3
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">AI Homiletika Menyusun Naskah</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  AI memproses melalui 8 tahapan: menganalisis konteks sejarah teks, merumuskan Big Idea 1 kalimat, membangun poin utama, penafsiran, ilustrasi, aplikasi konkret, dan doa penutup.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-xs">
                4
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Review di Editor & Download PowerPoint (.PPTX)</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sunting naskah dengan bantuan AI Assistant, atur urutan poin outline, dan unduh slide presentasi PowerPoint asli dengan speaker notes lengkap.
                </p>
              </div>
            </div>
          </div>

          {/* Biblical Integrity Box */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-400 text-sm">
              <ShieldCheck className="w-4 h-4" />
              Prinsip Integritas Alkitabiah
            </div>
            <p>
              Aplikasi ini berpegang teguh pada prinsip hermeneutika yang sehat. AI dilarang mengarang ayat, mengutip perikop fiktif, atau memutarbalikkan konteks Alkitab. Khotbah ditujukan sebagai draf persiapan mimbar yang wajib diuji dan didoakan oleh hamba Tuhan sebelum disampaikan.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
          >
            Tutup
          </button>
          <button
            onClick={() => {
              onClose();
              onStartNow();
            }}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Mulai Buat Khotbah Sekarang
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
