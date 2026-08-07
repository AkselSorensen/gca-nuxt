const LOCALE_KEY = 'gsa-locale'

export type Locale = 'fr' | 'en' | 'tr'

const labels: Record<Locale, string> = { fr: 'FR', en: 'EN', tr: 'TR' }
const flagEmoji: Record<Locale, string> = { fr: '🇫🇷', en: '🇬🇧', tr: '🇹🇷' }

const messages: Record<Locale, Record<string, string>> = {
  fr: {
    'nav.home': 'Accueil',
    'nav.marketplace': 'Marketplace',
    'nav.services': 'Prestation',
    'nav.about': 'À propos',
    'nav.login': 'Connexion',
    'nav.register': "S'inscrire",
    'nav.profile': 'Mon profil',
    'nav.shop': 'Ma boutique',
    'nav.downloads': 'Mes téléchargements',
    'nav.seller': 'Espace vendeur',
    'nav.admin': 'Administration',
    'nav.logout': 'Déconnexion',
    'lang': 'Langue',
  },
  en: {
    'nav.home': 'Home',
    'nav.marketplace': 'Marketplace',
    'nav.services': 'Services',
    'nav.about': 'About',
    'nav.login': 'Sign in',
    'nav.register': 'Sign up',
    'nav.profile': 'My profile',
    'nav.shop': 'My shop',
    'nav.downloads': 'My downloads',
    'nav.seller': 'Seller dashboard',
    'nav.admin': 'Administration',
    'nav.logout': 'Log out',
    'lang': 'Language',
  },
  tr: {
    'nav.home': 'Ana Sayfa',
    'nav.marketplace': 'Market',
    'nav.services': 'Hizmetler',
    'nav.about': 'Hakkımızda',
    'nav.login': 'Giriş',
    'nav.register': 'Kayıt Ol',
    'nav.profile': 'Profilim',
    'nav.shop': "Mağazam",
    'nav.downloads': 'İndirdiklerim',
    'nav.seller': 'Satıcı Paneli',
    'nav.admin': 'Yönetim',
    'nav.logout': 'Çıkış',
    'lang': 'Dil',
  },
}

const locale = ref<Locale>('fr')

function initLocale() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(LOCALE_KEY) as Locale | null
    if (saved && ['fr', 'en', 'tr'].includes(saved)) {
      locale.value = saved
    }
  }
}

function setLocale(l: Locale) {
  locale.value = l
  localStorage.setItem(LOCALE_KEY, l)
}

function t(key: string, fallback?: string): string {
  return messages[locale.value]?.[key] ?? fallback ?? key
}

export function useLang() {
  return { locale, labels, flagEmoji, initLocale, setLocale, t }
}
