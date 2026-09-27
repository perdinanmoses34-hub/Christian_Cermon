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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-2xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-semibold mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            Alkitab Multi-Versi
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-white tracking-tight">
            Alkitab TB, King James & Bahasa Tolaki
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Eksplorasi firman Tuhan dalam bahasa Indonesia (TB-LAI), bahasa Inggris klasik (King James Version), dan bahasa daerah Tolaki (Sulawesi Tenggara).
          </p>
        </div>

        {/* Quick Action Button */}
        <button
          onClick={() => onUseForSermon(`${chapterData.bookName} ${chapterData.chapter}:1-6`, chapterData.bookName)}
          className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30 transition-transform transform hover:-translate-y-0.5 shrink-0 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          Gunakan Pasal Ini Buat Khotbah
        </button>
      </div>

      {/* Control Bar: Book, Chapter, Version Selection & Mode Toggle */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Book & Chapter Selectors */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Pilih Kitab
              </label>
              <select
                value={selectedBookId}
                onChange={(e) => {
                  setSelectedBookId(e.target.value);
                  setSelectedChapter(1);
                }}
                className="px-3 py-2 text-xs font-semibold bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900"
              >
                {BIBLE_BOOKS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.testament === 'OT' ? 'PL' : 'PB'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Pasal
              </label>
              <select
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(Number(e.target.value))}
                className="px-3 py-2 text-xs font-semibold bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900 min-w-[70px]"
              >
                {Array.from({ length: selectedBook.chaptersCount }, (_, i) => i + 1).map((ch) => (
                  <option key={ch} value={ch}>
                    Pasal {ch}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick perikop navigation pills */}
            <div className="w-full sm:w-auto">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
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
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border whitespace-nowrap shrink-0 transition-colors ${
                      selectedBookId === item.book && selectedChapter === item.ch
                        ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                        : 'bg-stone-100 text-slate-700 border-stone-200 hover:bg-stone-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search within Chapter */}
          <div className="w-full sm:w-auto flex-1 sm:max-w-xs">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Cari Kata / Ayat
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kata atau nomor ayat..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Version Switchers & Comparison Mode Toggle */}
        <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Tampilan:</span>
            <button
              onClick={() => setCompareMode(true)}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                compareMode
                  ? 'bg-slate-900 text-amber-400 shadow-sm'
                  : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              Bandingkan 3 Versi Berdampingan
            </button>
            <button
              onClick={() => setCompareMode(false)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                !compareMode
                  ? 'bg-slate-900 text-amber-400 shadow-sm'
                  : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
              }`}
            >
              Versi Tunggal
            </button>
          </div>

          {!compareMode && (
            <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200">
              <button
                onClick={() => setActiveVersion('TB')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  activeVersion === 'TB'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                TB (Terjemahan Baru)
              </button>
              <button
                onClick={() => setActiveVersion('KJV')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  activeVersion === 'KJV'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                King James (KJV)
              </button>
              <button
                onClick={() => setActiveVersion('TOLAKI')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  activeVersion === 'TOLAKI'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                Bahasa Tolaki
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info Banner on Bahasa Tolaki */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-semibold">Tentang Terjemahan Bahasa Tolaki:</strong> Bahasa Tolaki adalah bahasa daerah suku Tolaki di Sulawesi Tenggara (Konawe, Kendari, Kolaka). Teks firman menggunakan istilah alkitabiah Tolaki: <em>Ombu Dewata</em> (Tuhan Allah), <em>Bisara</em> (Firman), <em>Pompakano</em> (Kasih Karunia), <em>Pewula</em> (Terang), dan <em>Inahu</em> (Hati Nurani/Jiwa).
        </div>
      </div>

      {/* Verses Presentation */}
      <div className="space-y-4">
        {displayVerses.map((v) => {
          const verseRef = `${chapterData.bookName} ${chapterData.chapter}:${v.verse}`;
          const isCopied = copiedVerseIndex === v.verse;

          return (
            <div
              key={v.verse}
              className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:border-amber-400 transition-all space-y-4"
            >
              {/* Verse Header bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0">
                    {v.verse}
                  </span>
                  <span className="font-serif-title font-bold text-sm text-slate-900">
                    {verseRef}
                  </span>
                </div>

                {/* Verse Actions */}
                <div className="flex items-center gap-1.5 flex-wrap self-end sm:self-auto">
                  <button
                    onClick={() => handleCopyVerse(v)}
                    className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs flex items-center gap-1 font-medium transition-colors"
                    title="Salin Ayat"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[11px]">{isCopied ? 'Tersalin' : 'Salin'}</span>
                  </button>

                  <button
                    onClick={() => onOpenCommentaryForPassage(verseRef)}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs flex items-center gap-1 font-semibold border border-blue-200 transition-colors"
                    title="Buka Tafsiran Para Pakar"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Tafsiran</span>
                  </button>

                  <button
                    onClick={() => onUseForSermon(verseRef, v.tb)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1 transition-colors shadow-sm cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Khotbah</span>
                  </button>
                </div>
              </div>

              {/* Verse Content Grid (Side-by-Side or Single) */}
              {compareMode ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
                  {/* TB Column */}
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider bg-amber-100/70 px-2 py-0.5 rounded">
                      Terjemahan Baru (TB - LAI)
                    </span>
                    <p className="text-slate-800 leading-relaxed pt-1">
                      {v.tb}
                    </p>
                  </div>

                  {/* KJV Column */}
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider bg-blue-100/70 px-2 py-0.5 rounded">
                      King James Version (KJV)
                    </span>
                    <p className="text-slate-800 leading-relaxed pt-1 font-serif italic">
                      "{v.kjv}"
                    </p>
                  </div>

                  {/* Tolaki Column */}
                  <div className="p-3.5 rounded-xl bg-amber-50/40 border border-amber-200/80 space-y-1.5">
                    <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider bg-amber-200/80 px-2 py-0.5 rounded">
                      Bahasa Tolaki (Sulawesi Tenggara)
                    </span>
                    <p className="text-slate-900 leading-relaxed pt-1 font-medium">
                      {v.tolaki}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-sm leading-relaxed text-slate-800">
                  {activeVersion === 'TB' && (
                    <p><strong className="text-amber-800">[TB]</strong> {v.tb}</p>
                  )}
                  {activeVersion === 'KJV' && (
                    <p className="font-serif italic"><strong className="text-blue-800 font-sans">[KJV]</strong> "{v.kjv}"</p>
                  )}
                  {activeVersion === 'TOLAKI' && (
                    <p className="font-medium"><strong className="text-amber-900">[Tolaki]</strong> {v.tolaki}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
