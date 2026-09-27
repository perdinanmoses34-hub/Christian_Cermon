import 'dotenv/config';
import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getThematicSlideArtwork } from './src/data/christianSlideThemes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Database path for server-side persistence
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DBData {
  users: Array<{
    id: string;
    name: string;
    email: string;
    username?: string;
    church_name?: string;
    password?: string;
    role?: 'user' | 'superadmin';
    subscription_status?: 'free' | 'premium' | 'expired';
    subscription_expires_at?: string | null;
    is_active?: boolean;
    phone?: string;
    created_at?: string;
  }>;
  sermons: any[];
  feature_locks?: {
    aiSermonGeneration: boolean;
    powerPointExport: boolean;
    scholarlyCommentary: boolean;
    sermonAiAssistant: boolean;
    tolakiBible: boolean;
    unlimitedSermons: boolean;
  };
  payment_info?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    whatsappContact: string;
    monthlyPrice: string;
    yearlyPrice: string;
  };
}

function loadDB(): DBData {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      // Ensure superadmin exists in parsed db
      if (parsed.users) {
        const hasSuperadmin = parsed.users.some(
          (u: any) => u.username === 'tn.timbu' || u.role === 'superadmin'
        );
        if (!hasSuperadmin) {
          parsed.users.unshift({
            id: 'user-superadmin',
            name: 'Tn. Timbu (Superadmin)',
            username: 'tn.timbu',
            email: 'tn.timbu@gereja.id',
            password: 'Eklesia_030918',
            church_name: 'Gereja Eklesia',
            role: 'superadmin',
            subscription_status: 'premium',
            subscription_expires_at: null,
            is_active: true,
            created_at: '2026-01-01T00:00:00.000Z',
          });
        }
        if (!parsed.feature_locks) {
          parsed.feature_locks = {
            aiSermonGeneration: false,
            powerPointExport: true,
            scholarlyCommentary: true,
            sermonAiAssistant: true,
            tolakiBible: false,
            unlimitedSermons: true,
          };
        }
        if (!parsed.payment_info) {
          parsed.payment_info = {
            bankName: 'BCA (Bank Central Asia)',
            accountNumber: '8220193812',
            accountHolder: 'Yayasan Pelayanan Khotbah Kristen',
            whatsappContact: '6281234567890',
            monthlyPrice: 'Rp 49.000 / bulan',
            yearlyPrice: 'Rp 399.000 / tahun',
          };
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading db.json, falling back to default', err);
  }

  const initialData: DBData = {
    users: [
      {
        id: 'user-superadmin',
        name: 'Tn. Timbu (Superadmin)',
        username: 'tn.timbu',
        email: 'tn.timbu@gereja.id',
        password: 'Eklesia_030918',
        church_name: 'Gereja Eklesia',
        role: 'superadmin',
        subscription_status: 'premium',
        subscription_expires_at: null,
        is_active: true,
        created_at: '2026-01-01T00:00:00.000Z',
      },
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
    ],
    feature_locks: {
      aiSermonGeneration: false,
      powerPointExport: true,
      scholarlyCommentary: true,
      sermonAiAssistant: true,
      tolakiBible: false,
      unlimitedSermons: true,
    },
    payment_info: {
      bankName: 'BCA (Bank Central Asia)',
      accountNumber: '8220193812',
      accountHolder: 'Yayasan Pelayanan Khotbah Kristen',
      whatsappContact: '6281234567890',
      monthlyPrice: 'Rp 49.000 / bulan',
      yearlyPrice: 'Rp 399.000 / tahun',
    },
    sermons: [
      {
        id: 'sermon-1',
        user_id: 'user-demo-1',
        title: 'Hidup Dalam Iman yang Sejati',
        theme: 'Hidup Dalam Iman',
        main_scripture: 'Ibrani 11:1-6',
        supporting_scriptures: ['Roma 10:17', '2 Korintus 5:7', 'Yakobus 2:17'],
        objective: 'Jemaat memahami hakikat iman alkitabiah, membuang kepalsuan iman pasif, dan berani melangkah dalam ketaatan konkret setiap hari.',
        method: 'ekspositori',
        audience: 'dewasa',
        duration: '30 menit',
        language: 'id',
        style: {
          languageStyle: 'Pastoral',
          theologicalToPractical: 65,
          seriousToRelaxed: 35,
        },
        big_idea: 'Iman yang sejati bukan sekadar persetujuan akal tentang keberadaan Allah, melainkan penyerahan diri seutuhnya yang dibuktikan lewat ketaatan firman di tengah ketidakpastian.',
        introduction: 'Pernahkah Anda berdiri di tepi keputusan besar di mana setiap kalkulasi manusia berkata "tidak", tetapi suara firman Tuhan membimbing Anda untuk melangkah? Hari ini kita akan menyelidiki bagaimana iman yang sejati bekerja dan memampukan kita hidup berkenan kepada Allah.',
        context: 'Surat Ibrani ditulis kepada orang-orang Kristen Yahudi abad pertama yang menghadapi tekanan penganiayaan, keletihan rohani, dan godaan untuk kembali ke sistem hukum Taurat.',
        text_explanation: 'Dalam ayat 1, penulis memberikan deskripsi fungsional tentang iman: dasar yang kokoh dari segala yang kita harapkan dan bukti dari segala yang tidak kita lihat.',
        main_points: [
          {
            id: 'point-1',
            title: 'Iman Memandang Janji Allah Lebih Nyata daripada Kenyataan Tampak',
            biblical_basis: ['Ibrani 11:1', '2 Korintus 5:7'],
            explanation: 'Iman bukan angan-angan positif atau optimisme psikologis. Iman alkitabiah berakar pada tabiat Allah yang setia.',
            interpretation: 'Penulis Ibrani memperlengkapi orang percaya agar memiliki sauh jiwa saat menghadapi ancaman penderitaan.',
            illustration: 'Seperti seorang anak kecil yang melompat ke pelukan ayahnya tanpa ragu karena mengenal kekuatan tangan sang ayah.',
            application: 'Pilihlah untuk menundukkan ketakutan Anda di bawah kekuasaan firman Tuhan yang tidak pernah berubah.',
            transition: 'Namun, iman yang kokoh ini tidak pernah berhenti pada perasaan damai semata; iman sejati menuntut ketaatan.',
          },
          {
            id: 'point-2',
            title: 'Iman Mendorong Ketaatan Nyata dalam Tindakan Sehari-hari',
            biblical_basis: ['Ibrani 11:4', 'Ibrani 11:6', 'Yakobus 2:17'],
            explanation: 'Setiap tokoh dalam Ibrani 11 digambarkan dengan kata kerja tindakan: Habel mempersembahkan, Nuh membangun bahtera, Abraham berangkat.',
            interpretation: 'Henokh diperkenan Allah karena ia setia berjalan bersama Allah di tengah generasi yang fasik.',
            illustration: 'Sebuah tiket kereta api tidak berguna jika hanya disimpan di dompet; tiket itu baru bermakna saat kita naik ke gerbong kereta.',
            application: 'Ambillah satu langkah ketaatan minggu ini: mengampuni orang yang melukai Anda atau memulai doa keluarga.',
            transition: 'Lantas, apa yang memberi kita kekuatan untuk terus taat?',
          },
          {
            id: 'point-3',
            title: 'Iman Percaya Bahwa Allah Adalah Pemberi Upah Kekal',
            biblical_basis: ['Ibrani 11:6', 'Roma 8:18'],
            explanation: 'Ayat 6 menyatakan bahwa Allah memberi upah kepada mereka yang sungguh-sungguh mencari Dia.',
            interpretation: 'Kepemilikan sejati yang abadi ada di surga.',
            illustration: 'Atlet maraton yang menjaga fokus pada garis akhir.',
            application: 'Tetaplah teguh melayani dan berbuat benar, sebab jerih payah Anda dalam Tuhan tidak pernah sia-sia.',
            transition: 'Maka dari itu, mari kita rangkum seluruh kebenaran firman ini.',
          },
        ],
        reflection_questions: [
          'Di area manakah dalam hidup Anda yang paling sering dikuasai kekhawatiran daripada iman?',
          'Langkah ketaatan konkret apa yang Roh Kudus bisikkan untuk Anda ambil hari ini?',
        ],
        call_to_action: 'Hari ini, serahkan satu ketakutan terbesar Anda, pegang firman-Nya, dan mulailah melangkah dalam iman!',
        conclusion: 'Iman bukanlah ketiadaan masalah, melainkan kehadiran Allah yang berdaulat dalam setiap keadaan.',
        closing_prayer: 'Bapa di surga, teguhkan iman kami agar kami berani melangkah dalam ketaatan firman-Mu setiap hari. Dalam nama Tuhan Yesus kami berdoa. Amin.',
        powerpoint: {
          template: 'Modern Church',
          colorPalette: 'navy',
          font: 'Inter',
          aspectRatio: '16:9',
          slides: [
            {
              id: 'slide-1',
              title: 'Hidup Dalam Iman yang Sejati',
              content: 'Ibrani 11:1-6\nSeri Pembinaan Rohani Jemaat',
              speaker_notes: 'Sampaikan salam hangat kepada jemaat dan perkenalkan tema khotbah dengan antusias.',
              slide_type: 'title',
            },
            {
              id: 'slide-2',
              title: 'Ayat Alkitab Utama',
              content: '"Iman adalah dasar dari segala sesuatu yang kita harapkan dan bukti dari segala sesuatu yang tidak kita lihat."\n\n— Ibrani 11:1',
              speaker_notes: 'Ajak jemaat membuka Alkitab dan membaca bersama ayat 1.',
              slide_type: 'scripture',
            },
            {
              id: 'slide-3',
              title: 'Gagasan Utama (Big Idea)',
              content: 'Iman yang sejati bukan sekadar persetujuan akal tentang keberadaan Allah, melainkan penyerahan diri seutuhnya yang dibuktikan lewat ketaatan firman.',
              speaker_notes: 'Ulangi kalimat Big Idea dua kali dengan intonasi jelas.',
              slide_type: 'big_idea',
            },
            {
              id: 'slide-4',
              title: 'Poin 1: Janji Allah Nyata',
              content: '• Hupostasis: Sertifikat kepemilikan sah janji Allah.\n• Elenchos: Keyakinan batin yang mengalahkan keraguan.\n• 2 Korintus 5:7: Berjalan karena percaya, bukan melihat.',
              speaker_notes: 'Jelaskan analogi sertifikat kepemilikan saham/tanah.',
              slide_type: 'point',
            },
            {
              id: 'slide-5',
              title: 'Poin 2: Ketaatan Nyata',
              content: '• Iman sejati selalu melahirkan tindakan konkret.\n• Para tokoh iman purba melangkah dan bergerak.\n• Yakobus 2:17: Iman tanpa perbuatan adalah mati.',
              speaker_notes: 'Sampaikan ilustrasi anak melompat ke pelukan sang ayah.',
              slide_type: 'point',
            },
            {
              id: 'slide-6',
              title: 'Poin 3: Upah Kekal Allah',
              content: '• Allah adalah Misthapodotes (Pemberi Upah).\n• Upah tertinggi adalah persekutuan dengan Allah sendiri.\n• Menghadapi pergumulan dengan pengharapan kekal.',
              speaker_notes: 'Kuatkan jemaat yang sedang bergumul dalam kerugian materi demi integritas.',
              slide_type: 'point',
            },
            {
              id: 'slide-7',
              title: 'Penerapan & Ajakan',
              content: '• Pribadi: Menundukkan kekhawatiran di bawah firman.\n• Keluarga: Menghidupkan mezbah doa.\n• Pekerjaan: Menjaga integritas tanpa kompromi.',
              speaker_notes: 'Ajak jemaat mengambil komitmen nyata hari ini.',
              slide_type: 'application',
            },
            {
              id: 'slide-8',
              title: 'Doa Penutup',
              content: '"Tuhan, mampukan kami melangkah dalam iman dan ketaatan kepada-Mu setiap hari. Amin."',
              speaker_notes: 'Pimpin doa syafaat dan penyerahan komitmen jemaat.',
              slide_type: 'prayer',
            },
          ],
        },
        status: 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  };

  saveDB(initialData);
  return initialData;
}

function saveDB(data: DBData) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db.json', err);
  }
}

// Current user helper (simple auth token or header)
function getUserIdFromRequest(req: Request): string {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  const customUser = req.headers['x-user-id'] as string;
  if (customUser) return customUser;
  return 'user-demo-1';
}

// -------------------------------------------------------------
// Authentication Endpoints
// -------------------------------------------------------------
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, username, password } = req.body;
  const db = loadDB();
  const query = (email || username || '').toLowerCase().trim();

  // Find user by email or username
  let user = db.users.find(
    (u) =>
      (u.email && u.email.toLowerCase() === query) ||
      (u.username && u.username.toLowerCase() === query)
  );

  // If superadmin login attempt
  if (query === 'tn.timbu' || query === 'tn.timbu@gereja.id') {
    if (password && password !== 'Eklesia_030918') {
      return res.status(401).json({ error: 'Kata sandi superadmin salah.' });
    }
    if (!user) {
      user = {
        id: 'user-superadmin',
        name: 'Tn. Timbu (Superadmin)',
        username: 'tn.timbu',
        email: 'tn.timbu@gereja.id',
        password: 'Eklesia_030918',
        church_name: 'Gereja Eklesia',
        role: 'superadmin',
        subscription_status: 'premium',
        subscription_expires_at: null,
        is_active: true,
        created_at: '2026-01-01T00:00:00.000Z',
      };
      db.users.unshift(user);
      saveDB(db);
    }
  }

  if (!user) {
    user = {
      id: `user-${Date.now()}`,
      name: query.includes('@') ? query.split('@')[0] : query || 'Pelayan Tuhan',
      email: query.includes('@') ? query : `${query}@gereja.id`,
      username: query.includes('@') ? query.split('@')[0] : query,
      church_name: 'Gereja Kristen',
      role: 'user',
      subscription_status: 'free',
      subscription_expires_at: '2026-12-31T23:59:59.000Z',
      is_active: true,
      created_at: new Date().toISOString(),
    };
    db.users.push(user);
    saveDB(db);
  }

  // Check if user is suspended
  if (user.is_active === false) {
    return res.status(403).json({
      error: 'Akun Anda telah dinonaktifkan oleh Superadmin. Silakan hubungi admin gereja.',
    });
  }

  res.json({
    token: user.id,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      church_name: user.church_name,
      role: user.role || 'user',
      subscription_status: user.subscription_status || 'free',
      subscription_expires_at: user.subscription_expires_at,
      is_active: user.is_active ?? true,
      created_at: user.created_at,
    },
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, church_name, username } = req.body;
  const db = loadDB();
  const existing = db.users.find(
    (u) =>
      u.email.toLowerCase() === (email || '').toLowerCase() ||
      (username && u.username && u.username.toLowerCase() === username.toLowerCase())
  );
  if (existing) {
    return res.json({
      token: existing.id,
      user: existing,
    });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name: name || 'Pelayan Tuhan',
    email: email || 'user@gereja.id',
    username: username || (email ? email.split('@')[0] : `user_${Date.now()}`),
    church_name: church_name || 'Gereja Kristen',
    role: 'user' as const,
    subscription_status: 'free' as const,
    subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true,
    created_at: new Date().toISOString(),
  };
  db.users.push(newUser);
  saveDB(db);

  res.json({
    token: newUser.id,
    user: newUser,
  });
});

