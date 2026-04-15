import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { ShieldAlert, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface CameraScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: any) => void;
  fps?: number;
  qrbox?: number;
}

const CameraScanner = ({ onScanSuccess, onScanFailure, fps = 10, qrbox = 250 }: CameraScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const regionId = 'qr-reader-zego';
  const [hasPermissionError, setHasPermissionError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // We delay the initialization slightly to ensure the DOM element is fully mounted
    const timer = setTimeout(() => {
      scannerRef.current = new Html5Qrcode(regionId);
      
      const onDecodeSuccess = (text: string) => {
        if (scannerRef.current) {
          scannerRef.current.pause(true);
        }
        onScanSuccess(text);
      };

      const onDecodeError = (err: any) => {
        if (onScanFailure) onScanFailure(err);
      };

      scannerRef.current.start(
        { facingMode: 'environment' },
        { fps, qrbox: { width: qrbox, height: qrbox } },
        onDecodeSuccess,
        onDecodeError
      ).then(() => {
        setIsLoading(false);
      }).catch((e: any) => {
        setIsLoading(false);
        if (e?.message?.toLowerCase().includes('permission') || e?.name === 'NotAllowedError') {
           setHasPermissionError(true);
        } else {
           toast.error('Erreur lors du démarrage de la caméra');
           console.error('Camera Error:', e);
        }
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.isScanning && scannerRef.current.stop().catch(console.error);
        scannerRef.current.clear();
      }
    };
  }, [fps, qrbox, onScanSuccess, onScanFailure]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl glass border border-white/10 p-0 bg-black min-h-[300px] flex items-center justify-center">
       {hasPermissionError ? (
          <div className="flex flex-col items-center justify-center p-8 text-center h-[300px]">
             <ShieldAlert className="w-10 h-10 text-red-500 mb-4" />
             <p className="text-sm font-bold text-white mb-2">Accès Caméra Refusé</p>
             <p className="text-[10px] text-white/50 mb-6">Veuillez autoriser l'accès à votre appareil photo dans les paramètres de votre navigateur pour scanner le QR Code.</p>
             <button 
               onClick={() => window.location.reload()}
               className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-white/10 text-white"
             >
                <RefreshCw className="w-4 h-4" />
                Actualiser la page
             </button>
          </div>
       ) : (
          <>
            <AnimatePresence>
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-[url('https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=500&q=80')] bg-cover bg-center"
                >
                   <div className="absolute inset-0 bg-black/80 backdrop-blur-lg" />
                   <div className="relative z-10 flex flex-col items-center">
                     <div className="mb-8 scale-animation flex items-center justify-center">
                       <img src="/images/wego/logo-clean.png" alt="Wego Logo" className="h-10 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
                     </div>
                     <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
                     <p className="text-xs font-bold text-white/60 tracking-[0.2em] uppercase">Démarrage Caméra...</p>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* The actual video container */}
            <div id={regionId} className="w-full h-full absolute inset-0 z-0 [&_video]:w-full [&_video]:h-full [&_video]:object-cover" />

            {/* Premium UI Overlay */}
            <AnimatePresence>
              {!isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                  className="absolute inset-0 z-20 overflow-hidden pointer-events-none"
                >
                   {/* Dark overlay using massive box-shadow on the center hole */}
                   <div className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] rounded-[32px] box-content" style={{ boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)' }}>
                      
                      {/* Wego Branding Top */}
                      <div className="absolute -top-16 left-0 right-0 flex justify-center items-center">
                         <img src="/images/wego/logo-clean.png" alt="Wego Logo" className="h-8 w-auto object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
                      </div>

                      {/* Scanner Corners (Reticle) */}
                      <div className="absolute -inset-1 border-2 border-transparent rounded-[34px]">
                         <div className="absolute top-0 left-0 w-12 h-12 border-t-[4px] border-l-[4px] border-accent rounded-tl-[34px]" />
                         <div className="absolute top-0 right-0 w-12 h-12 border-t-[4px] border-r-[4px] border-accent rounded-tr-[34px]" />
                         <div className="absolute bottom-0 left-0 w-12 h-12 border-b-[4px] border-l-[4px] border-accent rounded-bl-[34px]" />
                         <div className="absolute bottom-0 right-0 w-12 h-12 border-b-[4px] border-r-[4px] border-accent rounded-br-[34px]" />
                      </div>

                      {/* Animated Pink Laser Line */}
                      <motion.div 
                        animate={{ y: [0, 240, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                        className="absolute left-4 right-4 top-[10px] h-[3px] bg-accent shadow-[0_0_20px_4px_rgba(230,32,87,0.7)] rounded-full" 
                      />
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
       )}
    </div>
  );
};

export default CameraScanner;
