import { useState, useEffect } from 'react';
import { MapPin, Loader2, X, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchLocations, reverseGeocode, type LocationSuggestion } from '@/services/mapService';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface LocationSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (displayName: string, coords?: [number, number]) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  showCurrentLocation?: boolean;
}

const LocationSearchInput = ({ 
  value, 
  onChange, 
  onSelect, 
  placeholder, 
  className = '', 
  label,
  showCurrentLocation = false
}: LocationSearchInputProps) => {
  const { t } = useTranslation();
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  useEffect(() => {
    if (value.length < 3) {
      setSuggestions([]);
      return;
    }
    
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchLocations(value);
        setSuggestions(results);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [value]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        onChange(t('common.loading', { defaultValue: 'Chargement...' }));
        try {
          const address = await reverseGeocode(coords[0], coords[1]);
          onChange(address);
          onSelect(address, coords);
        } catch (err) {
          onChange("Ma position");
          onSelect("Ma position", coords);
        }
        setShowSuggestions(false);
      },
      () => toast.error("Error al obtener ubicación")
    );
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex justify-between items-center mb-1.5 px-1">
        {label && <label className="text-[9px] font-black uppercase tracking-widest text-accent">{label}</label>}
        {showCurrentLocation && (
          <button 
            type="button"
            onClick={handleUseCurrentLocation} 
            className="flex items-center gap-1 text-[9px] font-bold text-accent px-2 py-0.5 rounded bg-accent/10 hover:bg-accent/20 transition-colors"
          >
            <Navigation className="w-2.5 h-2.5" /> {t('user.booking.useMyLocation', { defaultValue: 'Position actuelle' })}
          </button>
        )}
      </div>
      
      <div className="relative group">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-3.5 text-foreground text-sm font-bold placeholder:text-muted-foreground/30 outline-none focus:ring-2 focus:ring-accent/50 focus:bg-white/10 transition-all shadow-inner"
        />
        {value && (
          <button 
            type="button"
            onClick={() => { onChange(''); setSuggestions([]); onSelect(''); }} 
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground/40 hover:text-foreground transition-colors"
            aria-label="Effacer"
            title="Effacer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showSuggestions && (suggestions.length > 0 || loading) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 right-0 mt-3 bg-card/95 backdrop-blur-2xl border border-white/10 rounded-[24px] shadow-2xl overflow-y-auto max-h-[280px] z-[2005] ring-1 ring-black/50"
          >
            {loading ? (
              <div className="p-8 flex flex-col items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recherche en cours...</span>
              </div>
            ) : (
              <div className="py-2">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onChange(s.displayName);
                      onSelect(s.displayName, [s.lat, s.lon]);
                      setShowSuggestions(false);
                    }}
                    className="w-full p-4 flex items-start gap-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 text-left active:bg-white/10 group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-accent/10 transition-colors">
                      <MapPin className="w-4 h-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[12px] font-bold text-foreground block truncate">{s.displayName}</span>
                      <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">Sénégal</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LocationSearchInput;
