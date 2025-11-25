import React from 'react';

export const NabahaLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 260 60" className={className} xmlns="http://www.w3.org/2000/svg" fill="none" style={{ direction: 'ltr' }}>
    <defs>
      <linearGradient id="compassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="50%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>
      <linearGradient id="eyeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#005c2b" />
        <stop offset="100%" stopColor="#007f3d" />
      </linearGradient>
    </defs>

    {/* Symbol Group */}
    <g transform="translate(10, 5)">
      {/* Outer Tech Ring (Left - Dark) */}
      <path d="M25 48 A 20 20 0 1 1 25 8" stroke="#005c2b" strokeWidth="4" strokeLinecap="round" />
      {/* Outer Tech Ring (Right - Light/Tech) */}
      <path d="M25 8 A 20 20 0 1 1 25 48" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 4" opacity="0.8" />
      
      {/* Circuit Dots */}
      <circle cx="8" cy="18" r="2" fill="#005c2b" />
      <circle cx="42" cy="38" r="2" fill="#10b981" />
      
      {/* Compass Needle Background (Eye Shape) */}
      <path d="M10 28 Q25 12 40 28 Q25 44 10 28 Z" fill="white" />
      
      {/* Compass Needle */}
      <path d="M25 50 L20 28 L25 4 L30 28 Z" fill="url(#compassGrad)" stroke="white" strokeWidth="1" />
      
      {/* Eye/Center */}
      <circle cx="25" cy="28" r="6" fill="url(#eyeGrad)" stroke="white" strokeWidth="2" />
      <circle cx="27" cy="26" r="1.5" fill="white" opacity="0.8" />
    </g>

    {/* Text Group */}
    {/* Arabic Text */}
    <text x="70" y="42" fontFamily="Tajawal, sans-serif" fontSize="28" fontWeight="700" fill="#005c2b">نباهة</text>
    
    {/* Divider */}
    <line x1="145" y1="15" x2="145" y2="45" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
    
    {/* English Text */}
    <text x="160" y="40" fontFamily="Inter, sans-serif" fontSize="22" fontWeight="600" fill="#334155">Nabaha</text>
  </svg>
);