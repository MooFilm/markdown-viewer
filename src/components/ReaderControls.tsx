import React from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';

interface ReaderControlsProps {
  fontSize: number;
  lineHeight: number;
  onIncreaseFont: () => void;
  onDecreaseFont: () => void;
  onLineHeightChange: (value: number) => void;
  onReset: () => void;
}

const ReaderControls: React.FC<ReaderControlsProps> = ({
  fontSize,
  lineHeight,
  onIncreaseFont,
  onDecreaseFont,
  onLineHeightChange,
  onReset,
}) => {
  return (
    <div className="reader-controls" aria-label="Reading preferences">
      <button type="button" className="reader-control-btn" onClick={onDecreaseFont} title="Decrease font size" aria-label="Decrease font size">
        <Minus size={16} />
      </button>
      <span className="reader-control-label">{fontSize.toFixed(1)}rem</span>
      <button type="button" className="reader-control-btn" onClick={onIncreaseFont} title="Increase font size" aria-label="Increase font size">
        <Plus size={16} />
      </button>
      <label className="reader-control-spacing">
        <span>Spacing</span>
        <select
          value={lineHeight}
          onChange={(e) => onLineHeightChange(Number(e.target.value))}
          aria-label="Line height"
        >
          <option value={1.6}>Compact</option>
          <option value={1.8}>Normal</option>
          <option value={2}>Relaxed</option>
        </select>
      </label>
      <button type="button" className="reader-control-btn" onClick={onReset} title="Reset reading preferences" aria-label="Reset reading preferences">
        <RotateCcw size={16} />
      </button>
    </div>
  );
};

export default ReaderControls;
