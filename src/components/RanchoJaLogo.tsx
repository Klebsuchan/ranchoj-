import React from 'react';

interface RanchoJaLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'light' | 'dark';
  className?: string;
}

export const RanchoJaIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="RanchoJá Ícone"
    >
      <defs>
        {/* Background rounded squircle gradient - iFood Red */}
        <linearGradient id="rjBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EA1D2C" />
          <stop offset="100%" stopColor="#BA0C19" />
        </linearGradient>

        {/* Speed Lightning gradient */}
        <linearGradient id="rjBoltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>

        {/* Soft shadow inside icon */}
        <filter id="rjShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#7F1D1D" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Modern Squircle Base in iFood Red */}
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="12"
        fill="url(#rjBgGrad)"
        className="transition-transform"
      />

      {/* Inner subtle rim highlight */}
      <rect
        x="3"
        y="3"
        width="42"
        height="42"
        rx="11"
        fill="none"
        stroke="#FCA5A5"
        strokeWidth="1"
        strokeOpacity="0.4"
      />

      {/* Stylized Shopping Cart Wireframe with iFood Smile vibe */}
      <g filter="url(#rjShadow)">
        {/* Handle and Cart Basket Line */}
        <path
          d="M10 13H14.5L18.2 27.2C18.4 28 19.1 28.6 20 28.6H33.5C34.3 28.6 35.1 28 35.3 27.2L38 17.5H16.5"
          stroke="#FFFFFF"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Front horizontal speed line */}
        <path
          d="M19 22.5H35.5"
          stroke="#FECACA"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Dynamic Speed Lightning Bolt */}
        <path
          d="M27.5 11.5L22 20.5H27L25 28.5L33.5 18H28L30 11.5H27.5Z"
          fill="url(#rjBoltGrad)"
          stroke="#FFFFFF"
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* Cart Wheels */}
        <circle cx="21" cy="34" r="2.4" fill="#FFFFFF" />
        <circle cx="33" cy="34" r="2.4" fill="#FFFFFF" />
      </g>
    </svg>
  );
};

export const RanchoJaLogo: React.FC<RanchoJaLogoProps> = ({
  size = 'md',
  showText = true,
  variant = 'light',
  className = '',
}) => {
  const pixelSizes = {
    xs: 24,
    sm: 30,
    md: 36,
    lg: 46,
    xl: 60,
  };

  const textClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  const isDark = variant === 'dark';

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <RanchoJaIcon size={pixelSizes[size]} />

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center tracking-tight">
            <span
              className={`font-black ${textClasses[size]} ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              rancho
            </span>
            <span
              className={`font-black italic ml-0.5 px-1.5 py-0.5 rounded-lg bg-red-600 text-white shadow-xs ${
                size === 'xs' || size === 'sm' ? 'text-[11px]' : textClasses[size]
              }`}
            >
              já
            </span>
          </div>
          {(size === 'md' || size === 'lg' || size === 'xl') && (
            <span
              className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${
                isDark ? 'text-red-300' : 'text-red-600'
              }`}
            >
              Mercados & Preços
            </span>
          )}
        </div>
      )}
    </div>
  );
};
