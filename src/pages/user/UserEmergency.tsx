import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
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
    <div className="min-h-screen bg-background safe-top safe-bottom">
      {/* Header */}
      <div className="flex items-center px-4 pt-4">
        <button onClick={() => navigate(-1)} className="tap-target p-2 rounded-xl hover:bg-muted" aria-label={t('common.back')}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground ml-2">{t('user.emergency.title')}</h1>
      </div>

      <div className="px-6 pt-8">
        {/* Emergency Button */}
        <motion.button
          onClick={handleEmergency}
          whileTap={{ scale: 0.95 }}
          className="w-full py-8 rounded-3xl bg-destructive text-destructive-foreground font-bold text-2xl flex flex-col items-center gap-3 tap-target shadow-[0_0_60px_rgba(239,68,68,0.3)] mb-8"
        >
          <AlertTriangle className="w-12 h-12" />
          {t('user.emergency.button')}
        </motion.button>

        {/* Trusted Contacts */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">{t('user.emergency.contacts')}</h2>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="tap-target p-2 rounded-xl bg-accent/10 text-accent"
            aria-label={t('user.emergency.addContact')}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass rounded-2xl p-4 mb-4 space-y-3">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder={t('auth.namePlaceholder')}
              className="w-full py-3 px-4 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent tap-target"
            />
            <input
              value={newPhone}
              onChange={e => setNewPhone(e.target.value)}
              placeholder={t('auth.phonePlaceholder')}
              className="w-full py-3 px-4 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent tap-target"
            />
            <button onClick={addContact} className="w-full py-3 rounded-xl gradient-accent text-accent-foreground font-medium tap-target">
              {t('user.emergency.addContact')}
            </button>
          </motion.div>
        )}

        {contacts.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <UserPlus className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">{t('user.emergency.noContacts')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {contacts.map(contact => (
              <div key={contact.id} className="glass rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-accent">{contact.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{contact.name}</p>
                    <p className="text-xs text-muted-foreground">{contact.phone}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a href={`tel:${contact.phone}`} className="tap-target p-2 rounded-lg bg-accent2/10">
                    <Phone className="w-4 h-4 text-accent2" />
                  </a>
                  <button onClick={() => removeContact(contact.id)} className="tap-target p-2 rounded-lg bg-destructive/10">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserEmergency;