// -------------------------------------------------------------
// Superadmin Management Endpoints
// -------------------------------------------------------------
app.get('/api/admin/users', (req: Request, res: Response) => {
  const db = loadDB();
  const safeUsers = db.users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    username: u.username,
    church_name: u.church_name,
    role: u.role || 'user',
    subscription_status: u.subscription_status || 'free',
    subscription_expires_at: u.subscription_expires_at,
    is_active: u.is_active ?? true,
    phone: u.phone,
    created_at: u.created_at || new Date().toISOString(),
    sermons_count: db.sermons.filter((s) => s.user_id === u.id).length,
  }));
  res.json({ users: safeUsers });
});

app.put('/api/admin/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { is_active, subscription_status, subscription_expires_at, role, name, church_name } = req.body;
  const db = loadDB();
  const user = db.users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
  }

  if (is_active !== undefined) user.is_active = is_active;
  if (subscription_status !== undefined) user.subscription_status = subscription_status;
  if (subscription_expires_at !== undefined) user.subscription_expires_at = subscription_expires_at;
  if (role !== undefined) user.role = role;
  if (name !== undefined) user.name = name;
  if (church_name !== undefined) user.church_name = church_name;

  saveDB(db);
  res.json({ success: true, user });
});

app.delete('/api/admin/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = loadDB();

  if (id === 'user-superadmin') {
    return res.status(400).json({ error: 'Akun Superadmin utama tidak dapat dihapus.' });
  }

  db.users = db.users.filter((u) => u.id !== id);
  db.sermons = db.sermons.filter((s) => s.user_id !== id);
  saveDB(db);

  res.json({ success: true, message: 'Pengguna berhasil dihapus.' });
});

