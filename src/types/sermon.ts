export type PreachingMethod =
  | 'ekspositori'
  | 'topikal'
  | 'tekstual'
  | 'naratif'
  | 'induktif'
  | 'deduktif'
  | 'problem_solution'
  | 'kristosentris';

export type TargetAudience =
  | 'umum'
  | 'dewasa'
  | 'pemuda'
  | 'remaja'
  | 'anak_anak'
  | 'keluarga'
  | 'pelayan_tuhan'
  | 'pemimpin_gereja'
  | 'kelompok_sel';

export type SermonDuration = '15 menit' | '20 menit' | '30 menit' | '45 menit' | '60 menit' | string;

export type LanguageStyle =
  | 'Sederhana'
  | 'Formal'
  | 'Inspiratif'
  | 'Pastoral'
  | 'Akademis'
  | 'Komunikatif'
  | 'Anak Muda'
  | 'Evangelistik';

export interface SermonStyle {
  languageStyle: LanguageStyle;
  theologicalToPractical: number; // 0 (Murni Teologis) to 100 (Sangat Praktis)
  seriousToRelaxed: number; // 0 (Sangat Serius) to 100 (Hangat / Santai)
}

export interface MainPoint {
  id: string;
  title: string;
  explanation: string;
  biblical_basis: string[];
  interpretation: string;
  illustration: string;
  application: string;
  transition: string;
}

export interface PracticalApplications {
  personal?: string;
  family?: string;
  workplace?: string;
  ministry?: string;
  relationships?: string;
  spiritual?: string;
}

export interface PowerPointSlide {
  id: string;
  title: string;
  content: string; // bullet points separated by newline
  speaker_notes: string;
  slide_type?: 'title' | 'scripture' | 'big_idea' | 'intro' | 'point' | 'application' | 'reflection' | 'conclusion' | 'cta' | 'prayer';
  image_url?: string;
  image_prompt?: string;
}

export type PPTTemplate =
  | 'Modern Church'
  | 'Minimalist'
  | 'Elegant'
  | 'Dark'
  | 'Youth'
  | 'Classic'
  | 'Nature'
  | 'Christian';

export type PPTColorPalette = 'navy' | 'blue' | 'gold' | 'beige' | 'white' | 'dark';

export type PPTFont = 'Inter' | 'Poppins' | 'Montserrat' | 'Merriweather' | 'Playfair Display';

export interface PowerPointConfig {
  template: PPTTemplate;
  colorPalette: PPTColorPalette;
  font: PPTFont;
  aspectRatio: '16:9' | '4:3';
  slides: PowerPointSlide[];
}

export interface Sermon {
  id: string;
  user_id: string;
  title: string;
  theme: string;
  main_scripture: string;
  supporting_scriptures: string[];
  objective?: string;
  method: PreachingMethod;
  audience: TargetAudience;
  duration: SermonDuration;
  language: 'id' | 'en';
  style: SermonStyle;
  big_idea: string;
  introduction: string;
  context: string;
  text_explanation?: string;
  main_points: MainPoint[];
  illustrations?: string[];
  applications?: PracticalApplications;
  reflection_questions: string[];
  call_to_action: string;
  conclusion: string;
  closing_prayer: string;
  powerpoint: PowerPointConfig;
  status: 'draft' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  church_name?: string;
  role?: 'user' | 'superadmin';
  subscription_status?: 'free' | 'premium' | 'expired';
  subscription_expires_at?: string | null;
  is_active?: boolean;
  phone?: string;
  created_at?: string;
}

export interface FeatureLocks {
  aiSermonGeneration: boolean;
  powerPointExport: boolean;
  scholarlyCommentary: boolean;
  sermonAiAssistant: boolean;
  tolakiBible: boolean;
  unlimitedSermons: boolean;
}

export interface PaymentInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  whatsappContact: string;
  monthlyPrice: string;
  yearlyPrice: string;
}

export interface SermonStats {
  totalSermons: number;
  thisMonthSermons: number;
  draftsCount: number;
  presentationsCount: number;
}
