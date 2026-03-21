import { motion } from 'framer-motion';
import { useState, useRef } from 'react';

export default function GlowButton({
  children,
  onClick,
  variant = 'primary', // primary | secondary | danger | ghost
  size = 'md',
  className = '',
  disabled = false,
  icon: Icon = null,
  iconRight = false,
  fullWidth = false,
  type = 'button',
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const btnRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const variants = {
    primary: {
      base: 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:border-emerald-400/60 hover:bg-emerald-500/20 hover:text-emerald-300',
      glow: 'rgba(16, 185, 129, 0.4)',
    },
    secondary: {
      base: 'border border-white/10 bg-white/5 text-white/80 hover:border-white/20 hover:bg-white/10 hover:text-white',
      glow: 'rgba(255, 255, 255, 0.2)',
    },
    danger: {
      base: 'border border-red-500/40 bg-red-500/15 text-red-400 hover:border-red-400/70 hover:bg-red-500/25 hover:text-red-300',
      glow: 'rgba(239, 68, 68, 0.5)',
    },
    ghost: {
      base: 'border border-transparent bg-transparent text-white/60 hover:text-white hover:border-white/10',
      glow: 'transparent',
    },
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3.5 text-base gap-2.5',
  };

  const v = variants[variant] || variants.primary;

  return (
    <motion.button
      ref={btnRef}
      type={type}
      disabled={disabled}
      className={`relative overflow-hidden rounded-xl font-exo font-semibold tracking-wide transition-all duration-200 flex items-center justify-center cursor-pointer backdrop-blur-sm
        ${v.base} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${className}`}
      style={{ fontFamily: "'Exo 2', sans-serif" }}
      onMouseMove={handleMouseMove}
      onClick={disabled ? undefined : onClick}
      whileHover={disabled ? {} : { scale: 1.02, boxShadow: `0 0 25px ${v.glow}` }}
      whileTap={disabled ? {} : { scale: 0.98 }}
    >
      {/* Magnetic glow spot */}
      <span
        className="pointer-events-none absolute rounded-full opacity-0 hover:opacity-100 transition-opacity"
        style={{
          width: 80,
          height: 80,
          background: `radial-gradient(circle, ${v.glow} 0%, transparent 70%)`,
          transform: `translate(${pos.x - 40}px, ${pos.y - 40}px)`,
        }}
      />
      {Icon && !iconRight && <Icon size={size === 'lg' ? 20 : size === 'sm' ? 14 : 16} />}
      <span className="relative z-10">{children}</span>
      {Icon && iconRight && <Icon size={size === 'lg' ? 20 : size === 'sm' ? 14 : 16} />}
    </motion.button>
  );
}
