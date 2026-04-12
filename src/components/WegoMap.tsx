import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
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

// Fit bounds helper
const FitBounds = ({ positions }: { positions: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (positions.length >= 2) {
      const bounds = L.latLngBounds(positions.map(p => L.latLng(p[0], p[1])));
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (positions.length === 1) {
      map.setView(positions[0], 14);
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
}

const WegoMap = ({
  markers,
  routePoints,
  routeColor = '#e62057',
  height = '100%',
  className = '',
  center,
  zoom = 13,
}: WegoMapProps) => {
  const allPositions = useMemo(() => {
    const pts: [number, number][] = markers.map(m => m.position);
    if (routePoints) pts.push(...routePoints);
    return pts;
  }, [markers, routePoints]);

  const mapCenter = center || (allPositions.length > 0 ? allPositions[0] : [-34.6037, -58.3816] as [number, number]);

  return (
    <div style={{ height, width: '100%' }} className={className}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%', borderRadius: 'inherit' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
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
