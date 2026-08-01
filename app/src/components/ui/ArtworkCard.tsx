import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Artwork, Artist } from '../../types/artwork';
import { formatPrice } from '../../utils/formatPrice';

interface ArtworkCardProps { artwork: Artwork; artist: Artist | undefined; }

export function ArtworkCard({ artwork, artist }: ArtworkCardProps) {
  const { i18n } = useTranslation();
  const [liked, setLiked] = useState(false);

  return (
    <article className="artwork-card bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
      <Link to={`/artwork/${artwork.id}`} className="block">
        <div className="aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-700">
          <img src={artwork.image} alt={artwork.title} className="w-full h-full object-cover artwork-zoom" />
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              <Link to={`/artwork/${artwork.id}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{artwork.title}</Link>
            </h3>
            {artist && <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">{artist.name}</p>}
          </div>
          <button onClick={() => setLiked((prev) => !prev)} aria-pressed={liked} aria-label={`Like ${artwork.title}`}
            className="flex-shrink-0 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <svg className={`w-5 h-5 ${liked ? 'text-red-500 fill-current animate-pulse-once' : 'text-gray-400'}`}
              viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{formatPrice(artwork.priceCents, i18n.language)}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">{artwork.category}</span>
        </div>
      </div>
    </article>
  );
}