app.get('/api/admin/settings', (_req: Request, res: Response) => {
  const db = loadDB();
  res.json({
    feature_locks: db.feature_locks || {
      aiSermonGeneration: false,
      powerPointExport: true,
      scholarlyCommentary: true,
      sermonAiAssistant: true,
      tolakiBible: false,
      unlimitedSermons: true,
    },
    payment_info: db.payment_info || {
      bankName: 'BCA (Bank Central Asia)',
      accountNumber: '8220193812',
      accountHolder: 'Yayasan Pelayanan Khotbah Kristen',
      whatsappContact: '6281234567890',
      monthlyPrice: 'Rp 49.000 / bulan',
      yearlyPrice: 'Rp 399.000 / tahun',
    },
  });
});

app.put('/api/admin/settings', (req: Request, res: Response) => {
  const { feature_locks, payment_info } = req.body;
  const db = loadDB();
  if (feature_locks) db.feature_locks = feature_locks;
  if (payment_info) db.payment_info = payment_info;
  saveDB(db);
  res.json({ success: true, feature_locks: db.feature_locks, payment_info: db.payment_info });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);
  const userEmail = ((req.headers['x-user-email'] as string) || '').toLowerCase().trim();
  const db = loadDB();
  const foundUser = db.users.find(
    (u) =>
      u.id === userId ||
      (userEmail && u.email && u.email.toLowerCase() === userEmail) ||
      (u.username && u.username.toLowerCase() === userId.toLowerCase())
  );

  const user = foundUser || {
    id: userId,
    name: 'Pdt. David Christian',
    email: 'david@gereja.id',
    church_name: 'Gereja Kristen Indonesia',
    role: 'user',
    subscription_status: 'free',
    is_active: true,
  };
  res.json({ user });
});

// -------------------------------------------------------------
// Sermon CRUD Endpoints
// -------------------------------------------------------------
app.get('/api/sermons', (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);
  const db = loadDB();
  const userSermons = db.sermons.filter((s) => s.user_id === userId);
  res.json({ sermons: userSermons });
});

