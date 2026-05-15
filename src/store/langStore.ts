import { create } from 'zustand';

export type Lang = 'ka' | 'en';

interface LangState {
  lang: Lang;
  setLang: (l: Lang) => void;
}

const KEY = 'dubuni_lang';

export const useLangStore = create<LangState>((set) => ({
  lang: typeof window !== 'undefined' && (localStorage.getItem(KEY) as Lang) === 'en' ? 'en' : 'ka',
  setLang: (l) => {
    if (typeof window !== 'undefined') localStorage.setItem(KEY, l);
    set({ lang: l });
  },
}));
