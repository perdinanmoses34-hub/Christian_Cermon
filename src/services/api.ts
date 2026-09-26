import { Sermon, User, PowerPointConfig, FeatureLocks, PaymentInfo } from '../types/sermon';
import { INITIAL_SAMPLE_SERMONS } from '../data/sampleSermons';

const LOCAL_STORAGE_KEY = 'csb_sermons_v1';
const LOCAL_STORAGE_USER_KEY = 'csb_current_user_v1';
const LOCAL_STORAGE_LOCKS_KEY = 'csb_feature_locks_v1';
const LOCAL_STORAGE_PAYMENT_KEY = 'csb_payment_info_v1';
const LOCAL_STORAGE_USERS_LIST_KEY = 'csb_all_users_v1';

export const DEFAULT_FEATURE_LOCKS: FeatureLocks = {
  aiSermonGeneration: false,
  powerPointExport: true,
  scholarlyCommentary: true,
  sermonAiAssistant: true,
  tolakiBible: false,
  unlimitedSermons: true,
};

export const DEFAULT_PAYMENT_INFO: PaymentInfo = {
  bankName: 'BCA (Bank Central Asia)',
  accountNumber: '8220193812',
  accountHolder: 'Yayasan Pelayanan Khotbah Kristen',
  whatsappContact: '6281234567890',
  monthlyPrice: 'Rp 49.000 / bulan',
  yearlyPrice: 'Rp 399.000 / tahun',
};

const DEFAULT_SUPERADMIN: User = {
  id: 'user-superadmin',
  name: 'Tn. Timbu (Superadmin)',
  username: 'tn.timbu',
  email: 'tn.timbu@gereja.id',
  church_name: 'Gereja Eklesia',
  role: 'superadmin',
  subscription_status: 'premium',
  subscription_expires_at: null,
  is_active: true,
  created_at: '2026-01-01T00:00:00.000Z',
};

const DEFAULT_USERS: User[] = [
  DEFAULT_SUPERADMIN,
  {
    id: 'user-demo-1',
    name: 'Pdt. David Christian',
    username: 'david.christian',
    email: 'david@gereja.id',
    church_name: 'Gereja Kristen Indonesia',
    role: 'user',
    subscription_status: 'free',
    subscription_expires_at: '2026-12-31T23:59:59.000Z',
    is_active: true,
    created_at: '2026-01-15T00:00:00.000Z',
  },
];

export function getStoredUser(): User {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load user from localStorage', e);
  }
  const defaultUser: User = DEFAULT_USERS[1];
  localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(defaultUser));
  return defaultUser;
}

export function setStoredUser(user: User): void {
  localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
}

export function clearStoredUser(): void {
  localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
}

export function getStoredFeatureLocks(): FeatureLocks {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_LOCKS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load feature locks', e);
  }
  return DEFAULT_FEATURE_LOCKS;
}

export function saveStoredFeatureLocks(locks: FeatureLocks): void {
  localStorage.setItem(LOCAL_STORAGE_LOCKS_KEY, JSON.stringify(locks));
}

export function getStoredPaymentInfo(): PaymentInfo {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_PAYMENT_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load payment info', e);
  }
  return DEFAULT_PAYMENT_INFO;
}

export function saveStoredPaymentInfo(info: PaymentInfo): void {
  localStorage.setItem(LOCAL_STORAGE_PAYMENT_KEY, JSON.stringify(info));
}

export function getStoredUsersList(): User[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_USERS_LIST_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse users list', e);
  }
  localStorage.setItem(LOCAL_STORAGE_USERS_LIST_KEY, JSON.stringify(DEFAULT_USERS));
  return DEFAULT_USERS;
}

export function saveStoredUsersList(users: User[]): void {
  localStorage.setItem(LOCAL_STORAGE_USERS_LIST_KEY, JSON.stringify(users));
}

export function getLocalSermons(): Sermon[] {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse local sermons', e);
  }
  // Default to sample sermons
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_SERMONS));
  return INITIAL_SAMPLE_SERMONS;
}

