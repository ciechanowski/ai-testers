import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en/common.json';
import enHome from './locales/en/home.json';
import enLive from './locales/en/live.json';
import enGallery from './locales/en/gallery.json';
import enArtwork from './locales/en/artwork.json';
import enCart from './locales/en/cart.json';
import enLogin from './locales/en/login.json';
import enAbout from './locales/en/about.json';
import enActivity from './locales/en/activity.json';
import enStudio from './locales/en/studio.json';
import enPayouts from './locales/en/payouts.json';
import enInsights from './locales/en/insights.json';

import plCommon from './locales/pl/common.json';
import plHome from './locales/pl/home.json';
import plLive from './locales/pl/live.json';
import plGallery from './locales/pl/gallery.json';
import plArtwork from './locales/pl/artwork.json';
import plCart from './locales/pl/cart.json';
import plLogin from './locales/pl/login.json';
import plAbout from './locales/pl/about.json';
import plActivity from './locales/pl/activity.json';
import plStudio from './locales/pl/studio.json';
import plPayouts from './locales/pl/payouts.json';
import plInsights from './locales/pl/insights.json';

import deCommon from './locales/de/common.json';
import deHome from './locales/de/home.json';
import deLive from './locales/de/live.json';
import deGallery from './locales/de/gallery.json';
import deArtwork from './locales/de/artwork.json';
import deCart from './locales/de/cart.json';
import deLogin from './locales/de/login.json';
import deAbout from './locales/de/about.json';
import deActivity from './locales/de/activity.json';
import deStudio from './locales/de/studio.json';
import dePayouts from './locales/de/payouts.json';
import deInsights from './locales/de/insights.json';

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon, home: enHome, live: enLive, gallery: enGallery, artwork: enArtwork, cart: enCart, login: enLogin, about: enAbout, activity: enActivity, studio: enStudio, payouts: enPayouts, insights: enInsights },
      pl: { common: plCommon, home: plHome, live: plLive, gallery: plGallery, artwork: plArtwork, cart: plCart, login: plLogin, about: plAbout, activity: plActivity, studio: plStudio, payouts: plPayouts, insights: plInsights },
      de: { common: deCommon, home: deHome, live: deLive, gallery: deGallery, artwork: deArtwork, cart: deCart, login: deLogin, about: deAbout, activity: deActivity, studio: deStudio, payouts: dePayouts, insights: deInsights },
    },
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'] },
  });

export default i18n;
