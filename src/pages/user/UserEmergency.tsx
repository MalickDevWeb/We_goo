import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, AlertTriangle, Phone, Plus, UserPlus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Contact {
  id: number;
  name: string;
  phone: string;
}

const UserEmergency = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([
    { id: 1, name: 'Mamá', phone: '+54 911 5555-1111' },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const handleEmergency = () => {
    toast.success(t('user.emergency.alertSent'));
  };

  const addContact = () => {
    if (!newName.trim() || !newPhone.trim()) return;
    setContacts(prev => [...prev, { id: Date.now(), name: newName, phone: newPhone }]);
    setNewName('');
    setNewPhone('');
    setShowAdd(false);
    toast.success(t('common.success'));
  };

  const removeContact = (id: number) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="h-[100svh] bg-background relative overflow-hidden flex flex-col safe-top">
      {/* Dynamic Animated Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/15 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent2/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 px-6 pt-6 pb-4 shrink-0 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 rounded-xl glass-strong border border-white/10 flex items-center justify-center p-0 active:scale-90 transition-transform shadow-lg"
          aria-label={t('common.back')}
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-xl font-black text-white tracking-tight">{t('user.emergency.title')}</h1>
      </div>

      <div className="relative z-10 flex-1 px-6 pb-24 overflow-y-auto no-scrollbar flex flex-col pt-2">
        {/* Emergency Button */}
        <motion.button
          onClick={handleEmergency}
          whileTap={{ scale: 0.95 }}
          className="w-full shrink-0 h-40 rounded-[32px] bg-red-500 text-white font-black text-2xl flex flex-col items-center justify-center gap-3 shadow-[0_0_80px_rgba(239,68,68,0.3)] mb-8 border border-white/20 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          <AlertTriangle className="w-14 h-14 drop-shadow-md group-hover:scale-110 transition-transform" />
          <span className="tracking-widest uppercase text-sm drop-shadow-md">{t('user.emergency.button')}</span>
        </motion.button>

        {/* Trusted Contacts */}
        <div className="flex items-center justify-between mb-4 mt-2">
          <h2 className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] px-2">{t('user.emergency.contacts')}</h2>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="w-8 h-8 rounded-full glass border border-white/10 text-white flex items-center justify-center active:scale-90 transition-transform"
            aria-label={t('user.emergency.addContact')}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <AnimatePresence>
          {showAdd && (
            <motion.div 
              initial={{ opacity: 0, height: 0, scale: 0.95 }} 
              animate={{ opacity: 1, height: 'auto', scale: 1 }} 
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              className="glass-strong rounded-[28px] border border-white/10 p-5 mb-6 space-y-4 shadow-xl overflow-hidden"
            >
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder={t('auth.namePlaceholder')}
                className="w-full py-4 px-5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-all font-medium"
              />
              <input
                value={newPhone}
                onChange={e => setNewPhone(e.target.value)}
                placeholder={t('auth.phonePlaceholder')}
                className="w-full py-4 px-5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-all font-medium"
              />
              <button onClick={addContact} className="w-full py-4 rounded-2xl gradient-accent text-white font-black text-sm shadow-lg shadow-accent/20 active:scale-95 transition-transform uppercase tracking-widest">
                {t('common.add', 'Ajouter')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1">
          {contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 opacity-40">
              <div className="w-20 h-20 rounded-full glass border border-white/10 flex items-center justify-center mb-4">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <p className="text-xs font-black text-white uppercase tracking-widest text-center">{t('user.emergency.noContacts')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.map(contact => (
                <div key={contact.id} className="glass rounded-[24px] border border-white/5 p-4 flex items-center justify-between group hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                      <span className="text-sm font-black text-accent uppercase">{contact.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm mb-0.5">{contact.name}</p>
                      <p className="text-[11px] font-medium text-white/40">{contact.phone}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a href={`tel:${contact.phone}`} aria-label={t('user.tracking.call', 'Appeler')} className="w-10 h-10 rounded-xl bg-accent2/10 border border-accent2/20 flex items-center justify-center active:scale-90 transition-transform text-accent2 hover:bg-accent2 hover:text-white">
                      <Phone className="w-4 h-4" />
                    </a>
                    <button onClick={() => removeContact(contact.id)} aria-label={t('common.delete', 'Supprimer')} className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center active:scale-90 transition-transform text-red-500 hover:bg-red-500 hover:text-white">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserEmergency;
