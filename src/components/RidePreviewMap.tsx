import React, { useEffect, useState } from 'react';

type Props = {
  onSelectPosition?: (lat: number, lng: number) => void;
};

const RidePreviewMap: React.FC<Props> = ({ onSelectPosition }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    return () => {};
  }, []);

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setError('Géolocalisation non supportée par le navigateur.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(coords);
        setLoading(false);
      },
      (err) => {
        setError('Impossible de récupérer la position. Autorisez la géolocalisation.');
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  const handleChoose = () => {
    if (!position) return;
    if (onSelectPosition) onSelectPosition(position.lat, position.lng);
  };

  return (
    <div className="mt-4 px-6">
      <div className="rounded-2xl overflow-hidden border border-border bg-muted">
        {/* Map placeholder area */}
        <div className="relative h-48 bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center">
          {/* Background placeholder image if available */}
          <img
            src="/images/wego/map_placeholder.jpg"
            alt="map placeholder"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            onError={(e) => {
              // hide the image if not found
              (e.target as HTMLImageElement).style.display = 'none';
            }}
            loading="lazy"
          />

          {/* marker positioned in center when no position, or slightly adjust when position exists */}
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-red-500/90 flex items-center justify-center text-white font-bold">📍</div>
              <div className="text-xs text-white/90">{position ? 'Votre position' : 'Aperçu de la carte'}</div>
            </div>
          </div>

          {/* overlay showing coords when available */}
          {position && (
            <div className="absolute left-3 top-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
              Lat: {position.lat.toFixed(5)}, Lng: {position.lng.toFixed(5)}
            </div>
          )}
        </div>

        <div className="p-3 flex items-center justify-between gap-3">
          <div className="flex-1">
            <div className="text-sm font-medium text-foreground">Choisissez votre position</div>
            <div className="text-xs text-muted-foreground mt-1">Utilisez votre position actuelle pour commencer une course.</div>
            {error && <div className="text-xs text-red-400 mt-1">{error}</div>}
          </div>

          <div className="flex flex-col items-end gap-2">
            <button
              type="button"
              onClick={handleLocate}
              className="px-3 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-semibold"
            >
              {loading ? 'Localisation...' : 'Utiliser ma position'}
            </button>
            <button
              type="button"
              onClick={handleChoose}
              disabled={!position}
              className={`px-3 py-2 rounded-lg text-sm font-semibold ${position ? 'bg-accent/90 text-accent-foreground' : 'bg-muted text-muted-foreground'}`}
            >
              Choisir cette position
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RidePreviewMap;
