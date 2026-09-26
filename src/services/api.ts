import { Sermon, User, PowerPointConfig } from '../types/sermon';
import { INITIAL_SAMPLE_SERMONS } from '../data/sampleSermons';

const LOCAL_STORAGE_KEY = 'csb_sermons_v1';
const LOCAL_STORAGE_USER_KEY = 'csb_current_user_v1';

export function getStoredUser(): User {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load user from localStorage', e);
  }
  const defaultUser: User = {
    id: 'user-demo-1',
    name: 'Pdt. David Christian',
    email: 'david@gereja.id',
    church_name: 'Gereja Kristen Indonesia',
    role: 'Pendeta / Gembala Jemaat',
  };
  localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(defaultUser));
  return defaultUser;
}

export function setStoredUser(user: User): void {
  localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
}

export function clearStoredUser(): void {
  localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
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

export async function generateSermonApi(payload: any, user: User): Promise<Sermon> {
  const res = await fetch('/api/sermons/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': user.id,
      Authorization: `Bearer ${user.id}`,
    },
    body: JSON.stringify({ ...payload, user_id: user.id }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Maaf, khotbah belum berhasil dibuat. Silakan coba lagi.');
  }

  const data = await res.json();
  const createdSermon = data.sermon;

  // Persist locally
  const localList = getLocalSermons();
  localList.unshift(createdSermon);
  saveLocalSermons(localList);

  return createdSermon;
}

export async function askAiAssistantApi(
  sectionName: string,
  currentContent: string,
  instruction: string,
  sermonContext: Partial<Sermon>
): Promise<string> {
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

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Gagal memproses bantuan AI. Silakan coba lagi.');
  }

  const data = await res.json();
  return data.refinedText;
}

export async function regeneratePowerPointApi(
  sermon: Sermon,
  config: Partial<PowerPointConfig>
): Promise<PowerPointConfig> {
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

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'PowerPoint belum berhasil dibuat. Khotbah Anda tetap tersimpan.');
  }

  const data = await res.json();
  return data.powerpoint;
}
