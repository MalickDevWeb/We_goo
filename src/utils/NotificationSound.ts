/**
 * High-end notification sound utility for Wego Super-App.
 * Uses a standard modern UI sound.
 */
export const playNotificationSound = () => {
  try {
    // Premium soft "ding" sound URL
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.volume = 0.5;
    audio.play().catch(err => {
      console.warn('[NotificationSound] Audio playback failed (likely browser policy):', err);
    });
  } catch (error) {
    console.error('[NotificationSound] Error initializing audio:', error);
  }
};
