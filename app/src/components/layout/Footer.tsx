import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation('common');
  return (
    <footer role="contentinfo" className="bg-gray-100 dark:bg-navy-light border-t border-gray-200 dark:border-navy-light mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left flex flex-col sm:flex-row sm:items-center gap-3">
            <Link to="/" className="inline-flex items-center justify-center sm:justify-start">
              <img src="/aitesters-logo.png" alt="AI Testers" className="h-6 w-auto" />
            </Link>
            <div className="sm:border-l sm:border-gray-300 sm:dark:border-navy sm:pl-3">
              <span className="text-sm font-bold text-accent dark:text-accent-light tracking-tightest">Pixelarium</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">&copy; {new Date().getFullYear()} {t('footer.copyright')}</p>
            </div>
          </div>
          <nav aria-label="Footer" className="flex items-center gap-6">
            <Link to="/about" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('footer.contact')}</Link>
            <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('footer.privacy')}</button>
            <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('footer.terms')}</button>
          </nav>
        </div>
      </div>
    </footer>
  );
}
