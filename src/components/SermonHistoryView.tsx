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
  X,
  MoreVertical,
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
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);

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
      setActionMenuOpenId(null);
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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-8 space-y-3.5 sm:space-y-6 animate-fadeIn pb-safe md:pb-8 w-full max-w-full overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-serif-title font-bold text-slate-900 tracking-tight">
            Koleksi Khotbah Saya
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Arsip naskah khotbah yang pernah Anda persiapkan ({filtered.length} khotbah).
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="w-full sm:w-auto px-4 py-2.5 sm:px-5 sm:py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Buat Khotbah Baru</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-3 sm:p-4 space-y-2.5 shadow-2xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul, perikop ayat, atau tema..."
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-800"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2.5 p-0.5 text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Method filter pills: horizontal scrolling */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 w-full">
          {methodsList.map((m) => (
            <button
              key={m.id}
              onClick={() => setFilterMethod(m.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-colors active:scale-95 ${
                filterMethod === m.id
                  ? 'bg-slate-900 text-amber-400 font-bold shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-slate-700'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sermons Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200/90 p-8 sm:p-12 text-center">
          <BookOpen className="w-10 h-10 text-stone-300 mx-auto mb-2.5" />
          <h3 className="font-bold text-slate-800 text-sm font-serif-title">Tidak Ada Khotbah Ditemukan</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4 max-w-sm mx-auto">
            Coba ganti kata kunci pencarian atau buat draf khotbah baru sekarang.
          </p>
          <button
            onClick={onCreateNew}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs active:scale-95 shadow-xs"
          >
            Buat Khotbah Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map((s) => {
            const dateStr = new Date(s.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
            const isMenuOpen = actionMenuOpenId === s.id;

            return (
              <div
                key={s.id}
                onClick={() => onOpenSermon(s)}
                className="bg-white rounded-2xl border border-stone-200/90 hover:border-amber-400 p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.99] relative"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/80">
                      {s.method}
                    </span>
                    <span className="text-xs font-bold text-slate-800 bg-stone-100 px-2.5 py-0.5 rounded-lg border border-stone-200/60">
                      {s.main_scripture}
                    </span>
                  </div>

                  <h3 className="font-serif-title font-bold text-sm sm:text-base text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-2">
                    {s.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                    {s.big_idea || s.introduction}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-stone-100 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 truncate max-w-[120px]">
                      <Users className="w-3 h-3 shrink-0" />
                      <span className="capitalize truncate">{s.audience.replace('_', ' ')}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 shrink-0" />
                      {s.duration}
                    </span>
                    <span>{dateStr}</span>
                  </div>

                  {/* Android-ergonomic Action Row */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-between pt-1 gap-1.5 w-full"
                  >
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <button
                        onClick={() => onOpenSermon(s)}
                        className="flex-1 py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-transform whitespace-nowrap"
                      >
                        <FileEdit className="w-3.5 h-3.5 shrink-0" />
                        <span>Buka</span>
                      </button>

                      <button
                        onClick={() => onOpenPowerPoint(s)}
                        className="flex-1 py-2 px-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold flex items-center justify-center gap-1.5 border border-amber-300/80 active:scale-95 transition-transform whitespace-nowrap"
                      >
                        <Presentation className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                        <span>Slide PPT</span>
                      </button>
                    </div>

                    {/* Quick Overflow Menu for secondary actions */}
                    <div className="relative shrink-0">
                      <button
                        onClick={() => setActionMenuOpenId(isMenuOpen ? null : s.id)}
                        className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-600 active:scale-95 transition-transform shrink-0"
                        title="Menu Lainnya"
                        aria-label="Menu Lainnya"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-30"
                            onClick={() => setActionMenuOpenId(null)}
                          />
                          <div className="absolute right-0 bottom-full mb-1.5 w-48 bg-white rounded-2xl shadow-xl border border-stone-200 py-1.5 z-40 text-xs animate-scaleIn">
                            <button
                              onClick={(e) => handleDownloadPptx(e, s)}
                              disabled={downloadingId === s.id}
                              className="w-full px-3 py-2 text-left hover:bg-stone-100 text-slate-700 flex items-center gap-2 font-medium"
                            >
                              <FileDown className="w-4 h-4 text-slate-500" />
                              <span>{downloadingId === s.id ? 'Mengunduh...' : 'Download .PPTX'}</span>
                            </button>
                            <button
                              onClick={() => {
                                onDuplicateSermon(s);
                                setActionMenuOpenId(null);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-stone-100 text-slate-700 flex items-center gap-2 font-medium"
                            >
                              <Copy className="w-4 h-4 text-slate-500" />
                              <span>Duplikasi Khotbah</span>
                            </button>
                            <div className="border-t border-stone-100 my-1" />
                            <button
                              onClick={() => {
                                setActionMenuOpenId(null);
                                if (confirm(`Apakah Anda yakin ingin menghapus "${s.title}"?`)) {
                                  onDeleteSermon(s.id);
                                }
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-medium"
                            >
                              <Trash2 className="w-4 h-4 text-rose-500" />
                              <span>Hapus Khotbah</span>
                            </button>
                          </div>
                        </>
                      )}
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
