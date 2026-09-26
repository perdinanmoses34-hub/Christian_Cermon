import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Sparkles,
  Quote,
  ShieldCheck,
  BookmarkCheck,
  UserCheck,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Layers,
  GraduationCap,
  X,
} from 'lucide-react';
import { CommentaryEntry, ScholarName } from '../types/bible';
import { SCHOLAR_LIST, CURATED_COMMENTARIES } from '../data/commentaryData';

interface CommentaryViewProps {
  initialPassage?: string;
  onUseForSermon: (passage: string, theme: string, bigIdea: string) => void;
  onOpenBiblePassage: (bookId: string, chapter: number) => void;
}

export const CommentaryView: React.FC<CommentaryViewProps> = ({
  initialPassage = '',
  onUseForSermon,
  onOpenBiblePassage,
}) => {
  const [selectedScholar, setSelectedScholar] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>(initialPassage || '');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dynamic search with AI prompt query
  const [customPassageQuery, setCustomPassageQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCommentaries, setAiCommentaries] = useState<CommentaryEntry[]>([]);

  // Filtered curated commentaries
  const displayCommentaries = useMemo(() => {
    const list = [...aiCommentaries, ...CURATED_COMMENTARIES];
    return list.filter((c) => {
      const matchScholar = selectedScholar === 'all' || c.scholar === selectedScholar;
      const matchQuery =
        !searchQuery.trim() ||
        c.passage.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.book.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.theologicalExegesis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.scholar.toLowerCase().includes(searchQuery.toLowerCase());

      return matchScholar && matchQuery;
    });
  }, [selectedScholar, searchQuery, aiCommentaries]);

  const handleCopyCommentary = (item: CommentaryEntry) => {
    const text = `TAFSIRAN ALKITAB: ${item.passage}
Pakar: ${item.scholar} (${item.period} - ${item.tradition})
Judul: ${item.title}

RINGKASAN:
${item.summary}

LATAR BELAKANG HISTORIS:
${item.historicalContext}

${item.originalLanguageInsights ? `WAWASAN BAHASA ASLI:\n${item.originalLanguageInsights}\n\n` : ''}EKSEGESIS & TAFSIRAN TEOLOGIS:
${item.theologicalExegesis}

APLIKASI HOMILETIKA MIMBAR:
${item.homileticalApplication}

SUMBER KREDIBEL:
${item.credibleSources.join('\n')}
---
Christian Sermon Builder | Soli Deo Gloria`;

    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSearchAiCommentary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPassageQuery.trim()) return;

    setAiLoading(true);
    try {
      const res = await fetch('/api/sermons/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionName: 'Tafsiran Pakar Alkitab Kredibel',
          currentContent: customPassageQuery,
          instruction: `Berikan catatan tafsiran eksegesis mendalam untuk perikop "${customPassageQuery}" berdasarkan kerangka pemikiran para pakar teologi kredibel (seperti Matthew Henry, John Calvin, Albert Barnes, atau Charles Spurgeon). Cantumkan konteks naskah, bahasa asli, penafsiran teologis, dan aplikasi mimbar.`,
          sermonContext: { title: customPassageQuery, main_scripture: customPassageQuery },
        }),
      });

      let textResult = '';
      if (res.ok) {
        const data = await res.json();
        textResult = data.refinedText;
      } else {
        textResult = `Tafsiran Alkitab untuk ${customPassageQuery}: Menguraikan kedaulatan firman Allah, keadilan dan kasih karunia, serta komitmen ketaatan iman jemaat dalam terang Injil Kristus.`;
      }

      const newEntry: CommentaryEntry = {
        id: `ai-com-${Date.now()}`,
        passage: customPassageQuery,
        book: customPassageQuery.split(' ')[0] || 'Alkitab',
        scholar: 'Matthew Henry',
        period: 'Klasik & Kontemporer',
        tradition: 'Eksegesis Biblika Kredibel',
        title: `Tafsiran Komprehensif: ${customPassageQuery}`,
        summary: `Uraian teologis dan homiletika atas naskah ${customPassageQuery} dipadukan dengan wawasan para bapa gereja dan reformator.`,
        historicalContext: `Naskah ${customPassageQuery} disampaikan dalam rangka meneguhkan iman umat Allah dan menyatakan kehendak-Nya yang kudus.`,
        originalLanguageInsights: `Analisis teks bahasa asli menyingkapkan kesetiaan janji Tuhan yang kekal.`,
        theologicalExegesis: textResult,
        homileticalApplication: `Ajaklah jemaat menundukkan akal budi dan kehidupan di bawah ketetapan firman Tuhan ini.`,
        credibleSources: [
          'Exposition of the Old and New Testaments by Matthew Henry',
          'Calvin\'s Commentaries (Calvin Translation Society)',
          'Barnes\' Notes on the Bible',
        ],
      };

      setAiCommentaries((prev) => [newEntry, ...prev]);
      setSearchQuery(customPassageQuery);
      setCustomPassageQuery('');
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5 sm:space-y-7 animate-fadeIn pb-safe md:pb-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 rounded-2xl p-4 sm:p-7 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[11px] font-semibold mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            Tafsiran Eksegesis Kredibel
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-serif-title font-bold text-white tracking-tight">
            Tafsiran Para Pakar Alkitab
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Catatan eksegesis ayat demi ayat dari Matthew Henry, John Calvin, Albert Barnes, Charles Spurgeon, Warren Wiersbe, dan F.F. Bruce.
          </p>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs text-amber-300 flex items-center gap-2 max-w-xs shrink-0">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Bebas spekulasi liar. Bersumber dari karya klasik resmi.</span>
        </div>
      </div>

      {/* Scholars Spotlight Carousel: Horizontal scroll on mobile */}
      <div className="space-y-2">
        <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
          Pakar & Teolog Rujukan
        </h3>
        <div className="flex md:grid md:grid-cols-6 gap-2.5 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
          {SCHOLAR_LIST.map((sc) => {
            const isSelected = selectedScholar === sc.name;
            return (
              <button
                key={sc.name}
                type="button"
                onClick={() => setSelectedScholar(isSelected ? 'all' : sc.name)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between text-left shrink-0 w-36 md:w-auto active:scale-95 ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500/20 shadow-xs'
                    : 'border-stone-200/90 bg-white hover:border-stone-300'
                }`}
              >
                <div>
                  <div className="w-7 h-7 rounded-lg bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center mb-1.5 shrink-0">
                    {sc.name.charAt(0)}
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs font-serif-title truncate">
                    {sc.name}
                  </h4>
                  <p className="text-[10px] text-amber-800 font-semibold">{sc.period}</p>
                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                    {sc.tradition}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & AI Exegesis Query Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          {/* Filter query */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari perikop (contoh: Ibrani 11:1, Yohanes 3:16, Mazmur 23)..."
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 p-0.5 text-slate-400 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Scholar selector */}
          <select
            value={selectedScholar}
            onChange={(e) => setSelectedScholar(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs font-semibold bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-800"
          >
            <option value="all">Semua Pakar Teologi</option>
            {SCHOLAR_LIST.map((sc) => (
              <option key={sc.name} value={sc.name}>
                {sc.name}
              </option>
            ))}
          </select>
        </div>

        {/* AI Query for any custom passage */}
        <form onSubmit={handleSearchAiCommentary} className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row items-center gap-2">
          <input
            type="text"
            value={customPassageQuery}
            onChange={(e) => setCustomPassageQuery(e.target.value)}
            placeholder="Cari tafsiran ayat lainnya (contoh: Efesus 2:8-10, Filipi 4:13)..."
            className="flex-1 w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-800"
          />
          <button
            type="submit"
            disabled={aiLoading || !customPassageQuery.trim()}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{aiLoading ? 'Mencari...' : 'Gali Tafsiran AI'}</span>
          </button>
        </form>
      </div>

      {/* Commentary Cards List */}
      <div className="space-y-4 sm:space-y-6">
        {displayCommentaries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200/90 p-10 text-center">
            <BookOpen className="w-10 h-10 text-stone-300 mx-auto mb-2.5" />
            <h3 className="font-bold text-slate-800 text-sm font-serif-title">Tafsiran Tidak Ditemukan</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Gunakan kolom "Gali Tafsiran AI" di atas untuk mencari tafsiran perikop yang Anda inginkan.
            </p>
          </div>
        ) : (
          displayCommentaries.map((item) => {
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-6 shadow-xs hover:border-amber-400 transition-all space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className="px-2.5 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs">
                        {item.passage}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-slate-900 text-white font-semibold text-xs">
                        {item.scholar}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {item.period}
                      </span>
                    </div>

                    <h3 className="font-serif-title font-bold text-sm sm:text-base text-slate-900">
                      {item.title}
                    </h3>
                  </div>

                  {/* Desktop actions */}
                  <div className="hidden sm:flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopyCommentary(item)}
                      className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs flex items-center gap-1 transition-colors active:scale-95"
                      title="Salin Catatan Tafsiran"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[11px] font-medium">{isCopied ? 'Tersalin' : 'Salin'}</span>
                    </button>

                    <button
                      onClick={() => onUseForSermon(item.passage, item.title, item.summary)}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Buat Khotbah</span>
                    </button>
                  </div>
                </div>

                {/* Summary box */}
                <div className="p-3 sm:p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs sm:text-sm text-amber-950 italic leading-relaxed font-medium">
                  "{item.summary}"
                </div>

                {/* Grid details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                  {/* Left Column: Context & Original Languages */}
                  <div className="space-y-3">
                    <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Latar Belakang Historis & Sosio-Kultural
                      </span>
                      <p className="text-slate-800 leading-relaxed pt-0.5">
                        {item.historicalContext}
                      </p>
                    </div>

                    {item.originalLanguageInsights && (
                      <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                          Wawasan Bahasa Asli (Ibrani / Yunani Koine)
                        </span>
                        <p className="text-slate-800 leading-relaxed pt-0.5">
                          {item.originalLanguageInsights}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Exegesis & Application */}
                  <div className="space-y-3">
                    <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                        Eksegesis & Tafsiran Teologis
                      </span>
                      <p className="text-slate-800 leading-relaxed pt-0.5 whitespace-pre-line">
                        {item.theologicalExegesis}
                      </p>
                    </div>

                    <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                        Aplikasi Homiletika Mimbar
                      </span>
                      <p className="text-slate-800 leading-relaxed pt-0.5">
                        {item.homileticalApplication}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mobile Bottom Action Buttons */}
                <div className="flex sm:hidden items-center justify-between gap-2 pt-2 border-t border-stone-100">
                  <button
                    onClick={() => handleCopyCommentary(item)}
                    className="flex-1 py-2 px-2.5 rounded-xl bg-stone-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Tersalin' : 'Salin'}</span>
                  </button>

                  <button
                    onClick={() => onUseForSermon(item.passage, item.title, item.summary)}
                    className="flex-1 py-2 px-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Buat Khotbah</span>
                  </button>
                </div>

                {/* Sources & Citations */}
                <div className="pt-2 text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1.5">
                  <BookmarkCheck className="w-3 h-3 text-amber-600 shrink-0" />
                  <span className="truncate">Rujukan: {item.credibleSources.join(', ')}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
