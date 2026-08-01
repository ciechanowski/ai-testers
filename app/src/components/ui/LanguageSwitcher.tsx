import { useTranslation } from 'react-i18next';

const languages = ['en', 'pl', 'de'] as const;

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation('common');
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Language">
      {languages.map((lng) => (
        <button
          key={lng}
          onClick={() => void i18n.changeLanguage(lng)}
          aria-current={i18n.language === lng ? 'true' : undefined}
          className={`px-2 py-1 text-sm rounded transition-colors ${
            i18n.language === lng ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >{t(`language.${lng}`)}</button>
      ))}
    </div>
  );
}