export function saveLocalSermons(sermons: Sermon[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sermons));
  } catch (e) {
    console.error('Failed to save sermons to localStorage', e);
  }
}

// -------------------------------------------------------------
// API Calls with Graceful Local Fallback
// -------------------------------------------------------------
export async function fetchUserSermons(user: User): Promise<Sermon[]> {
  try {
    const res = await fetch('/api/sermons', {
      headers: {
        'x-user-id': user.id,
        Authorization: `Bearer ${user.id}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.sermons) && data.sermons.length > 0) {
        // Merge with local sermons
        const local = getLocalSermons();
        const merged = [...data.sermons];
        local.forEach((ls) => {
          if (!merged.some((m) => m.id === ls.id)) {
            merged.push(ls);
          }
        });
        saveLocalSermons(merged);
        return merged;
      }
    }
  } catch (err) {
    console.warn('Backend /api/sermons not reachable, using local storage cache', err);
  }
  return getLocalSermons().filter((s) => !s.user_id || s.user_id === user.id || s.user_id === 'user-demo-1');
}

export async function saveSermon(sermon: Sermon, user: User): Promise<Sermon> {
  const updatedSermon: Sermon = {
    ...sermon,
    user_id: user.id,
    updated_at: new Date().toISOString(),
  };

  // Update local storage first for instant feedback
  const localList = getLocalSermons();
  const idx = localList.findIndex((s) => s.id === updatedSermon.id);
  if (idx >= 0) {
    localList[idx] = updatedSermon;
  } else {
    localList.unshift(updatedSermon);
  }
  saveLocalSermons(localList);

  // Sync with backend
  try {
    const method = idx >= 0 ? 'PUT' : 'POST';
    const url = idx >= 0 ? `/api/sermons/${updatedSermon.id}` : '/api/sermons';
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.id,
        Authorization: `Bearer ${user.id}`,
      },
      body: JSON.stringify(updatedSermon),
    });
    if (res.ok) {
      const data = await res.json();
      return data.sermon || updatedSermon;
    }
  } catch (err) {
    console.warn('Backend save failed, saved locally', err);
  }
  return updatedSermon;
}

export async function deleteSermonApi(sermonId: string, user: User): Promise<boolean> {
  const localList = getLocalSermons().filter((s) => s.id !== sermonId);
  saveLocalSermons(localList);

  try {
    await fetch(`/api/sermons/${sermonId}`, {
      method: 'DELETE',
      headers: {
        'x-user-id': user.id,
        Authorization: `Bearer ${user.id}`,
      },
    });
  } catch (err) {
    console.warn('Backend delete failed, removed locally', err);
  }
  return true;
}

// Fallback sermon generator for static hosting environments like GitHub Pages
function createClientSideSermon(payload: any, user: User): Sermon {
  const sermonId = `sermon-${Date.now()}`;
  const theme = payload.theme || 'Hidup Bersama Kristus';
  const scripture = payload.main_scripture || 'Yohanes 15:1-8';
  const method = payload.method || 'ekspositori';
  const audience = payload.audience || 'dewasa';
  const duration = payload.duration || '30 menit';

  const methodNames: Record<string, string> = {
    ekspositori: 'Ekspositori (Penggalian Teks Mendalam)',
    topikal: 'Topikal (Penjelajahan Tema Firman)',
    tekstual: 'Tekstual (Pengembangan Klausul Ayat)',
    naratif: 'Naratif (Alur Kisah Tokoh Alkitab)',
    induktif: 'Induktif (Dari Realitas Menuju Firman)',
    deduktif: 'Deduktif (Pernyataan Kebenaran Utama)',
    problem_solution: 'Problem-Solution (Prinsip Alkitab Menjawab Masalah)',
    kristosentris: 'Kristosentris (Penebusan Kristus Sebagai Pusat)',
  };

  const point1Title = `Mengenal Rancangan & Kehendak Allah Melalui ${scripture}`;
  const point2Title = `Menghidupi Firman dengan Ketaatan Nyata Setiap Hari`;
  const point3Title = `Memperoleh Pengharapan & Damai Sejahtera Kekal di Dalam Kristus`;

  return {
    id: sermonId,
    user_id: user.id,
    title: `${theme}`,
    theme,
    main_scripture: scripture,
    supporting_scriptures: payload.supporting_scriptures && payload.supporting_scriptures.length > 0
      ? payload.supporting_scriptures
      : ['Mazmur 119:105', 'Roma 12:1-2'],
    objective: payload.objective || `Membimbing jemaat ${audience} memahami arti ${theme} dan menerapkannya dalam kehidupan iman.`,
    method,
    audience,
    duration,
    language: payload.language || 'id',
    style: payload.style || {
      languageStyle: 'Pastoral',
      theologicalToPractical: 60,
      seriousToRelaxed: 40,
    },
    big_idea: `Kebenaran firman Tuhan dalam ${scripture} memanggil kita untuk menaruh percaya seutuhnya kepada Allah dan hidup dalam ketaatan yang nyata setiap hari.`,
    introduction: `Di tengah dunia yang serba berubah dan penuh ketidakpastian, manusia sering kali mencari pegangan hidup. Melalui teks firman Tuhan dalam ${scripture}, kita diajak untuk melihat kembali fondasi iman kita pada metodologi ${methodNames[method] || method}. Hari ini kita akan merenungkan bagaimana kebenaran ini bekerja dalam kehidupan nyata kita.`,
    context: `Latar belakang teks ${scripture} mencatat pesan penting yang relevan bagi umat Allah sepanjang masa. Melalui pendekatan ${method}, kita melihat kesinambungan antara naskah asli dengan pergumulan jemaat masa kini.`,
    text_explanation: `Teks ini mengajarkan bahwa Allah tidak pernah meninggalkan umat-Nya. Setiap firman yang disampaikan memiliki otoritas penuh dan kuasa untuk mengubah hati yang rindu dipimpin Roh Kudus.`,
    main_points: [
      {
        id: `pt-${Date.now()}-1`,
        title: point1Title,
        biblical_basis: [scripture],
        explanation: `Bagian awal firman ini memperlihatkan inisiatif anugerah Allah yang terlebih dahulu menjangkau dan menyapa umat-Nya. Fondasi iman kita bukanlah kekuatan diri sendiri, melainkan kesetiaan janji Allah yang tertulis di dalam firman-Nya.`,
        interpretation: `Makna asli dari teks ini menegaskan bahwa kebenaran Allah tidak bergantung pada situasi emosional kita, melainkan pada ketetapan Allah yang berdaulat.`,
        illustration: `Seperti sebuah mercusuar yang berdiri kokoh di atas batu karang, menuntun kapal-kapal di tengah badai malam agar tidak menabrak tebing karang.`,
        application: `Periksalah arah hidup Anda minggu ini: apakah keputusan harian Anda masih dipandu oleh firman atau sekadar kecemasan duniawi?`,
        transition: `Setelah memahami rancangan firman ini, bagaimanakah kita meresponsnya dalam kehidupan harian kita?`,
      },
      {
        id: `pt-${Date.now()}-2`,
        title: point2Title,
        biblical_basis: [scripture, 'Yakobus 1:22'],
        explanation: `Mendengarkan firman saja belumlah lengkap jika tidak disertai dengan ketaatan. Roh Kudus memampukan orang percaya untuk mengambil langkah nyata yang memuliakan Allah.`,
        interpretation: `Teks firman menekankan buah ketaatan sebagai bukti autentik dari relasi yang hidup bersama Sang Pencipta.`,
        illustration: `Bagaikan benih yang jatuh di tanah yang subur; bukan sekadar tersimpan, melainkan bertunas, berakar kuat, dan menghasilkan buah lebat.`,
        application: `Pilihlah satu tindakan kasih atau ketaatan konkret yang akan Anda lakukan kepada keluarga atau rekan kerja minggu ini.`,
        transition: `Dan apa yang menjadi kekuatan serta upah terbesar bagi orang-orang yang setia berjalan bersama-Nya?`,
      },
      {
        id: `pt-${Date.now()}-3`,
        title: point3Title,
        biblical_basis: [scripture, 'Filipi 4:6-7'],
        explanation: `Di dalam Kristus, kita memiliki damai sejahtera yang melampaui segala akal. Segala jerih lelah dalam mengikut Tuhan tidak akan pernah sia-sia karena kita memiliki warisan kekal di surga.`,
        interpretation: `Puncak dari seluruh pewahyuan firman mengarahkan pandangan kita kepada kesetiaan dan kemuliaan Kristus yang kekal.`,
        illustration: `Seorang pelari yang tetap berlari dengan semangat karena matanya tertuju pada garis akhir dan mahkota kemenangan.`,
        application: `Serahkan segala kekhawatiran terbesar Anda ke dalam tangan Tuhan hari ini dan hiduplah dalam ucapan syukur.`,
        transition: `Mari kita bawa seluruh kebenaran firman ini ke dalam kesimpulan dan panggilan doa kita.`,
      },
    ],
    illustrations: [
      `Analogi mercusuar di tengah badai samudra yang memandu kapal ke pelabuhan damai.`,
      `Ilustrasi benih yang bertumbuh menghasilkan buah lebat melalui pemeliharaan yang tekun.`,
    ],
    applications: {
      personal: `Sediakan waktu teduh setiap pagi untuk membaca firman sebelum memulai rutinitas.`,
      family: `Membangun komunikasi yang penuh kasih dan saling mendoakan antaranggota keluarga.`,
      workplace: `Menjaga kejujuran dan keteladanan moral di tempat kerja atau usaha.`,
      ministry: `Melayani dengan kerendahan hati tanpa mencari pengakuan manusia.`,
    },
    reflection_questions: [
      `Di bagian manakah dalam hidup Anda saat ini yang paling membutuhkan penyerahan iman kepada Tuhan?`,
      `Langkah ketaatan konkret apa yang Roh Kudus bisikkan dalam hati Anda hari ini?`,
      `Sudahkah Anda membagikan kasih dan kebenaran firman ini kepada sesama di sekitar Anda?`,
    ],
    call_to_action: `Hari ini, bukalah hati Anda bagi pimpinan firman Tuhan. Ambillah komitmen untuk melangkah dalam ketaatan dan jadilah saksi Kristus yang bercahaya!`,
    conclusion: `Firman Tuhan dalam ${scripture} mengingatkan kita bahwa Allah adalah tempat perlindungan yang teguh. Ketika kita berakar di dalam Dia, hidup kita akan menghasilkan buah yang kekal.`,
    closing_prayer: `Bapa yang bertahta di dalam surga, kami mengucap syukur untuk firman-Mu yang hidup dan berkuasa. Mampukanlah kami tidak hanya menjadi pendengar, tetapi pelaku firman yang setia. Penuhilah hati kami dengan Roh Kudus agar hidup kami senantiasa memuliakan nama-Mu. Di dalam nama Tuhan Yesus Kristus kami berdoa dan bersyukur. Amin.`,
    powerpoint: {
      template: 'Modern Church',
      colorPalette: 'navy',
      font: 'Inter',
      aspectRatio: '16:9',
      slides: [
        {
          id: `sl-${Date.now()}-1`,
          title: theme,
          content: `${scripture}\nKhotbah ${methodNames[method] || method}`,
          speaker_notes: `Buka dengan salam hangat kepada jemaat dan sampaikan tema khotbah dengan penuh pengharapan.`,
          slide_type: 'title',
        },
        {
          id: `sl-${Date.now()}-2`,
          title: 'Ayat Alkitab Utama',
          content: `Firman Tuhan:\n"${scripture}"`,
          speaker_notes: `Ajak jemaat membuka Alkitab dan membaca bersama perikop utama.`,
          slide_type: 'scripture',
        },
        {
          id: `sl-${Date.now()}-3`,
          title: 'Gagasan Utama (Big Idea)',
          content: `Kebenaran firman Tuhan dalam ${scripture} memanggil kita untuk menaruh percaya seutuhnya kepada Allah dan hidup dalam ketaatan yang nyata setiap hari.`,
          speaker_notes: `Ulangi pesan sentral ini dengan penekanan pada kata percaya dan ketaatan nyata.`,
          slide_type: 'big_idea',
        },
        {
          id: `sl-${Date.now()}-4`,
          title: '1. Mengenal Rancangan Allah',
          content: `• Fondasi iman berakar pada kesetiaan Allah.\n• Kebenaran firman melampaui situasi yang tampak.\n• Mengarahkan hati kepada janji yang tidak pernah gagal.`,
          speaker_notes: `Sampaikan penjelasan poin pertama dan ilustrasikan dengan analogi mercusuar.`,
          slide_type: 'point',
        },
        {
          id: `sl-${Date.now()}-5`,
          title: '2. Menghidupi Firman dengan Ketaatan',
          content: `• Iman sejati selalu terwujud dalam tindakan nyata.\n• Menjadi pelaku firman, bukan hanya pendengar.\n• Roh Kudus memberi kekuatan untuk taat.`,
          speaker_notes: `Ajak jemaat merenungkan langkah ketaatan konkret minggu ini.`,
          slide_type: 'point',
        },
        {
          id: `sl-${Date.now()}-6`,
          title: '3. Damai Sejahtera Kekal',
          content: `• Mengalami damai Allah yang melampaui segala akal.\n• Pengharapan teguh di dalam Yesus Kristus.\n• Jerih payah di dalam Tuhan tidak pernah sia-sia.`,
          speaker_notes: `Kuatkan jemaat yang sedang menghadapi masa-masa sulit atau pergumulan berat.`,
          slide_type: 'point',
        },
        {
          id: `sl-${Date.now()}-7`,
          title: 'Penerapan Praktis Minggu Ini',
          content: `• Pribadi: Saat teduh rutin bersama firman Tuhan.\n• Keluarga: Saling mendoakan dan mengampuni.\n• Pekerjaan: Menjaga integritas dan kejujuran.`,
          speaker_notes: `Bimbing jemaat menentukan satu komitmen iman yang akan dilakukan hari ini.`,
          slide_type: 'application',
        },
        {
          id: `sl-${Date.now()}-8`,
          title: 'Doa Penutup',
          content: `"Tuhan, mampukan kami melangkah dalam ketaatan dan hidup berbuah bagi kemuliaan-Mu. Amin."`,
          speaker_notes: `Tutup khotbah dengan doa penyerahan diri jemaat.`,
          slide_type: 'prayer',
        },
      ],
    },
    status: 'completed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function generateSermonApi(payload: any, user: User): Promise<Sermon> {
  try {
    const res = await fetch('/api/sermons/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.id,
        Authorization: `Bearer ${user.id}`,
      },
      body: JSON.stringify({ ...payload, user_id: user.id }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.sermon) {
        const createdSermon = data.sermon;
        const localList = getLocalSermons();
        localList.unshift(createdSermon);
        saveLocalSermons(localList);
        return createdSermon;
      }
    }
  } catch (err) {
    console.warn('Backend /api/sermons/generate unreachable (e.g. static GitHub Pages), generating resilient client-side sermon', err);
  }

  // Graceful fallback for static hosting (GitHub Pages)
  const clientSermon = createClientSideSermon(payload, user);
  const localList = getLocalSermons();
  localList.unshift(clientSermon);
  saveLocalSermons(localList);
  return clientSermon;
}

export async function askAiAssistantApi(
  sectionName: string,
  currentContent: string,
  instruction: string,
  sermonContext: Partial<Sermon>
): Promise<string> {
  try {
    const res = await fetch('/api/sermons/assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sectionName,
        currentContent,
        instruction,
        sermonContext: {
          title: sermonContext.title,
          main_scripture: sermonContext.main_scripture,
          big_idea: sermonContext.big_idea,
        },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.refinedText) {
        return data.refinedText;
      }
    }
  } catch (err) {
    console.warn('Backend /api/sermons/assist unreachable, applying client-side refinement', err);
  }

  // Resilient refinement on static hosting
  if (instruction.toLowerCase().includes('praktis')) {
    return `${currentContent}\n\n[Langkah Praktis Minggu Ini]: Pilihlah satu tindakan konkret hari ini untuk mewujudkan firman ini dalam perkataan dan perbuatan sehari-hari.`;
  }
  if (instruction.toLowerCase().includes('teologis')) {
    return `${currentContent}\n\n[Penegasan Teologis]: Teks ini berakar pada kedaulatan anugerah Allah yang mengikatkan janji-Nya kepada umat-Nya secara setia dan kekal.`;
  }
  if (instruction.toLowerCase().includes('ilustrasi')) {
    return `${currentContent}\n\n[Ilustrasi Tambahan]: Seperti seorang nahkoda yang mempercayai kompas di tengah kabut tebal, orang beriman bersandar penuh pada ketetapan firman Allah.`;
  }
  if (instruction.toLowerCase().includes('pemuda')) {
    return `${currentContent}\n\n[Refleksi Anak Muda]: Di tengah arus tren dan tekanan media sosial, firman Tuhan memberikan identitas sejati yang teguh dan tak tergoyahkan.`;
  }

  return `${currentContent}\n\n[Catatan Homiletika]: Disesuaikan menurut instruksi: "${instruction}". Tetap teguh pada kebenaran teks firman Tuhan.`;
}

export async function regeneratePowerPointApi(
  sermon: Sermon,
  config: Partial<PowerPointConfig>
): Promise<PowerPointConfig> {
  try {
    const res = await fetch('/api/sermons/generate-powerpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sermon,
        template: config.template,
        colorPalette: config.colorPalette,
        font: config.font,
        aspectRatio: config.aspectRatio,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.powerpoint) {
        return data.powerpoint;
      }
    }
  } catch (err) {
    console.warn('Backend /api/sermons/generate-powerpoint unreachable, updating slides client-side', err);
  }

  // Fallback for static hosting
  const existingSlides = sermon.powerpoint?.slides || [];
  return {
    template: config.template || sermon.powerpoint?.template || 'Modern Church',
    colorPalette: config.colorPalette || sermon.powerpoint?.colorPalette || 'navy',
    font: config.font || sermon.powerpoint?.font || 'Inter',
    aspectRatio: config.aspectRatio || sermon.powerpoint?.aspectRatio || '16:9',
    slides: existingSlides,
  };
}

// -------------------------------------------------------------
// Authentication API with Superadmin Support
// -------------------------------------------------------------
export async function loginUserApi(credentials: {
  email?: string;
  username?: string;
  password?: string;
  name?: string;
  church_name?: string;
}): Promise<User> {
  const query = (credentials.email || credentials.username || '').toLowerCase().trim();

  // Try server endpoint
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.user) {
        setStoredUser(data.user);
        return data.user;
      }
    } else {
      const err = await res.json().catch(() => ({}));
      if (err.error) throw new Error(err.error);
    }
  } catch (err: any) {
    if (err.message && err.message.includes('Superadmin')) {
      throw err;
    }
    console.warn('Backend login unavailable or errored, evaluating via client auth logic', err);
  }

  // Client-side authentication logic (for GitHub Pages static hosting)
  const usersList = getStoredUsersList();

  // 1. Superadmin check
  if (query === 'tn.timbu' || query === 'tn.timbu@gereja.id') {
    if (credentials.password !== 'Eklesia_030918') {
      throw new Error('Kata sandi superadmin salah.');
    }
    let superadmin = usersList.find((u) => u.username === 'tn.timbu' || u.role === 'superadmin');
    if (!superadmin) {
      superadmin = {
        id: 'user-superadmin',
        name: 'Tn. Timbu (Superadmin)',
        username: 'tn.timbu',
        email: 'tn.timbu@gereja.id',
        church_name: 'Gereja Eklesia',
        role: 'superadmin',
        subscription_status: 'premium',
        subscription_expires_at: null,
        is_active: true,
        created_at: '2026-01-01T00:00:00.000Z',
      };
      usersList.unshift(superadmin);
      saveStoredUsersList(usersList);
    }

    if (superadmin.is_active === false) {
      throw new Error('Akun Anda telah dinonaktifkan oleh Administrator.');
    }

    setStoredUser(superadmin);
    return superadmin;
  }

  // 2. Regular user check
  let existingUser = usersList.find(
    (u) =>
      (u.email && u.email.toLowerCase() === query) ||
      (u.username && u.username.toLowerCase() === query)
  );

  if (existingUser) {
    if (existingUser.is_active === false) {
      throw new Error('Akun Anda telah dinonaktifkan oleh Superadmin. Silakan hubungi admin gereja.');
    }
    setStoredUser(existingUser);
    return existingUser;
  }

  // 3. New registered user
  const newUser: User = {
    id: `user-${Date.now()}`,
    name: credentials.name || (query.includes('@') ? query.split('@')[0] : query || 'Pelayan Tuhan'),
    email: query.includes('@') ? query : `${query}@gereja.id`,
    username: query.includes('@') ? query.split('@')[0] : query,
    church_name: credentials.church_name || 'Gereja Kristen',
    role: 'user',
    subscription_status: 'free',
    subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true,
    created_at: new Date().toISOString(),
  };

  usersList.push(newUser);
  saveStoredUsersList(usersList);
  setStoredUser(newUser);
  return newUser;
}

// -------------------------------------------------------------
// Superadmin Management API
// -------------------------------------------------------------
export async function fetchAdminUsersApi(): Promise<User[]> {
  try {
    const res = await fetch('/api/admin/users');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.users)) {
        saveStoredUsersList(data.users);
        return data.users;
      }
    }
  } catch (err) {
    console.warn('Backend /api/admin/users unreachable, using local storage cache', err);
  }
  return getStoredUsersList();
}

export async function updateAdminUserApi(userId: string, updates: Partial<User>): Promise<User> {
  try {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.user) {
        // Also update local storage
        const list = getStoredUsersList();
        const idx = list.findIndex((u) => u.id === userId);
        if (idx >= 0) {
          list[idx] = { ...list[idx], ...data.user };
          saveStoredUsersList(list);
        }
        return data.user;
      }
    }
  } catch (err) {
    console.warn('Backend update admin user failed, persisting locally', err);
  }

  const list = getStoredUsersList();
  const idx = list.findIndex((u) => u.id === userId);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...updates };
    saveStoredUsersList(list);
    return list[idx];
  }
  throw new Error('Pengguna tidak ditemukan.');
}

export async function deleteAdminUserApi(userId: string): Promise<void> {
  if (userId === 'user-superadmin') {
    throw new Error('Akun superadmin utama tidak dapat dihapus.');
  }

  try {
    await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('Backend delete admin user failed, deleting locally', err);
  }

  const list = getStoredUsersList().filter((u) => u.id !== userId);
  saveStoredUsersList(list);
}

export async function fetchAdminSettingsApi(): Promise<{
  feature_locks: FeatureLocks;
  payment_info: PaymentInfo;
}> {
  try {
    const res = await fetch('/api/admin/settings');
    if (res.ok) {
      const data = await res.json();
      if (data.feature_locks && data.payment_info) {
        saveStoredFeatureLocks(data.feature_locks);
        saveStoredPaymentInfo(data.payment_info);
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend settings unreachable, using local storage cache', err);
  }

  return {
    feature_locks: getStoredFeatureLocks(),
    payment_info: getStoredPaymentInfo(),
  };
}

export async function updateAdminSettingsApi(payload: {
  feature_locks?: FeatureLocks;
  payment_info?: PaymentInfo;
}): Promise<void> {
  try {
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn('Backend update settings failed, saving locally', err);
  }

  if (payload.feature_locks) saveStoredFeatureLocks(payload.feature_locks);
  if (payload.payment_info) saveStoredPaymentInfo(payload.payment_info);
}
