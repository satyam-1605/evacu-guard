import { useState, useEffect } from 'react';

export default function TypewriterText({ text, delay = 60, className = '', onComplete }) {
  const [displayed, setDisplayed] = useState('');
  const [idx, setIdx] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (idx < text.length) {
      const t = setTimeout(() => {
        setDisplayed(prev => prev + text[idx]);
        setIdx(prev => prev + 1);
      }, delay);
      return () => clearTimeout(t);
    } else {
      onComplete?.();
    }
  }, [idx, text, delay, onComplete]);

  useEffect(() => {
    const t = setInterval(() => setShowCursor(v => !v), 530);
    return () => clearInterval(t);
  }, []);

  return (
    <span className={className}>
      {displayed}
      <span
        className="inline-block w-0.5 h-[1em] ml-1 align-middle"
        style={{
          background: '#10b981',
          opacity: showCursor ? 1 : 0,
          transition: 'opacity 0.1s',
          boxShadow: '0 0 8px rgba(16,185,129,0.8)',
        }}
      />
    </span>
  );
}
