import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, Lock } from 'lucide-react';
import FolderActions from './FolderActions';
import PinGate from './PinGate';

interface FolderItemProps {
  name: string;
  path: string;
  listView: boolean;
  hasToken: boolean;
  hasPin: boolean;
  lockedAncestor: string | null;
  pinHash?: string;
  pins: Record<string, string>;
  pinsSha?: string;
  onPinsChanged: () => void;
  onUnlocked: (path: string) => void;
}

const FolderItem: React.FC<FolderItemProps> = ({
  name,
  path,
  listView,
  hasToken,
  hasPin,
  lockedAncestor,
  pinHash,
  pins,
  pinsSha,
  onPinsChanged,
  onUnlocked,
}) => {
  const navigate = useNavigate();
  const [pinGateOpen, setPinGateOpen] = useState(false);

  const isBlocked = !!lockedAncestor && !hasToken;
  const showLockIcon = hasPin && !hasToken;

  const openFolder = () => {
    navigate(`/?dir=${encodeURIComponent(path)}`);
  };

  const handleOpen = () => {
    if (isBlocked) {
      setPinGateOpen(true);
      return;
    }
    openFolder();
  };

  const handleUnlock = () => {
    if (lockedAncestor) onUnlocked(lockedAncestor);
    setPinGateOpen(false);
    openFolder();
  };

  return (
    <div className={`book-card folder-item ${listView ? 'book-card-list' : ''}`}>
      <button
        type="button"
        className={`folder-open-btn ${isBlocked ? 'folder-open-btn-locked' : ''}`}
        onClick={handleOpen}
        title={name}
      >
        <div className={`folder-cover ${isBlocked ? 'folder-cover-locked' : ''}`}>
          {showLockIcon ? <Lock size={listView ? 24 : 32} /> : <Folder size={listView ? 24 : 32} />}
        </div>
        <span className="file-item-name">
          {name}
          {hasPin && hasToken && <Lock size={12} className="folder-lock-badge" aria-hidden />}
        </span>
      </button>

      {hasToken && (
        <div className="book-card-actions" onClick={(e) => e.stopPropagation()}>
          <FolderActions
            variant="icon"
            folderPath={path}
            folderName={name}
            hasPin={hasPin}
            pins={pins}
            pinsSha={pinsSha}
            onChanged={onPinsChanged}
            onUnlocked={onUnlocked}
          />
        </div>
      )}

      {pinGateOpen && pinHash && lockedAncestor && (
        <PinGate
          folderPath={lockedAncestor}
          folderName={lockedAncestor.split('/').pop() || name}
          pinHash={pinHash}
          onUnlock={handleUnlock}
          onCancel={() => setPinGateOpen(false)}
        />
      )}
    </div>
  );
};

export default FolderItem;
