import React, { useState } from 'react';
import { MoreHorizontal, Lock, LockOpen, KeyRound } from 'lucide-react';
import { useGithub } from '../context/GithubContext';
import { useToast } from '../context/ToastContext';
import { useLocale } from '../context/LocaleContext';
import { formatGithubError } from '../utils/githubErrors';
import { createPinHash, saveFolderPins, unlockFolder } from '../utils/folderPins';
import Modal from './Modal';

interface FolderActionsProps {
  folderPath: string;
  folderName: string;
  hasPin: boolean;
  pins: Record<string, string>;
  pinsSha?: string;
  onChanged: () => void;
  onUnlocked?: (path: string) => void;
  variant?: 'menu' | 'button' | 'icon';
}

const FolderActions: React.FC<FolderActionsProps> = ({
  folderPath,
  folderName,
  hasPin,
  pins,
  pinsSha,
  onChanged,
  onUnlocked,
  variant = 'menu',
}) => {
  const { octokit, owner, repo } = useGithub();
  const { showToast } = useToast();
  const { t } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);

  const closeModal = () => {
    setPinModalOpen(false);
    setPin('');
    setConfirmPin('');
  };

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) {
      showToast({ type: 'error', message: t('pinTooShort') });
      return;
    }
    if (pin !== confirmPin) {
      showToast({ type: 'error', message: t('pinMismatch') });
      return;
    }

    try {
      setLoading(true);
      const hash = await createPinHash(pin);
      const updated = { ...pins, [folderPath]: hash };
      await saveFolderPins(octokit!, owner, repo, updated, pinsSha);
      unlockFolder(folderPath);
      onUnlocked?.(folderPath);
      showToast({ type: 'success', message: t('pinSetSuccess') });
      closeModal();
      onChanged();
    } catch (err: unknown) {
      showToast({ type: 'error', message: formatGithubError(err) });
    } finally {
      setLoading(false);
      setMenuOpen(false);
    }
  };

  const handleRemovePin = async () => {
    if (!window.confirm(t('removePinConfirm').replace('{name}', folderName))) return;

    try {
      setLoading(true);
      const updated = { ...pins };
      delete updated[folderPath];
      await saveFolderPins(octokit!, owner, repo, updated, pinsSha);
      showToast({ type: 'success', message: t('pinRemovedSuccess') });
      closeModal();
      onChanged();
    } catch (err: unknown) {
      showToast({ type: 'error', message: formatGithubError(err) });
    } finally {
      setLoading(false);
      setMenuOpen(false);
    }
  };

  return (
    <div className={`file-actions ${variant === 'button' ? 'file-actions-button' : ''} ${variant === 'icon' ? 'file-actions-icon' : ''}`}>
      {variant === 'button' ? (
        <button
          type="button"
          className="btn-secondary navbar-btn"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setPinModalOpen(true);
          }}
          disabled={loading}
          title={hasPin ? t('changePin') : t('setPin')}
        >
          {hasPin ? <KeyRound size={16} /> : <Lock size={16} />}
          {hasPin ? t('changePin') : t('setPin')}
        </button>
      ) : variant === 'icon' ? (
        <button
          type="button"
          className="folder-pin-trigger"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setPinModalOpen(true);
          }}
          disabled={loading}
          title={hasPin ? t('changePin') : t('setPin')}
          aria-label={hasPin ? t('changePin') : t('setPin')}
        >
          {hasPin ? <KeyRound size={16} /> : <Lock size={16} />}
        </button>
      ) : (
        <>
          <button
            type="button"
            className="file-actions-trigger"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen((open) => !open);
            }}
            disabled={loading}
            aria-label={`Actions for ${folderName}`}
          >
            <MoreHorizontal size={16} />
          </button>

          {menuOpen && (
            <div className="file-actions-menu">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPinModalOpen(true);
                  setMenuOpen(false);
                }}
              >
                {hasPin ? <KeyRound size={14} /> : <Lock size={14} />}
                {hasPin ? t('changePin') : t('setPin')}
              </button>
              {hasPin && (
                <button type="button" className="danger" onClick={(e) => { e.stopPropagation(); handleRemovePin(); }}>
                  <LockOpen size={14} />
                  {t('removePin')}
                </button>
              )}
            </div>
          )}
        </>
      )}

      <Modal open={pinModalOpen} onClose={closeModal}>
        <h3>{hasPin ? t('changePin') : t('setPin')}</h3>
        <p className="modal-desc">{t('setPinDesc').replace('{name}', folderName)}</p>
        <form onSubmit={handleSavePin}>
          <label className="pin-field-label" htmlFor={`pin-${folderPath}`}>{t('enterPin')}</label>
          <input
            id={`pin-${folderPath}`}
            className="input-field"
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={8}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            autoFocus
            placeholder="••••"
          />
          <label className="pin-field-label" htmlFor={`confirm-pin-${folderPath}`}>{t('confirmPin')}</label>
          <input
            id={`confirm-pin-${folderPath}`}
            className="input-field"
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={8}
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
            placeholder="••••"
          />
          <div className="modal-footer">
            {hasPin && (
              <button type="button" className="btn-secondary modal-footer-danger" onClick={handleRemovePin} disabled={loading}>
                {t('removePin')}
              </button>
            )}
            <button type="button" className="btn-secondary" onClick={closeModal}>
              {t('cancel')}
            </button>
            <button type="submit" className="btn-primary" disabled={loading || pin.length < 4}>
              {t('save')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FolderActions;
