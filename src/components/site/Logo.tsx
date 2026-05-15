import { useContentStore } from '@/store/contentStore';

export function Logo({ className = 'w-12 h-12' }: { className?: string }) {
  const assets = useContentStore((s) => s.assets);
  return (
    <div
      className={`${className} relative inline-flex items-center justify-center bg-coral border-[3px] border-ink rounded-2xl shadow-sticker -rotate-3`}
    >
      <img src={assets.logo} alt="Dubuni" className="w-[78%] h-[78%] object-contain" />
    </div>
  );
}
