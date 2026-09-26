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
  ExternalLink,
  Layers,
  Sparkles,
  CheckCircle,
  FileEdit,
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
    }
  };

  const getMethodBadgeClass = (m: PreachingMethod) => {
    switch (m) {
      case 'ekspositori':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'topikal':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'tekstual':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'naratif':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'induktif':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'deduktif':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'problem_solution':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'kristosentris':
        return 'bg-amber-200 text-amber-900 border-amber-300 font-semibold';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-2xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Soli Deo Gloria
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-white tracking-tight">
              Selamat datang kembali, {currentUser.name}!
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Siap mempersiapkan firman Tuhan yang berbobot untuk jemaat? Mulai buat draf khotbah baru atau kelola koleksi khotbah Anda.
            </p>
          </div>

          <button
            onClick={onCreateNew}
            className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-900/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            + Buat Khotbah Baru
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Khotbah</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Khotbah Bulan Ini</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{stats.thisMonth}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
            <FileEdit className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Draf Khotbah</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{stats.drafts}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Presentation className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">PowerPoint Dibuat</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{stats.powerpoints}</p>
          </div>
        </div>
      </div>

      {/* Main Section: Khotbah Terakhir & Filters */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-serif-title font-bold text-slate-900">
              Khotbah Terakhir
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar naskah khotbah yang siap diedit, ditinjau, atau diunduh presentasinya.
            </p>
          </div>

          <button
            onClick={onCreateNew}
            className="md:hidden w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Buat Khotbah Baru
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tema, ayat Alkitab, atau gagasan utama..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Filter: Method */}
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500 text-slate-700"
          >
            <option value="all">Semua Metode Homiletika</option>
            <option value="ekspositori">Ekspositori</option>
            <option value="topikal">Topikal</option>
            <option value="tekstual">Tekstual</option>
            <option value="naratif">Naratif</option>
            <option value="induktif">Induktif</option>
            <option value="deduktif">Deduktif</option>
            <option value="problem_solution">Problem-Solution</option>
            <option value="kristosentris">Kristosentris</option>
          </select>

          {/* Filter: Audience */}
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

          {/* Sort */}
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

        {/* Sermon List */}
        {filteredSermons.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Belum Ada Khotbah Ditemukan</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              {searchQuery || selectedMethod !== 'all'
                ? 'Tidak ada khotbah yang cocok dengan filter pencarian Anda.'
                : 'Mulai buat naskah khotbah pertama Anda dengan panduan AI sekarang juga.'}
            </p>
            <button
              onClick={onCreateNew}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
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
                  className="p-5 hover:bg-stone-50/80 transition-colors cursor-pointer group flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getMethodBadgeClass(
                          sermon.method
                        )}`}
                      >
                        {sermon.method}
                      </span>
                      <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80">
                        {sermon.main_scripture}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        Target: <span className="capitalize">{sermon.audience.replace('_', ' ')}</span>
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {sermon.duration}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors font-serif-title">
                      {sermon.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 max-w-3xl leading-relaxed">
                      {sermon.big_idea || sermon.introduction || 'Tidak ada ringkasan.'}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                      <span>Dibuat: {formattedDate}</span>
                      <span>•</span>
                      <span>{sermon.main_points.length} Poin Khotbah</span>
                      {slideCount > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-700 font-medium flex items-center gap-1">
                            <Presentation className="w-3 h-3" />
                            {slideCount} Slides PPT
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions Buttons */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto pt-3 lg:pt-0 border-t border-stone-100 lg:border-t-0 justify-end"
                  >
                    <button
                      onClick={() => onOpenSermon(sermon)}
                      title="Buka / Edit Khotbah"
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                      <span>Buka</span>
                    </button>

                    <button
                      onClick={() => onOpenPowerPoint(sermon)}
                      title="Lihat / Generate PowerPoint"
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300/80 flex items-center gap-1.5 transition-colors"
                    >
                      <Presentation className="w-3.5 h-3.5" />
                      <span>Slide PPT</span>
                    </button>

                    <button
                      onClick={(e) => handleDownloadPptx(e, sermon)}
                      disabled={downloadingId === sermon.id}
                      title="Download .PPTX Langsung"
                      className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-slate-700 transition-colors"
                    >
                      <FileDown className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDuplicateSermon(sermon)}
                      title="Duplikasi Khotbah"
                      className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-slate-700 transition-colors"
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
                      className="p-1.5 rounded-lg bg-stone-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
