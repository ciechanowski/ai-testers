import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const stats = [
  { key: 'artists', value: 127 },
  { key: 'artworks', value: 2_450 },
  { key: 'collectors', value: 890 },
  { key: 'countries', value: 34 },
];

const teamAvatars = ['/avatars/avatar-01.svg', '/avatars/avatar-02.svg', '/avatars/avatar-03.svg', '/avatars/avatar-04.svg'];

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting && !animated.current) {
        animated.current = true;
        const duration = 1_000;
        const startTime = performance.now();
        const tick = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          setCount(Math.floor(progress * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export function AboutPage() {
  const { t } = useTranslation('about');
  const teamMembers = t('team.members', { returnObjects: true }) as Array<{ name: string; role: string; bio: string }>;

  return (
    <div>
      <section aria-label={t('story.heading')} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('title')}</h1>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">{t('story.heading')}</h2>
        <div className="max-w-3xl space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed">
          <p>{t('story.p1')}</p>
          <p>{t('story.p2')}</p>
        </div>
      </section>
      <section aria-label="Statistics" className="bg-indigo-600 dark:bg-indigo-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-indigo-200 text-sm mb-6">{t('story.since')} 2019</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.key} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-white mb-1"><AnimatedCounter target={stat.value} /></p>
                <p className="text-indigo-200 text-sm">{t(`stats.${stat.key}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section aria-label={t('team.heading')} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">{t('team.heading')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, i) => (
            <article key={member.name} className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-sm border border-gray-200 dark:border-gray-700">
              <img src={teamAvatars[i]} alt={member.name} className="w-20 h-20 rounded-full mx-auto mb-4 bg-gray-200 dark:bg-gray-600" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{member.name}</h3>
              <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-2">{member.role}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{member.bio}</p>
            </article>
          ))}
        </div>
      </section>
      <section aria-label={t('contact.heading')} className="bg-gray-50 dark:bg-navy-light py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">{t('contact.heading')}</h2>
          <form onSubmit={(e) => e.preventDefault()} className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 space-y-5" aria-label={t('contact.heading')}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('contact.name')}</label>
                <input id="contact-name" type="text" required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('contact.email')}</label>
                <input id="contact-email" type="email" required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div>
              <label htmlFor="contact-subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('contact.subject.label')}</label>
              <select id="contact-subject" required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500">
                <option value="general">{t('contact.subject.general')}</option>
                <option value="support">{t('contact.subject.support')}</option>
                <option value="partnership">{t('contact.subject.partnership')}</option>
                <option value="press">{t('contact.subject.press')}</option>
              </select>
            </div>
            <div>
              <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('contact.message')}</label>
              <textarea id="contact-message" rows={5} required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 resize-y" />
            </div>
            <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-md">{t('contact.send')}</button>
          </form>
        </div>
      </section>
      <div data-testid="map-placeholder" className="h-64 bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
        <div className="text-center text-gray-400 dark:text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p>Pixelarium HQ, Warsaw, Poland</p>
        </div>
      </div>
    </div>
  );
}
