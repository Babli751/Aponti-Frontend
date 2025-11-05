import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Load from localStorage or default to 'en'
    return localStorage.getItem('booksyPro_language') || 'en';
  });

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('booksyPro_language', newLanguage);
  };

  useEffect(() => {
    // Save to localStorage whenever language changes
    localStorage.setItem('booksyPro_language', language);
  }, [language]);

  const value = {
    language,
    changeLanguage,
    t: getTranslations(language)
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Centralized translations
const getTranslations = (lang) => {
  const translations = {
    en: {
      // Common
      brand: 'Aponti',
      currency: '€',
      home: 'Home',
      services: 'Services',
      offers: 'Offers',
      about: 'About',
      company: 'Company',
      support: 'Support',
      login: 'Sign In',
      signup: 'Sign Up',

      // Home page
      heroTitle: 'Find Your Perfect Service',
      heroSubtitle: 'Book appointments with top-rated businesses across Europe',
      searchService: 'What service do you need?',
      searchLocation: 'Where?',
      searchButton: 'Search',
      featuredBusinesses: 'Featured Businesses',
      bookAppointment: 'Book Now',
      verified: 'Verified',
      new: 'New',
      mostPreferred: 'Most Popular',
      nextAvailable: 'Next available',
      today: 'Today',
      starting: 'from',
      results: 'results',
      filter: 'Filter',
      sort: 'Sort',
      nearest: 'Nearest',
      popular: 'Most Popular',
      cheapest: 'Best Price',
      appointments: 'My Bookings',
      favorites: 'Favorites',
      profile: 'Profile',
      instantApproval: 'Instant Booking',
      happyCustomers: 'Happy Customers',
      instantBooking: 'Instant Booking',
      
      // Services page
      ourServices: 'Our Services',
      servicesSubtitle: 'Professional barber services across Europe',
      bookNow: 'Book Now',
      duration: 'Duration',
      price: 'Starting from',
      traditional: 'Traditional',
      premium: 'Premium',
      minutes: 'min',
      
      // About page
      aboutUs: 'About Us',
      aboutSubtitle: 'Connecting you with Europe\'s finest barbers',
      ourMission: 'Our Mission',
      ourVision: 'Our Vision',
      ourValues: 'Our Values',
      stats: 'Our Impact',
      team: 'Leadership Team',
      joinUs: 'Join Us Today',
      
      // Offers page
      specialOffers: 'Special Offers',
      offersSubtitle: 'Save more on your favorite barber services',
      claimOffer: 'Claim Offer',
      validUntil: 'Valid until',
      newCustomers: 'New Customers',
      limitedTime: 'Limited Time',
      
      // Company page
      companyInfo: 'Company Information',
      careers: 'Careers',
      press: 'Press',
      partners: 'Partners',
      contact: 'Contact',
      
      // Support page
      helpCenter: 'Help Center',
      contactUs: 'Contact Us',
      faq: 'FAQ',
      safety: 'Safety',

      // Additional common translations
      exclusive: 'Exclusive',
      termsApply: 'Terms and conditions apply',
      getStarted: 'Get Started',
      learnMore: 'Learn More',
      readMore: 'Read More',
      showMore: 'Show More',
      showLess: 'Show Less',
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      delete: 'Delete',
      edit: 'Edit',
      update: 'Update',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Information',

      // Business specific translations
      reviews: 'reviews',
      businesses: 'Businesses',
      business: 'business',
      traditionalLabel: 'Traditional',
      premiumLabel: 'Premium',

      // Business translations
      tryBusiness: 'Try Business',
      businessSignup: 'Business Signup',
      businessPortal: 'Business Portal',
      businessDashboard: 'Business Dashboard',
      joinOurNetwork: 'Join Our Network',
      businessSubtitle: 'Grow your barber business with us',
      businessName: 'Business Name',
      ownerName: 'Owner Name',
      businessAddress: 'Business Address',
      city: 'City',
      phoneNumber: 'Phone Number',
      businessDescription: 'Business Description',
      addService: 'Add Service',
      serviceName: 'Service Name',
      servicePrice: 'Price',
      serviceDuration: 'Duration (minutes)',
      manageServices: 'Manage Services',
      businessInfo: 'Business Information',
      getStartedBusiness: 'Get Started for Business',
      whyJoinUs: 'Why Join Us?',
      increaseBookings: 'Increase Bookings',
      easyManagement: 'Easy Management',
      growYourBusiness: 'Grow Your Business'
    },
    tr: {
      // Common
      brand: 'Aponti',
      currency: '€',
      home: 'Ana Sayfa',
      services: 'Hizmetler',
      offers: 'Teklifler',
      about: 'Hakkımızda',
      company: 'Şirket',
      support: 'Destek',
      login: 'Giriş',
      signup: 'Kayıt Ol',

      // Home page
      heroTitle: 'Mükemmel Hizmetinizi Bulun',
      heroSubtitle: 'Avrupa\'nın en iyi işletmelerinden randevu alın',
      searchService: 'Hangi hizmete ihtiyacınız var?',
      searchLocation: 'Nerede?',
      searchButton: 'Ara',
      featuredBusinesses: 'Öne Çıkan İşletmeler',
      bookAppointment: 'Hemen Rezervasyon',
      verified: 'Doğrulanmış',
      new: 'Yeni',
      mostPreferred: 'En Popüler',
      nextAvailable: 'Sonraki müsait',
      today: 'Bugün',
      starting: 'başlangıç',
      results: 'sonuç',
      filter: 'Filtrele',
      sort: 'Sırala',
      nearest: 'En Yakın',
      popular: 'En Popüler',
      cheapest: 'En Uygun',
      appointments: 'Rezervasyonlarım',
      favorites: 'Favorilerim',
      profile: 'Profilim',
      instantApproval: 'Anında Onay',
      happyCustomers: 'Mutlu Müşteri',
      instantBooking: 'Anında Rezervasyon',
      
      // Services page
      ourServices: 'Hizmetlerimiz',
      servicesSubtitle: 'Avrupa genelinde profesyonel berber hizmetleri',
      bookNow: 'Rezervasyon Yap',
      duration: 'Süre',
      price: 'Başlangıç',
      traditional: 'Geleneksel',
      premium: 'Premium',
      minutes: 'dk',
      
      // About page
      aboutUs: 'Hakkımızda',
      aboutSubtitle: 'Sizi Avrupa\'nın en iyi berberleriyle buluşturuyoruz',
      ourMission: 'Misyonumuz',
      ourVision: 'Vizyonumuz',
      ourValues: 'Değerlerimiz',
      stats: 'Etkimiz',
      team: 'Yönetim Ekibi',
      joinUs: 'Bugün Katılın',
      
      // Offers page
      specialOffers: 'Özel Teklifler',
      offersSubtitle: 'Favori berber hizmetlerinizde daha fazla tasarruf edin',
      claimOffer: 'Teklifi Al',
      validUntil: 'Geçerlilik tarihi',
      newCustomers: 'Yeni Müşteriler',
      limitedTime: 'Sınırlı Süre',
      
      // Company page
      companyInfo: 'Şirket Bilgileri',
      careers: 'Kariyer',
      press: 'Basın',
      partners: 'Ortaklar',
      contact: 'İletişim',
      
      // Support page
      helpCenter: 'Yardım Merkezi',
      contactUs: 'İletişim',
      faq: 'SSS',
      safety: 'Güvenlik',

      // Additional common translations
      exclusive: 'Özel',
      termsApply: 'Şartlar ve koşullar geçerlidir',
      getStarted: 'Başlayın',
      learnMore: 'Daha Fazla Öğren',
      readMore: 'Devamını Oku',
      showMore: 'Daha Fazla Göster',
      showLess: 'Daha Az Göster',
      save: 'Kaydet',
      cancel: 'İptal',
      confirm: 'Onayla',
      delete: 'Sil',
      edit: 'Düzenle',
      update: 'Güncelle',
      close: 'Kapat',
      back: 'Geri',
      next: 'İleri',
      previous: 'Önceki',
      submit: 'Gönder',
      loading: 'Yükleniyor...',
      error: 'Hata',
      success: 'Başarılı',
      warning: 'Uyarı',
      info: 'Bilgi',

      // Business specific translations
      reviews: 'yorum',
      businesses: 'İşletme',
      business: 'işletme',
      traditionalLabel: 'Geleneksel',
      premiumLabel: 'Premium',

      // Business translations
      tryBusiness: 'İşletme Deneyin',
      businessSignup: 'İşletme Kaydı',
      businessPortal: 'İşletme Portalı',
      businessDashboard: 'İşletme Paneli',
      joinOurNetwork: 'Ağımıza Katılın',
      businessSubtitle: 'Berber işletmenizi bizimle büyütün',
      businessName: 'İşletme Adı',
      ownerName: 'Sahip Adı',
      businessAddress: 'İşletme Adresi',
      city: 'Şehir',
      phoneNumber: 'Telefon Numarası',
      businessDescription: 'İşletme Açıklaması',
      addService: 'Hizmet Ekle',
      serviceName: 'Hizmet Adı',
      servicePrice: 'Fiyat',
      serviceDuration: 'Süre (dakika)',
      manageServices: 'Hizmetleri Yönet',
      businessInfo: 'İşletme Bilgileri',
      getStartedBusiness: 'İşletme İçin Başlayın',
      whyJoinUs: 'Neden Bize Katılın?',
      increaseBookings: 'Rezervasyonları Artırın',
      easyManagement: 'Kolay Yönetim',
      growYourBusiness: 'İşletmenizi Büyütün'
    },
    ru: {
      // Common
      brand: 'Aponti',
      currency: '€',
      home: 'Главная',
      services: '��слуги',
      offers: 'Предложения',
      about: 'О нас',
      company: 'Компания',
      support: 'Поддержка',
      login: 'Войти',
      signup: 'Регистрация',
      
      // Home page
      heroTitle: 'Найдите своего идеального парикмахера',
      heroSubtitle: 'Записывайтесь к лучшим парикмахерам по всей Европе',
      searchService: 'Какая услуга вам нужна?',
      searchLocation: 'Где?',
      searchButton: 'Поиск',
      featuredBarbers: 'Рекомендуемые парикмахеры',
      bookAppointment: 'Забронировать',
      verified: 'Проверено',
      new: 'Новый',
      mostPreferred: 'Самый популярный',
      nextAvailable: 'Следующий доступный',
      today: 'Сегодня',
      starting: 'от',
      results: 'результатов',
      filter: 'Фильтр',
      sort: 'Сортировка',
      nearest: 'Ближайшие',
      popular: 'Популярные',
      cheapest: 'Лучшая цена',
      appointments: 'Мои бронирования',
      favorites: 'Избранное',
      profile: 'Профиль',
      instantApproval: 'Мгновенное бронирование',
      happyCustomers: 'Довольных клиентов',
      instantBooking: 'Мгновенное бронирование',
      
      // Services page
      ourServices: 'Наши услуги',
      servicesSubtitle: 'Профессиональные парикмахерские услуги по всей Европе',
      bookNow: 'Забронировать',
      duration: 'Продолжительность',
      price: 'Начиная от',
      traditional: 'Традицион��ая',
      premium: 'Премиум',
      minutes: 'мин',
      
      // About page
      aboutUs: 'О нас',
      aboutSubtitle: 'Соединяем вас с лучшими парикмахерами Европы',
      ourMission: 'Наша миссия',
      ourVision: 'Наше видение',
      ourValues: 'Наши ценности',
      stats: 'Наше влияние',
      team: 'Команда руководства',
      joinUs: 'Присоединяйтесь сегодня',
      
      // Offers page
      specialOffers: 'Специальные предложения',
      offersSubtitle: 'Экономьте больше на ваших любимых парикмахерских услугах',
      claimOffer: 'Получить предложение',
      validUntil: 'Действительно до',
      newCustomers: 'Новые клиенты',
      limitedTime: 'Ограниченное время',
      
      // Company page
      companyInfo: 'Информация о компании',
      careers: 'Карьера',
      press: 'Пресса',
      partners: 'Партнеры',
      contact: 'Контакты',
      
      // Support page
      helpCenter: 'Центр помощи',
      contactUs: 'Связаться с нам��',
      faq: 'FAQ',
      safety: 'Безопасность',

      // Additional common translations
      exclusive: 'Эксклюзивно',
      termsApply: 'Применяются условия и положения',
      getStarted: 'Начать',
      learnMore: 'Узнать больше',
      readMore: 'Читать далее',
      showMore: 'Показать больше',
      showLess: 'Показать меньше',
      save: 'Сохранить',
      cancel: 'Отмена',
      confirm: 'Подтвердить',
      delete: 'Удалить',
      edit: 'Редактировать',
      update: 'Обновить',
      close: 'Закрыть',
      back: 'Назад',
      next: 'Далее',
      previous: 'Предыдущий',
      submit: 'Отправить',
      loading: 'Загрузка...',
      error: 'Ошибка',
      success: 'Успех',
      warning: 'Предупреждение',
      info: 'Информация',

      // Business specific translations
      reviews: 'отзывов',
      businesses: 'Предприятий',
      business: 'предприятий',
      traditionalLabel: 'Традиционный',
      premiumLabel: 'Премиум',

      // Business translations
      tryBusiness: 'Попр��бовать бизнес',
      businessSignup: 'Регистрация бизнеса',
      businessPortal: 'Бизнес-портал',
      businessDashboard: 'Бизнес-панель',
      joinOurNetwork: 'Присоединитесь к нашей сети',
      businessSubtitle: 'Развивайте свой парикмахерский бизнес с нами',
      businessName: 'Название бизнеса',
      ownerName: 'Имя владельца',
      businessAddress: 'Адрес бизнеса',
      city: 'Город',
      phoneNumber: 'Номер телефона',
      businessDescription: 'Описание бизнеса',
      addService: 'Добавить услугу',
      serviceName: 'Название услуги',
      servicePrice: 'Цена',
      serviceDuration: 'Продолжительность (минуты)',
      manageServices: 'Управление услугами',
      businessInfo: 'Информация о бизнесе',
      getStartedBusiness: 'Начать для бизнеса',
      whyJoinUs: 'Почему стоит присоединиться?',
      increaseBookings: 'Увеличьте бронирования',
      easyManagement: 'Простое управление',
      growYourBusiness: 'Развивай��е свой бизнес'
    }
  };

  return translations[lang] || translations.en;
};

export default LanguageContext;
