import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';

export function CartPage() {
  const { t } = useTranslation('cart');
  const { i18n } = useTranslation();
  const { items, removeItem, updateQuantity, totalCents } = useCart();
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => setLastUpdated(new Date().toLocaleTimeString()), 1_000);
    return () => clearInterval(interval);
  }, []);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <svg className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('empty.heading')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{t('empty.description')}</p>
        <Link to="/gallery" className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">{t('empty.cta')}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('title')} ({items.length} {t('items')})</h1>
        <p data-testid="last-updated" className="text-sm text-gray-500 dark:text-gray-400">{t('lastUpdated')} {lastUpdated}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.artwork.id} className="flex gap-4 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <img src={item.artwork.image} alt={item.artwork.title} className="w-24 h-24 object-cover rounded-lg bg-gray-100 dark:bg-gray-700" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{item.artwork.title}</h3>
                <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mt-1">{formatPrice(item.artwork.priceCents, i18n.language)}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded">
                    <button onClick={() => updateQuantity(item.artwork.id, item.quantity - 1)} aria-label={`Decrease quantity of ${item.artwork.title}`} className="px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">-</button>
                    <span className="px-3 py-1 text-sm border-x border-gray-300 dark:border-gray-600">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.artwork.id, item.quantity + 1)} aria-label={`Increase quantity of ${item.artwork.title}`} className="px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">+</button>
                  </div>
                  <button onClick={() => removeItem(item.artwork.id)} className="text-sm text-red-500 hover:text-red-700 transition-colors">{t('remove')}</button>
                </div>
              </div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{formatPrice(item.artwork.priceCents * item.quantity, i18n.language)}</p>
            </div>
          ))}
        </div>
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>{t('summary.subtotal')}</span><span>{formatPrice(totalCents, i18n.language)}</span></div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>{t('summary.shipping')}</span><span className="text-green-600 dark:text-green-400">{t('summary.free')}</span></div>
              <hr className="border-gray-200 dark:border-gray-700" />
              <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-gray-100"><span>{t('summary.total')}</span><span>{formatPrice(totalCents, i18n.language)}</span></div>
            </div>
          </div>
          <form className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4" onSubmit={(e) => e.preventDefault()} aria-label={t('checkout.heading')}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('checkout.heading')}</h2>
            <div>
              <label htmlFor="checkout-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('checkout.fullName')}</label>
              <input id="checkout-name" type="text" required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label htmlFor="checkout-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('checkout.email')}</label>
              <input id="checkout-email" type="email" required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label htmlFor="checkout-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('checkout.address')}</label>
              <input id="checkout-address" type="text" required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="checkout-city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('checkout.city')}</label>
                <input id="checkout-city" type="text" required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label htmlFor="checkout-zip" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('checkout.zip')}</label>
                <input id="checkout-zip" type="text" required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div>
              <label htmlFor="checkout-country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('checkout.country')}</label>
              <select id="checkout-country" required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500">
                <option value="">{t('checkout.selectCountry')}</option>
                <option value="us">{t('checkout.countries.us')}</option>
                <option value="pl">{t('checkout.countries.pl')}</option>
                <option value="de">{t('checkout.countries.de')}</option>
                <option value="uk">{t('checkout.countries.uk')}</option>
                <option value="fr">{t('checkout.countries.fr')}</option>
              </select>
            </div>
            <hr className="border-gray-200 dark:border-gray-700" />
            <div>
              <label htmlFor="checkout-card" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('checkout.cardNumber')}</label>
              <input id="checkout-card" type="text" placeholder="1234 5678 9012 3456" required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="checkout-expiry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('checkout.expiry')}</label>
                <input id="checkout-expiry" type="text" placeholder="MM/YY" required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label htmlFor="checkout-cvv" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('checkout.cvv')}</label>
                <input id="checkout-cvv" type="text" placeholder="123" required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-md mt-4">{t('checkout.placeOrder')}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
