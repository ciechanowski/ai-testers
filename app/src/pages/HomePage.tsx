import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LiveCounter } from '../components/ui/LiveCounter';
import { CountdownTimer } from '../components/ui/CountdownTimer';
import { TestimonialCarousel } from '../components/ui/TestimonialCarousel';
import { ArtworkCard } from '../components/ui/ArtworkCard';
import artworksData from '../data/artworks.json';
import artistsData from '../data/artists.json';
import testimonialsData from '../data/testimonials.json';
import type { Artwork, Artist, Testimonial } from '../types/artwork';

const artworks = artworksData as Artwork[];
const artists = artistsData as Artist[];
const testimonials = testimonialsData as Testimonial[];
const featured = artworks.slice(0, 3);

export function HomePage() {
  const { t } = useTranslation('home');
  return (
    <div>
      <section data-testid="hero-section" className="hero-gradient dark:hero-gradient-dark relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">{t('hero.title')}</h1>
          <p className="text-lg md:text-xl text-indigo-100 dark:text-indigo-200 max-w-2xl mx-auto mb-8">{t('hero.subtitle')}</p>
          <Link to="/gallery" className="inline-flex items-center px-8 py-3 bg-white text-indigo-600 font-semibold rounded-full shadow-lg hover:bg-indigo-50 transition-colors">{t('hero.cta')}</Link>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
            <LiveCounter />
            <CountdownTimer />
          </div>
        </div>
      </section>
      <section aria-label={t('featured.heading')} className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('featured.heading')}</h2>
            <Link to="/gallery" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">{t('featured.viewAll')} &rarr;</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((artwork) => (
              <ArtworkCard key={artwork.id} artwork={artwork} artist={artists.find((a) => a.id === artwork.artistId)} />
            ))}
          </div>
        </div>
      </section>
      <TestimonialCarousel testimonials={testimonials} />
    </div>
  );
}
