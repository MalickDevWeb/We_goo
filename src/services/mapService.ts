export interface LocationSuggestion {
  displayName: string;
  lat: number;
  lon: number;
}

export const searchLocations = async (query: string): Promise<LocationSuggestion[]> => {
  if (query.length < 3) return [];
  try {
    const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`);
    const data = await response.json();
    return data.features.map((feature: any) => {
      const p = feature.properties;
      const addr = [p.name, p.street, p.city, p.country].filter(Boolean).join(", ");
      return {
        displayName: addr || p.name,
        lat: feature.geometry.coordinates[1],
        lon: feature.geometry.coordinates[0],
      };
    });
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
};

export const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
      headers: { 'User-Agent': 'WegoApp-Client' }
    });
    const data = await response.json();
    return data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  }
};

export const getRealRoute = async (start: [number, number], end: [number, number]): Promise<[number, number][]> => {

  try {
    const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`);
    const data = await response.json();
    if (data.routes && data.routes.length > 0) {
      return data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
    }
    return [start, end];
  } catch (error) {
    console.error("Routing error:", error);
    return [start, end];
  }
};
