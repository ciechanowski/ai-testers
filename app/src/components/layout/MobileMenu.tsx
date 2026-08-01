import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { Badge } from '../ui/Badge';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  cartCount: number;
}

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block px-4 py-3 text-lg font-medium rounded-lg transition-colors ${
    isActive ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950' : 'text-gray-700 dark:text-gray-300'
  }`;

export function MobileMenu({ isOpen, onClose, cartCount }: MobileMenuProps) {
  const { t } = useTranslation('common');
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-label="Navigation" className="fixed inset-y-0 right-0 w-72 bg-white dark:bg-navy z-50 shadow-xl animate-slide-in">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">Menu</span>
          <button onClick={onClose} aria-label={t('closeMenu')} className="p-2 text-gray-600 dark:text-gray-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="p-4 space-y-2">
          <NavLink to="/" end className={mobileLinkClass} onClick={onClose}>{t('nav.home')}</NavLink>
          <NavLink to="/live" className={mobileLinkClass} onClick={onClose}>{t('nav.live')}</NavLink>
          <NavLink to="/activity" className={mobileLinkClass} onClick={onClose}>{t('nav.activity')}</NavLink>
          <NavLink to="/gallery" className={mobileLinkClass} onClick={onClose}>{t('nav.gallery')}</NavLink>
          <NavLink to="/about" className={mobileLinkClass} onClick={onClose}>{t('nav.about')}</NavLink>
          <NavLink to="/login" className={mobileLinkClass} onClick={onClose}>{t('nav.login')}</NavLink>
          <NavLink to="/cart" className={mobileLinkClass} onClick={onClose}>
            <span className="relative inline-block">{t('nav.cart')}<Badge count={cartCount} /></span>
          </NavLink>
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <LanguageSwitcher />
        </div>
      </div>
    </>
  );
}
