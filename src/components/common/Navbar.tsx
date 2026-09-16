import React from 'react';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenLogin: () => void;
  onOpenSignup?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
  onOpenLogin,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-gradient-to-b from-[#030303]/80 via-[#030303]/30 to-transparent transition-all pointer-events-none">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between pointer-events-auto">
        
        {/* LEFT: Minimal RELIC Wordmark (pure text, no icon/logo) */}
        <button
          onClick={() => onNavigate('home')}
          className="text-xl sm:text-2xl font-black tracking-wider uppercase text-[#F5F5F5] font-['Inter',_sans-serif] hover:text-white transition-colors focus:outline-none cursor-pointer"
        >
          RELIC
        </button>

        {/* RIGHT: ONLY [ SIGN IN ] */}
        <button
          id="nav-signin-btn"
          onClick={onOpenLogin}
          className="px-6 py-2.5 text-xs font-['Inter',_sans-serif] font-bold tracking-wider uppercase text-white bg-[#2F9BFF] hover:bg-[#258ae6] active:bg-[#1d76c7] rounded-xl transition-all shadow-md shadow-[#2F9BFF]/20 cursor-pointer"
        >
          SIGN IN
        </button>
      </div>
    </header>
  );
};

