import { lazy, Suspense, useEffect, useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

// Leaflet relies on `window`, so load only on client.
const MapInner = lazy(() => import('./MapPickerInner'));

interface Props {
  lat: number | null;
  lng: number | null;
  centerLat: number;
  centerLng: number;
  onChange: (lat: number, lng: number) => void;
}

export function MapPicker(props: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="aspect-[16/10] w-full rounded-2xl border-[3px] border-ink bg-cream flex items-center justify-center">
        <Loader2 className="animate-spin text-ink/40" />
      </div>
    );
  }
  return (
    <Suspense fallback={
      <div className="aspect-[16/10] w-full rounded-2xl border-[3px] border-ink bg-cream flex items-center justify-center">
        <Loader2 className="animate-spin text-ink/40" />
      </div>
    }>
      <div className="relative">
        <MapInner {...props} />
        <div className="pointer-events-none absolute top-3 left-3 bg-white border-[2px] border-ink rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-wider shadow-sticker flex items-center gap-1">
          <MapPin size={12} /> {props.lat ? `${props.lat.toFixed(4)}, ${props.lng?.toFixed(4)}` : 'დააწკაპუნეთ რუკაზე'}
        </div>
      </div>
    </Suspense>
  );
}