app.get('/api/sermons/:id', (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);
  const { id } = req.params;
  const db = loadDB();
  const sermon = db.sermons.find((s) => s.id === id && s.user_id === userId);
  if (!sermon) {
    return res.status(404).json({ error: 'Khotbah tidak ditemukan atau bukan milik Anda' });
  }
  res.json({ sermon });
});

app.post('/api/sermons', (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);
  const sermonData = req.body;
  const db = loadDB();

  const newSermon = {
    ...sermonData,
    id: sermonData.id || `sermon-${Date.now()}`,
    user_id: userId,
    created_at: sermonData.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const existingIdx = db.sermons.findIndex((s) => s.id === newSermon.id);
  if (existingIdx >= 0) {
    db.sermons[existingIdx] = newSermon;
  } else {
    db.sermons.unshift(newSermon);
  }
  saveDB(db);

  res.json({ sermon: newSermon });
});

app.put('/api/sermons/:id', (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);
  const { id } = req.params;
  const updates = req.body;
  const db = loadDB();

  const idx = db.sermons.findIndex((s) => s.id === id && s.user_id === userId);
  if (idx < 0) {
    // If not found, save as new
    const newSermon = {
      ...updates,
      id,
      user_id: userId,
      updated_at: new Date().toISOString(),
    };
    db.sermons.unshift(newSermon);
    saveDB(db);
    return res.json({ sermon: newSermon });
  }

  const updated = {
    ...db.sermons[idx],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  db.sermons[idx] = updated;
  saveDB(db);

  res.json({ sermon: updated });
});

app.delete('/api/sermons/:id', (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);
  const { id } = req.params;
  const db = loadDB();
  db.sermons = db.sermons.filter((s) => !(s.id === id && s.user_id === userId));
  saveDB(db);
  res.json({ success: true });
});

// Helper to generate or resolve thematic slide artwork
async function generateOrResolveSlideImage(
  prompt: string,
  slideType: string,
  title: string,
  theme: string
): Promise<{ url: string; prompt: string }> {
  const fallback = getThematicSlideArtwork(slideType, title || theme);
  const effectivePrompt = prompt || fallback.prompt;

  // Attempt Gemini image generation if API key is present
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: effectivePrompt,
        config: {
          imageConfig: {
            aspectRatio: '16:9',
          },
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if ((part as any).inlineData?.data) {
          const mimeType = (part as any).inlineData.mimeType || 'image/png';
          return {
            url: `data:${mimeType};base64,${(part as any).inlineData.data}`,
            prompt: effectivePrompt,
          };
        }
      }
    } catch (err: any) {
      console.warn(`Gemini image fallback for "${title}":`, err.message || err);
    }
  }

  return {
    url: fallback.url,
    prompt: effectivePrompt,
  };
}

// -------------------------------------------------------------
// Helper to sanitize sermon text and remove meta-instructions / stage cues
// -------------------------------------------------------------
function sanitizeSermonText(text: string): string {
  if (!text) return '';
  return text
    .split('\n')
    .filter((line) => {
      const lower = line.trim().toLowerCase();
      // Filter out lines that are meta-instructions/stage directions
      if (
        lower.startsWith('• buka dengan salam') ||
        lower.startsWith('• sampaikan salam') ||
        lower.startsWith('• beri salam') ||
        lower.startsWith('• ajak jemaat') ||
        lower.startsWith('• tersenyum') ||
        lower.startsWith('• senyum') ||
        lower.startsWith('• heningkan suasana') ||
        lower.startsWith('• tutup dengan doa') ||
        lower.startsWith('• persilakan jemaat') ||
        lower.startsWith('• slide ini') ||
        lower.startsWith('(buka dengan salam') ||
        lower.startsWith('buka dengan salam') ||
        lower.startsWith('ajak jemaat')
      ) {
        return false;
      }
      return true;
    })
    .map((line) =>
      line
        .replace(/\((?:buka dengan salam|ajak jemaat berdiri|ajak jemaat membaca|tutup dengan doa|sampaikan salam hangat)[^\)]*\)/gi, '')
        .trim()
    )
    .filter((line) => line.length > 0)
    .join('\n');
}

// -------------------------------------------------------------
// AI Sermon Generator Endpoint
// -------------------------------------------------------------
const SYSTEM_PROMPT = `You are a distinguished senior Christian theologian, biblicist, and homiletics professor. Your role is to help preachers prepare biblically sound, theologically profound, deeply expository, and practically transformative Christian sermons.

Key Rules:
1. Prioritize authentic biblical exegesis, grammatical-historical hermeneutics, and the socio-historical context of the text.
2. In-depth analysis: Provide substantial theological insight, original Hebrew/Greek language nuances (with transliterations and lexical depth), historical-cultural background, and perspectives of revered church fathers/theologians (e.g. Augustine, Calvin, Spurgeon, Matthew Henry, John Stott).
3. Do NOT write superficial, short, or trivial points. Every sermon point must feature a deep explanation (minimum 2-3 substantive paragraphs with doctrinal depth), clear scriptural basis, vivid illustration, and concrete life applications.
4. STRICT PROHIBITION OF META-INSTRUCTIONS & STAGE DIRECTIONS:
   - NEVER insert conversational cues, presentation instructions, or stage directions into slides or speaker notes (e.g., DO NOT write: "buka dengan salam", "ajak jemaat berdiri", "baca ayat bersama", "tersenyum", "tutup dengan doa", "slide ini berisi...", etc.).
   - All slide contents and speaker_notes MUST be direct, substantive, authoritative preaching manuscripts and expository content ready to be delivered or presented!
5. SLIDE POWERPOINT STRUCTURE REQUIREMENTS:
   Every generated PowerPoint MUST strictly adhere to this exact required sequence:
   - SLIDE 1 (slide_type: 'title'): Judul/Tema khotbah, ayat pendukung tema, nama pengkhotbah, dan sasaran jemaat.
   - SLIDE 2 (slide_type: 'intro'): Pendahuluan (realitas pergumulan hidup jemaat masa kini, hook, relevansi pesan, dan arah khotbah dalam 4-6 butir padat).
   - SLIDE 3 (slide_type: 'context'): Latar Belakang & Konteks Ayat (penulis, penerima mula-mula, latar sosio-historis, dan konteks kanonika dalam 4-6 butir padat).
   - SLIDE 4 (slide_type: 'commentary'): Pandangan Para Pakar & Tafsiran Teologis (analisa eksegesis bapa gereja/teolog terkemuka terhadap ayat ini dalam 4-6 butir padat).
   - SLIDE 5 (slide_type: 'word_study'): Analisa Kata Bahasa Asli Ibrani/Yunani (analisa leksikal kata-kata kunci asli, transliterasi, makna mendalam, implikasi iman dalam 4-6 butir padat).
   - SLIDE 6 DAN SETERUSNYA (slide_type: 'point'): POKOK ISI / POIN PEMBAHASAN (Poin 1, Poin 2, Poin 3, dst., masing-masing 4-6 butir padat berisi kebenaran doktrinal, firman, ilustrasi, dan aplikasi nyata).
   - SLIDE TERAKHIR (slide_type: 'conclusion'): Penutup (Rangkuman kebenaran firman/Big Idea, komitmen ketaatan iman, pokok doa penyerahan diri, dan doa penutup dalam 4-6 butir padat).
6. Bullet points on each slide MUST be substantive (4 to 6 detailed points per slide). NEVER generate 2 or 3 short trivial lines!`;

