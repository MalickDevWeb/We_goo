import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerCarImg from '@/assets/marker-car.png';
import markerPickupImg from '@/assets/marker-pickup.png';
import markerDestImg from '@/assets/marker-destination.png';
import markerPackageImg from '@/assets/marker-package.png';

// Custom icons
const createIcon = (iconUrl: string, size: [number, number] = [40, 40]) =>
  new L.Icon({ iconUrl, iconSize: size, iconAnchor: [size[0] / 2, size[1]], popupAnchor: [0, -size[1]] });

export const carIcon = createIcon(markerCarImg, [50, 50]);
export const pickupIcon = createIcon(markerPickupImg, [36, 36]);
export const destinationIcon = createIcon(markerDestImg, [36, 36]);
export const packageIcon = createIcon(markerPackageImg, [44, 44]);

export const createPhotoIcon = (photoUrl: string) => {
  return L.divIcon({
    html: `<div style="width: 48px; height: 48px; border-radius: 50%; overflow: hidden; border: 3px solid #e62057; box-shadow: 0 10px 20px rgba(230,32,87,0.4), 0 0 0 3px rgba(230,32,87,0.2); background: #000; display: flex; align-items: center; justify-content: center; position: relative;">
             <img src="${photoUrl}" style="width: 100%; height: 100%; object-fit: cover;" />
             <div style="position: absolute; inset: 0; box-shadow: inset 0 0 10px rgba(0,0,0,0.5); pointer-events: none; border-radius: 50%;"></div>
           </div>`,
    className: 'custom-photo-marker transition-all duration-300', 
    iconSize: [48, 48],
    iconAnchor: [24, 24]
  });
};

// Internal component to handle map events
const MapEvents = ({ onClick }: { onClick?: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click: (e) => {
      if (onClick) onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Auto-center helper
const AutoCenter = ({ center, zoom }: { center?: [number, number], zoom?: number }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom(), { animate: true });
    }
  }, [center, zoom, map]);
  return null;
};

// Fit bounds helper
const FitBounds = ({ positions }: { positions: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (positions.length >= 2) {
      const bounds = L.latLngBounds(positions.map(p => L.latLng(p[0], p[1])));
      map.fitBounds(bounds, { padding: [50, 50], animate: true });
    } else if (positions.length === 1) {
      map.setView(positions[0], 15, { animate: true });
    }
  }, [map, positions]);
  return null;
};

export interface MapMarker {
  position: [number, number];
  icon: L.Icon | L.DivIcon;
  key: string;
  rotation?: number;
  onClick?: () => void;
}

interface WegoMapProps {
  markers: MapMarker[];
  routePoints?: [number, number][];
  routeColor?: string;
  height?: string;
  className?: string;
  center?: [number, number];
  zoom?: number;
  variant?: 'light' | 'dark';
  onMapClick?: (lat: number, lng: number) => void;
}

const WegoMap = ({
  markers,
  routePoints,
  routeColor = '#e62057',
  height = '100%',
  className = '',
  center,
  zoom = 13,
  variant = 'dark',
  onMapClick,
}: WegoMapProps) => {
  const allPositions = useMemo(() => {
    const pts: [number, number][] = markers.map(m => m.position);
    if (routePoints) pts.push(...routePoints);
    return pts;
  }, [markers, routePoints]);

  const mapCenter = center || (allPositions.length > 0 ? allPositions[0] : [20, 0] as [number, number]);
  const initialZoom = center ? zoom : (allPositions.length > 0 ? 13 : 2);

  return (
    <div style={{ height, width: '100%' }} className={className}>
      <MapContainer
        center={mapCenter}
        zoom={initialZoom}
        style={{ height: '100%', width: '100%', borderRadius: 'inherit' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <MapEvents onClick={onMapClick} />
        {!center && allPositions.length > 0 && <FitBounds positions={allPositions} />}
        {center && <AutoCenter center={center} zoom={zoom} />}
        {markers.map(m => (
          <Marker 
            key={m.key} 
            position={m.position} 
            icon={m.icon}
            eventHandlers={{
              click: () => {
                if (m.onClick) m.onClick();
              },
              add: (e) => {
                if (m.rotation !== undefined) {
                  const el = e.target.getElement();
                  if (el) el.style.transform += ` rotate(${m.rotation}deg)`;
                }
              }
            }}
          />
        ))}
        {routePoints && routePoints.length >= 2 && (
          <Polyline
            positions={routePoints}
            pathOptions={{ color: routeColor, weight: 4, opacity: 0.8, dashArray: '10, 8' }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default WegoMap;
