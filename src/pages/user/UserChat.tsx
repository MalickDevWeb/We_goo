import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, MapPin, Smile } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
      time: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, msg]);
    setInput('');

    // Auto-reply mock
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: '👍 Entendido!',
        sender: 'driver',
        time: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }),
      }]);
    }, 1500);
  };

  const shareLocation = () => {
    const msg: Message = {
      id: Date.now(),
      text: '📍 Ubicación compartida',
      sender: 'user',
      time: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }),
      isLocation: true,
    };
    setMessages(prev => [...prev, msg]);
  };

  return (
    <div className="h-screen bg-background flex flex-col safe-top safe-bottom">
      {/* Header */}
      <div className="glass-strong px-4 py-3 flex items-center gap-3 border-b border-border">
        <button onClick={() => navigate(-1)} className="tap-target p-2" aria-label={t('common.back')}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
          <span className="font-bold text-accent text-sm">RS</span>
        </div>
        <div>
          <p className="font-medium text-foreground text-sm">Roberto Sánchez</p>
          <p className="text-xs text-accent2">● {t('driver.dashboard.online')}</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[75%] px-4 py-3 rounded-2xl ${
              msg.sender === 'user'
                ? 'gradient-accent text-accent-foreground rounded-br-md'
                : 'glass text-foreground rounded-bl-md'
            }`}>
              {msg.isLocation ? (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{msg.text}</span>
                </div>
              ) : (
                <p className="text-sm">{msg.text}</p>
              )}
              <p className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-accent-foreground/60' : 'text-muted-foreground'}`}>
                {msg.time}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <div className="glass-strong border-t border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <button onClick={shareLocation} className="tap-target p-2 rounded-xl hover:bg-muted" aria-label={t('user.chat.shareLocation')}>
            <MapPin className="w-5 h-5 text-accent" />
          </button>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder={t('user.chat.placeholder')}
            className="flex-1 py-3 px-4 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground outline-none tap-target"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="tap-target p-3 rounded-xl gradient-accent text-accent-foreground disabled:opacity-40 transition-transform active:scale-[0.95]"
            aria-label={t('user.chat.send')}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserChat;
