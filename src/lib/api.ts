import { storage } from "@/src/utils/storage";

const ANIME_LIST_KEY = "offline_anime_list";

export type AnimeStatus = "Ongoing" | "Complete" | "Hiatus";
export type EntryType = "anime" | "donghua";

export type Anime = {
  id: string;
  user_id: string;
  type: EntryType;
  title: string;
  image?: string | null;
  season: number;
  episode: number;
  status: AnimeStatus;
  genre?: string | null;
  created_at: string;
  updated_at: string;
};

export type User = {
  id: string;
  email: string;
  name?: string | null;
};

// Helpers for Offline Mode
async function getLocalList(): Promise<Anime[]> {
  const list = await storage.getItem<Anime[]>(ANIME_LIST_KEY, []);
  return list || [];
}

async function saveLocalList(list: Anime[]) {
  await storage.setItem(ANIME_LIST_KEY, list);
}

// ----- Auth (Mocked) ----- //
export async function apiRegister(email: string, password: string, name?: string) {
  return { access_token: "offline", token_type: "Bearer" };
}

export async function apiLogin(email: string, password: string) {
  return { access_token: "offline", token_type: "Bearer" };
}

export async function apiMe() {
  return { id: "offline-user", email: "offline@mode.com", name: "Offline User" };
}

export async function saveToken(token: string) {}
export async function clearToken() {}

// ----- Anime (Offline Logic) ----- //
export type ListParams = {
  type?: EntryType;
  search?: string;
  genre?: string;
  status?: AnimeStatus;
  sort?: "updated" | "created" | "title";
};

// CSV Helpers
export async function apiExportCSV(type: EntryType): Promise<string> {
  const list = await getLocalList();
  const filtered = list.filter((item) => item.type === type);

  // Format: Judul, Season, Episode, Status
  const headers = ["Judul", "Season", "Episode", "Status"];
  const rows = filtered.map((item) =>
    [
      `"${item.title.replace(/"/g, '""')}"`,
      item.season,
      item.episode,
      item.status,
    ].join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

export async function apiImportCSV(csvContent: string, type: EntryType) {
  const lines = csvContent.split("\n").map(l => l.trim()).filter((line) => line !== "");
  if (lines.length < 2) throw new Error("File CSV kosong atau tidak valid");

  const importedAnimes: Anime[] = [];
  const now = new Date().toISOString();

  // Kita asumsikan format: Judul, Season, Episode, Status
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

    const title = values[0]?.replace(/^"|"$/g, "").replace(/""/g, '"').trim();
    const season = parseInt(values[1], 10) || 1;
    const episode = parseInt(values[2], 10) || 0;
    let status = values[3]?.replace(/^"|"$/g, "").trim() as AnimeStatus;

    // Validasi status
    const validStatuses = ["Ongoing", "Complete", "Hiatus"];
    if (!validStatuses.includes(status)) {
      status = "Ongoing";
    }

    if (title) {
      importedAnimes.push({
        id: Math.random().toString(36).substring(2, 9),
        user_id: "offline-user",
        type: type,
        title: title,
        season: season,
        episode: episode,
        status: status,
        genre: null,
        created_at: now,
        updated_at: now,
      });
    }
  }

  const allData = await getLocalList();
  const newList = [...allData, ...importedAnimes];
  await saveLocalList(newList);
  return importedAnimes.length;
}

export async function apiListAnime(params: ListParams = {}) {
  let list = await getLocalList();

  if (params.type) list = list.filter((a) => a.type === params.type);
  if (params.status) list = list.filter((a) => a.status === params.status);
  if (params.search) {
    const s = params.search.toLowerCase();
    list = list.filter((a) => a.title.toLowerCase().includes(s));
  }

  // Sorting
  if (params.sort === "title") {
    list.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    // Default to updated_at desc
    list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }

  return list;
}

export async function apiRecentAnime(limit = 10) {
  const list = await getLocalList();
  list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  return list.slice(0, limit);
}

export async function apiGenres(type?: EntryType) {
  const list = await getLocalList();
  const genres = new Set<string>();
  list.forEach((a) => {
    if (a.genre && (!type || a.type === type)) {
      a.genre.split(",").forEach((g) => genres.add(g.trim()));
    }
  });
  return Array.from(genres);
}

export async function apiGetAnime(id: string) {
  const list = await getLocalList();
  const found = list.find((a) => a.id === id);
  if (!found) throw new Error("Anime tidak ditemukan");
  return found;
}

export type AnimePayload = {
  type: EntryType;
  title: string;
  image?: string | null;
  season: number;
  episode: number;
  status: AnimeStatus;
  genre?: string | null;
};

export async function apiCreateAnime(payload: AnimePayload) {
  const list = await getLocalList();
  const now = new Date().toISOString();
  const newItem: Anime = {
    ...payload,
    id: Math.random().toString(36).substring(2, 9),
    user_id: "offline-user",
    created_at: now,
    updated_at: now,
  };
  list.push(newItem);
  await saveLocalList(list);
  return newItem;
}

export async function apiUpdateAnime(id: string, payload: Partial<AnimePayload>) {
  const list = await getLocalList();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) throw new Error("Anime tidak ditemukan");

  const now = new Date().toISOString();
  list[idx] = { ...list[idx], ...payload, updated_at: now };
  await saveLocalList(list);
  return list[idx];
}

export async function apiNext(id: string) {
  const list = await getLocalList();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) throw new Error("Anime tidak ditemukan");
  list[idx].episode += 1;
  list[idx].updated_at = new Date().toISOString();
  await saveLocalList(list);
  return list[idx];
}

export async function apiPrevious(id: string) {
  const list = await getLocalList();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) throw new Error("Anime tidak ditemukan");
  list[idx].episode = Math.max(0, list[idx].episode - 1);
  list[idx].updated_at = new Date().toISOString();
  await saveLocalList(list);
  return list[idx];
}

export async function apiFinish(id: string) {
  const list = await getLocalList();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) throw new Error("Anime tidak ditemukan");
  list[idx].status = "Complete";
  list[idx].updated_at = new Date().toISOString();
  await saveLocalList(list);
  return list[idx];
}

export async function apiDelete(id: string) {
  const list = await getLocalList();
  const newList = list.filter((a) => a.id !== id);
  await saveLocalList(newList);
  return { ok: true };
}
