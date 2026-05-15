import { useEffect } from 'react';
import { useContentStore } from '@/store/contentStore';

/** Applies admin-controlled theme colors to :root CSS variables. */
export function ThemeApplier() {
  const { assets } = useContentStore();
  useEffect(() => {
    const c: any = (assets as any).colors || {};
    const root = document.documentElement;
    if (c.primary) root.style.setProperty('--primary', c.primary);
    if (c.accent) root.style.setProperty('--accent', c.accent);
    if (c.secondary) root.style.setProperty('--secondary', c.secondary);
    if (c.background) root.style.setProperty('--background', c.background);
  }, [assets]);
  return null;
}
