import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { DarkModeToggle } from '../ui/DarkModeToggle';
import { Badge } from '../ui/Badge';
import { useCart } from '../../context/CartContext';
import { MobileMenu } from './MobileMenu';

interface HeaderProps {
  isDark: boolean;
  onToggleDark: () => void;
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950'
      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
  }`;

export function Header({ isDark, onToggleDark }: HeaderProps) {
  const { t } = useTranslation('common');
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header role="banner" className="sticky top-0 z-50 bg-white/80 dark:bg-navy/80 backdrop-blur-md border-b border-gray-200 dark:border-navy-light">
      <nav role="navigation" aria-label="Main" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/aitesters-logo.png"
              alt="AI Testers"
              className="h-7 w-auto transition-opacity group-hover:opacity-80"
            />
            <span className="hidden sm:inline-block text-base font-bold text-accent dark:text-accent-light tracking-tightest border-l border-gray-300 dark:border-navy-light pl-3">
              Pixelarium
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/" end className={navLinkClass}>{t('nav.home')}</NavLink>
            <NavLink to="/live" className={navLinkClass}>{t('nav.live')}</NavLink>
            <NavLink to="/activity" className={navLinkClass}>{t('nav.activity')}</NavLink>
            <NavLink to="/gallery" className={navLinkClass}>{t('nav.gallery')}</NavLink>
            <NavLink to="/about" className={navLinkClass}>{t('nav.about')}</NavLink>
            <NavLink to="/login" className={navLinkClass}>{t('nav.login')}</NavLink>
            <NavLink to="/cart" className={navLinkClass}>
              <span className="relative">{t('nav.cart')}<Badge count={totalItems} /></span>
            </NavLink>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            <DarkModeToggle isDark={isDark} onToggle={onToggleDark} />
          </div>
          <div className="flex md:hidden items-center gap-2">
            <DarkModeToggle isDark={isDark} onToggle={onToggleDark} />
            <button onClick={() => setMobileMenuOpen(true)} aria-label={t('openMenu')} className="p-2 text-gray-600 dark:text-gray-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} cartCount={totalItems} />
    </header>
  );
}
