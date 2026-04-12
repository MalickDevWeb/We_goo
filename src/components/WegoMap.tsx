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

// Internal component to handle map events
const MapEvents = ({ onClick }: { onClick?: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click: (e) => {
      if (onClick) onClick(e.latlng.lat, e.latlng.lng);
    },
  });
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
  icon: L.Icon;
  key: string;
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
          url={variant === 'dark' 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          }
        />
        <MapEvents onClick={onMapClick} />
        {allPositions.length > 0 && <FitBounds positions={allPositions} />}
        {markers.map(m => (
          <Marker key={m.key} position={m.position} icon={m.icon} />
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
