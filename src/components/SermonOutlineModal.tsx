import React, { useState } from 'react';
import { X, Copy, Check, Printer, FileDown, ArrowUp, ArrowDown, Plus, Trash2, Edit2, ArrowLeft } from 'lucide-react';
import { Sermon, MainPoint } from '../types/sermon';

interface SermonOutlineModalProps {
  sermon: Sermon;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSermon: (updated: Sermon) => void;
}

export const SermonOutlineModal: React.FC<SermonOutlineModalProps> = ({
  sermon,
  isOpen,
  onClose,
  onUpdateSermon,
}) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [editingPointId, setEditingPointId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  if (!isOpen) return null;

  // Move point up or down
  const movePoint = (index: number, direction: 'up' | 'down') => {
    const newPoints = [...sermon.main_points];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newPoints.length) return;

    const temp = newPoints[index];
    newPoints[index] = newPoints[targetIndex];
    newPoints[targetIndex] = temp;

    onUpdateSermon({
      ...sermon,
      main_points: newPoints,
      updated_at: new Date().toISOString(),
    });
  };

  const handleStartEdit = (pt: MainPoint) => {
    setEditingPointId(pt.id);
    setEditingTitle(pt.title);
  };

  const handleSaveEdit = (ptId: string) => {
    const updated = sermon.main_points.map((p) =>
      p.id === ptId ? { ...p, title: editingTitle } : p
    );
    onUpdateSermon({
      ...sermon,
      main_points: updated,
      updated_at: new Date().toISOString(),
    });
    setEditingPointId(null);
  };

  const handleAddPoint = () => {
    const num = sermon.main_points.length + 1;
    const newPt: MainPoint = {
      id: `pt-${Date.now()}`,
      title: `Poin ${num}: Pokok Kebenaran Baru`,
      biblical_basis: [sermon.main_scripture],
      explanation: 'Uraian kebenaran teks firman Tuhan...',
      interpretation: 'Tafsiran alkitabiah yang murni...',
      illustration: 'Ilustrasi pendukung...',
      application: 'Aplikasi hidup nyata...',
      transition: 'Transisi...',
    };
    onUpdateSermon({
      ...sermon,
      main_points: [...sermon.main_points, newPt],
      updated_at: new Date().toISOString(),
    });
  };

  const handleDeletePoint = (ptId: string) => {
    if (sermon.main_points.length <= 1) return;
    onUpdateSermon({
      ...sermon,
      main_points: sermon.main_points.filter((p) => p.id !== ptId),
      updated_at: new Date().toISOString(),
    });
  };

  const generateOutlineText = (): string => {
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
    let text = `JUDUL KHOTBAH:\n${sermon.title}\n\n`;
    text += `TEKS ALKITAB:\n${sermon.main_scripture}\n\n`;
    text += `METODE:\n${sermon.method.toUpperCase()}\n\n`;
    text += `BIG IDEA:\n${sermon.big_idea}\n\n`;
    text += `PENDAHULUAN:\n${sermon.introduction}\n\n`;

    sermon.main_points.forEach((pt, idx) => {
      const roman = romanNumerals[idx] || `${idx + 1}`;
      text += `${roman}. ${pt.title.toUpperCase()}\n`;
      text += `   A. Dasar Ayat: ${pt.biblical_basis.join(', ')}\n`;
      text += `   B. Penjelasan: ${pt.explanation.slice(0, 140)}...\n`;
      text += `   C. Ilustrasi: ${pt.illustration.slice(0, 100)}...\n`;
      text += `   D. Aplikasi: ${pt.application.slice(0, 100)}...\n\n`;
    });

    text += `KESIMPULAN:\n${sermon.conclusion}\n\n`;
    text += `AJAKAN:\n${sermon.call_to_action}\n\n`;
    text += `DOA PENUTUP:\n${sermon.closing_prayer}\n`;
    return text;
  };

  const handleCopyOutline = () => {
    navigator.clipboard.writeText(generateOutlineText());
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownloadOutline = () => {
    const element = document.createElement('a');
    const file = new Blob([generateOutlineText()], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${sermon.title.replace(/\s+/g, '_')}_Outline.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn safe-area-top safe-area-bottom w-full max-w-full overflow-hidden">
      <div className="bg-white rounded-none sm:rounded-3xl w-full max-w-3xl h-full sm:h-auto sm:max-h-[92vh] flex flex-col shadow-2xl border-0 sm:border border-stone-200 overflow-hidden">
        {/* Header - Android Material 3 App Bar style */}
        <div className="p-3.5 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={onClose}
              className="p-2 -ml-1 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-stone-200 active:scale-95 transition-colors sm:hidden"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h3 className="font-serif-title font-bold text-base sm:text-lg text-slate-900 truncate">
                Outline Sistematis
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                {sermon.title} • {sermon.main_scripture}
              </p>
            </div>
          </div>

          {/* Desktop action buttons */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyOutline}
              className="px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-xs font-semibold text-slate-700 hover:bg-stone-100 flex items-center gap-1.5 transition-colors active:scale-95"
            >
              {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copySuccess ? 'Tersalin' : 'Salin Teks'}</span>
            </button>
            <button
              onClick={handleDownloadOutline}
              className="px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-xs font-semibold text-slate-700 hover:bg-stone-100 flex items-center gap-1.5 transition-colors active:scale-95"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Download .TXT</span>
            </button>
            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-stone-200 transition-colors"
              title="Cetak Outline"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile top close button */}
          <div className="sm:hidden flex items-center gap-1">
            <button
              onClick={handleCopyOutline}
              className="p-2 text-slate-700 hover:bg-stone-200 rounded-xl active:scale-95"
              title="Salin Naskah"
            >
              {copySuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:bg-stone-200 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Outline Content Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 font-mono text-xs sm:text-sm text-slate-800 space-y-4 bg-stone-50/50">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-4 font-sans">
            {/* Header info */}
            <div>
              <p className="text-slate-400 text-[10px] sm:text-[11px] uppercase font-bold tracking-wider">JUDUL KHOTBAH</p>
              <p className="font-bold text-base sm:text-lg font-serif-title text-slate-900 mt-0.5">{sermon.title}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">TEKS:</span>
              <span className="font-bold text-xs sm:text-sm text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                {sermon.main_scripture}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400 uppercase font-semibold">({sermon.method})</span>
            </div>

            {sermon.big_idea && (
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">GAGASAN UTAMA (BIG IDEA)</p>
                <p className="italic text-xs sm:text-sm text-amber-950 bg-amber-50/70 p-3 rounded-xl border border-amber-200/80 leading-relaxed font-medium">
                  "{sermon.big_idea}"
                </p>
              </div>
            )}

            {/* Poin-Poin Utama with Reorder and Edit capability */}
            <div className="pt-3 border-t border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  POIN-POIN KHOTBAH ({sermon.main_points.length})
                </span>
                <button
                  onClick={handleAddPoint}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 active:scale-95 py-1 px-2 rounded-lg bg-amber-50 hover:bg-amber-100"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Poin
                </button>
              </div>

              {sermon.main_points.map((pt, idx) => {
                const roman = romanNumerals[idx] || `${idx + 1}`;
                const isEditing = editingPointId === pt.id;

                return (
                  <div key={pt.id} className="p-3 sm:p-3.5 rounded-xl bg-stone-100/80 border border-stone-200 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="font-bold text-amber-700 w-5 shrink-0 text-xs sm:text-sm">{roman}.</span>
                        {isEditing ? (
                          <div className="flex items-center gap-1.5 flex-1">
                            <input
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              className="text-xs font-bold px-2 py-1.5 bg-white border border-amber-400 rounded-lg flex-1 focus:outline-none"
                            />
                            <button
                              onClick={() => handleSaveEdit(pt.id)}
                              className="text-[11px] px-2.5 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg"
                            >
                              Simpan
                            </button>
                          </div>
                        ) : (
                          <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                            {pt.title}
                          </span>
                        )}
                      </div>

                      {/* Reorder & Action buttons - Touch friendly */}
                      <div className="flex items-center gap-1 shrink-0">
                        {!isEditing && (
                          <button
                            onClick={() => handleStartEdit(pt)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-stone-200 active:scale-90"
                            title="Ubah Judul"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => movePoint(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-stone-200 disabled:opacity-20 active:scale-90"
                          title="Naikkan"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => movePoint(idx, 'down')}
                          disabled={idx === sermon.main_points.length - 1}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-stone-200 disabled:opacity-20 active:scale-90"
                          title="Turunkan"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        {sermon.main_points.length > 1 && (
                          <button
                            onClick={() => handleDeletePoint(pt.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-90"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="pl-6 space-y-1 text-slate-600 text-xs leading-relaxed">
                      <p>
                        <strong className="text-slate-700">A. Ayat:</strong>{' '}
                        {pt.biblical_basis.join(', ')}
                      </p>
                      <p className="line-clamp-2">
                        <strong className="text-slate-700">B. Penjelasan:</strong> {pt.explanation}
                      </p>
                      {pt.illustration && (
                        <p className="line-clamp-1">
                          <strong className="text-slate-700">C. Ilustrasi:</strong> {pt.illustration}
                        </p>
                      )}
                      {pt.application && (
                        <p className="line-clamp-1">
                          <strong className="text-slate-700">D. Aplikasi:</strong> {pt.application}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* End sections */}
            <div className="pt-3 border-t border-stone-200 space-y-3 text-xs">
              <div>
                <p className="text-slate-400 uppercase font-bold tracking-wider text-[10px]">KESIMPULAN</p>
                <p className="text-slate-700 mt-0.5 leading-relaxed">{sermon.conclusion}</p>
              </div>

              <div>
                <p className="text-slate-400 uppercase font-bold tracking-wider text-[10px]">AJAKAN (CALL TO ACTION)</p>
                <p className="text-slate-700 mt-0.5 leading-relaxed">{sermon.call_to_action}</p>
              </div>

              <div>
                <p className="text-slate-400 uppercase font-bold tracking-wider text-[10px]">DOA PENUTUP</p>
                <p className="italic text-slate-600 mt-0.5 leading-relaxed">{sermon.closing_prayer}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Android Bottom App Bar */}
        <div className="p-3 sm:p-4 border-t border-stone-200 bg-white flex items-center justify-between gap-2 shrink-0">
          <div className="flex sm:hidden items-center gap-1.5">
            <button
              onClick={handleDownloadOutline}
              className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 active:scale-95"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Download .TXT</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs active:scale-95 shadow-sm text-center"
          >
            Tutup Outline
          </button>
        </div>
      </div>
    </div>
  );
};
