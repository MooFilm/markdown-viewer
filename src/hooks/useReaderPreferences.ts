import { useEffect, useState } from 'react';

const FONT_SIZE_KEY = 'reader-font-size';
const LINE_HEIGHT_KEY = 'reader-line-height';

const DEFAULT_FONT_SIZE = 1.1;
const DEFAULT_LINE_HEIGHT = 1.8;

export function useReaderPreferences() {
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem(FONT_SIZE_KEY);
    return saved ? Number(saved) : DEFAULT_FONT_SIZE;
  });

  const [lineHeight, setLineHeight] = useState(() => {
    const saved = localStorage.getItem(LINE_HEIGHT_KEY);
    return saved ? Number(saved) : DEFAULT_LINE_HEIGHT;
  });

  useEffect(() => {
    localStorage.setItem(FONT_SIZE_KEY, String(fontSize));
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem(LINE_HEIGHT_KEY, String(lineHeight));
  }, [lineHeight]);

  const increaseFontSize = () => setFontSize((value) => Math.min(1.5, Number((value + 0.1).toFixed(1))));
  const decreaseFontSize = () => setFontSize((value) => Math.max(0.9, Number((value - 0.1).toFixed(1))));
  const resetPreferences = () => {
    setFontSize(DEFAULT_FONT_SIZE);
    setLineHeight(DEFAULT_LINE_HEIGHT);
  };

  return {
    fontSize,
    lineHeight,
    increaseFontSize,
    decreaseFontSize,
    setLineHeight,
    resetPreferences,
  };
}
