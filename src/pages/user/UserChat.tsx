import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, MapPin, Smile } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import driverPhoto from '@/assets/driver-roberto.png';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'driver';
  time: string;
  isLocation?: boolean;
}

const mockMessages: Message[] = [
  { id: 1, text: 'Hola, estoy en camino!', sender: 'driver', time: '10:30' },
  { id: 2, text: 'Perfecto, te espero en la puerta', sender: 'user', time: '10:31' },
  { id: 3, text: 'Llego en 3 minutos aproximadamente', sender: 'driver', time: '10:32' },
];

const UserChat = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg: Message = {
      id: Date.now(),
      text: input,
      sender: 'user',
      time: new Date().toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, msg]);
    setInput('');

    // Auto-reply mock
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: '👍 Entendu!',
        sender: 'driver',
        time: new Date().toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' }),
      }]);
    }, 1500);
  };

  const shareLocation = () => {
    const msg: Message = {
      id: Date.now(),
      text: '📍 Ubicación compartida',
      sender: 'user',
      time: new Date().toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' }),
      isLocation: true,
    };
    setMessages(prev => [...prev, msg]);
  };

  return (
    <div className="h-[100svh] bg-background relative overflow-hidden flex flex-col safe-top">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-accent/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/2 left-[-10%] w-48 h-48 bg-accent2/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 glass-strong px-6 py-4 flex items-center justify-between border-b border-white/10 shadow-lg">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center active:scale-90 transition-transform" 
            aria-label={t('common.back')}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 p-0.5 border border-white/10 overflow-hidden">
                <img src={driverPhoto} alt="Contact" className="w-full h-full object-cover rounded-xl" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-accent2 border-2 border-background shadow-[0_0_10px_rgba(154,230,180,0.5)]" />
            </div>
            <div>
              <p className="font-black text-white text-sm tracking-tight leading-none mb-1">Roberto Sánchez</p>
              <p className="text-[9px] font-black text-accent2 uppercase tracking-widest">{t('driver.dashboard.online')}</p>
            </div>
          </div>
        </div>
        
        <button 
          className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center active:scale-90 transition-transform"
          aria-label="Emojis"
          title="Emojis"
        >
           <Smile className="w-5 h-5 text-white/40" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
         <div className="text-center mb-8">
            <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] bg-white/[0.03] px-3 py-1 rounded-full border border-white/[0.05]">Aujourd'hui</span>
         </div>

        {messages.map((msg, idx) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] px-5 py-4 rounded-[24px] shadow-2xl relative overflow-hidden ${
              msg.sender === 'user'
                ? 'bg-accent text-white rounded-tr-none'
                : 'glass-strong text-white rounded-tl-none border border-white/5'
            }`}>
              {/* Subtle glossy overlay for user messages */}
              {msg.sender === 'user' && (
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
              )}
              
              {msg.isLocation ? (
                <div className="flex flex-col gap-3">
                   <div className="w-full h-32 rounded-xl bg-white/10 overflow-hidden border border-white/10 relative">
                     <div className="absolute inset-0 flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-white animate-bounce" />
                     </div>
                   </div>
                  <span className="text-xs font-black uppercase tracking-widest leading-none">{msg.text}</span>
                </div>
              ) : (
                <p className="text-[14px] leading-relaxed font-medium">{msg.text}</p>
              )}
              <div className={`flex items-center gap-1.5 mt-2 justify-end ${msg.sender === 'user' ? 'text-white/40' : 'text-white/20'}`}>
                <span className="text-[9px] font-bold uppercase tabular-nums">
                  {msg.time}
                </span>
                {msg.sender === 'user' && <div className="w-1 h-1 rounded-full bg-white/40" />}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input area */}
      <div className="relative z-10 glass-strong border-t border-white/10 px-6 py-5 pb-8">
        <div className="flex items-center gap-3">
          <button 
            onClick={shareLocation} 
            className="w-12 h-12 rounded-2xl glass border border-white/10 flex items-center justify-center text-accent active:scale-95 transition-all shadow-lg hover:bg-white/5" 
            aria-label={t('user.chat.shareLocation')}
          >
            <MapPin className="w-5 h-5" />
          </button>
          
          <div className="flex-1 relative flex items-center">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder={t('user.chat.placeholder')}
              className="w-full h-12 px-5 pr-14 rounded-2xl bg-white/5 text-white text-sm placeholder:text-white/20 outline-none border border-white/10 focus:border-accent/40 focus:bg-white/[0.08] transition-all"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="absolute right-1 w-10 h-10 rounded-xl bg-accent text-white disabled:opacity-20 transition-all active:scale-90 flex items-center justify-center shadow-lg shadow-accent/20"
              aria-label={t('user.chat.send')}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserChat;
