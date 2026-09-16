import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CaseProvider, useCase } from './context/CaseContext';
import { FullscreenProvider } from './context/FullscreenContext';
import { FullscreenHud } from './components/common/FullscreenHud';

// Common Layout Components
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { AppLayout } from './components/common/AppLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { LoginPage } from './pages/public/LoginPage';

// Post-Login Mandatory RELIC Overview
import { RelicPostLoginOverview } from './pages/app/RelicPostLoginOverview';

// Authenticated Application Pages
import { DashboardPage } from './pages/app/DashboardPage';
import NewComplaintPage from './pages/app/NewComplaintPage';
import { ActiveCasesPage } from './pages/app/ActiveCasesPage';
import { CaseRepositoryPage } from './pages/app/CaseRepositoryPage';
import { CaseDetailsPage } from './pages/app/CaseDetailsPage';
import { AiAnalysisPage } from './pages/app/AiAnalysisPage';
import { MoneyTrailPage } from './pages/app/MoneyTrailPage';
import { LocationIntelligencePage } from './pages/app/LocationIntelligencePage';
import { AtmIntelligencePage } from './pages/app/AtmIntelligencePage';
import { RiskHeatmapPage } from './pages/app/RiskHeatmapPage';
import { EvidencePage } from './pages/app/EvidencePage';
import { ReportsPage } from './pages/app/ReportsPage';
import { AtmCctvEvidencePage } from './pages/app/AtmCctvEvidencePage';
import { ProfilePage } from './pages/app/ProfilePage';
import { SettingsPage } from './pages/app/SettingsPage';

function AppRouter() {
  const { user } = useAuth();
  const [history, setHistory] = useState<string[]>(['home']);
  const currentRoute = history[history.length - 1] || 'home';

  const navigate = (route: string) => {
    if (route === currentRoute) return;
    setHistory((prev) => [...prev, route]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setHistory((prev) => {
      if (prev.length <= 1) {
        return ['home'];
      }
      return prev.slice(0, -1);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If user is authenticated and navigating an app route (or just logged in)
  const isAppRoute = [
    'dashboard',
    'relic-overview',
    'new-complaint',
    'active-cases',
    'cases',
    'case-details',
    'money-trail',
    'ai-analysis',
    'location-intelligence',
    'atm-intelligence',
    'risk-heatmap',
    'atm-cctv-evidence',
    'evidence',
    'reports',
    'profile',
    'settings',
  ].includes(currentRoute);

  // If unauthenticated but on an app route (e.g. after logout), reset to home
  useEffect(() => {
    if (!user && isAppRoute) {
      setHistory(['home']);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [user, isAppRoute]);

  // Compute effective route for public layout
  const effectiveRoute = !user && isAppRoute ? 'home' : currentRoute;

  // If logged in and on relic-overview route, immediately redirect to dashboard
  useEffect(() => {
    if (user && currentRoute === 'relic-overview') {
      navigate('dashboard');
    }
  }, [user, currentRoute]);

  // If logged in and on an authenticated app route
  if (user && isAppRoute) {
    return (
      <AppLayout currentRoute={currentRoute} onNavigate={navigate} onBack={goBack}>
        {currentRoute === 'dashboard' && <DashboardPage onNavigate={navigate} onBack={goBack} />}
        {currentRoute === 'new-complaint' && <NewComplaintPage onNavigate={navigate} onBack={goBack} />}
        {currentRoute === 'active-cases' && <ActiveCasesPage onNavigate={navigate} onBack={goBack} />}
        {currentRoute === 'cases' && <CaseRepositoryPage onNavigate={navigate} onBack={goBack} />}
        {currentRoute === 'case-details' && <CaseDetailsPage onNavigate={navigate} onBack={goBack} />}
        {currentRoute === 'money-trail' && <MoneyTrailPage onNavigate={navigate} onBack={goBack} />}
        {currentRoute === 'ai-analysis' && <AiAnalysisPage onNavigate={navigate} onBack={goBack} />}
        {currentRoute === 'location-intelligence' && <LocationIntelligencePage onNavigate={navigate} onBack={goBack} />}
        {currentRoute === 'atm-intelligence' && <AtmIntelligencePage onNavigate={navigate} onBack={goBack} />}
        {currentRoute === 'risk-heatmap' && <RiskHeatmapPage onNavigate={navigate} onBack={goBack} />}
        {currentRoute === 'atm-cctv-evidence' && <AtmCctvEvidencePage onNavigate={navigate} onBack={goBack} />}
        {currentRoute === 'evidence' && <EvidencePage onNavigate={navigate} onBack={goBack} />}
        {currentRoute === 'reports' && <ReportsPage onNavigate={navigate} onBack={goBack} />}
        {currentRoute === 'profile' && <ProfilePage onNavigate={navigate} onBack={goBack} />}
        {currentRoute === 'settings' && <SettingsPage onNavigate={navigate} onBack={goBack} />}
      </AppLayout>
    );
  }

  // Handle Login & Signup standalones (Signup redirects to login per requirement)
  if (effectiveRoute === 'login' || effectiveRoute === 'signup') {
    return (
      <LoginPage
        onNavigate={navigate}
        onBack={goBack}
        onNavigateHome={() => navigate('home')}
        onSuccess={() => navigate('dashboard')}
      />
    );
  }

  // Public Layout: Predominantly black cinematic theme (Locked single-viewport)
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#030303] text-[#F5F5F5] selection:bg-[#2F9BFF] selection:text-white font-['Inter',_sans-serif]">
      <Navbar
        currentRoute={effectiveRoute}
        onNavigate={navigate}
        onOpenLogin={() => navigate('login')}
      />

      <main className="flex-1 h-full w-full overflow-hidden">
        <HomePage
          onNavigate={navigate}
          onOpenLogin={() => navigate('login')}
        />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CaseProvider>
          <FullscreenProvider>
            <AppRouter />
            <FullscreenHud />
          </FullscreenProvider>
        </CaseProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
