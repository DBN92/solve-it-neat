import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md', 
  showText = true 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo SVG */}
      <div className={`relative ${sizeClasses[size]}`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Cadeado principal */}
          <rect
            x="25"
            y="45"
            width="50"
            height="35"
            rx="4"
            fill="#1e3a5f"
            stroke="#1e3a5f"
            strokeWidth="2"
          />
          
          {/* Arco do cadeado */}
          <path
            d="M35 45 V35 C35 25 40 20 50 20 C60 20 65 25 65 35 V45"
            stroke="#1e3a5f"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Ícone de pessoa dentro do cadeado */}
          <circle
            cx="50"
            cy="55"
            r="4"
            fill="white"
          />
          <path
            d="M42 70 C42 65 45 62 50 62 C55 62 58 65 58 70"
            stroke="white"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Check verde */}
          <circle
            cx="70"
            cy="70"
            r="12"
            fill="#059669"
          />
          <path
            d="M65 70 L68 73 L75 66"
            stroke="white"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Texto do logo */}
      {showText && (
        <div className="flex flex-col">
          <div className={`font-bold text-[#1e3a5f] leading-tight ${textSizeClasses[size]}`}>
            Open Consent
          </div>
          <div className={`font-semibold text-[#059669] leading-tight ${textSizeClasses[size]}`}>
            Imonitore
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo;