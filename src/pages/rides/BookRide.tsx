import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BookRide = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { pickup, destination, vehicle } = (state as any) || {};

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom px-6 pt-6">
      <button onClick={() => navigate(-1)} className="tap-target text-muted-foreground">← Retour</button>
      <div className="mt-6">
        <h2 className="text-2xl font-bold text-foreground">Confirmer la réservation</h2>
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <div>Point de prise en charge: <span className="text-foreground font-medium">{pickup ?? '—'}</span></div>
          <div>Destination: <span className="text-foreground font-medium">{destination ?? '—'}</span></div>
          <div>Véhicule: <span className="text-foreground font-medium">{vehicle ?? 'Standard'}</span></div>
        </div>

        <div className="mt-6">
          <button className="px-4 py-2 bg-accent text-accent-foreground rounded-lg mr-3">Confirmer et commander</button>
          <button onClick={() => navigate('/services/rides')} className="px-4 py-2 rounded-lg border border-border">Modifier</button>
        </div>
      </div>
    </div>
  );
};

export default BookRide;
