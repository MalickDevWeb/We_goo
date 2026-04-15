import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, MapPin, Smile, Mic, Cpu, Bot, Car, UtensilsCrossed, Package, CheckCircle2, Waves } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { socketProvider } from '@/services/socket';
import { toast } from 'sonner';

interface AIWidget {
  type: 'ride' | 'food' | 'package';
  data: any;
  status: 'pending' | 'executed';
}

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  time: string;
  widget?: AIWidget;
}

const INITIAL_MESSAGES: Message[] = [
  { 
    id: 1, 
    text: 'Bonjour ! Je suis l\'Assistant IA Wego 🧠. Je peux commander pour vous : un Taxi, un Repas de votre restaurant préféré, ou même gérer vos Coursiers. Que puis-je faire pour vous aujourd\'hui ?', 
    sender: 'ai', 
    time: new Date().toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' }) 
  }
];

const UserChat = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const processAiCommand = (userInput: string) => {
     setIsTyping(true);
     const lower = userInput.toLowerCase();
     
     setTimeout(() => {
        setIsTyping(false);
        const newMessage: Message = {
           id: Date.now(),
           text: '',
           sender: 'ai',
           time: new Date().toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })
        };

        if (lower.includes('pizza') || lower.includes('manger') || lower.includes('restaurant')) {
           newMessage.text = "J'ai analysé votre demande. Voici le meilleur forfait pour une Pizza Royale avec livraison immédiate :";
           newMessage.widget = {
              type: 'food',
              status: 'pending',
              data: { title: "Pizza Royale Extra", price: 6500, restaurant: "Luigi's Pizzeria", eta: "25 min" }
           };
        } 
        else if (lower.includes('taxi') || lower.includes('voiture') || lower.includes('course')) {
           newMessage.text = "Je peux vous réserver un Wego Premium pour votre prochain déplacement. Confirmez-vous la course vers votre destination habituelle (Aéroport) ?";
           newMessage.widget = {
              type: 'ride',
              status: 'pending',
              data: { type: "Wego Premium", price: 3500, eta: "3 min" }
           };
        } 
        else if (lower.includes('colis') || lower.includes('livraison') || lower.includes('envoyer')) {
           newMessage.text = "Je prépare un coursier sécurisé pour votre colis. Voici les détails de l'expédition :";
           newMessage.widget = {
              type: 'package',
              status: 'pending',
              data: { type: "Coursier Express", weight: "< 5kg", price: 2000 }
           };
        } 
        else {
           newMessage.text = "Je suis désolé, je n'ai pas tout à fait compris. Je peux vous commander un Taxi, un Repas ou un Livreur ! Dites par exemple 'Je veux une pizza'.";
        }

        setMessages(prev => [...prev, newMessage]);
     }, 2000);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const msg: Message = {
      id: Date.now(),
      text: input,
      sender: 'user',
      time: new Date().toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, msg]);
    setInput('');
    processAiCommand(input);
  };

  const handleVoiceCommand = () => {
     setIsRecording(true);
     // Simulate 3 seconds of talking
     setTimeout(() => {
        setIsRecording(false);
        const randCmds = ["Commande moi une pizza s'il te plait", "Je veux un taxi", "J'ai besoin qu'un coursier vienne chercher un colis"];
        const picked = randCmds[Math.floor(Math.random() * randCmds.length)];
        
        const msg: Message = {
          id: Date.now(),
          text: `🎤 [Audio Transcrit] : "${picked}"`,
          sender: 'user',
          time: new Date().toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, msg]);
        processAiCommand(picked);
     }, 3000);
  };

  const executeWidgetAction = (msgId: number, widget: AIWidget) => {
     // Mark as executed
     setMessages(prev => prev.map(m => m.id === msgId && m.widget ? { ...m, widget: { ...m.widget, status: 'executed' } } : m));
     toast.success("Action exécutée avec succès par l'IA !");
     
     // WebSockets trigger to the targeted apps!
     if (widget.type === 'food') {
        socketProvider.emit('new_restaurant_order', {
           id: `AI-${Date.now().toString().slice(-4)}`,
           customerName: "Utilisateur Premium",
           items: [widget.data.title],
           total: widget.data.price
        });
     }
  };

  return (
    <div className="h-[100svh] bg-[#020617] relative overflow-hidden flex flex-col safe-top">
      {/* AI Futuristic Orbs Background */}
      <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[60%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none transition-all duration-3000" />
      <div className={`absolute bottom-0 left-[-20%] w-[60%] h-[50%] rounded-full blur-[100px] pointer-events-none transition-colors duration-1000 ${isRecording ? 'bg-red-500/20' : isTyping ? 'bg-accent/20' : 'bg-transparent'}`} />

      {/* Header */}
      <div className="relative z-10 glass-strong px-6 py-4 flex items-center justify-between border-b border-white/5 shadow-2xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            aria-label="Retour"
            className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center active:scale-90 transition-transform bg-white/5" 
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-3">
             <div className="relative p-1">
                <div className={`absolute inset-0 rounded-full border-2 border-dashed transition-all duration-1000 animate-spin-slow ${isTyping ? 'border-accent' : 'border-white/20'}`} />
                <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center border-2 border-[#020617] overflow-hidden relative z-10 shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                   <Bot className="w-6 h-6 text-blue-400" />
                </div>
             </div>
             <div>
                <p className="font-black text-white text-sm tracking-tight leading-none mb-1 flex items-center gap-2">
                   Wego AI Assistant
                   <Cpu className="w-3.5 h-3.5 text-accent" />
                </p>
                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Connecté & Prêt</p>
             </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
         <div className="text-center mb-4">
            <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] bg-white/[0.03] px-3 py-1 rounded-full border border-white/[0.05]">Aujourd'hui</span>
         </div>

        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.1 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-[24px] shadow-2xl relative ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-accent text-white rounded-tr-none px-5 py-4'
                  : 'bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-tl-none p-4'
              }`}>
                {msg.text && (
                  <p className="text-[14px] leading-relaxed font-medium mb-1 drop-shadow-md">
                     {msg.text}
                  </p>
                )}

                {/* --- Interactive Widget Rendering --- */}
                {msg.widget && (
                   <div className="mt-4 bg-[#020617]/60 rounded-2xl p-4 border border-white/10 relative overflow-hidden">
                      <div className="flex items-center gap-3 mb-3">
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            msg.widget.type === 'food' ? 'bg-orange-500/20 text-orange-500' : 
                            msg.widget.type === 'ride' ? 'bg-blue-500/20 text-blue-500' : 'bg-emerald-500/20 text-emerald-500'
                         }`}>
                            {msg.widget.type === 'food' ? <UtensilsCrossed className="w-5 h-5" /> : 
                             msg.widget.type === 'ride' ? <Car className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                         </div>
                         <div>
                            <h4 className="text-sm font-black text-white">{msg.widget.data.title || msg.widget.data.type}</h4>
                            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">{msg.widget.data.restaurant || 'Wego Logistique'}</p>
                         </div>
                      </div>

                      <div className="flex items-center justify-between mb-4 px-2">
                         <span className="text-xl font-black text-white">{msg.widget.data.price} <span className="text-[10px] text-white/40 uppercase">CFA</span></span>
                         <div className="bg-white/5 px-2 py-1 rounded-lg">
                            <span className="text-[10px] font-black text-emerald-400">ETA: {msg.widget.data.eta || '10 min'}</span>
                         </div>
                      </div>

                      {msg.widget.status === 'pending' ? (
                         <button 
                           onClick={() => executeWidgetAction(msg.id, msg.widget!)}
                           className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-transform active:scale-95 shadow-xl ${
                             msg.widget.type === 'food' ? 'bg-orange-500 text-white shadow-orange-500/20' : 
                             msg.widget.type === 'ride' ? 'bg-blue-500 text-white shadow-blue-500/20' : 'bg-emerald-500 text-white shadow-emerald-500/20'
                           }`}
                         >
                            Confirmer & Exécuter
                         </button>
                      ) : (
                         <div className="w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 bg-white/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-4 h-4" />
                            Action Réussie
                         </div>
                      )}
                   </div>
                )}

                <div className={`flex items-center gap-1.5 mt-2 justify-end ${msg.sender === 'user' ? 'text-white/40' : 'text-white/20'}`}>
                  <span className="text-[9px] font-bold uppercase tabular-nums">
                    {msg.time}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
               <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] rounded-tl-none p-5 flex gap-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0ms]" />
                  <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:150ms]" />
                  <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:300ms]" />
               </div>
            </motion.div>
        )}
      </div>

      {/* Voice / Text Input Area */}
      <div className="relative z-10 p-6 pb-8 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent">
         {/* Voice Wave Visualizer */}
         <AnimatePresence>
            {isRecording && (
               <motion.div 
                 initial={{ opacity: 0, height: 0 }}
                 animate={{ opacity: 1, height: 60 }}
                 exit={{ opacity: 0, height: 0 }}
                 className="flex items-center justify-center gap-1 mb-4"
               >
                  {[...Array(12)].map((_, i) => (
                     <motion.div 
                       key={i}
                       animate={{ height: [10, 40, 10] }}
                       transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
                       className="w-1.5 bg-red-500 rounded-full"
                     />
                  ))}
                  <span className="ml-4 font-black text-red-500 text-xs uppercase tracking-widest animate-pulse">Écoute en cours...</span>
               </motion.div>
            )}
         </AnimatePresence>

        <div className="flex items-center gap-3">
          <div className="flex-1 relative flex items-center">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Écrivez ou dictez votre demande..."
              disabled={isRecording}
              className="w-full h-14 px-5 pr-14 rounded-2xl bg-white/5 text-white text-sm placeholder:text-white/30 outline-none border border-white/10 focus:border-accent/40 focus:bg-white/[0.08] transition-all disabled:opacity-50"
            />
            {input.trim() ? (
               <button
                 onClick={handleSend}
                 className="absolute right-2 w-10 h-10 rounded-xl bg-accent text-white transition-all active:scale-90 flex items-center justify-center shadow-lg shadow-accent/20"
                 aria-label="Envoyer"
               >
                 <Send className="w-4 h-4" />
               </button>
            ) : (
               <button
                 onClick={handleVoiceCommand}
                 className={`absolute right-2 w-10 h-10 rounded-xl text-white transition-all active:scale-90 flex items-center justify-center shadow-lg ${isRecording ? 'bg-red-500 shadow-red-500/50 animate-pulse' : 'bg-transparent border border-white/10'}`}
                 aria-label="Microphone"
               >
                 <Mic className={`w-5 h-5 ${isRecording ? 'text-white' : 'text-white/40'}`} />
               </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserChat;