app.post('/api/sermons/generate', async (req: Request, res: Response) => {
  try {
    const {
      theme,
      preacher_name = 'Hamba Tuhan',
      main_scripture,
      supporting_scriptures = [],
      objective = '',
      method = 'ekspositori',
      audience = 'dewasa',
      duration = '30 menit',
      language = 'id',
      style = {
        languageStyle: 'Pastoral',
        theologicalToPractical: 60,
        seriousToRelaxed: 40,
      },
    } = req.body;

    if (!theme || !main_scripture) {
      return res.status(400).json({ error: 'Tema dan Ayat Alkitab Utama wajib diisi.' });
    }

    const effectivePreacher = preacher_name || req.body.preacherName || 'Hamba Tuhan';

    const promptText = `Siapkan sebuah naskah khotbah Kristen yang SANGAT MENDALAM, ALKITABIAH, BERBOBOT TINGGI, dan SISTEMATIS beserta slide PowerPoint profesional dengan spesifikasi:
- Tema Khotbah: "${theme}"
- Nama Pengkhotbah: "${effectivePreacher}"
- Ayat Alkitab Utama: "${main_scripture}"
- Ayat Pendukung: ${JSON.stringify(supporting_scriptures)}
- Tujuan Khotbah: "${objective || 'Membimbing jemaat memahami kebenaran firman dan hidup dalam ketaatan iman yang nyata'}"
- Metode Khotbah: "${method}" (PENTING: Susun struktur dan alur argumen dengan disiplin metodologi ${method})
- Target Jemaat: "${audience}"
- Estimasi Durasi: "${duration}"
- Bahasa: ${language === 'en' ? 'English' : 'Bahasa Indonesia'}
- Gaya Bahasa: ${style.languageStyle}
- Karakter: Skala Teologis-ke-Praktis ${style.theologicalToPractical}/100, Skala Serius-ke-Santai ${style.seriousToRelaxed}/100.

PENTING - KUALITAS & KEDALAMAN MATERI KHOTBAH:
1. Naskah khotbah TIDAK BOLEH sederhana atau dangkal! Harus memiliki bobot teologis yang kokoh, wawasan konteks historis yang kaya, dan sentuhan pastoral yang mengubahkan.
2. Big Idea: 1 kalimat tesis sentral yang tajam, berwibawa, dan mudah diingat jemaat.
3. Pendahuluan: Memuat realitas pergumulan hidup jemaat (hook), relevansi kebenaran firman di zaman modern, dan arah pesan khotbah.
4. Latar Belakang & Konteks Teks: Uraikan konteks historis, penulis kitab, jemaat mula-mula penerima surat/kitab, dan latar belakang budayanya.
5. Pandangan Para Pakar / Tafsiran Teologis: Berikan sintesis eksegesis dari bapa-bapa gereja dan penafsir ternama (misalnya John Calvin, Charles Spurgeon, Matthew Henry, John Stott, dsb.) terhadap teks ayat pokok ini.
6. Analisa Kata Bahasa Asli (Ibrani/Yunani): Lakukan analisa kata mendalam terhadap kata-kata kunci asli dari teks (Ibrani untuk PL / Yunani untuk PB) beserta transliterasi alfabetis, akar kata/leksikon Strong's, dan makna teologis yang kaya.
7. Poin Pembahasan Utama: Buat 3 sampai 4 poin utama. Setiap poin WAJIB memiliki penjelasan eksposisi yang MENDALAM dan KOMPREHENSIF (minimal 2-3 paragraf berbobot per poin), dasar ayat valid, tafsiran teologis, ilustrasi analogi hidup nyata, dan langkah aplikasi konkret.
8. Aplikasi praktis dalam 6 dimensi: Pribadi, Keluarga, Tempat Kerja/Studi, Pelayanan Gereja, Relasi Antarpribadi, Spiritualitas.
9. Sediakan 3-5 pertanyaan refleksi yang menusuk hati dan ajakan komitmen konkret (call to action).
10. Doa penutup yang khidmat, agung, dan pastoral.

PENTING SEKALI - ATURAN STRUKTUR SLIDE POWERPOINT (WAJIB & KETAT):
Susun urutan slide PowerPoint dengan STRUKTUR PERSIS berikut ini:
- SLIDE 1 (slide_type: 'title'):
  * Title: ${theme}
  * Content:
    • Tema Khotbah: ${theme}
    • Ayat Alkitab: ${main_scripture} ${supporting_scriptures.length ? '(' + supporting_scriptures.join(', ') + ')' : ''}
    • Pengkhotbah: ${effectivePreacher}
    • Sasaran Jemaat: ${audience} (${duration})
  * Speaker Notes: Naskah pengantar mimbar pembuka yang khidmat mengenai urgensi tema firman ini bagi hidup jemaat.
- SLIDE 2 (slide_type: 'intro'):
  * Title: Pendahuluan: Realitas Hidup & Arah Firman
  * Content: 4 sampai 6 butir padat tentang dilema nyata jemaat, hook kehidupan masa kini, relevansi firman, dan tujuan pesan.
  * Speaker Notes: Naskah eksposisi pengantar khotbah yang mendalam.
- SLIDE 3 (slide_type: 'context'):
  * Title: Latar Belakang & Konteks Ayat
  * Content: 4 sampai 6 butir padat tentang konteks sosio-historis teks, penulis, jemaat mula-mula, dan posisi perikop dalam firman Tuhan.
  * Speaker Notes: Uraian latar belakang historis dan teologis teks.
- SLIDE 4 (slide_type: 'commentary'):
  * Title: Pandangan Para Pakar & Tafsiran Teologis
  * Content: 4 sampai 6 butir padat berisi tinjauan penafsiran bapa gereja dan teolog pakar terkemuka terhadap teks pokok ayat ini.
  * Speaker Notes: Ulasan mendalam mengenai teologi dan perspektif tafsiran para pakar.
- SLIDE 5 (slide_type: 'word_study'):
  * Title: Analisa Kata Bahasa Asli (Ibrani / Yunani)
  * Content: 4 sampai 6 butir padat menyelidiki kata-kata kunci teks dalam bahasa asli (Ibrani / Yunani), transliterasi, arti leksikal, dan implikasi teologisnya.
  * Speaker Notes: Penjelasan homiletis mengenai kekayaan makna kata asli firman Allah.
- SLIDE 6 DAN SETERUSNYA (slide_type: 'point'):
  * POKOK ISI / POIN PEMBAHASAN:
    - Slide 6: Poin I: [Judul Poin Pembahasan Pertama] (4-6 butir padat berisi prinsip doktrin firman, penjelasan teks, ilustrasi, dan tindakan konkret)
    - Slide 7: Poin II: [Judul Poin Pembahasan Kedua] (4-6 butir padat)
    - Slide 8: Poin III: [Judul Poin Pembahasan Ketiga] (4-6 butir padat)
    (Jika ada Poin IV, jadikan Slide 9)
  * Speaker Notes: Naskah khotbah mimbar komprehensif untuk setiap poin tersebut.
- SLIDE TERAKHIR (slide_type: 'conclusion'):
  * Title: Penutup & Komitmen Iman
  * Content: 4 sampai 6 butir padat (Rangkuman kebenaran Big Idea, komitmen ketaatan iman nyata jemaat, pokok doa penyerahan diri, dan doa penutup).
  * Speaker Notes: Naskah doa penutup yang khidmat, agung, dan meneguhkan jemaat.

LARANGAN KERAS TENTANG PETUNJUK PANGGUNG (TIDAK PROFESIONAL):
- DILARANG KERAS menyisipkan instruksi mimbar / petunjuk panggung / arahan tingkah laku (contoh yang DILARANG: "Buka dengan salam", "Ajak jemaat berdiri", "Baca ayat bersama", "Tersenyumlah", "Tutup dengan doa", "Slide ini berisi...", dsb.).
- Seluruh isi teks slide dan speaker_notes HARUS 100% BERISI MATERI SUBSTANTIF EKSPOSISI DAN TEOLOGIS yang siap disajikan dan berwibawa!
- Setiap slide WAJIB memiliki 4 sampai 6 butir terinci (bullet points) yang mendalam, JANGAN PERNAH membuat 2 atau 3 baris pendek saja!
- Sediakan field image_prompt untuk setiap slide dengan deskripsi karya seni visual rohani yang artistik.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Judul khotbah yang menarik dan alkitabiah' },
            theme: { type: Type.STRING },
            preacher_name: { type: Type.STRING },
            main_scripture: { type: Type.STRING },
            supporting_scriptures: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            method: { type: Type.STRING },
            audience: { type: Type.STRING },
            duration: { type: Type.STRING },
            big_idea: { type: Type.STRING, description: 'Satu kalimat pesan sentral khotbah yang tajam' },
            objective: { type: Type.STRING },
            introduction: { type: Type.STRING, description: 'Pendahuluan khotbah yang mendalam, realitas hidup, dan memikat' },
            context: { type: Type.STRING, description: 'Latar belakang sosio-historis, penulis, penerima, dan konteks kanonika' },
            expert_views: { type: Type.STRING, description: 'Pandangan para pakar/tafsiran bapa gereja dan teolog ternama' },
            original_language_analysis: { type: Type.STRING, description: 'Analisa kata dari bahasa asli Ibrani atau Yunani dengan transliterasi dan makna leksikal mendalam' },
            text_explanation: { type: Type.STRING, description: 'Penjelasan umum bagian teks Alkitab' },
            main_points: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  explanation: { type: Type.STRING, description: 'Penjelasan eksposisi mendalam minimal 2-3 paragraf berbobot' },
                  biblical_basis: { type: Type.ARRAY, items: { type: Type.STRING } },
                  interpretation: { type: Type.STRING },
                  illustration: { type: Type.STRING },
                  application: { type: Type.STRING },
                  transition: { type: Type.STRING },
                },
                required: ['title', 'explanation', 'interpretation', 'application'],
              },
            },
            illustrations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            applications: {
              type: Type.OBJECT,
              properties: {
                personal: { type: Type.STRING },
                family: { type: Type.STRING },
                workplace: { type: Type.STRING },
                ministry: { type: Type.STRING },
                relationships: { type: Type.STRING },
                spiritual: { type: Type.STRING },
              },
            },
            reflection_questions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            call_to_action: { type: Type.STRING },
            conclusion: { type: Type.STRING },
            closing_prayer: { type: Type.STRING },
            powerpoint: {
              type: Type.OBJECT,
              properties: {
                template: { type: Type.STRING },
                colorPalette: { type: Type.STRING },
                font: { type: Type.STRING },
                aspectRatio: { type: Type.STRING },
                slides: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      content: { type: Type.STRING, description: 'Isi slide dalam 4-6 butir terinci (bullet points) yang mendalam' },
                      speaker_notes: { type: Type.STRING, description: 'Naskah mimbar substantif tanpa instruksi panggung' },
                      slide_type: { type: Type.STRING },
                      image_prompt: { type: Type.STRING, description: 'Deskripsi adegan visual alkitabiah/spiritual untuk slide ini' },
                    },
                    required: ['title', 'content', 'speaker_notes'],
                  },
                },
              },
              required: ['slides'],
            },
          },
          required: [
            'title',
            'big_idea',
            'introduction',
            'context',
            'expert_views',
            'original_language_analysis',
            'main_points',
            'reflection_questions',
            'call_to_action',
            'conclusion',
            'closing_prayer',
            'powerpoint',
          ],
        },
      },
    });

    const text = response.text?.trim() || '{}';
    const parsedData = JSON.parse(text);

    // Build finalized slides with sanitized text and resolved slide images
    const rawSlides = parsedData.powerpoint?.slides || [];
    const resolvedSlides = await Promise.all(
      rawSlides.map(async (s: any, idx: number) => {
        const slideType = s.slide_type || (idx === 0 ? 'title' : 'point');
        const slideTitle = s.title || `Slide ${idx + 1}`;
        const cleanContent = sanitizeSermonText(s.content || '');
        const cleanNotes = sanitizeSermonText(s.speaker_notes || '');
        const artwork = await generateOrResolveSlideImage(
          s.image_prompt,
          slideType,
          slideTitle,
          theme
        );
        return {
          id: s.id || `slide-${Date.now()}-${idx + 1}`,
          title: slideTitle,
          content: cleanContent,
          speaker_notes: cleanNotes,
          slide_type: slideType,
          image_url: artwork.url,
          image_prompt: artwork.prompt,
        };
      })
    );

    // Build finalized sermon structure
    const sermonId = `sermon-${Date.now()}`;
    const finalizedSermon = {
      id: sermonId,
      user_id: getUserIdFromRequest(req),
      title: parsedData.title || theme,
      theme,
      preacher_name: effectivePreacher,
      main_scripture,
      supporting_scriptures: parsedData.supporting_scriptures || supporting_scriptures,
      objective: parsedData.objective || objective,
      method,
      audience,
      duration,
      language,
      style,
      big_idea: parsedData.big_idea || '',
      introduction: parsedData.introduction || '',
      context: parsedData.context || '',
      expert_views: parsedData.expert_views || '',
      original_language_analysis: parsedData.original_language_analysis || '',
      text_explanation: parsedData.text_explanation || '',
      main_points: (parsedData.main_points || []).map((pt: any, idx: number) => ({
        id: pt.id || `point-${idx + 1}`,
        title: pt.title || `Poin ${idx + 1}`,
        explanation: pt.explanation || '',
        biblical_basis: pt.biblical_basis || [main_scripture],
        interpretation: pt.interpretation || '',
        illustration: pt.illustration || '',
        application: pt.application || '',
        transition: pt.transition || '',
      })),
      illustrations: parsedData.illustrations || [],
      applications: parsedData.applications || {
        personal: 'Refleksikan firman ini dalam tindakan pribadi Anda.',
      },
      reflection_questions: parsedData.reflection_questions || [],
      call_to_action: parsedData.call_to_action || '',
      conclusion: parsedData.conclusion || '',
      closing_prayer: parsedData.closing_prayer || '',
      powerpoint: {
        template: parsedData.powerpoint?.template || 'Modern Church',
        colorPalette: parsedData.powerpoint?.colorPalette || 'navy',
        font: parsedData.powerpoint?.font || 'Inter',
        aspectRatio: parsedData.powerpoint?.aspectRatio || '16:9',
        slides: resolvedSlides.length > 0 ? resolvedSlides : [
          {
            id: `slide-1`,
            title: theme,
            content: `• Tema Khotbah: ${theme}\n• Ayat Firman: ${main_scripture}\n• Pengkhotbah: ${effectivePreacher}\n• Sasaran Jemaat: ${audience} (${duration})`,
            speaker_notes: `Pesan firman ini memanggil setiap umat Tuhan untuk merespons kebenaran Allah dengan segenap hati dan ketaatan yang nyata.`,
            slide_type: 'title',
            ...getThematicSlideArtwork('title', theme),
          }
        ],
      },
      status: 'completed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save to server database
    const db = loadDB();
    db.sermons.unshift(finalizedSermon);
    saveDB(db);

    res.json({ sermon: finalizedSermon });
  } catch (error: any) {
    console.error('Error generating sermon with Gemini:', error);
    res.status(500).json({
      error: 'Maaf, khotbah belum berhasil dibuat. Silakan coba lagi.',
      details: error.message,
    });
  }
});

// -------------------------------------------------------------
// AI Assistant Endpoint (targeted refinements for editor)
// -------------------------------------------------------------
app.post('/api/sermons/assist', async (req: Request, res: Response) => {
  try {
    const { sectionName, currentContent, instruction, sermonContext } = req.body;

    if (!instruction) {
      return res.status(400).json({ error: 'Instruksi bantuan AI wajib diisi.' });
    }

    const promptText = `Anda adalah asisten teologis dan homiletika Kristen yang bertugas membantu pengkhotbah memperbaiki bagian tertentu dari khotbahnya.

Informasi Khotbah:
- Judul: "${sermonContext?.title || 'Khotbah Kristen'}"
- Teks Alkitab: "${sermonContext?.main_scripture || ''}"
- Big Idea: "${sermonContext?.big_idea || ''}"
- Bagian yang Sedang Diedit: "${sectionName || 'Naskah Khotbah'}"

Teks Saat Ini:
"""
${currentContent || ''}
"""

Permintaan Pengkhotbah:
"${instruction}"

Aturan Penting:
1. Hanya ubah bagian yang diminta dan jangan mengubah fakta Alkitab.
2. Jangan mengarang ayat atau referensi fiktif.
3. Tetap pertahankan keselarasan dengan teks Alkitab dan Big Idea.
4. Kembalikan teks hasil perbaikan yang siap pakai di mimbar, jelas, mengalir, dan bermakna.

Berikan jawaban langsung berupa teks hasil perbaikan tanpa kata pengantar atau basa-basi.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
    });

    const refinedText = response.text?.trim() || currentContent;
    res.json({ refinedText });
  } catch (error: any) {
    console.error('Error assisting sermon section:', error);
    res.status(500).json({
      error: 'Gagal memproses bantuan AI. Silakan coba lagi.',
      details: error.message,
    });
  }
});

