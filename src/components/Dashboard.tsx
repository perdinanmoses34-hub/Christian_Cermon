import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  BookOpen,
  Calendar,
  Users,
  Clock,
  Presentation,
  FileDown,
  Trash2,
  Copy,
  Layers,
  Sparkles,
  FileEdit,
  MoreVertical,
  X,
  SlidersHorizontal,
  ChevronRight,
  Check,
} from 'lucide-react';
import { Sermon, User, PreachingMethod, TargetAudience } from '../types/sermon';
import { exportToPowerPoint } from '../services/pptxExporter';

interface DashboardProps {
  currentUser: User;
  sermons: Sermon[];
  onCreateNew: () => void;
  onOpenSermon: (sermon: Sermon) => void;
  onOpenPowerPoint: (sermon: Sermon) => void;
  onDuplicateSermon: (sermon: Sermon) => void;
  onDeleteSermon: (sermonId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  sermons,
  onCreateNew,
  onOpenSermon,
  onOpenPowerPoint,
  onDuplicateSermon,
  onDeleteSermon,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [selectedAudience, setSelectedAudience] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Mobile action sheet state for sermon overflow menu
  const [mobileActionSermon, setMobileActionSermon] = useState<Sermon | null>(null);
  // Mobile filter drawer state
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = sermons.length;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonth = sermons.filter((s) => {
      const d = new Date(s.created_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    const drafts = sermons.filter((s) => s.status === 'draft').length;
    const powerpoints = sermons.filter(
      (s) => s.powerpoint && s.powerpoint.slides && s.powerpoint.slides.length > 0
    ).length;

    return { total, thisMonth, drafts, powerpoints };
  }, [sermons]);

  // Filtered and sorted sermons
  const filteredSermons = useMemo(() => {
    return sermons
      .filter((s) => {
        const matchesQuery =
          !searchQuery ||
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.theme.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.main_scripture.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.big_idea.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesMethod = selectedMethod === 'all' || s.method === selectedMethod;
        const matchesAudience = selectedAudience === 'all' || s.audience === selectedAudience;

        return matchesQuery && matchesMethod && matchesAudience;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        return a.title.localeCompare(b.title);
      });
  }, [sermons, searchQuery, selectedMethod, selectedAudience, sortBy]);

  const handleDownloadPptx = async (e: React.MouseEvent, sermon: Sermon) => {
    e.stopPropagation();
    if (!sermon.powerpoint) return;
    setDownloadingId(sermon.id);
    try {
      await exportToPowerPoint(sermon.title, sermon.powerpoint);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloadingId(null);
      setMobileActionSermon(null);
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

  const getMethodBadgeClass = (m: PreachingMethod) => {
    switch (m) {
      case 'ekspositori':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'topikal':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'tekstual':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'naratif':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'induktif':
        return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      case 'deduktif':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'problem_solution':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'kristosentris':
        return 'bg-amber-100 text-amber-900 border-amber-300 font-semibold';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5 sm:space-y-8 animate-fadeIn pb-safe md:pb-8">
      {/* Welcome Banner: Clean Material Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 rounded-2xl p-4 sm:p-7 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[11px] font-semibold mb-2">
              <Sparkles className="w-3 h-3" />
              Soli Deo Gloria
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-serif-title font-bold text-white tracking-tight">
              Shalom, {currentUser.name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Persiapkan firman Tuhan yang berbobot untuk jemaat. Mulai draf baru atau kelola naskah khotbah Anda.
            </p>
          </div>

          <button
            onClick={onCreateNew}
            className="w-full md:w-auto px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-xl shadow-amber-900/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            <span>Buat Khotbah Baru</span>
          </button>
        </div>
      </div>

      {/* 4 Stats Cards: 2x2 grid on mobile with tight spacing */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-stone-200/90 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">Total Khotbah</p>
            <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-stone-200/90 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">Bulan Ini</p>
            <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">{stats.thisMonth}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-stone-200/90 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
            <FileEdit className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">Draf Khotbah</p>
            <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">{stats.drafts}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-stone-200/90 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Presentation className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">Slide PPT</p>
            <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">{stats.powerpoints}</p>
          </div>
        </div>
      </div>

      {/* Main Section: Khotbah & Mobile-First Filter Experience */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        {/* Section Header */}
        <div className="p-4 sm:p-6 border-b border-stone-100 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-xl font-serif-title font-bold text-slate-900">
              Koleksi Khotbah
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {filteredSermons.length} naskah khotbah tersedia
            </p>
          </div>

          {/* Quick Filter Drawer Button for Mobile */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-semibold text-slate-700 active:scale-95 transition-all"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter</span>
            {(selectedAudience !== 'all' || sortBy !== 'newest') && (
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            )}
          </button>
        </div>

        {/* Search Bar & Horizontal Method Chip Carousel */}
        <div className="p-3 sm:p-4 bg-stone-50/80 border-b border-stone-200/80 space-y-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tema, ayat firman, atau gagasan utama..."
              className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-amber-500 transition-colors shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Horizontal Scrolling Chips for Preaching Methods */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
            {methodsList.map((m) => {
              const isSelected = selectedMethod === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMethod(m.id)}
                  className={`px-3 py-1.5 text-xs rounded-full font-medium whitespace-nowrap shrink-0 transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-slate-900 text-amber-400 font-bold shadow-xs'
                      : 'bg-white text-slate-700 border border-stone-200 hover:border-stone-300'
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>

          {/* Desktop-only secondary filter dropdowns */}
          <div className="hidden md:flex items-center gap-3 pt-1">
            <select
              value={selectedAudience}
              onChange={(e) => setSelectedAudience(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500 text-slate-700"
            >
              <option value="all">Semua Target Jemaat</option>
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

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500 text-slate-700"
            >
              <option value="newest">Terbaru Dibuat</option>
              <option value="oldest">Terlama</option>
              <option value="title">Judul (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Sermon List: Android Card List */}
        {filteredSermons.length === 0 ? (
          <div className="py-14 sm:py-16 text-center px-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800 font-serif-title">Belum Ada Khotbah Ditemukan</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5 leading-relaxed">
              {searchQuery || selectedMethod !== 'all'
                ? 'Tidak ada khotbah yang cocok dengan kata kunci atau filter yang Anda pilih.'
                : 'Mulai susun naskah khotbah pertama Anda dengan bimbingan AI sekarang.'}
            </p>
            <button
              onClick={onCreateNew}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2 active:scale-95 shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Buat Khotbah Sekarang
            </button>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filteredSermons.map((sermon) => {
              const slideCount = sermon.powerpoint?.slides?.length || 0;
              const formattedDate = new Date(sermon.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div
                  key={sermon.id}
                  onClick={() => onOpenSermon(sermon)}
                  className="p-4 sm:p-5 hover:bg-stone-50/80 transition-colors cursor-pointer group flex flex-col lg:flex-row lg:items-center justify-between gap-3.5"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    {/* Tags row */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getMethodBadgeClass(
                          sermon.method
                        )}`}
                      >
                        {sermon.method}
                      </span>
                      <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80">
                        {sermon.main_scripture}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span className="capitalize">{sermon.audience.replace('_', ' ')}</span>
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {sermon.duration}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors font-serif-title line-clamp-2">
                      {sermon.title}
                    </h3>

                    {/* Big idea / Introduction snippet */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed max-w-3xl">
                      {sermon.big_idea || sermon.introduction || 'Tidak ada ringkasan.'}
                    </p>

                    {/* Metadata line */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] text-slate-400 pt-0.5">
                      <span>{formattedDate}</span>
                      <span>•</span>
                      <span>{sermon.main_points.length} Poin Khotbah</span>
                      {slideCount > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <Presentation className="w-3 h-3" />
                            {slideCount} Slide PPT
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions: Mobile clean 2-button row + overflow menu, Desktop inline buttons */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 w-full lg:w-auto pt-2 lg:pt-0 border-t border-stone-100 lg:border-t-0 justify-end"
                  >
                    <button
                      onClick={() => onOpenSermon(sermon)}
                      className="flex-1 sm:flex-initial px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-1.5 transition-colors shadow-2xs active:scale-95"
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                      <span>Buka Naskah</span>
                    </button>

                    <button
                      onClick={() => onOpenPowerPoint(sermon)}
                      className="flex-1 sm:flex-initial px-3 py-2 text-xs font-semibold rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300/80 flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                    >
                      <Presentation className="w-3.5 h-3.5" />
                      <span>Slide PPT</span>
                    </button>

                    {/* Desktop inline utility buttons */}
                    <div className="hidden sm:flex items-center gap-1">
                      <button
                        onClick={(e) => handleDownloadPptx(e, sermon)}
                        disabled={downloadingId === sermon.id}
                        title="Download .PPTX Langsung"
                        className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 transition-colors"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDuplicateSermon(sermon)}
                        title="Duplikasi Khotbah"
                        className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Apakah Anda yakin ingin menghapus naskah khotbah "${sermon.title}"?`)) {
                            onDeleteSermon(sermon.id);
                          }
                        }}
                        title="Hapus Khotbah"
                        className="p-2 rounded-xl bg-stone-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Mobile 3-dot overflow menu button */}
                    <button
                      onClick={() => setMobileActionSermon(sermon)}
                      className="sm:hidden p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-600 active:scale-95"
                      aria-label="Menu Opsi Khotbah"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mobile Bottom Sheet for Sermon Actions (Download, Duplicate, Delete) */}
      {mobileActionSermon && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/70 backdrop-blur-xs animate-fadeIn sm:hidden">
          <div className="flex-1" onClick={() => setMobileActionSermon(null)} />
          <div className="bg-white border-t border-stone-200 rounded-t-3xl p-5 shadow-2xl safe-area-bottom space-y-3">
            <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto mb-2" />
            <div className="pb-2 border-b border-stone-100">
              <p className="font-serif-title font-bold text-sm text-slate-900 truncate">
                {mobileActionSermon.title}
              </p>
              <p className="text-xs text-amber-700">{mobileActionSermon.main_scripture}</p>
            </div>

            <div className="space-y-1.5 text-xs font-semibold">
              <button
                onClick={(e) => handleDownloadPptx(e, mobileActionSermon)}
                disabled={downloadingId === mobileActionSermon.id}
                className="w-full text-left p-3 rounded-xl bg-stone-50 hover:bg-stone-100 flex items-center gap-3 text-slate-800 active:scale-[0.98]"
              >
                <FileDown className="w-4 h-4 text-amber-600" />
                <span>Download File Presentasi (.PPTX)</span>
              </button>

              <button
                onClick={() => {
                  onDuplicateSermon(mobileActionSermon);
                  setMobileActionSermon(null);
                }}
                className="w-full text-left p-3 rounded-xl bg-stone-50 hover:bg-stone-100 flex items-center gap-3 text-slate-800 active:scale-[0.98]"
              >
                <Copy className="w-4 h-4 text-slate-600" />
                <span>Duplikasi Naskah Khotbah</span>
              </button>

              <button
                onClick={() => {
                  const s = mobileActionSermon;
                  setMobileActionSermon(null);
                  if (confirm(`Apakah Anda yakin ingin menghapus khotbah "${s.title}"?`)) {
                    onDeleteSermon(s.id);
                  }
                }}
                className="w-full text-left p-3 rounded-xl bg-rose-50 hover:bg-rose-100 flex items-center gap-3 text-rose-700 font-bold active:scale-[0.98]"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Hapus Khotbah Ini</span>
              </button>
            </div>

            <button
              onClick={() => setMobileActionSermon(null)}
              className="w-full py-2.5 rounded-xl bg-stone-200 text-slate-700 font-bold text-xs"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Sheet for Advanced Filter & Sort */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/70 backdrop-blur-xs animate-fadeIn md:hidden">
          <div className="flex-1" onClick={() => setIsFilterDrawerOpen(false)} />
          <div className="bg-white border-t border-stone-200 rounded-t-3xl p-5 shadow-2xl safe-area-bottom space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto" />
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-bold text-sm text-slate-900">Filter & Urutkan Khotbah</h3>
              <button
                onClick={() => {
                  setSelectedAudience('all');
                  setSortBy('newest');
                  setSelectedMethod('all');
                }}
                className="text-xs text-amber-700 font-semibold"
              >
                Reset
              </button>
            </div>

            {/* Target Jemaat */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Target Jemaat</label>
              <select
                value={selectedAudience}
                onChange={(e) => setSelectedAudience(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl text-slate-800"
              >
                <option value="all">Semua Target Jemaat</option>
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

            {/* Urutan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Urutkan Berdasarkan</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'newest', label: 'Terbaru' },
                  { id: 'oldest', label: 'Terlama' },
                  { id: 'title', label: 'Judul (A-Z)' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSortBy(s.id as any)}
                    className={`py-2 text-xs rounded-xl font-semibold border ${
                      sortBy === s.id
                        ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                        : 'bg-stone-50 text-slate-700 border-stone-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsFilterDrawerOpen(false)}
              className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-md mt-2"
            >
              Terapkan Filter ({filteredSermons.length} Khotbah)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
