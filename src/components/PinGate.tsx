import React, { useState } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import { useLocale } from '../context/LocaleContext';
import { verifyPin } from '../utils/folderPins';
import Modal from './Modal';

interface PinGateProps {
  folderPath: string;
  folderName: string;
  pinHash: string;
  onUnlock: () => void;
  onCancel?: () => void;
  inline?: boolean;
}

const PinGate: React.FC<PinGateProps> = ({
  folderPath,
  folderName,
  pinHash,
  onUnlock,
  onCancel,
  inline = false,
}) => {
  const { t } = useLocale();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) return;

    try {
      setLoading(true);
      setError(null);
      const valid = await verifyPin(pin, pinHash);
      if (valid) {
        onUnlock();
      } else {
        setError(t('pinIncorrect'));
        setPin('');
      }
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className={`pin-gate ${inline ? 'pin-gate-inline' : ''}`}>
      <div className="pin-gate-icon">
        <Lock size={inline ? 32 : 48} />
      </div>
      <h3>{t('folderLocked')}</h3>
      <p className="pin-gate-desc">
        {t('folderLockedDesc').replace('{name}', folderName || folderPath || t('root'))}
      </p>
      <form onSubmit={handleSubmit} className="pin-gate-form">
        <input
          className="input-field pin-gate-input"
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={8}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
          placeholder={t('enterPin')}
          autoFocus
          disabled={loading}
        />
        {error && <p className="pin-gate-error">{error}</p>}
        <div className="pin-gate-actions">
          {onCancel && (
            <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
              {t('cancel')}
            </button>
          )}
          <button type="submit" className="btn-primary" disabled={loading || pin.length < 4}>
            {loading ? <Loader2 size={16} className="lucide-spin" /> : t('unlock')}
          </button>
        </div>
      </form>
    </div>
  );

  if (inline) {
    return <div className="pin-gate-container">{content}</div>;
  }

  return (
    <Modal open onClose={onCancel ?? (() => {})} className="pin-gate-dialog">
      {content}
    </Modal>
  );
};

export default PinGate;
