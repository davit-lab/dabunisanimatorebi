import { create } from 'zustand';
import { ASSETS, TRANSLATIONS, TRANSLATIONS_VERSION } from '@/constants';
import type { Language } from '@/types';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';

const ROW_ID = 'main';

export interface ContentStore {
  assets: typeof ASSETS;
  translations: Record<Language, any>;
  isAdmin: boolean;
  user: any | null;
  isLoaded: boolean;
  init: () => void;
  setAuth: (user: any | null, isAdmin: boolean) => void;
  signOut: () => Promise<void>;
  updateAssets: (a: Partial<typeof ASSETS>) => void;
  updateTranslation: (lang: Language, path: string, value: any) => void;
  resetToDefault: () => void;
}

function mergeArrayById(defaults: any[], remote: any[]): any[] {
  if (!remote || remote.length === 0) return defaults;
  const merged = remote.map((remoteItem: any) => {
    const def =
      defaults.find((d: any) => d.id && d.id === remoteItem.id) ||
      (remoteItem.name && defaults.find((d: any) => d.name === remoteItem.name));
    if (def) return { ...def, ...remoteItem, id: remoteItem.id || def.id };
    return remoteItem.id ? remoteItem : null;
  }).filter(Boolean);
  return merged.length > 0 ? merged : defaults;
}

function setNested(obj: any, path: string, value: any) {
  const keys = path.split('.');
  const result = JSON.parse(JSON.stringify(obj));
  let cur = result;
  for (let i = 0; i < keys.length - 1; i++) {
    const k: any = isNaN(Number(keys[i])) ? keys[i] : Number(keys[i]);
    if (cur[k] === undefined) cur[k] = {};
    cur = cur[k];
  }
  const last: any = isNaN(Number(keys[keys.length - 1])) ? keys[keys.length - 1] : Number(keys[keys.length - 1]);
  cur[last] = value;
  return result;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let realtimeTimer: ReturnType<typeof setTimeout> | null = null;
let lastSelf = 0;
async function persist(assets: any, translations: any) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    lastSelf = Date.now();
    const { error } = await supabase
      .from('site_content')
      .upsert({ id: ROW_ID, assets, translations }, { onConflict: 'id' });
    if (error) console.error('[content] save', error);
  }, 350);
}

export const useContentStore = create<ContentStore>((set, get) => ({
  assets: { ...ASSETS },
  translations: JSON.parse(JSON.stringify(TRANSLATIONS)),
  isAdmin: false,
  user: null,
  isLoaded: false,

  init: () => {
    if (!isSupabaseConfigured) {
      console.error('[content] Supabase is not configured — using default site content only.');
      set({ isLoaded: true });
      return;
    }

    supabase
      .from('site_content')
      .select('assets, translations')
      .eq('id', ROW_ID)
      .maybeSingle()
      .then(({ data }) => {
        const defaultT = JSON.parse(JSON.stringify(TRANSLATIONS));
        const remoteT: any = data?.translations || {};
        const final: any = {};
        (['ka', 'en'] as Language[]).forEach((l) => {
          const rem = remoteT[l] || {};
          final[l] = {
            ...defaultT[l],
            ...rem,
            nav: defaultT[l].nav,
            ui: { ...(defaultT[l].ui || {}), ...(rem.ui || {}) },
            animators: mergeArrayById(defaultT[l].animators || [], rem.animators || []),
            hosts: mergeArrayById(defaultT[l].hosts || [], rem.hosts || []),
            programs: mergeArrayById(defaultT[l].programs || [], rem.programs || []),
            services: mergeArrayById(defaultT[l].services || [], rem.services || []),
          };
        });
        const storedVersion = (remoteT as any)._version || 0;
        if (storedVersion < TRANSLATIONS_VERSION) {
          (['ka', 'en'] as Language[]).forEach((l) => {
            final[l].ui.animatorsTitle = defaultT[l].ui.animatorsTitle;
            final[l].ui.animatorsDesc = defaultT[l].ui.animatorsDesc;
          });
          final._version = TRANSLATIONS_VERSION;
          const remoteA2: any = data?.assets || {};
          lastSelf = Date.now();
          supabase.from('site_content').upsert(
            { id: ROW_ID, assets: { ...ASSETS, ...remoteA2 }, translations: final },
            { onConflict: 'id' }
          ).then(({ error }) => { if (error) console.error('[migration]', error); });
        } else {
          final._version = storedVersion;
        }
        const remoteA: any = data?.assets || {};
        set({
          assets: { ...ASSETS, ...remoteA },
          translations: final,
          isLoaded: true,
        });
      });

    supabase
      .channel('site_content_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_content' }, (payload) => {
        if (Date.now() - lastSelf < 1500) return;
        const row: any = payload.new;
        if (!row) return;
        if (realtimeTimer) clearTimeout(realtimeTimer);
        realtimeTimer = setTimeout(() => {
          const defaultT = JSON.parse(JSON.stringify(TRANSLATIONS));
          const remoteT: any = row.translations || {};
          const final: any = {};
          (['ka', 'en'] as Language[]).forEach((l) => {
            const rem = remoteT[l] || {};
            final[l] = {
              ...defaultT[l],
              ...rem,
              ui: { ...(defaultT[l].ui || {}), ...(rem.ui || {}) },
              animators: mergeArrayById(defaultT[l].animators || [], rem.animators || []),
              hosts: mergeArrayById(defaultT[l].hosts || [], rem.hosts || []),
              programs: mergeArrayById(defaultT[l].programs || [], rem.programs || []),
              services: mergeArrayById(defaultT[l].services || [], rem.services || []),
            };
          });
          final._version = (remoteT as any)._version || TRANSLATIONS_VERSION;
          set({ assets: { ...ASSETS, ...(row.assets || {}) }, translations: final });
        }, 200);
      })
      .subscribe();

    // Auth bootstrap — skip redundant updates that can cause UI flicker
    const applySession = (u: { id: string } | null) => {
      const prev = get().user;
      if (prev?.id === u?.id) return;
      set({ user: u });
      if (u) {
        setTimeout(async () => {
          const { data } = await supabase.from('user_roles').select('role').eq('user_id', u.id).eq('role', 'admin').maybeSingle();
          set({ isAdmin: !!data });
        }, 0);
      } else {
        set({ isAdmin: false });
      }
    };

    supabase.auth.onAuthStateChange((_e, session) => {
      applySession(session?.user ?? null);
    });
    supabase.auth.getSession().then(async ({ data }) => {
      applySession(data.session?.user ?? null);
    });
  },

  setAuth: (user, isAdmin) => set({ user, isAdmin }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAdmin: false });
  },
  updateAssets: (newA) => {
    const s = get();
    const updated = { ...s.assets, ...newA };
    set({ assets: updated });
    persist(updated, s.translations);
  },
  updateTranslation: (lang, path, value) => {
    const s = get();
    const updated = { ...s.translations, [lang]: setNested(s.translations[lang], path, value) };
    set({ translations: updated });
    persist(s.assets, updated);
  },
  resetToDefault: () => {
    const a = { ...ASSETS };
    const t = JSON.parse(JSON.stringify(TRANSLATIONS));
    set({ assets: a, translations: t });
    persist(a, t);
  },
}));

let contentStoreInitialized = false;
if (typeof window !== 'undefined' && !contentStoreInitialized) {
  contentStoreInitialized = true;
  useContentStore.getState().init();
}
