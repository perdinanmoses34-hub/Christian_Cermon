import React, { useState } from 'react';
import { X, Copy, Check, Printer, FileDown, ArrowUp, ArrowDown, Plus, Trash2, Edit2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div>
            <h3 className="font-serif-title font-bold text-lg text-slate-900">
              Sermon Outline Sistematis
            </h3>
            <p className="text-xs text-slate-500">
              {sermon.title} • {sermon.main_scripture}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyOutline}
              className="px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-xs font-semibold text-slate-700 hover:bg-stone-100 flex items-center gap-1.5 transition-colors"
            >
              {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Salin Teks</span>
            </button>
            <button
              onClick={handleDownloadOutline}
              className="px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-xs font-semibold text-slate-700 hover:bg-stone-100 flex items-center gap-1.5 transition-colors"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Download .TXT</span>
            </button>
            <button
              onClick={() => window.print()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-stone-200 transition-colors"
              title="Cetak Outline"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-stone-200 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Outline Content Body */}
        <div className="flex-1 overflow-y-auto p-6 font-mono text-xs sm:text-sm text-slate-800 space-y-5 bg-stone-50/50">
          <div className="bg-white p-5 rounded-xl border border-stone-200 space-y-4">
            {/* Header info */}
            <div>
              <p className="text-slate-400 font-sans text-[11px] uppercase font-bold tracking-wider">JUDUL</p>
              <p className="font-bold text-base font-serif-title text-slate-900">{sermon.title}</p>
            </div>

            <div>
              <p className="text-slate-400 font-sans text-[11px] uppercase font-bold tracking-wider">TEKS ALKITAB</p>
              <p className="font-semibold text-amber-700">{sermon.main_scripture}</p>
            </div>

            <div>
              <p className="text-slate-400 font-sans text-[11px] uppercase font-bold tracking-wider">BIG IDEA</p>
              <p className="italic text-slate-700 bg-amber-50/60 p-2.5 rounded border border-amber-200/60">
                "{sermon.big_idea}"
              </p>
            </div>

            {/* Poin-Poin Utama with Reorder and Edit capability */}
            <div className="pt-2 border-t border-stone-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs font-bold text-slate-700 uppercase tracking-wider">
                  POIN-POIN KHOTBAH ({sermon.main_points.length})
                </span>
                <button
                  onClick={handleAddPoint}
                  className="font-sans text-xs font-semibold text-amber-700 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Poin Baru
                </button>
              </div>

              {sermon.main_points.map((pt, idx) => {
                const roman = romanNumerals[idx] || `${idx + 1}`;
                const isEditing = editingPointId === pt.id;

                return (
                  <div key={pt.id} className="p-3.5 rounded-lg bg-stone-100/70 border border-stone-200 space-y-2 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="font-bold text-amber-700 w-6 shrink-0">{roman}.</span>
                        {isEditing ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              className="font-sans text-xs font-bold px-2 py-1 bg-white border border-amber-400 rounded flex-1 focus:outline-none"
                            />
                            <button
                              onClick={() => handleSaveEdit(pt.id)}
                              className="font-sans text-[11px] px-2 py-1 bg-amber-500 text-slate-950 font-bold rounded"
                            >
                              Simpan
                            </button>
                          </div>
                        ) : (
                          <span className="font-bold text-slate-900 font-sans text-xs sm:text-sm">
                            {pt.title}
                          </span>
                        )}
                      </div>

                      {/* Reorder & Action buttons */}
                      <div className="flex items-center gap-1 shrink-0 font-sans">
                        {!isEditing && (
                          <button
                            onClick={() => handleStartEdit(pt)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-stone-200"
                            title="Ubah Judul Poin"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => movePoint(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-stone-200 disabled:opacity-30"
                          title="Pindah ke Atas"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => movePoint(idx, 'down')}
                          disabled={idx === sermon.main_points.length - 1}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-stone-200 disabled:opacity-30"
                          title="Pindah ke Bawah"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        {sermon.main_points.length > 1 && (
                          <button
                            onClick={() => handleDeletePoint(pt.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Hapus Poin"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="pl-8 space-y-1 text-slate-600 font-sans text-xs">
                      <p>
                        <strong className="text-slate-700">A. Dasar Firman:</strong>{' '}
                        {pt.biblical_basis.join(', ')}
                      </p>
                      <p className="line-clamp-2">
                        <strong className="text-slate-700">B. Penjelasan:</strong> {pt.explanation}
                      </p>
                      <p className="line-clamp-1">
                        <strong className="text-slate-700">C. Ilustrasi:</strong> {pt.illustration}
                      </p>
                      <p className="line-clamp-1">
                        <strong className="text-slate-700">D. Penerapan:</strong> {pt.application}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* End sections */}
            <div className="pt-2 border-t border-stone-200 space-y-3 font-sans text-xs">
              <div>
                <p className="text-slate-400 uppercase font-bold tracking-wider text-[11px]">KESIMPULAN</p>
                <p className="text-slate-700 mt-0.5">{sermon.conclusion}</p>
              </div>

              <div>
                <p className="text-slate-400 uppercase font-bold tracking-wider text-[11px]">AJAKAN (CALL TO ACTION)</p>
                <p className="text-slate-700 mt-0.5">{sermon.call_to_action}</p>
              </div>

              <div>
                <p className="text-slate-400 uppercase font-bold tracking-wider text-[11px]">DOA PENUTUP</p>
                <p className="italic text-slate-600 mt-0.5">{sermon.closing_prayer}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-white flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs"
          >
            Selesai Meninjau Outline
          </button>
        </div>
      </div>
    </div>
  );
};
