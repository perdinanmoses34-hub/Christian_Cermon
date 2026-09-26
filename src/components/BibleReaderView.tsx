import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Sparkles,
  Copy,
  Check,
  Columns3,
  Bookmark,
  ExternalLink,
  Info,
  ChevronRight,
  ArrowRight,
  Filter,
  Layers,
  X,
} from 'lucide-react';
import { BibleVersion, BibleVerse } from '../types/bible';
import { BIBLE_BOOKS, CURATED_BIBLE_CHAPTERS } from '../data/bibleData';

interface BibleReaderViewProps {
  onUseForSermon: (verseRef: string, themeHint?: string) => void;
  onOpenCommentaryForPassage: (passage: string) => void;
}

export const BibleReaderView: React.FC<BibleReaderViewProps> = ({
  onUseForSermon,
  onOpenCommentaryForPassage,
}) => {
  const [selectedBookId, setSelectedBookId] = useState<string>('ibrani');
  const [selectedChapter, setSelectedChapter] = useState<number>(11);
  const [activeVersion, setActiveVersion] = useState<BibleVersion>('TB');
  const [compareMode, setCompareMode] = useState<boolean>(true); // side by side comparison
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedVerseIndex, setCopiedVerseIndex] = useState<number | null>(null);

  const selectedBook = useMemo(() => {
    return BIBLE_BOOKS.find((b) => b.id === selectedBookId) || BIBLE_BOOKS[0];
  }, [selectedBookId]);

  // Retrieve chapter data
  const chapterKey = `${selectedBookId}-${selectedChapter}`;
  const chapterData = useMemo(() => {
    if (CURATED_BIBLE_CHAPTERS[chapterKey]) {
      return CURATED_BIBLE_CHAPTERS[chapterKey];
    }
    // Fallback default
    return CURATED_BIBLE_CHAPTERS['ibrani-11'];
  }, [chapterKey]);

  // Filtered verses by search query
  const displayVerses = useMemo(() => {
    if (!searchQuery.trim()) return chapterData.verses;
    const q = searchQuery.toLowerCase();
    return chapterData.verses.filter(
      (v) =>
        v.tb.toLowerCase().includes(q) ||
        v.kjv.toLowerCase().includes(q) ||
        v.tolaki.toLowerCase().includes(q) ||
        v.verse.toString() === q
    );
  }, [chapterData, searchQuery]);

  const handleCopyVerse = (v: BibleVerse) => {
    let textToCopy = '';
    const ref = `${chapterData.bookName} ${chapterData.chapter}:${v.verse}`;
    if (compareMode) {
      textToCopy = `"${v.tb}" (${ref} - TB)\n"${v.kjv}" (${ref} - KJV)\n"${v.tolaki}" (${ref} - Tolaki)`;
    } else if (activeVersion === 'TB') {
      textToCopy = `"${v.tb}" (${ref} - Terjemahan Baru LAI)`;
    } else if (activeVersion === 'KJV') {
      textToCopy = `"${v.kjv}" (${ref} - King James Version)`;
    } else {
      textToCopy = `"${v.tolaki}" (${ref} - Bahasa Tolaki)`;
    }

    navigator.clipboard.writeText(textToCopy);
    setCopiedVerseIndex(v.verse);
    setTimeout(() => setCopiedVerseIndex(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6 animate-fadeIn pb-safe md:pb-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 rounded-2xl p-4 sm:p-7 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[11px] font-semibold mb-2">
            <BookOpen className="w-3 h-3" />
            Alkitab Multi-Versi
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-serif-title font-bold text-white tracking-tight">
            Alkitab TB, KJV & Bahasa Tolaki
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Terjemahan Baru LAI (Indonesia), King James Version (Inggris), dan Bahasa Daerah Tolaki (Sulawesi Tenggara).
          </p>
        </div>

        {/* Quick Action Button */}
        <button
          onClick={() => onUseForSermon(`${chapterData.bookName} ${chapterData.chapter}:1-6`, chapterData.bookName)}
          className="w-full md:w-auto px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30 active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Gunakan Pasal Ini Buat Khotbah</span>
        </button>
      </div>

      {/* Control Bar: Book & Chapter Dropdowns, Search, and Version Switchers */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs space-y-3.5">
        {/* Row 1: Book & Chapter side-by-side on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="col-span-1 sm:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Pilih Kitab
            </label>
            <select
              value={selectedBookId}
              onChange={(e) => {
                setSelectedBookId(e.target.value);
                setSelectedChapter(1);
              }}
              className="w-full px-3 py-2 text-xs sm:text-sm font-semibold bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900"
            >
              {BIBLE_BOOKS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.testament === 'OT' ? 'PL' : 'PB'})
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Pasal
            </label>
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs sm:text-sm font-semibold bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900"
            >
              {Array.from({ length: selectedBook.chaptersCount }, (_, i) => i + 1).map((ch) => (
                <option key={ch} value={ch}>
                  Pasal {ch}
                </option>
              ))}
            </select>
          </div>

          {/* Search within Chapter */}
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Cari Ayat
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kata atau ayat..."
                className="w-full pl-8 pr-7 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-800"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 p-0.5 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick perikop navigation pills */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Perikop Pilihan Cepat
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
            {[
              { label: 'Ibrani 11 (Iman)', book: 'ibrani', ch: 11 },
              { label: 'Yohanes 3 (Kasih)', book: 'yohanes', ch: 3 },
              { label: 'Yohanes 1 (Firman)', book: 'yohanes', ch: 1 },
              { label: 'Yohanes 15 (Pokok Anggur)', book: 'yohanes', ch: 15 },
              { label: 'Mazmur 23 (Gembala)', book: 'mazmur', ch: 23 },
              { label: 'Roma 8 (Kemenangan)', book: 'roma', ch: 8 },
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedBookId(item.book);
                  setSelectedChapter(item.ch);
                }}
                className={`px-3 py-1.5 text-xs rounded-full font-medium whitespace-nowrap shrink-0 transition-colors active:scale-95 ${
                  selectedBookId === item.book && selectedChapter === item.ch
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-stone-100 text-slate-700 border border-stone-200 hover:bg-stone-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Version Switchers & Comparison Mode Toggle */}
        <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 w-full sm:w-auto">
            <button
              onClick={() => setCompareMode(true)}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors ${
                compareMode
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>3 Versi Bersama</span>
            </button>
            <button
              onClick={() => setCompareMode(false)}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors ${
                !compareMode
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Versi Tunggal</span>
            </button>
          </div>

          {!compareMode && (
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 w-full sm:w-auto">
              <button
                onClick={() => setActiveVersion('TB')}
                className={`flex-1 sm:flex-initial px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  activeVersion === 'TB'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                TB (LAI)
              </button>
              <button
                onClick={() => setActiveVersion('KJV')}
                className={`flex-1 sm:flex-initial px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  activeVersion === 'KJV'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                King James
              </button>
              <button
                onClick={() => setActiveVersion('TOLAKI')}
                className={`flex-1 sm:flex-initial px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  activeVersion === 'TOLAKI'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                Tolaki
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info Banner on Bahasa Tolaki */}
      <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-3 sm:p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-semibold">Tentang Terjemahan Bahasa Tolaki:</strong> Bahasa Tolaki adalah bahasa daerah Sulawesi Tenggara (Konawe, Kendari, Kolaka). Istilah alkitabiah Tolaki: <em>Ombu Dewata</em> (Tuhan Allah), <em>Bisara</em> (Firman), <em>Pompakano</em> (Kasih Karunia), <em>Pewula</em> (Terang), dan <em>Inahu</em> (Hati Nurani/Jiwa).
        </div>
      </div>

      {/* Verses Presentation */}
      <div className="space-y-3.5">
        {displayVerses.map((v) => {
          const verseRef = `${chapterData.bookName} ${chapterData.chapter}:${v.verse}`;
          const isCopied = copiedVerseIndex === v.verse;

          return (
            <div
              key={v.verse}
              className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs hover:border-amber-400 transition-all space-y-3.5"
            >
              {/* Verse Header bar */}
              <div className="flex items-center justify-between pb-2.5 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0">
                    {v.verse}
                  </span>
                  <span className="font-serif-title font-bold text-sm sm:text-base text-slate-900">
                    {verseRef}
                  </span>
                </div>

                <div className="hidden sm:flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopyVerse(v)}
                    className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs flex items-center gap-1 font-semibold transition-colors active:scale-95"
                    title="Salin Ayat"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Tersalin' : 'Salin'}</span>
                  </button>

                  <button
                    onClick={() => onOpenCommentaryForPassage(verseRef)}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs flex items-center gap-1 font-semibold border border-blue-200 transition-colors active:scale-95"
                    title="Buka Tafsiran Para Pakar"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Tafsiran Pakar</span>
                  </button>

                  <button
                    onClick={() => onUseForSermon(verseRef, v.tb)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Buat Khotbah</span>
                  </button>
                </div>
              </div>

              {/* Verse Content Grid (Side-by-Side on desktop or stacked on mobile) */}
              {compareMode ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs sm:text-sm">
                  {/* TB Column */}
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider bg-amber-100/70 px-2 py-0.5 rounded">
                      Terjemahan Baru (TB - LAI)
                    </span>
                    <p className="text-slate-900 leading-relaxed pt-1">
                      {v.tb}
                    </p>
                  </div>

                  {/* KJV Column */}
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider bg-blue-100/70 px-2 py-0.5 rounded">
                      King James Version (KJV)
                    </span>
                    <p className="text-slate-900 leading-relaxed pt-1 italic font-serif">
                      "{v.kjv}"
                    </p>
                  </div>

                  {/* Tolaki Column */}
                  <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/70 space-y-1.5">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100/70 px-2 py-0.5 rounded">
                      Bahasa Daerah Tolaki
                    </span>
                    <p className="text-slate-900 leading-relaxed pt-1">
                      {v.tolaki}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-sm leading-relaxed">
                  {activeVersion === 'TB' && (
                    <div>
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider bg-amber-100/70 px-2 py-0.5 rounded">
                        TB - Lembaga Alkitab Indonesia
                      </span>
                      <p className="text-slate-900 text-sm sm:text-base leading-relaxed pt-2">
                        {v.tb}
                      </p>
                    </div>
                  )}

                  {activeVersion === 'KJV' && (
                    <div>
                      <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider bg-blue-100/70 px-2 py-0.5 rounded">
                        King James Version (KJV)
                      </span>
                      <p className="text-slate-900 text-sm sm:text-base leading-relaxed pt-2 italic font-serif">
                        "{v.kjv}"
                      </p>
                    </div>
                  )}

                  {activeVersion === 'TOLAKI' && (
                    <div>
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100/70 px-2 py-0.5 rounded">
                        Bahasa Daerah Tolaki (Sulawesi Tenggara)
                      </span>
                      <p className="text-slate-900 text-sm sm:text-base leading-relaxed pt-2">
                        {v.tolaki}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile-only Bottom Action Bar on Verse Card: 3 clean touch buttons */}
              <div className="flex sm:hidden items-center justify-between gap-1.5 pt-2 border-t border-stone-100">
                <button
                  onClick={() => handleCopyVerse(v)}
                  className="flex-1 py-2 px-2 rounded-xl bg-stone-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 active:scale-95"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Tersalin' : 'Salin'}</span>
                </button>

                <button
                  onClick={() => onOpenCommentaryForPassage(verseRef)}
                  className="flex-1 py-2 px-2 rounded-xl bg-blue-50 text-blue-800 text-xs font-semibold flex items-center justify-center gap-1 border border-blue-200 active:scale-95"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Tafsiran</span>
                </button>

                <button
                  onClick={() => onUseForSermon(verseRef, v.tb)}
                  className="flex-1 py-2 px-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold flex items-center justify-center gap-1 active:scale-95 shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Khotbah</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
