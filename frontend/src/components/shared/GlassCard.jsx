import { motion } from 'framer-motion';
import { useState, useRef } from 'react';

export default function GlassCard({ children, className = '', tilt = false, glow = null, onClick, style = {} }) {
  const [transform, setTransform] = useState('');
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!tilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTransform(`perspective(1000px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) scale(1.01)`);
  };

  const handleMouseLeave = () => setTransform('');

  const glowStyle = glow
    ? { boxShadow: `0 0 30px ${glow}`, borderColor: glow.replace(')', ', 0.4)').replace('rgb', 'rgba') }
    : {};

  return (
    <motion.div
      ref={cardRef}
      className={`glass-card ${className}`}
      style={{ transform, transition: 'transform 0.15s ease, box-shadow 0.3s ease', ...glowStyle, ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={!tilt ? { y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' } : {}}
    >
      {children}
    </motion.div>
  );
}
