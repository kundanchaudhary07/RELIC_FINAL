import React from 'react';

interface RelicLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showSubtitle?: boolean;
  className?: string;
  variant?: 'light' | 'dark' | 'monochrome';
}

export const RelicLogo: React.FC<RelicLogoProps> = ({
  size = 'md',
  showText = true,
  showSubtitle = false,
  className = '',
}) => {
  const dimensions = {
    sm: { text: 'text-sm', sub: 'text-[9px]' },
    md: { text: 'text-lg', sub: 'text-[10px]' },
    lg: { text: 'text-2xl', sub: 'text-xs' },
    xl: { text: 'text-4xl', sub: 'text-sm' },
  }[size];

  if (!showText && !showSubtitle) {
    return null;
  }

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <div className="flex flex-col">
        {showText && (
          <span
            className={`font-['Inter',_sans-serif] font-black tracking-wider text-[#F5F5F5] uppercase leading-none ${dimensions.text}`}
          >
            RELIC
          </span>
        )}
        {showSubtitle && (
          <span
            className={`text-[#929292] font-normal tracking-tight mt-1 leading-tight ${dimensions.sub}`}
          >
            Risk Evaluation & Location Intelligence for Cashpoints
          </span>
        )}
      </div>
    </div>
  );
};
