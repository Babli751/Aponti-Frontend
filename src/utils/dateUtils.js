/**
 * Date and time formatting utilities
 * Handles timezone conversion and locale-specific formatting
 */

/**
 * Get locale string based on language
 */
export const getLocale = (language) => {
  const locales = {
    en: 'en-US',
    tr: 'tr-TR',
    ru: 'ru-RU'
  };
  return locales[language] || 'en-US';
};

/**
 * Format date to locale string
 */
export const formatDate = (dateString, language = 'en', options = {}) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const locale = getLocale(language);

  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };

  return date.toLocaleDateString(locale, defaultOptions);
};

/**
 * Format time to locale string
 */
export const formatTime = (dateString, language = 'en', options = {}) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const locale = getLocale(language);

  const defaultOptions = {
    hour: '2-digit',
    minute: '2-digit',
    ...options
  };

  return date.toLocaleTimeString(locale, defaultOptions);
};

/**
 * Format date and time together
 */
export const formatDateTime = (dateString, language = 'en') => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const locale = getLocale(language);

  return date.toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export const formatRelativeTime = (dateString, language = 'en') => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date - now;
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  const translations = {
    en: {
      now: 'just now',
      minutesAgo: (n) => `${n} minute${n !== 1 ? 's' : ''} ago`,
      hoursAgo: (n) => `${n} hour${n !== 1 ? 's' : ''} ago`,
      daysAgo: (n) => `${n} day${n !== 1 ? 's' : ''} ago`,
      inMinutes: (n) => `in ${n} minute${n !== 1 ? 's' : ''}`,
      inHours: (n) => `in ${n} hour${n !== 1 ? 's' : ''}`,
      inDays: (n) => `in ${n} day${n !== 1 ? 's' : ''}`
    },
    tr: {
      now: 'şimdi',
      minutesAgo: (n) => `${n} dakika önce`,
      hoursAgo: (n) => `${n} saat önce`,
      daysAgo: (n) => `${n} gün önce`,
      inMinutes: (n) => `${n} dakika içinde`,
      inHours: (n) => `${n} saat içinde`,
      inDays: (n) => `${n} gün içinde`
    },
    ru: {
      now: 'только что',
      minutesAgo: (n) => `${n} минут${n !== 1 ? 'ы' : 'у'} назад`,
      hoursAgo: (n) => `${n} час${n !== 1 ? 'а' : ''} назад`,
      daysAgo: (n) => `${n} дн${n !== 1 ? 'я' : 'ей'} назад`,
      inMinutes: (n) => `через ${n} минут${n !== 1 ? 'ы' : 'у'}`,
      inHours: (n) => `через ${n} час${n !== 1 ? 'а' : ''}`,
      inDays: (n) => `через ${n} дн${n !== 1 ? 'я' : 'ей'}`
    }
  };

  const t = translations[language] || translations.en;

  if (Math.abs(diffMins) < 1) return t.now;

  if (diffMs < 0) {
    // Past
    if (Math.abs(diffMins) < 60) return t.minutesAgo(Math.abs(diffMins));
    if (Math.abs(diffHours) < 24) return t.hoursAgo(Math.abs(diffHours));
    return t.daysAgo(Math.abs(diffDays));
  } else {
    // Future
    if (diffMins < 60) return t.inMinutes(diffMins);
    if (diffHours < 24) return t.inHours(diffHours);
    return t.inDays(diffDays);
  }
};

/**
 * Get current date in ISO format for date input min value
 */
export const getTodayISO = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Check if a date is today
 */
export const isToday = (dateString) => {
  if (!dateString) return false;

  const date = new Date(dateString);
  const today = new Date();

  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

/**
 * Check if a date is in the past
 */
export const isPast = (dateString) => {
  if (!dateString) return false;
  return new Date(dateString) < new Date();
};

/**
 * Check if a date is in the future
 */
export const isFuture = (dateString) => {
  if (!dateString) return false;
  return new Date(dateString) > new Date();
};
