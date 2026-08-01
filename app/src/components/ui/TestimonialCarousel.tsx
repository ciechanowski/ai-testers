import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Testimonial } from '../../types/artwork';

interface TestimonialCarouselProps { testimonials: Testimonial[]; }

function getTimeAgo(timestamp: string, t: (key: string, opts?: Record<string, number>) => string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / (1_000 * 60));
  const hours = Math.floor(diff / (1_000 * 60 * 60));
  const days = Math.floor(diff / (1_000 * 60 * 60 * 24));
  if (days > 0) return t('testimonials.timeAgo.days', { count: days });
  if (hours > 0) return t('testimonials.timeAgo.hours', { count: hours });
  return t('testimonials.timeAgo.minutes', { count: Math.max(1, minutes) });
}

export function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  const { t } = useTranslation('home');
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5_000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const testimonial = testimonials[activeIndex];
  if (!testimonial) return null;

  return (
    <section aria-label={t('testimonials.heading')} className="py-16 bg-gray-50 dark:bg-navy-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-10">{t('testimonials.heading')}</h2>
        <div className="relative">
          <blockquote className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-md border border-gray-200 dark:border-gray-700 transition-opacity duration-500">
            <p className="text-lg text-gray-700 dark:text-gray-300 italic mb-6">&ldquo;{testimonial.text}&rdquo;</p>
            <footer className="flex items-center gap-4">
              <img src={testimonial.avatar} alt={testimonial.author} className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600" />
              <div>
                <cite className="not-italic font-semibold text-gray-900 dark:text-gray-100">{testimonial.author}</cite>
                <p data-testid="testimonial-timestamp" className="text-sm text-gray-500 dark:text-gray-400">{getTimeAgo(testimonial.timestamp, t)}</p>
              </div>
            </footer>
          </blockquote>
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setActiveIndex(i)} aria-label={`Testimonial ${i + 1}`}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${i === activeIndex ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-gray-300 dark:bg-gray-600'}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
