import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArtworkCard } from '../components/ui/ArtworkCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import artworksData from '../data/artworks.json';
import artistsData from '../data/artists.json';
import type { Artwork, Artist } from '../types/artwork';

const allArtworks = artworksData as Artwork[];
const artists = artistsData as Artist[];
const categories = ['all', 'digital-art', 'photography', '3d-render', 'illustration'] as const;
type SortOption = 'newest' | 'oldest' | 'priceAsc' | 'priceDesc';
const PAGE_SIZE = 6;

export function GalleryPage() {
  const { t } = useTranslation('gallery');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [sort, setSort] = useState<SortOption>('newest');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    let result = allArtworks;
    if (category !== 'all') result = result.filter((a) => a.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((a) => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
    }
    result = [...result].sort((a, b) => {
      switch (sort) {
        case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'priceAsc': return a.priceCents - b.priceCents;
        case 'priceDesc': return b.priceCents - a.priceCents;
      }
    });
    return result;
  }, [search, category, sort]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleCategoryChange = (cat: string) => {
    setLoading(true);
    setCategory(cat);
    setPage(1);
    setTimeout(() => setLoading(false), 200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">{t('title')}</h1>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <label htmlFor="search-input" className="sr-only">{t('searchLabel')}</label>
          <input id="search-input" type="search" aria-label={t('searchLabel')} placeholder={t('search')} value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
        </div>
        <div>
          <label htmlFor="sort-select" className="sr-only">{t('sort.label')}</label>
          <select id="sort-select" aria-label={t('sort.label')} value={sort} onChange={(e) => setSort(e.target.value as SortOption)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500">
            <option value="newest">{t('sort.newest')}</option>
            <option value="oldest">{t('sort.oldest')}</option>
            <option value="priceAsc">{t('sort.priceAsc')}</option>
            <option value="priceDesc">{t('sort.priceDesc')}</option>
          </select>
        </div>
      </div>
      <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-8">
        <aside data-testid="gallery-sidebar" aria-label={t('filtersHeading')} className="hidden lg:block">
          <div className="sticky top-24 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">{t('filtersHeading')}</h2>
            <div className="flex flex-col gap-2" role="group" aria-label="Categories">
              {categories.map((cat) => (
                <button key={cat} onClick={() => handleCategoryChange(cat)} aria-pressed={category === cat}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    category === cat ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}>{t(`categories.${cat}`)}</button>
              ))}
            </div>
          </div>
        </aside>

        <div>
          <div className="flex flex-wrap gap-2 mb-6 lg:hidden" role="group" aria-label="Categories">
            {categories.map((cat) => (
              <button key={cat} onClick={() => handleCategoryChange(cat)} aria-pressed={category === cat}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category === cat ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}>{t(`categories.${cat}`)}</button>
            ))}
          </div>

          {loading ? <LoadingSpinner /> : paginated.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-12">{t('noResults')}</p>
          ) : (
            <>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('showing', { from: (page - 1) * PAGE_SIZE + 1, to: Math.min(page * PAGE_SIZE, filtered.length), total: filtered.length })}</p>
              <div data-testid="artwork-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginated.map((artwork) => <ArtworkCard key={artwork.id} artwork={artwork} artist={artists.find((a) => a.id === artwork.artistId)} />)}
              </div>
              {totalPages > 1 && (
                <nav aria-label="Pagination" className="flex items-center justify-center gap-2 mt-10">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">{t('previous')}</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setPage(p)} aria-label={t('page', { page: p })} aria-current={p === page ? 'page' : undefined}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-indigo-600 text-white' : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>{p}</button>
                  ))}
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">{t('next')}</button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