// -------------------------------------------------------------
// Regenerate PowerPoint Slides Endpoint
// -------------------------------------------------------------
app.post('/api/sermons/generate-powerpoint', async (req: Request, res: Response) => {
  try {
    const { sermon, template, colorPalette, font, aspectRatio } = req.body;

    if (!sermon) {
      return res.status(400).json({ error: 'Data khotbah diperlukan.' });
    }

    const preacherName = sermon.preacher_name || 'Hamba Tuhan';
    const promptText = `Ubah naskah khotbah berikut menjadi slide PowerPoint profesional yang SANGAT MENDALAM, BERBOBOT TINGGI, DAN SISTEMATIS:
Judul: ${sermon.title}
Tema: ${sermon.theme || sermon.title}
Pengkhotbah: ${preacherName}
Teks Utama: ${sermon.main_scripture}
Ayat Pendukung: ${JSON.stringify(sermon.supporting_scriptures || [])}
Big Idea: ${sermon.big_idea}
Pendahuluan: ${sermon.introduction}
Konteks Historis: ${sermon.context}
Pandangan Pakar/Tafsiran: ${sermon.expert_views || ''}
Analisa Bahasa Asli (Ibrani/Yunani): ${sermon.original_language_analysis || ''}
Poin-Poin Utama: ${JSON.stringify(sermon.main_points)}
Aplikasi Praktis: ${JSON.stringify(sermon.applications)}
Pertanyaan Refleksi: ${JSON.stringify(sermon.reflection_questions)}
Kesimpulan: ${sermon.conclusion}
Doa Penutup: ${sermon.closing_prayer}

PENTING SEKALI - ATURAN STRUKTUR SLIDE POWERPOINT (WAJIB & KETAT):
Susun urutan slide PowerPoint dengan STRUKTUR PERSIS berikut ini:
- SLIDE 1 (slide_type: 'title'):
  * Title: ${sermon.theme || sermon.title}
  * Content:
    • Tema Khotbah: ${sermon.theme || sermon.title}
    • Ayat Alkitab: ${sermon.main_scripture}
    • Pengkhotbah: ${preacherName}
    • Sasaran Jemaat: ${sermon.audience || 'Umum'} (${sermon.duration || '30 menit'})
  * Speaker Notes: Naskah pengantar mimbar pembuka yang khidmat mengenai pesan sentral firman Tuhan.
- SLIDE 2 (slide_type: 'intro'):
  * Title: Pendahuluan: Realitas Hidup & Arah Firman
  * Content: 4 sampai 6 butir padat tentang dilema nyata jemaat, hook kehidupan masa kini, relevansi firman, dan tujuan pesan.
  * Speaker Notes: Naskah eksposisi pengantar khotbah yang mendalam.
- SLIDE 3 (slide_type: 'context'):
  * Title: Latar Belakang & Konteks Ayat
  * Content: 4 sampai 6 butir padat tentang konteks sosio-historis teks, penulis, jemaat mula-mula, dan posisi perikop dalam firman Tuhan.
  * Speaker Notes: Uraian latar belakang historis dan teologis teks.
- SLIDE 4 (slide_type: 'commentary'):
  * Title: Pandangan Para Pakar & Tafsiran Teologis
  * Content: 4 sampai 6 butir padat berisi tinjauan penafsiran bapa gereja dan teolog pakar terkemuka terhadap teks pokok ayat ini.
  * Speaker Notes: Ulasan mendalam mengenai teologi dan perspektif tafsiran para pakar.
- SLIDE 5 (slide_type: 'word_study'):
  * Title: Analisa Kata Bahasa Asli (Ibrani / Yunani)
  * Content: 4 sampai 6 butir padat menyelidiki kata-kata kunci teks dalam bahasa asli (Ibrani / Yunani), transliterasi, arti leksikal, dan implikasi teologisnya.
  * Speaker Notes: Penjelasan homiletis mengenai kekayaan makna kata asli firman Allah.
- SLIDE 6 DAN SETERUSNYA (slide_type: 'point'):
  * POKOK ISI / POIN PEMBAHASAN:
    - Slide 6: Poin I: [Judul Poin Pembahasan Pertama] (4-6 butir padat berisi prinsip doktrin firman, penjelasan teks, ilustrasi, dan tindakan konkret)
    - Slide 7: Poin II: [Judul Poin Pembahasan Kedua] (4-6 butir padat)
    - Slide 8: Poin III: [Judul Poin Pembahasan Ketiga] (4-6 butir padat)
    (Jika ada Poin IV, jadikan Slide 9)
  * Speaker Notes: Naskah khotbah mimbar komprehensif untuk setiap poin tersebut.
- SLIDE TERAKHIR (slide_type: 'conclusion'):
  * Title: Penutup & Komitmen Iman
  * Content: 4 sampai 6 butir padat (Rangkuman kebenaran Big Idea, komitmen ketaatan iman nyata jemaat, pokok doa penyerahan diri, dan doa penutup).
  * Speaker Notes: Naskah doa penutup yang khidmat, agung, dan meneguhkan jemaat.

LARANGAN KERAS:
- DILARANG KERAS menyisipkan instruksi mimbar / petunjuk panggung / arahan tingkah laku (contoh yang DILARANG: "Buka dengan salam", "Ajak jemaat berdiri", "Baca ayat bersama", "Tersenyumlah", "Tutup dengan doa", "Slide ini berisi...", dsb.).
- Seluruh isi teks slide dan speaker_notes HARUS 100% BERISI MATERI SUBSTANTIF EKSPOSISI DAN TEOLOGIS yang siap disajikan!
- Setiap slide WAJIB memiliki 4 sampai 6 butir terinci (bullet points) yang mendalam, JANGAN membuat 2 atau 3 baris pendek saja!
- Sediakan field image_prompt untuk setiap slide dengan deskripsi karya seni visual rohani yang artistik.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            slides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  content: { type: Type.STRING, description: 'Isi slide dalam 4-6 butir terinci (bullet points) yang mendalam' },
                  speaker_notes: { type: Type.STRING },
                  slide_type: { type: Type.STRING },
                  image_prompt: { type: Type.STRING, description: 'Deskripsi adegan visual alkitabiah/spiritual untuk slide ini' },
                },
                required: ['title', 'content', 'speaker_notes'],
              },
            },
          },
          required: ['slides'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{"slides":[]}');
    const rawSlides = parsed.slides || [];
    const resolvedSlides = await Promise.all(
      rawSlides.map(async (s: any, idx: number) => {
        const slideType = s.slide_type || (idx === 0 ? 'title' : 'point');
        const slideTitle = s.title || `Slide ${idx + 1}`;
        const artwork = await generateOrResolveSlideImage(
          s.image_prompt,
          slideType,
          slideTitle,
          sermon.theme || sermon.title
        );
        return {
          id: `slide-${Date.now()}-${idx + 1}`,
          title: slideTitle,
          content: sanitizeSermonText(s.content || ''),
          speaker_notes: sanitizeSermonText(s.speaker_notes || ''),
          slide_type: slideType,
          image_url: artwork.url,
          image_prompt: artwork.prompt,
        };
      })
    );

    const updatedPowerPoint = {
      template: template || sermon.powerpoint?.template || 'Modern Church',
      colorPalette: colorPalette || sermon.powerpoint?.colorPalette || 'navy',
      font: font || sermon.powerpoint?.font || 'Inter',
      aspectRatio: aspectRatio || sermon.powerpoint?.aspectRatio || '16:9',
      slides: resolvedSlides,
    };

    res.json({ powerpoint: updatedPowerPoint });
  } catch (error: any) {
    console.error('Error generating powerpoint:', error);
    res.status(500).json({
      error: 'PowerPoint belum berhasil dibuat. Khotbah Anda tetap tersimpan.',
      details: error.message,
    });
  }
});

// -------------------------------------------------------------
// Vite middleware in dev or static files in production
// -------------------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Christian Sermon Builder running on port ${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer();
