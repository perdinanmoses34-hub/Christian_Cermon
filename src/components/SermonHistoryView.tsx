import React, { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  Calendar,
  Clock,
  Users,
  Presentation,
  FileDown,
  Copy,
  Trash2,
  FileEdit,
  Plus,
  Filter,
} from 'lucide-react';
import { Sermon, PreachingMethod } from '../types/sermon';
import { exportToPowerPoint } from '../services/pptxExporter';

interface SermonHistoryViewProps {
  sermons: Sermon[];
  onOpenSermon: (sermon: Sermon) => void;
  onOpenPowerPoint: (sermon: Sermon) => void;
  onDuplicateSermon: (sermon: Sermon) => void;
  onDeleteSermon: (sermonId: string) => void;
  onCreateNew: () => void;
}

export const SermonHistoryView: React.FC<SermonHistoryViewProps> = ({
  sermons,
  onOpenSermon,
  onOpenPowerPoint,
  onDuplicateSermon,
  onDeleteSermon,
  onCreateNew,
}) => {
  const [search, setSearch] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return sermons.filter((s) => {
      const matchSearch =
        !search ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.theme.toLowerCase().includes(search.toLowerCase()) ||
        s.main_scripture.toLowerCase().includes(search.toLowerCase());

      const matchMethod = filterMethod === 'all' || s.method === filterMethod;
      return matchSearch && matchMethod;
    });
  }, [sermons, search, filterMethod]);

  const handleDownloadPptx = async (e: React.MouseEvent, sermon: Sermon) => {
    e.stopPropagation();
    if (!sermon.powerpoint) return;
    setDownloadingId(sermon.id);
    try {
      await exportToPowerPoint(sermon.title, sermon.powerpoint);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingId(null);
    }
  };

  const methodsList: Array<{ id: string; label: string }> = [
    { id: 'all', label: 'Semua Metode' },
    { id: 'ekspositori', label: 'Ekspositori' },
    { id: 'topikal', label: 'Topikal' },
    { id: 'tekstual', label: 'Tekstual' },
    { id: 'naratif', label: 'Naratif' },
    { id: 'induktif', label: 'Induktif' },
    { id: 'deduktif', label: 'Deduktif' },
    { id: 'problem_solution', label: 'Problem-Solution' },
    { id: 'kristosentris', label: 'Kristosentris' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-slate-900">
            Koleksi Khotbah Saya
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Arsip lengkap naskah khotbah yang pernah Anda persiapkan bersama asisten AI.
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          + Buat Khotbah Baru
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-3 shadow-sm">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sermons by title, scripture, or theme..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:outline-none focus:border-amber-500 text-slate-800"
          />
        </div>

        {/* Method filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {methodsList.map((m) => (
            <button
              key={m.id}
              onClick={() => setFilterMethod(m.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                filterMethod === m.id
                  ? 'bg-slate-900 text-amber-400 font-bold'
                  : 'bg-stone-100 hover:bg-stone-200 text-slate-600'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sermons Table / Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-sm">Tidak Ada Khotbah Ditemukan</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Coba ubah kata kunci pencarian atau buat khotbah baru sekarang.
          </p>
          <button
            onClick={onCreateNew}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
          >
            Buat Khotbah Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((s) => {
            const dateStr = new Date(s.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={s.id}
                onClick={() => onOpenSermon(s)}
                className="bg-white rounded-xl border border-stone-200 hover:border-amber-400 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                      {s.method}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 bg-stone-100 px-2 py-0.5 rounded">
                      {s.main_scripture}
                    </span>
                  </div>

                  <h3 className="font-serif-title font-bold text-base text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-2">
                    {s.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {s.big_idea || s.introduction}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-stone-100 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span className="capitalize">{s.audience.replace('_', ' ')}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {s.duration}
                    </span>
                    <span>{dateStr}</span>
                  </div>

                  {/* Actions */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-between pt-1"
                  >
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenSermon(s)}
                        className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-medium flex items-center gap-1"
                      >
                        <FileEdit className="w-3 h-3" /> Buka
                      </button>
                      <button
                        onClick={() => onOpenPowerPoint(s)}
                        className="px-2.5 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-medium flex items-center gap-1 border border-amber-300"
                      >
                        <Presentation className="w-3 h-3" /> Slides
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleDownloadPptx(e, s)}
                        disabled={downloadingId === s.id}
                        title="Download .PPTX"
                        className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-stone-100"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDuplicateSermon(s)}
                        title="Duplikat"
                        className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-stone-100"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus khotbah "${s.title}"?`)) {
                            onDeleteSermon(s.id);
                          }
                        }}
                        title="Hapus"
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
