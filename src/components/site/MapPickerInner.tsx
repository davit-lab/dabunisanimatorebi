import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default icon paths (bundler issue)
const icon = L.divIcon({
  className: '',
  html: `<div style="transform:translate(-50%,-100%);font-size:36px;line-height:1;filter:drop-shadow(2px 3px 0 #2D334A)">📍</div>`,
  iconSize: [36, 36],
});

interface Props {
  lat: number | null;
  lng: number | null;
  centerLat: number;
  centerLng: number;
  onChange: (lat: number, lng: number) => void;
}

function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) { onChange(e.latlng.lat, e.latlng.lng); },
  });
  return null;
}

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng], map.getZoom()); }, [lat, lng, map]);
  return null;
}

export default function MapPickerInner({ lat, lng, centerLat, centerLng, onChange }: Props) {
  const center: [number, number] = [lat ?? centerLat, lng ?? centerLng];
  return (
    <div className="aspect-[16/10] w-full rounded-2xl border-[3px] border-ink overflow-hidden shadow-sticker-md">
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onChange={onChange} />
        <Recenter lat={center[0]} lng={center[1]} />
        {lat != null && lng != null && <Marker position={[lat, lng]} icon={icon} />}
      </MapContainer>
    </div>
  );
}
