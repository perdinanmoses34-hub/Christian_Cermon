export type BibleVersion = 'TB' | 'KJV' | 'TOLAKI';

export interface BibleVerse {
  verse: number;
  tb: string;
  kjv: string;
  tolaki: string;
}

export interface BibleBook {
  id: string;
  name: string;
  testament: 'OT' | 'NT';
  chaptersCount: number;
}

export interface BibleChapterData {
  bookId: string;
  bookName: string;
  chapter: number;
  verses: BibleVerse[];
}

export type ScholarName =
  | 'Matthew Henry'
  | 'John Calvin'
  | 'Albert Barnes'
  | 'Charles Spurgeon'
  | 'Warren Wiersbe'
  | 'F.F. Bruce';

export interface CommentaryEntry {
  id: string;
  passage: string;
  book: string;
  scholar: ScholarName;
  period: string;
  tradition: string;
  title: string;
  summary: string;
  historicalContext: string;
  originalLanguageInsights?: string; // Greek / Hebrew word breakdown
  theologicalExegesis: string;
  homileticalApplication: string;
  credibleSources: string[];
}
