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
  onUnlock: (path: string) => void;
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
  onUnlock,
}) => {
  const navigate = useNavigate();
  const [pinGateOpen, setPinGateOpen] = useState(false);

  const isBlocked = !!lockedAncestor && !hasToken;
  const showLockIcon = hasPin || isBlocked;

  const handleClick = (e: React.MouseEvent) => {
    if (!isBlocked) return;
    e.preventDefault();
    setPinGateOpen(true);
  };

  const handleUnlock = () => {
    if (lockedAncestor) onUnlock(lockedAncestor);
    setPinGateOpen(false);
    navigate(`/?dir=${encodeURIComponent(path)}`);
  };

  return (
    <div className={`book-card folder-item ${listView ? 'book-card-list' : ''}`}>
      <div
        className={`folder-cover ${isBlocked ? 'folder-cover-locked' : ''}`}
        onClick={isBlocked ? handleClick : undefined}
        role={isBlocked ? 'button' : undefined}
        tabIndex={isBlocked ? 0 : undefined}
        onKeyDown={
          isBlocked
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setPinGateOpen(true);
                }
              }
            : undefined
        }
      >
        {showLockIcon && !hasToken ? <Lock size={listView ? 24 : 32} /> : <Folder size={listView ? 24 : 32} />}
      </div>

      {!isBlocked ? (
        <a
          href={`#/?dir=${encodeURIComponent(path)}`}
          className="file-item-name book-title-link"
          title={name}
          onClick={(e) => {
            e.preventDefault();
            navigate(`/?dir=${encodeURIComponent(path)}`);
          }}
        >
          {name}
          {hasPin && hasToken && <Lock size={12} className="folder-lock-badge" aria-hidden />}
        </a>
      ) : (
        <button
          type="button"
          className="file-item-name folder-locked-name"
          title={name}
          onClick={() => setPinGateOpen(true)}
        >
          {name}
        </button>
      )}

      {hasToken && (
        <div className="book-card-actions">
          <FolderActions
            variant="icon"
            folderPath={path}
            folderName={name}
            hasPin={hasPin}
            pins={pins}
            pinsSha={pinsSha}
            onChanged={onPinsChanged}
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
