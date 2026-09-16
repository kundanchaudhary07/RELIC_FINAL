import React from 'react';

interface HomePageProps {
  onNavigate: (route: string) => void;
  onOpenLogin: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenLogin,
}) => {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#030303] text-[#F5F5F5] font-['Inter',_sans-serif] selection:bg-[#2F9BFF] selection:text-white flex flex-col justify-between">
      
      {/* ============================================================= */}
      {/* CINEMATIC EARTH FROM SPACE (REALISTIC PHOTOGRAPHIC HERO)       */}
      {/* ============================================================= */}
      <div
        className="absolute inset-0 bg-cover bg-no-repeat pointer-events-none transition-all duration-700"
        style={{
          backgroundImage: `url('/relic-earth.jpg')`,
          backgroundPosition: 'center 62%',
          filter: 'brightness(1.12) contrast(1.12) saturate(1.15)',
        }}
      >
        {/* Soft, targeted directional vignette focused exclusively behind the left-hand text:
            leaves the Earth curvature, thin blue atmospheric limb, and nocturnal city lights completely bright and visible */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 80% at 20% 50%, rgba(3, 3, 3, 0.75) 0%, rgba(3, 3, 3, 0.35) 45%, rgba(3, 3, 3, 0) 80%)'
          }}
        />

        {/* Subtle top shade for minimal header contrast */}
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-[#030303]/70 to-transparent pointer-events-none" />
      </div>

      {/* Top spacing accounting for the minimal header */}
      <div className="h-20 sm:h-24 shrink-0 pointer-events-none" />

      {/* ============================================================= */}
      {/* CENTRAL HERO TYPOGRAPHY: STRICTLY PER SPECIFICATION           */}
      {/* ============================================================= */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-4 flex-1 flex flex-col justify-center select-none">
        <div className="max-w-3xl space-y-8 sm:space-y-10">
          
          {/* LEVEL 1: RELIC (Strongest & Hero element) + LEVEL 2: Product Name */}
          <div className="space-y-3 sm:space-y-4">
            <h1 
              className="font-black tracking-tight text-[#F5F5F5] uppercase leading-[0.92] font-['Inter',_sans-serif]"
              style={{ fontSize: 'clamp(72px, 8vw, 120px)' }}
            >
              RELIC
            </h1>
            
            <p 
              className="font-normal text-[#C8C8C8] tracking-tight leading-snug max-w-2xl"
              style={{ fontSize: 'clamp(18px, 1.8vw, 26px)' }}
            >
              Risk Evaluation & Location Intelligence for Cashpoints
            </p>
          </div>

          {/* LEVEL 3: Slogan (Noticeable, impactful, but clearly smaller than RELIC) */}
          <div>
            <h2 
              className="font-extrabold tracking-tight text-[#EDEDED] leading-[1.15] uppercase font-['Inter',_sans-serif]"
              style={{ fontSize: 'clamp(28px, 3.2vw, 46px)' }}
            >
              PREDICT THE RISK.<br />
              LOCATE THE THREAT.<br />
              PREVENT THE FRAUD.
            </h2>
          </div>

        </div>
      </div>

      {/* Bottom breathing space — strictly NO scroll indicators, NO down arrows, NO extra labels */}
      <div className="h-10 sm:h-12 shrink-0 pointer-events-none" />

    </div>
  );
};

