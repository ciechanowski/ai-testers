import { Outlet, Routes, Route, useSearchParams } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { useDarkMode } from './hooks/useDarkMode';
import { HomePage } from './pages/HomePage';
import { LiveBoardPage } from './pages/LiveBoardPage';
import { ActivityPage } from './pages/ActivityPage';
import { GalleryPage } from './pages/GalleryPage';
import { ArtworkDetailPage } from './pages/ArtworkDetailPage';
import { CartPage } from './pages/CartPage';
import { LoginPage } from './pages/LoginPage';
import { AboutPage } from './pages/AboutPage';
import { StudioPage } from './pages/StudioPage';
import { PayoutsPage } from './pages/PayoutsPage';
import { InsightsPage } from './pages/InsightsPage';

function Layout() {
  const { isDark, toggle } = useDarkMode();
  const [params] = useSearchParams();
  const vrt = params.get('vrt');
  return (
    <div className={`min-h-screen flex flex-col${vrt ? ` vrt-demo--${vrt}` : ''}`}>
      <Header isDark={isDark} onToggleDark={toggle} />
      <main role="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/live" element={<LiveBoardPage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/artwork/:id" element={<ArtworkDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/about" element={<AboutPage />} />
        {/* Homework S01 L04 — dostęp tylko przez bezpośredni URL (celowo poza nav) */}
        <Route path="/studio" element={<StudioPage />} />
        {/* Homework S02 L04 — dostęp tylko przez bezpośredni URL (celowo poza nav) */}
        <Route path="/payouts" element={<PayoutsPage />} />
        {/* Homework S03 L04 — dostęp tylko przez bezpośredni URL (celowo poza nav) */}
        <Route path="/insights" element={<InsightsPage />} />
      </Route>
    </Routes>
  );
}
