import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { ArtworkCard } from '../components/ui/ArtworkCard';
import { formatPrice } from '../utils/formatPrice';
import artworksData from '../data/artworks.json';
import artistsData from '../data/artists.json';
import type { Artwork, Artist } from '../types/artwork';

const artworks = artworksData as Artwork[];
const artists = artistsData as Artist[];

function getRelativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1_000 * 60 * 60 * 24));
  if (days > 30) { const months = Math.floor(days / 30); return `${months} month${months > 1 ? 's' : ''} ago`; }
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

export function ArtworkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('artwork');
  const { i18n } = useTranslation();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const artwork = artworks.find((a) => a.id === id);
  const artist = artwork ? artists.find((a) => a.id === artwork.artistId) : undefined;

  if (!artwork) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Artwork not found</h1>
        <Link to="/gallery" className="text-indigo-600 dark:text-indigo-400 mt-4 inline-block hover:underline">{t('backToGallery')}</Link>
      </div>
    );
  }

  const related = artworks.filter((a) => a.category === artwork.category && a.id !== artwork.id).slice(0, 3);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addItem(artwork);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/gallery" className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline mb-6">&larr; {t('backToGallery')}</Link>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <img src={artwork.image} alt={artwork.title} className="w-full h-full object-cover artwork-zoom" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{artwork.title}</h1>
          {artist && (
            <div className="flex items-center gap-3 mb-4">
              <img src={artist.avatar} alt={artist.name} className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('by')}</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{artist.name}</p>
              </div>
            </div>
          )}
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{artwork.description}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t('created')}: {getRelativeDate(artwork.createdAt)}</p>
          <div className="flex items-end gap-6 mb-8">
            <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{formatPrice(artwork.priceCents, i18n.language)}</span>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <label htmlFor="quantity-input" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('quantity')}</label>
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-lg transition-colors">-</button>
              <input id="quantity-input" type="number" min={1} max={10} value={quantity} onChange={(e) => setQuantity(Math.max(1, Math.min(10, Number(e.target.value))))} aria-label={t('quantity')} className="w-12 text-center border-x border-gray-300 dark:border-gray-600 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
              <button onClick={() => setQuantity((q) => Math.min(10, q + 1))} aria-label="Increase quantity" className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-lg transition-colors">+</button>
            </div>
          </div>
          <button onClick={handleAddToCart} className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-md">{t('addToCart')}</button>
        </div>
      </div>
      {related.length > 0 && (
        <section aria-label={t('related')} className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t('related')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((a) => <ArtworkCard key={a.id} artwork={a} artist={artists.find((ar) => ar.id === a.artistId)} />)}
          </div>
        </section>
      )}
    </div>
  );
}
