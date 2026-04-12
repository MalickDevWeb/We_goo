import React from 'react';
import { useNavigate } from 'react-router-dom';

type Props = {
  serviceKey: string;
};

const QuickActionSection: React.FC<Props> = ({ serviceKey }) => {
  const navigate = useNavigate();

  if (serviceKey === 'rides') {
    return (
      <div className="px-6 pb-6" id="quick-actions">
        <div className="rounded-2xl bg-muted p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-600 to-pink-400 flex items-center justify-center text-white text-xl">🚗</div>
            <div className="flex-1">
              <div className="text-lg font-bold text-foreground">Réservez votre trajet</div>
              <div className="text-sm text-muted-foreground mt-1">Choisissez votre position, destination et le type de véhicule.</div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => navigate('/services/rides/book')}
              className="w-full py-2 rounded-lg bg-accent text-accent-foreground font-semibold"
            >
              Commander maintenant
            </button>
            <button
              type="button"
              onClick={() => navigate('/services/rides/estimate')}
              className="w-full py-2 rounded-lg bg-transparent border border-border text-foreground font-semibold"
            >
              Estimer le prix
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (serviceKey === 'packages') {
    return (
      <div className="px-6 pb-6" id="quick-actions">
        <div className="grid grid-cols-1 gap-4">
          <div className="rounded-2xl overflow-hidden bg-muted p-4 flex gap-4 items-center">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-600 to-yellow-400 rounded-lg flex items-center justify-center text-white text-2xl">📦</div>
            <div>
              <div className="text-lg font-bold text-foreground">Envoyez votre colis en toute sécurité</div>
              <div className="text-sm text-muted-foreground mt-1">Choisissez la taille, l'assurance et le suivi en temps réel.</div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/services/packages/send')}
              className="ml-auto px-4 py-2 bg-accent text-accent-foreground rounded-lg"
            >
              Envoyer
            </button>
          </div>

          <div className="rounded-2xl overflow-hidden bg-muted p-4 flex gap-4 items-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-green-400 rounded-lg flex items-center justify-center text-white text-2xl">📍</div>
            <div>
              <div className="text-lg font-bold text-foreground">Recevez et suivez vos colis</div>
              <div className="text-sm text-muted-foreground mt-1">Consultez l'état, géolocalisez et communiquez avec le transporteur.</div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/services/packages/track')}
              className="ml-auto px-4 py-2 bg-accent text-accent-foreground rounded-lg"
            >
              Suivre
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="px-6 pb-6" id="quick-actions">
      <div className="rounded-2xl bg-muted p-4">
        <div className="text-lg font-bold text-foreground">{serviceKey}</div>
        <div className="text-sm text-muted-foreground mt-1">Actions rapides non disponibles pour ce service.</div>
      </div>
    </div>
  );
};

export default QuickActionSection;
