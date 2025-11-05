import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import api, { businessAPI } from '../services/api';
import { 
  Box,
  Typography,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  CardMedia,
  Button,
  Grid,
  Container,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Stack,
  MenuItem,
  FormControl,
  Select,
  Link,
  Divider,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  BottomNavigation,
  BottomNavigationAction,
  Fab,
  Menu
} from '@mui/material';
import {
  Search,
  LocationOn,
  Star,
  Person,
  Notifications,
  Schedule,
  Favorite,
  ContentCut,
  LocalOffer,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Copyright,
  CalendarToday,
  CheckCircle,
  Menu as MenuIcon,
  Home as HomeIcon,
  AccountCircle,
  Close,
  Business,
  Support as SupportIcon,
  Logout,
  Settings,
  Work,
  People,
  ExpandMore
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

  const [searchLocation, setSearchLocation] = useState('Berlin, Germany');
  const [searchService, setSearchService] = useState('');

  // Category selection flow states
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [selectedWorker, setSelectedWorker] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [categoryBusinesses, setCategoryBusinesses] = useState([]);
  const [businessWorkers, setBusinessWorkers] = useState([]);
  const [workerServices, setWorkerServices] = useState([]);

  const { language, changeLanguage, t: translations } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bottomNavValue, setBottomNavValue] = useState(0);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [userLocation, setUserLocation] = useState({ lat: 41.0082, lng: 28.9784, city: 'istanbul' }); // Default: Istanbul
  const [featuredBusinesses, setFeaturedBusinesses] = useState([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);

  // Map section states
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [mapCategory, setMapCategory] = useState('all');

  // Get user's location on mount and when authentication changes
  useEffect(() => {
    // Only request geolocation if user is signed in
    if (isAuthenticated && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('User location detected:', position.coords);
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Geolocation error:', error.message, 'code:', error.code);
          // Silently fallback to Istanbul if geolocation fails
          console.log('Using default location (Istanbul)');
          setUserLocation({ lat: 41.0082, lng: 28.9784 });
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else if (isAuthenticated) {
      // Browser doesn't support geolocation, use default
      console.log('Geolocation not supported, using Istanbul');
      setUserLocation({ lat: 41.0082, lng: 28.9784 });
    }
  }, [isAuthenticated]);

  // Fetch featured businesses
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoadingBusinesses(true);

        // Try to fetch businesses from API
        let data;
        try {
          data = await businessAPI.getBusinesses();
        } catch (apiError) {
          console.error('Primary API error:', apiError);
          // Try alternative endpoint
          try {
            const response = await api.get('/business/list');
            data = response.data;
          } catch (altError) {
            console.error('Alternative API error:', altError);
            throw altError;
          }
        }

        console.log('Fetched businesses RAW:', data);
        console.log('Fetched businesses TYPE:', typeof data, Array.isArray(data));

        // Handle different response formats
        let businesses = [];
        if (Array.isArray(data)) {
          businesses = data;
        } else if (data && Array.isArray(data.businesses)) {
          businesses = data.businesses;
        } else if (data && Array.isArray(data.data)) {
          businesses = data.data;
        } else if (data && typeof data === 'object') {
          // If it's an object, try to extract an array
          const values = Object.values(data);
          if (values.length > 0 && typeof values[0] === 'object') {
            businesses = values;
          }
        }

        console.log('Processed businesses:', businesses.length, businesses);

        // Filter out invalid entries and limit to 6
        const validBusinesses = businesses.filter(b =>
          b && (b.business_name || b.name || b.id)
        ).slice(0, 6);

        console.log('Valid businesses for display:', validBusinesses.length, validBusinesses);

        // Fetch workers and services count for each business
        const businessesWithCounts = await Promise.all(
          validBusinesses.map(async (business) => {
            try {
              // Fetch workers for this business
              const workersResponse = await api.get(`/business/${business.id}/workers`);
              const workers = Array.isArray(workersResponse.data) ? workersResponse.data :
                              Array.isArray(workersResponse.data?.workers) ? workersResponse.data.workers : [];

              // Fetch services for this business
              const servicesResponse = await api.get(`/business/${business.id}/services`);
              const services = Array.isArray(servicesResponse.data) ? servicesResponse.data :
                               Array.isArray(servicesResponse.data?.services) ? servicesResponse.data.services : [];

              console.log(`Business ${business.id}: ${workers.length} workers, ${services.length} services`);

              return {
                ...business,
                workers_count: workers.length,
                services_count: services.length
              };
            } catch (err) {
              console.error(`Error fetching counts for business ${business.id}:`, err);
              return {
                ...business,
                workers_count: 0,
                services_count: 0
              };
            }
          })
        );

        console.log('Businesses with counts:', businessesWithCounts);
        setFeaturedBusinesses(businessesWithCounts);
      } catch (error) {
        console.error('Error fetching businesses:', error);
        console.error('Error details:', error.response?.data, error.message);
        setFeaturedBusinesses([]);
      } finally {
        setLoadingBusinesses(false);
      }
    };
    fetchBusinesses();
  }, []);

  // Use centralized translations
  const t = translations;

  // Available categories - matching AppointmentNew page
  const categories = [
    { id: 'beauty', label: language === 'en' ? '💅 Beauty & Wellness' : language === 'tr' ? '💅 Güzellik & Sağlık' : '💅 Красота' },
    { id: 'barber', label: language === 'en' ? '💈 Barber' : language === 'tr' ? '💈 Berber' : '💈 Парикмахер' },
    { id: 'automotive', label: language === 'en' ? '🚗 Automotive' : language === 'tr' ? '🚗 Otomotiv' : '🚗 Авто' },
    { id: 'pet_care', label: language === 'en' ? '🐾 Pet Care' : language === 'tr' ? '🐾 Evcil Hayvan' : '🐾 Питомцы' },
    { id: 'home_services', label: language === 'en' ? '🏠 Home Services' : language === 'tr' ? '🏠 Ev Hizmetleri' : '🏠 Дом' },
    { id: 'health', label: language === 'en' ? '⚕️ Health' : language === 'tr' ? '⚕️ Sağlık' : '⚕️ Здоровье' },
    { id: 'other', label: language === 'en' ? '📋 Other' : language === 'tr' ? '📋 Diğer' : '📋 Другое' }
  ];

  // Handle category selection
  const handleCategorySelect = async (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedBusiness('');
    setSelectedWorker('');
    setSelectedService('');

    console.log('🔍 Selected category:', categoryId);
    console.log('📋 All businesses:', featuredBusinesses);
    console.log('🔢 Total businesses:', featuredBusinesses.length);

    // Filter businesses by category
    const filtered = featuredBusinesses.filter(b => {
      const businessCat = (b.category || b.business_type || 'barber').toLowerCase().trim();
      const selectedCat = categoryId.toLowerCase().trim();

      console.log(`🏢 Business "${b.business_name || b.name}": category="${businessCat}" vs selected="${selectedCat}"`);

      // Match exact category or if business category contains selected category
      const matches = businessCat === selectedCat || businessCat.includes(selectedCat) || selectedCat.includes(businessCat);

      if (matches) {
        console.log(`✅ MATCH: "${b.business_name || b.name}" matches category "${selectedCat}"`);
      }

      return matches;
    });

    console.log('✨ Filtered businesses for category', categoryId, ':', filtered);
    console.log('📊 Found', filtered.length, 'businesses');
    setCategoryBusinesses(filtered);
  };

  // Handle business selection
  const handleBusinessSelect = async (businessId) => {
    setSelectedBusiness(businessId);
    setSelectedWorker('');
    setSelectedService('');

    console.log('Fetching workers for business:', businessId);

    try {
      // Fetch real workers from API
      const response = await api.get(`/business/${businessId}/workers`);
      console.log('Workers API response:', response.data);

      let workers = [];
      if (Array.isArray(response.data)) {
        workers = response.data;
      } else if (Array.isArray(response.data?.workers)) {
        workers = response.data.workers;
      } else if (response.data && typeof response.data === 'object') {
        workers = Object.values(response.data);
      }

      console.log('Processed workers:', workers);
      setBusinessWorkers(workers);
    } catch (error) {
      console.error('Error fetching workers:', error);
      setBusinessWorkers([]);
    }
  };

  // Handle worker selection
  const handleWorkerSelect = async (workerId) => {
    setSelectedWorker(workerId);
    setSelectedService('');

    console.log('Fetching services for worker:', workerId);

    try {
      // Fetch real services from API
      const response = await api.get(`/business/worker/${workerId}/services`);
      console.log('Services API response:', response.data);

      let services = [];
      if (Array.isArray(response.data)) {
        services = response.data;
      } else if (Array.isArray(response.data?.services)) {
        services = response.data.services;
      } else if (response.data && typeof response.data === 'object') {
        services = Object.values(response.data);
      }

      console.log('Processed services:', services);
      setWorkerServices(services);
    } catch (error) {
      console.error('Error fetching services:', error);
      setWorkerServices([]);
    }
  };

  // Handle Book Now - Create booking directly from home page
  const handleBookNow = async () => {
    console.log('📅 Book Now clicked!', {
      business: selectedBusiness,
      worker: selectedWorker,
      service: selectedService,
      date: selectedDate,
      time: selectedTime
    });

    if (selectedBusiness && selectedWorker && selectedService && selectedDate && selectedTime) {
      try {
        // Combine date and time into ISO format
        const startTime = `${selectedDate}T${selectedTime}:00`;

        // Create booking
        const response = await api.post('/bookings/', {
          service_id: parseInt(selectedService),
          barber_id: parseInt(selectedWorker),
          start_time: startTime
        });

        console.log('✅ Booking created:', response.data);

        // Show success message
        alert(language === 'en'
          ? 'Booking successful! Redirecting to dashboard...'
          : language === 'tr'
            ? 'Rezervasyon başarılı! Yönlendiriliyor...'
            : 'Бронирование успешно! Перенаправление...');

        // Navigate to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('❌ Booking failed:', error);
        alert(language === 'en'
          ? 'Booking failed. Please try again.'
          : language === 'tr'
            ? 'Rezervasyon başarısız. Lütfen tekrar deneyin.'
            : 'Ошибка бронирования. Попробуйте еще раз.');
      }
    } else {
      // If something is not selected, show a message
      console.warn('❌ Please select all fields');
      alert(language === 'en'
        ? 'Please select Category, Business, Worker, Service, Date and Time!'
        : language === 'tr'
        ? 'Lütfen Kategori, İşletme, Çalışan, Hizmet, Tarih ve Saat seçin!'
        : 'Пожалуйста, выберите все поля!');
    }
  };

  // Map section handlers
  const handleFindMyLocation = () => {
    // First, show an informational prompt
    const confirmMessage = language === 'en'
      ? 'To find businesses near you, we need access to your location. Click OK to allow location access in the next prompt.'
      : language === 'tr'
      ? 'Size yakın işletmeleri bulmak için konumunuza erişmemiz gerekiyor. Sonraki uyarıda konum erişimine izin vermek için Tamam\'a tıklayın.'
      : 'Чтобы найти предприятия рядом с вами, нам нужен доступ к вашему местоположению. Нажмите OK, чтобы разрешить доступ к местоположению.';

    const userConfirmed = window.confirm(confirmMessage);

    if (!userConfirmed) {
      // User cancelled, use default location
      setUserLocation({ lat: 41.0082, lng: 28.9784 });
      alert(language === 'en'
        ? 'Location access cancelled. Showing Istanbul as default location.'
        : language === 'tr'
        ? 'Konum erişimi iptal edildi. Varsayılan olarak İstanbul gösteriliyor.'
        : 'Доступ к местоположению отменен. Показываем Стамбул по умолчанию.');
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          alert(language === 'en'
            ? 'Location found! Showing nearby businesses...'
            : language === 'tr'
            ? 'Konum bulundu! Yakındaki işletmeler gösteriliyor...'
            : 'Местоположение найдено! Показываем ближайшие предприятия...');
        },
        (error) => {
          console.error('Geolocation error:', error);

          // Fallback to default location (Istanbul)
          const defaultLocation = { lat: 41.0082, lng: 28.9784 };
          setUserLocation(defaultLocation);

          let errorMessage = '';
          if (error.code === 1) {
            // PERMISSION_DENIED
            errorMessage = language === 'en'
              ? 'Location access denied. Showing Istanbul as default location. To enable location access, please check your browser settings (usually in the address bar or browser settings).'
              : language === 'tr'
              ? 'Konum erişimi reddedildi. Varsayılan olarak İstanbul gösteriliyor. Konum erişimini açmak için tarayıcı ayarlarınızı kontrol edin (genellikle adres çubuğunda veya tarayıcı ayarlarında).'
              : 'Доступ к местоположению запрещен. Показываем Стамбул по умолчанию. Включите доступ к местоположению в настройках браузера.';
          } else if (error.code === 2) {
            // POSITION_UNAVAILABLE
            errorMessage = language === 'en'
              ? 'Location unavailable. Showing Istanbul as default location.'
              : language === 'tr'
              ? 'Konum bilgisi bulunamadı. Varsayılan olarak İstanbul gösteriliyor.'
              : 'Местоположение недоступно. Показываем Стамбул по умолчанию.';
          } else {
            // TIMEOUT
            errorMessage = language === 'en'
              ? 'Location request timed out. Showing Istanbul as default location.'
              : language === 'tr'
              ? 'Konum isteği zaman aşımına uğradı. Varsayılan olarak İstanbul gösteriliyor.'
              : 'Истекло время запроса местоположения. Показываем Стамбул по умолчанию.';
          }

          alert(errorMessage);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      // Fallback to default location
      setUserLocation({ lat: 41.0082, lng: 28.9784 });
      alert(language === 'en'
        ? 'Geolocation is not supported by your browser. Showing Istanbul as default location.'
        : language === 'tr'
        ? 'Tarayıcınız konum özelliğini desteklemiyor.'
        : 'Ваш браузер не поддерживает геолокацию.');
    }
  };

  const handleMapSearch = () => {
    // Filter businesses based on map search query and category
    console.log('Searching:', { query: mapSearchQuery, category: mapCategory });
    // This would trigger the map to show filtered results
    alert(language === 'en'
      ? `Searching for ${mapCategory === 'all' ? 'all services' : mapCategory} near "${mapSearchQuery || 'current location'}"...`
      : language === 'tr'
      ? `"${mapSearchQuery || 'mevcut konum'}" yakınında ${mapCategory === 'all' ? 'tüm hizmetler' : mapCategory} aranıyor...`
      : `Поиск ${mapCategory === 'all' ? 'всех услуг' : mapCategory} рядом с "${mapSearchQuery || 'текущее местоположение'}"...`);
  };

  // Showcase categories for beauty salons and barber shops
  const showcaseCategories = [
    {
      id: 1,
      title: language === 'en' ? 'Premium Barbershops' : language === 'tr' ? 'Premium Berber Salonları' : 'Премиум парикмахерские',
      subtitle: language === 'en'
        ? 'Traditional craftsmanship meets modern style'
        : language === 'tr'
        ? 'Geleneksel ustalık modern tarzla buluşuyor'
        : 'Традиционное мастерство встречает современный стиль',
      image: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=800&h=600&fit=crop',
      features: [
        language === 'en' ? 'Master Barbers' : language === 'tr' ? 'Usta Berberler' : 'Мастер-парикмахеры',
        language === 'en' ? 'Classic Cuts' : language === 'tr' ? 'Klasik Kesimler' : 'Классичес��ие стрижки',
        language === 'en' ? 'Hot Towel Service' : language === 'tr' ? 'S��cak Havlu Hizmeti' : 'Горячее полотенце'
      ]
    },
    {
      id: 2,
      title: language === 'en' ? 'Modern Hair Studios' : language === 'tr' ? 'Modern Saç Stüdyoları' : 'Современные студии волос',
      subtitle: language === 'en'
        ? 'Cutting-edge techniques and contemporary designs'
        : language === 'tr'
        ? 'Son teknoloji ve çağdaş tasarımlar'
        : 'Передовые техники и современный дизайн',
      image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=600&fit=crop',
      features: [
        language === 'en' ? 'Trendy Styles' : language === 'tr' ? 'Trend Saç Modelleri' : 'Модные стили',
        language === 'en' ? 'Color Specialists' : language === 'tr' ? 'Renk Uzmanları' : 'Специалисты по цвету',
        language === 'en' ? 'Hair Treatments' : language === 'tr' ? 'Saç Bakımı' : 'Уход за волосами'
      ]
    },
    {
      id: 3,
      title: language === 'en' ? 'Luxury Beauty Salons' : language === 'tr' ? 'Lüks Güzellik Salonları' : 'Роскошные салоны красоты',
      subtitle: language === 'en'
        ? 'Complete beauty experience with premium services'
        : language === 'tr'
        ? 'Premium hizmetlerle tam güzellik deneyimi'
        : 'Полноценный опыт красоты с премиум услугами',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop',
      features: [
        language === 'en' ? 'Full Service Salon' : language === 'tr' ? 'Tam Hizmet Salon' : 'Полный сервис салон',
        language === 'en' ? 'Skin Care' : language === 'tr' ? 'Cilt Bakımı' : 'Уход за кожей',
        language === 'en' ? 'Nail Services' : language === 'tr' ? 'Tırnak Hizmetleri' : 'Услуги маникюра'
      ]
    }
  ];


  const handleProfileMenuOpen = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
    navigate('/');
  };


  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#ffffff', minHeight: '100vh', pb: { xs: '70px', md: 0 } }}>
      {/* Responsive Navigation Bar */}
      <AppBar
        position="sticky"
        elevation={0}
        style={{
          backgroundColor: '#374151',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          color: 'white'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{
            justifyContent: 'space-between',
            py: { xs: 0.5, md: 1 },
            minHeight: { xs: '56px', sm: '64px', md: '72px' },
            px: { xs: 0.5, sm: 1, md: 2 }
          }}>
            {/* Left Side - Brand + Mobile Menu */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {isMobile && (
                <IconButton
                  edge="start"
                  onClick={() => setDrawerOpen(true)}
                  sx={{ mr: 1, color: 'white' }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              <Logo size={isMobile ? "small" : "medium"} variant="white" />
              
              {/* Desktop/Tablet Navigation Links */}
              {!isMobile && (
                <Stack direction="row" spacing={{ md: 3, lg: 4 }} sx={{ ml: { md: 2, lg: 4 } }}>
                  <Button
                    color="inherit"
                    sx={{ fontWeight: 500 }}
                    onClick={() => navigate('/services')}
                  >
                    {t.services}
                  </Button>
                  <Button
                    color="inherit"
                    sx={{ fontWeight: 500 }}
                    onClick={() => navigate('/about')}
                  >
                    {t.about}
                  </Button>
                  <Button
                    color="inherit"
                    sx={{ fontWeight: 500 }}
                    onClick={() => navigate('/contact')}
                  >
                    {language === 'en' ? 'Contact Us' : language === 'tr' ? 'İletişim' : 'Контакт'}
                  </Button>
                </Stack>
              )}
            </Box>

            {/* Right Side - Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
              {/* Language Selector */}
              <FormControl size="small" sx={{ minWidth: { xs: 60, sm: 80, md: 100 } }}>
                <Select
                  value={language}
                  onChange={(e) => changeLanguage(e.target.value)}
                  sx={{
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                    '& .MuiSelect-select': { py: { xs: 0.5, md: 1 }, display: 'flex', alignItems: 'center', fontSize: { xs: '0.75rem', sm: '0.85rem', md: '1rem' } },
                    '& .MuiSvgIcon-root': { color: 'white' }
                  }}
                >
                  <MenuItem value="en">🇬�� {isMobile ? 'EN' : isTablet ? 'EN' : 'English'}</MenuItem>
                  <MenuItem value="tr">🇹🇷 {isMobile ? 'TR' : isTablet ? 'TR' : 'Türkçe'}</MenuItem>
                  <MenuItem value="ru">🇷🇺 {isMobile ? 'RU' : isTablet ? 'RU' : 'Русский'}</MenuItem>
                </Select>
              </FormControl>

              {/* Try Business Button */}
              <Button
                variant="contained"
                startIcon={<Business />}
                disableElevation={false}
                sx={{
                  backgroundColor: '#ef4444 !important',
                  background: '#ef4444 !important',
                  bgcolor: '#ef4444 !important',
                  color: 'white !important',
                  fontWeight: 600,
                  px: 3,
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4) !important',
                  backgroundImage: 'none !important',
                  '&:hover': {
                    backgroundColor: '#dc2626 !important',
                    background: '#dc2626 !important',
                    bgcolor: '#dc2626 !important',
                    backgroundImage: 'none !important',
                    boxShadow: '0 6px 16px rgba(239, 68, 68, 0.5) !important'
                  },
                  '&.MuiButton-contained': {
                    backgroundColor: '#ef4444 !important',
                    background: '#ef4444 !important',
                    backgroundImage: 'none !important'
                  },
                  '&.MuiButton-containedPrimary': {
                    backgroundColor: '#ef4444 !important',
                    background: '#ef4444 !important',
                    backgroundImage: 'none !important'
                  },
                  '&.Mui-focusVisible': {
                    backgroundColor: '#ef4444 !important',
                    background: '#ef4444 !important'
                  },
                  display: { xs: 'none', sm: 'flex' }
                }}
                style={{
                  backgroundColor: '#ef4444',
                  background: '#ef4444',
                  color: 'white'
                }}
                onClick={() => {
                  console.log('🔴 Try Business clicked - RED BUTTON VERSION');
                  navigate('/business-signup');
                }}
              >
                {t.tryBusiness}
              </Button>

              {!isMobile && (
                <>
                  {isAuthenticated ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton sx={{ color: 'white' }}>
                        <Notifications />
                      </IconButton>
                      <Button
                        onClick={handleProfileMenuOpen}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          color: 'white',
                          textTransform: 'none',
                          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                        }}
                      >
                        <Avatar
                          src={user?.avatar || user?.profile_picture || undefined}
                          sx={{ width: 32, height: 32, bgcolor: user?.avatar || user?.profile_picture ? 'transparent' : '#4b5563' }}
                        >
                          {!user?.avatar && !user?.profile_picture && (user?.name?.[0] || user?.first_name?.[0] || 'U')}
                        </Avatar>
                        {user?.name && (
                          <Box sx={{ textAlign: 'left', display: { xs: 'none', lg: 'block' } }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2, color: 'white' }}>
                              {user.name}
                            </Typography>
                          </Box>
                        )}
                        <ExpandMore sx={{ fontSize: 16 }} />
                      </Button>
                    </Box>
                  ) : (
                    <>
                      <Button
                        variant="contained"
                        sx={{
                          bgcolor: 'white',
                          color: '#2d3748',
                          fontWeight: 600,
                          px: 3,
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(255,255,255,0.3)'
                          },
                          transition: 'all 0.2s'
                        }}
                        onClick={() => navigate('/signin')}
                      >
                        {t.login}
                      </Button>
                      <Button
                        variant="contained"
                        sx={{
                          bgcolor: 'white',
                          color: '#2d3748',
                          fontWeight: 600,
                          px: 3,
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(255,255,255,0.3)'
                          },
                          transition: 'all 0.2s'
                        }}
                        onClick={() => navigate('/signup')}
                      >
                        {t.signup}
                      </Button>
                    </>
                  )}
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={handleProfileMenuClose}
        sx={{ mt: 1 }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => { navigate('/dashboard', { state: { scrollToProfile: true } }); handleProfileMenuClose(); }}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          {t.profile}
        </MenuItem>
        <MenuItem onClick={() => { navigate('/dashboard'); handleProfileMenuClose(); }}>
          <ListItemIcon>
            <Schedule fontSize="small" />
          </ListItemIcon>
          {t.appointments}
        </MenuItem>
        <MenuItem onClick={() => { navigate('/favorites'); handleProfileMenuClose(); }}>
          <ListItemIcon>
            <Favorite fontSize="small" />
          </ListItemIcon>
          {t.favorites}
        </MenuItem>
        <MenuItem onClick={() => { navigate('/settings'); handleProfileMenuClose(); }}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          {language === 'en' ? 'Settings' : language === 'tr' ? 'Ayarlar' : 'Настройки'}
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          {language === 'en' ? 'Sign Out' : language === 'tr' ? 'Çıkış Yap' : 'В��йти'}
        </MenuItem>
      </Menu>

      {/* Responsive Hero Section */}
      <Box data-search="hero" sx={{
        position: 'relative',
        height: { xs: '50vh', sm: '52vh', md: '400px', lg: '450px' },
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden'
      }}>
        {/* Animated GIF Background */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'url(https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0
          }}
        />
        {/* Dark Overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(26, 32, 44, 0.85) 0%, rgba(45, 55, 72, 0.75) 100%)',
            zIndex: 1
          }}
        />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ color: 'white', textAlign: { xs: 'center', md: 'left' } }}>
                <Typography variant="h1" component="h1" sx={{
                  fontWeight: 'bold',
                  mb: { xs: 2, sm: 2.5, md: 3 },
                  fontSize: { xs: '1.8rem', sm: '2.2rem', md: '3.5rem' },
                  lineHeight: { xs: 1.1, md: 1.2 }
                }}>
                  {t.heroTitle}
                </Typography>
                <Typography variant="h5" sx={{
                  mb: { xs: 3, sm: 3.5, md: 4 },
                  opacity: 0.95,
                  fontWeight: 300,
                  fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.4rem' },
                  lineHeight: { xs: 1.4, md: 1.5 }
                }}>
                  {t.heroSubtitle}
                </Typography>

                {/* Category Selection System - Side by Side with Arrows */}
                <Box sx={{
                  bgcolor: 'rgba(255,255,255,0.95)',
                  borderRadius: 3,
                  p: { xs: 2, md: 3 },
                  maxWidth: { xs: '100%', md: '100%' },
                  mb: { xs: 3, sm: 3.5, md: 4 }
                }}>
                  <Grid container spacing={2} alignItems="center">
                    {/* Category */}
                    <Grid item xs={12} sm={6} md={2.2}>
                      <FormControl fullWidth>
                        <Select
                          value={selectedCategory}
                          onChange={(e) => handleCategorySelect(e.target.value)}
                          displayEmpty
                          renderValue={(selected) => {
                            if (!selected) {
                              return <em style={{ color: '#9ca3af' }}>
                                {language === 'en' ? 'Category' : language === 'tr' ? 'Kategori' : 'Категория'}
                              </em>;
                            }
                            const cat = categories.find(c => c.id === selected);
                            return cat ? cat.label : selected;
                          }}
                          sx={{
                            bgcolor: 'white',
                            fontSize: { xs: '0.85rem', md: '0.95rem' },
                            minHeight: { xs: '48px', md: '56px' },
                            '& .MuiSelect-select': {
                              py: { xs: 1.5, md: 2 },
                              display: 'flex',
                              alignItems: 'center'
                            },
                            '& .MuiOutlinedInput-notchedOutline': { borderWidth: 2, borderColor: '#2d3748' }
                          }}
                        >
                          {categories.map(cat => (
                            <MenuItem key={cat.id} value={cat.id}>
                              {cat.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Arrow 1 */}
                    <Grid item xs={false} md={0.2} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
                      <Typography sx={{ fontSize: '1.5rem', color: selectedCategory ? '#2d3748' : '#d1d5db', fontWeight: 'bold' }}>→</Typography>
                    </Grid>

                    {/* Business */}
                    <Grid item xs={12} sm={6} md={2.2}>
                      <FormControl fullWidth disabled={!selectedCategory || categoryBusinesses.length === 0}>
                        <Select
                          value={selectedBusiness}
                          onChange={(e) => handleBusinessSelect(e.target.value)}
                          displayEmpty
                          renderValue={(selected) => {
                            if (!selected) {
                              return <em style={{ color: '#9ca3af' }}>
                                {language === 'en' ? 'Business' : language === 'tr' ? 'İşletme' : 'Бизнес'}
                              </em>;
                            }
                            const business = categoryBusinesses.find(b => b.id === selected);
                            return business ? (business.business_name || business.name) : selected;
                          }}
                          sx={{
                            bgcolor: 'white',
                            fontSize: { xs: '0.85rem', md: '0.95rem' },
                            minHeight: { xs: '48px', md: '56px' },
                            '& .MuiSelect-select': {
                              py: { xs: 1.5, md: 2 },
                              display: 'flex',
                              alignItems: 'center'
                            },
                            '& .MuiOutlinedInput-notchedOutline': { borderWidth: 2 }
                          }}
                        >
                          {categoryBusinesses.map(business => (
                            <MenuItem key={business.id} value={business.id}>
                              {business.business_name || business.name || 'Business'}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Arrow 2 */}
                    <Grid item xs={false} md={0.2} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
                      <Typography sx={{ fontSize: '1.5rem', color: selectedBusiness ? '#2d3748' : '#d1d5db', fontWeight: 'bold' }}>→</Typography>
                    </Grid>

                    {/* Worker */}
                    <Grid item xs={12} sm={6} md={2.2}>
                      <FormControl fullWidth disabled={!selectedBusiness || businessWorkers.length === 0}>
                        <Select
                          value={selectedWorker}
                          onChange={(e) => handleWorkerSelect(e.target.value)}
                          displayEmpty
                          renderValue={(selected) => {
                            if (!selected) {
                              return <em style={{ color: '#9ca3af' }}>
                                {language === 'en' ? 'Worker' : language === 'tr' ? 'Çalışan' : 'Работник'}
                              </em>;
                            }
                            const worker = businessWorkers.find(w => w.id === selected);
                            return worker ? worker.name : selected;
                          }}
                          sx={{
                            bgcolor: 'white',
                            fontSize: { xs: '0.85rem', md: '0.95rem' },
                            minHeight: { xs: '48px', md: '56px' },
                            '& .MuiSelect-select': {
                              py: { xs: 1.5, md: 2 },
                              display: 'flex',
                              alignItems: 'center'
                            },
                            '& .MuiOutlinedInput-notchedOutline': { borderWidth: 2 }
                          }}
                        >
                          {businessWorkers.map(worker => (
                            <MenuItem key={worker.id} value={worker.id}>
                              {worker.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Arrow 3 */}
                    <Grid item xs={false} md={0.2} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
                      <Typography sx={{ fontSize: '1.5rem', color: selectedWorker ? '#2d3748' : '#d1d5db', fontWeight: 'bold' }}>→</Typography>
                    </Grid>

                    {/* Service */}
                    <Grid item xs={12} sm={6} md={2.2}>
                      <FormControl fullWidth disabled={!selectedWorker || workerServices.length === 0}>
                        <Select
                          value={selectedService}
                          onChange={(e) => setSelectedService(e.target.value)}
                          displayEmpty
                          renderValue={(selected) => {
                            if (!selected) {
                              return <em style={{ color: '#9ca3af' }}>
                                {language === 'en' ? 'Service' : language === 'tr' ? 'Hizmet' : 'Услуга'}
                              </em>;
                            }
                            const service = workerServices.find(s => s.id === selected);
                            return service ? `${service.name} - €${service.price}` : selected;
                          }}
                          sx={{
                            bgcolor: 'white',
                            fontSize: { xs: '0.85rem', md: '0.95rem' },
                            minHeight: { xs: '48px', md: '56px' },
                            '& .MuiSelect-select': {
                              py: { xs: 1.5, md: 2 },
                              display: 'flex',
                              alignItems: 'center'
                            },
                            '& .MuiOutlinedInput-notchedOutline': { borderWidth: 2 }
                          }}
                        >
                          {workerServices.map(service => (
                            <MenuItem key={service.id} value={service.id}>
                              {service.name} - €{service.price} ({service.duration} min)
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Date Picker */}
                    <Grid item xs={12} sm={6} md={2.7}>
                      <TextField
                        fullWidth
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        disabled={!selectedService}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{
                          min: new Date().toISOString().split('T')[0]
                        }}
                        sx={{
                          bgcolor: 'white',
                          '& .MuiOutlinedInput-root': {
                            minHeight: { xs: '48px', md: '56px' },
                            '& fieldset': { borderWidth: 2 }
                          }
                        }}
                      />
                    </Grid>

                    {/* Time Picker */}
                    <Grid item xs={12} sm={6} md={2.7}>
                      <TextField
                        fullWidth
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        disabled={!selectedDate}
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          bgcolor: 'white',
                          '& .MuiOutlinedInput-root': {
                            minHeight: { xs: '48px', md: '56px' },
                            '& fieldset': { borderWidth: 2 }
                          }
                        }}
                      />
                    </Grid>

                    {/* Book Now Button */}
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={handleBookNow}
                        disabled={!selectedBusiness || !selectedWorker || !selectedService || !selectedDate || !selectedTime}
                        sx={{
                          bgcolor: '#00a693',
                          color: 'white',
                          fontWeight: 'bold',
                          py: 1.5,
                          mt: 1,
                          fontSize: '1.1rem',
                          '&:hover': {
                            bgcolor: '#008c7a',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(0,166,147,0.4)'
                          },
                          '&:disabled': {
                            bgcolor: '#d1d5db',
                            color: 'white'
                          },
                          transition: 'all 0.2s'
                        }}
                      >
                        {language === 'en' ? '🗓️ Book Now' : language === 'tr' ? '🗓️ Hemen Rezervasyon Yap' : '🗓️ Забронировать'}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>

                {/* Quick Stats */}
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={{ xs: 2, sm: 3, md: 4 }}
                  sx={{ opacity: 0.9, alignItems: { xs: 'center', md: 'flex-start' } }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ fontSize: 20 }} />
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', md: '1rem' } }}>2000+ {t.barbers}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Star sx={{ fontSize: 20 }} />
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', md: '1rem' } }}>150,000+ {t.happyCustomers}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday sx={{ fontSize: 20 }} />
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', md: '1rem' } }}>{t.instantBooking}</Typography>
                  </Box>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Map Section - Find Businesses Near You */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: '#f9fafb' }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h3" sx={{
              fontWeight: 'bold',
              color: '#1f2937',
              fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
              mb: 2
            }}>
              {language === 'en' ? '🗺️ Find Businesses Near You' :
                language === 'tr' ? '🗺️ Yakınınızdaki İşletmeleri Bulun' :
                '🗺️ Найдите предприятия рядом с вами'}
            </Typography>
            <Typography variant="h6" sx={{
              color: '#6b7280',
              fontSize: { xs: '1rem', md: '1.25rem' },
              maxWidth: 600,
              mx: 'auto'
            }}>
              {language === 'en' ? 'Explore registered businesses on the map' :
                language === 'tr' ? 'Kayıtlı işletmeleri haritada keşfedin' :
                'Исследуйте зарегистрированные предприятия на карте'}
            </Typography>
          </Box>

          {/* Search Controls Above Map */}
          <Card sx={{
            mb: 3,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Grid container spacing={2} alignItems="center">
                {/* Search Input */}
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder={language === 'en'
                      ? 'Search location...'
                      : language === 'tr'
                      ? 'Konum ara...'
                      : 'Поиск местоположения...'}
                    value={mapSearchQuery}
                    onChange={(e) => setMapSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ color: '#2d3748' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#2d3748'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#2d3748'
                        }
                      }
                    }}
                  />
                </Grid>

                {/* Category Dropdown */}
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <Select
                      value={mapCategory}
                      onChange={(e) => setMapCategory(e.target.value)}
                      displayEmpty
                      sx={{
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#2d3748'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#2d3748'
                        }
                      }}
                    >
                      <MenuItem value="all">
                        {language === 'en' ? 'All Categories' : language === 'tr' ? 'Tüm Kategoriler' : 'Все категории'}
                      </MenuItem>
                      <MenuItem value="barber">
                        💈 {language === 'en' ? 'Barber' : language === 'tr' ? 'Berber' : 'Парикмахер'}
                      </MenuItem>
                      <MenuItem value="beauty">
                        💅 {language === 'en' ? 'Beauty & Wellness' : language === 'tr' ? 'Güzellik & Sağlık' : 'Красота'}
                      </MenuItem>
                      <MenuItem value="automotive">
                        🚗 {language === 'en' ? 'Automotive' : language === 'tr' ? 'Otomotiv' : 'Авто'}
                      </MenuItem>
                      <MenuItem value="pet">
                        🐾 {language === 'en' ? 'Pet Care' : language === 'tr' ? 'Evcil Hayvan' : 'Питомцы'}
                      </MenuItem>
                      <MenuItem value="home">
                        🏠 {language === 'en' ? 'Home Services' : language === 'tr' ? 'Ev Hizmetleri' : 'Дом'}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Find My Location Button */}
                <Grid item xs={12} md={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<LocationOn />}
                    onClick={handleFindMyLocation}
                    sx={{
                      bgcolor: '#2d3748',
                      fontWeight: 600,
                      '&:hover': {
                        bgcolor: '#1a202c',
                      }
                    }}
                  >
                    {language === 'en' ? 'Find My Location' : language === 'tr' ? 'Konumumu Bul' : 'Найти мою локацию'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Box sx={{
            height: { xs: 400, md: 600 },
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,166,147,0.2)',
            border: '3px solid #2d3748',
            position: 'relative'
          }}>
            <iframe
              src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${userLocation.lat},${userLocation.lng}&zoom=13`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={language === 'en' ? 'Map of businesses' : language === 'tr' ? 'İşletmeler haritası' : 'Карта ��редприятий'}
            />
          </Box>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            {!isAuthenticated ? (
              <Typography variant="body2" sx={{
                color: '#ff6b35',
                fontWeight: 600,
                bgcolor: 'rgba(255,107,53,0.1)',
                py: 1.5,
                px: 3,
                borderRadius: 2,
                display: 'inline-block'
              }}>
                {language === 'en' ? '🔒 Sign in to see businesses near your location' :
                  language === 'tr' ? '🔒 Konumunuzdaki işletmeleri görmek için giriş yapın' :
                  '🔒 Войдите, чтобы увидеть предприятия рядом с вами'}
              </Typography>
            ) : (
              <Typography variant="body2" sx={{ color: '#6b7280', fontStyle: 'italic' }}>
                {language === 'en' ? '💡 Showing businesses near your current location' :
                  language === 'tr' ? '💡 Mevcut konumunuza yakın işletmeler gösteriliyor' :
                  '💡 Показаны предприятия рядом с вашим текущим местоположением'}
              </Typography>
            )}
          </Box>
        </Container>
      </Box>

      {/* Featured Businesses Section - Now with Beautiful Images */}
      <Box sx={{ bgcolor: 'white', py: { xs: 4, md: 6 } }}>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{
            fontWeight: 'bold',
            textAlign: 'center',
            mb: { xs: 3, md: 4 },
            color: '#1f2937',
            fontSize: { xs: '1.75rem', md: '2rem' }
          }}>
            {language === 'en'
              ? 'Featured Businesses'
              : language === 'tr'
              ? 'Öne Çıkan İşletmeler'
              : 'Избранные предприятия'
            }
          </Typography>

          {loadingBusinesses ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" sx={{ color: '#6b7280' }}>
                {language === 'en' ? 'Loading businesses...' : language === 'tr' ? 'İşletmeler yükleniyor...' : 'Загрузка предприятий...'}
              </Typography>
            </Box>
          ) : featuredBusinesses.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" sx={{ color: '#6b7280' }}>
                {language === 'en' ? 'No businesses found' : language === 'tr' ? 'İşletme bulunamadı' : 'Предприяти�� не найдены'}
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {featuredBusinesses.map((business) => {
                // Get category icon and color based on business category
                const getCategoryInfo = (category) => {
                  const cat = (category || 'barber').toLowerCase();
                  if (cat.includes('barber') || cat.includes('berber')) {
                    return { icon: '💈', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)', name: language === 'en' ? 'Barber' : language === 'tr' ? 'Berber' : 'Парикмахер' };
                  } else if (cat.includes('beauty') || cat.includes('güzellik') || cat.includes('красота')) {
                    return { icon: '💅', color: '#ec4899', bgColor: 'rgba(236, 72, 153, 0.1)', name: language === 'en' ? 'Beauty & Wellness' : language === 'tr' ? 'Güzellik & Sağlık' : 'Красота' };
                  } else if (cat.includes('automotive') || cat.includes('otomotiv') || cat.includes('авто')) {
                    return { icon: '🚗', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)', name: language === 'en' ? 'Automotive' : language === 'tr' ? 'Otomotiv' : 'Авто' };
                  } else if (cat.includes('pet') || cat.includes('hayvan') || cat.includes('питомц')) {
                    return { icon: '🐾', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)', name: language === 'en' ? 'Pet Care' : language === 'tr' ? 'Evcil Hayvan' : 'Питомцы' };
                  } else if (cat.includes('home') || cat.includes('ev') || cat.includes('дом')) {
                    return { icon: '🏠', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)', name: language === 'en' ? 'Home Services' : language === 'tr' ? 'Ev Hizmetleri' : 'Дом' };
                  } else if (cat.includes('health') || cat.includes('sağlık') || cat.includes('здоровье')) {
                    return { icon: '⚕️', color: '#06b6d4', bgColor: 'rgba(6, 182, 212, 0.1)', name: language === 'en' ? 'Health' : language === 'tr' ? 'Sağlık' : 'Здоровье' };
                  } else {
                    return { icon: '📋', color: '#6366f1', bgColor: 'rgba(99, 102, 241, 0.1)', name: language === 'en' ? 'Other' : language === 'tr' ? 'Diğer' : 'Другое' };
                  }
                };

                const categoryInfo = getCategoryInfo(business.category || business.business_type);

                // Get varied image based on category and business ID for variety
                const getBusinessImage = (category, businessId) => {
                  const cat = (category || 'barber').toLowerCase();
                  const imageVariant = (businessId % 3); // 0, 1, or 2 for variety

                  if (cat.includes('barber') || cat.includes('berber')) {
                    const barberImages = [
                      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80',
                      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80',
                      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80'
                    ];
                    return barberImages[imageVariant];
                  } else if (cat.includes('beauty') || cat.includes('güzellik')) {
                    const beautyImages = [
                      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
                      'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=800&q=80',
                      'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&q=80'
                    ];
                    return beautyImages[imageVariant];
                  } else {
                    const generalImages = [
                      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&q=80',
                      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
                      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80'
                    ];
                    return generalImages[imageVariant];
                  }
                };

                return (
                  <Grid item xs={12} sm={6} md={6} lg={4} key={business.id}>
                    <Card sx={{
                      height: '100%',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      borderRadius: 3,
                      transition: 'all 0.3s',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      border: '1px solid transparent',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 12px 32px ${categoryInfo.color}40`,
                        borderColor: categoryInfo.color
                      }
                    }}
                    onClick={() => navigate(`/business/${business.id}`)}
                    >
                      {/* Hero Image with Overlay */}
                      <Box sx={{ position: 'relative', height: 240 }}>
                        <CardMedia
                          component="img"
                          height="240"
                          image={business.image_url || getBusinessImage(business.category || business.business_type, business.id)}
                          alt={business.business_name || business.name}
                          sx={{ objectFit: 'cover' }}
                        />

                        {/* Gradient Overlay */}
                        <Box sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 100%)',
                          zIndex: 1
                        }} />

                        {/* Category Badge on Image */}
                        <Box sx={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          zIndex: 2,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 2,
                          bgcolor: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(8px)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                        }}>
                          <Typography sx={{ fontSize: '1rem' }}>{categoryInfo.icon}</Typography>
                          <Typography variant="caption" sx={{
                            color: categoryInfo.color,
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}>
                            {categoryInfo.name}
                          </Typography>
                        </Box>

                        {/* Business Name Overlay at Bottom */}
                        <Box sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          p: 2,
                          zIndex: 2,
                          color: 'white'
                        }}>
                          <Typography variant="h6" sx={{
                            fontWeight: 'bold',
                            fontSize: '1.25rem',
                            mb: 0.5,
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                          }}>
                            {business.business_name || business.name || 'Business'}
                          </Typography>
                          {business.owner_name && (
                            <Typography variant="body2" sx={{
                              fontSize: '0.85rem',
                              opacity: 0.95,
                              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                            }}>
                              {language === 'en' ? 'by' : language === 'tr' ? 'Sahibi:' : 'от'} {business.owner_name}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {/* Card Content Below Image */}
                      <CardContent sx={{ p: 2.5 }}>

                        <Divider sx={{ my: 2 }} />

                        {/* Stats Grid */}
                        <Box sx={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: 2,
                          mb: 2
                        }}>
                          {/* Workers Count */}
                          <Box sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: '#f9fafb',
                            textAlign: 'center'
                          }}>
                            <People sx={{ fontSize: 24, color: categoryInfo.color, mb: 0.5 }} />
                            <Typography variant="h6" sx={{
                              fontWeight: 'bold',
                              color: '#1f2937',
                              fontSize: '1.25rem'
                            }}>
                              {business.workers_count || 0}
                            </Typography>
                            <Typography variant="caption" sx={{
                              color: '#6b7280',
                              fontSize: '0.7rem'
                            }}>
                              {language === 'en' ? 'Workers' : language === 'tr' ? 'Çalışan' : 'Работники'}
                            </Typography>
                          </Box>

                          {/* Services Count */}
                          <Box sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: '#f9fafb',
                            textAlign: 'center'
                          }}>
                            <ContentCut sx={{ fontSize: 24, color: categoryInfo.color, mb: 0.5 }} />
                            <Typography variant="h6" sx={{
                              fontWeight: 'bold',
                              color: '#1f2937',
                              fontSize: '1.25rem'
                            }}>
                              {business.services_count || 0}
                            </Typography>
                            <Typography variant="caption" sx={{
                              color: '#6b7280',
                              fontSize: '0.7rem'
                            }}>
                              {language === 'en' ? 'Services' : language === 'tr' ? 'Hizmet' : 'Услуги'}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Location */}
                        {(business.address || business.city) && (
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            p: 1,
                            borderRadius: 2,
                            bgcolor: '#f9fafb'
                          }}>
                            <LocationOn sx={{ fontSize: 18, color: categoryInfo.color }} />
                            <Typography variant="body2" sx={{
                              color: '#374151',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontSize: '0.85rem'
                            }}>
                              {business.city ? business.city : business.address}
                            </Typography>
                          </Box>
                        )}

                        {/* View Details Button */}
                        <Button
                          variant="contained"
                          fullWidth
                          sx={{
                            mt: 2,
                            bgcolor: categoryInfo.color,
                            color: 'white',
                            fontWeight: 'bold',
                            py: 1.2,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontSize: '0.95rem',
                            boxShadow: `0 4px 12px ${categoryInfo.color}40`,
                            '&:hover': {
                              bgcolor: categoryInfo.color,
                              filter: 'brightness(0.9)',
                              boxShadow: `0 6px 16px ${categoryInfo.color}60`
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/business/${business.id}`);
                          }}
                        >
                          {language === 'en' ? 'Book Now' : language === 'tr' ? 'Hemen Rezervasyon' : 'Забронировать'}
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Container>
      </Box>

      {/* Customer Testimonials Section */}
      <Box sx={{ bgcolor: '#f9fafb', py: { xs: 4, md: 6 } }}>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{
            fontWeight: 'bold',
            textAlign: 'center',
            mb: { xs: 3, md: 4 },
            color: '#1f2937',
            fontSize: { xs: '1.75rem', md: '2rem' }
          }}>
            {language === 'en'
              ? 'What Our Customers Say'
              : language === 'tr'
              ? 'Müşterilerimiz Ne Diyor'
              : 'Что говорят наши клиенты'
            }
          </Typography>

          <Grid container spacing={3}>
            {/* Testimonial 1 - Germany */}
            <Grid item xs={12} md={4}>
              <Card sx={{
                height: '100%',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                borderRadius: 2,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 6px 20px rgba(0,166,147,0.15)' }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      bgcolor: '#2d3748',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1.25rem',
                      mr: 2
                    }}>
                      ML
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1f2937' }}>
                        Maria Löwe
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.875rem' }}>
                        Berlin, Germany 🇩🇪
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#374151', lineHeight: 1.6, fontStyle: 'italic' }}>
                    {language === 'en'
                      ? '"Aponti has completely changed how I book appointments. So easy to find quality salons nearby and book instantly!"'
                      : language === 'tr'
                      ? '"Aponti randevu alma şeklimi tamamen değiştirdi. Yakındaki kaliteli salonları bulmak ve anında rezervasyon yapmak çok kolay!"'
                      : '"Aponti полностью изменил то, как я бронирую встречи. Так легко найти качественные салоны поблизости!"'
                    }
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Testimonial 2 - France */}
            <Grid item xs={12} md={4}>
              <Card sx={{
                height: '100%',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                borderRadius: 2,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 6px 20px rgba(0,166,147,0.15)' }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      bgcolor: '#2d3748',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1.25rem',
                      mr: 2
                    }}>
                      JD
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1f2937' }}>
                        Jean Dubois
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.875rem' }}>
                        Paris, France 🇫🇷
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#374151', lineHeight: 1.6, fontStyle: 'italic' }}>
                    {language === 'en'
                      ? '"As a busy professional, Aponti saves me so much time. I can see my barber\'s schedule and book the perfect time slot!"'
                      : language === 'tr'
                      ? '"Yoğun bir profesyonel olarak Aponti bana çok zaman kazandırıyor. Berberimin programını görebiliyor ve mükemmel saat dilimini ayırtabiliyorum!"'
                      : '"Как занятой профессионал, Aponti экономит мне так много времени. Я вижу расписание парикмахера!"'
                    }
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Testimonial 3 - Netherlands */}
            <Grid item xs={12} md={4}>
              <Card sx={{
                height: '100%',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                borderRadius: 2,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 6px 20px rgba(0,166,147,0.15)' }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      bgcolor: '#2d3748',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1.25rem',
                      mr: 2
                    }}>
                      SV
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1f2937' }}>
                        Sophie van Berg
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.875rem' }}>
                        Amsterdam, Netherlands 🇳🇱
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#374151', lineHeight: 1.6, fontStyle: 'italic' }}>
                    {language === 'en'
                      ? '"The best booking platform I\'ve used! Clean interface, reliable notifications, and all my favorite beauty spots in one place."'
                      : language === 'tr'
                      ? '"Kullandığım en iyi rezervasyon platformu! Temiz arayüz, güvenilir bildirimler ve en sevdiğim güzellik mekanları tek yerde."'
                      : '"Лучшая платформа для брони��ования! Чистый интерфейс, надёжные уведомления!"'
                    }
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Call to Action Section */}
      <Box sx={{ bgcolor: 'linear-gradient(135deg, #2d3748 0%, #4fd5c7 100%)', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <Typography variant="h3" sx={{
              fontWeight: 'bold',
              mb: 2,
              fontSize: { xs: '2rem', md: '2.5rem' },
              color: '#1f2937',
              maxWidth: 600,
              mx: 'auto'
            }}>
              {language === 'en'
                ? 'Ready to Book Your Next Appointment?'
                : language === 'tr'
                ? 'Bir Sonraki Randevunuzu Almaya Hazır mısınız?'
                : 'Готовы забронировать следующую встречу?'
              }
            </Typography>
            <Typography variant="h6" sx={{
              mb: 4,
              opacity: 0.9,
              fontSize: { xs: '1.1rem', md: '1.25rem' },
              maxWidth: 600,
              mx: 'auto',
              color: '#374151'
            }}>
              {language === 'en'
                ? 'Join thousands of satisfied customers who trust us with their beauty and grooming needs'
                : language === 'tr'
                ? 'Güzellik ve bakım ihtiyaçları için bize güvenen binlerce memnun müşteriye katılın'
                : 'Присоединяйтесь �� тысячам довольных клиентов, которые доверяют нам свои потребности в красоте и уходе'
              }
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ justifyContent: { xs: 'center', sm: 'flex-end' }, alignItems: 'center', maxWidth: 600, mx: 'auto', width: '100%' }}
            >
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: '#2d3748',
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  '&:hover': {
                    bgcolor: '#f0fffe',
                    transform: 'translateY(-2px)'
                  }
                }}
                onClick={() => {
                  // Scroll to search section
                  const searchSection = document.querySelector('[data-search="hero"]');
                  if (searchSection) {
                    searchSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                {language === 'en'
                  ? 'Find Your Salon'
                  : language === 'tr'
                  ? 'Salonunuzu Bulun'
                  : 'Найти салон'
                }
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<Business />}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                    borderColor: 'white'
                  }
                }}
                onClick={() => navigate('/business-signup')}
              >
                {t.tryBusiness}
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Simplified Footer */}
      <Box sx={{ bgcolor: '#1f2937', color: 'white', py: { xs: 3, sm: 4, md: 6 }, mt: { xs: 2, md: 4 } }}>
        <Container maxWidth="xl">
          <Grid container spacing={{ xs: 3, md: 4 }}>
            {/* Brand Section */}
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Logo size="medium" variant="white" />
              </Box>
              <Typography variant="body2" sx={{ mb: 3, opacity: 0.8, lineHeight: 1.6, fontSize: { xs: '0.85rem', md: '0.875rem' } }}>
                {language === 'en' 
                  ? 'The leading platform for booking professional barber services across Europe. Find and book the best barbers in your city.'
                  : language === 'tr'
                  ? 'Avrupa\'da profesyonel berber hizmetleri rezervasyonu için önde gelen platform. Şehrinizdeki en iyi berberleri bulun ve rezervasyon yapın.'
                  : 'Ведущая платфор��а для бронирования профессиональных парикмахерских услуг по всей Европе. Найдите и забронируйте лучших парикмахеров в своем городе.'
                }
              </Typography>
              <Stack direction="row" spacing={1}>
                <IconButton sx={{ color: '#3b82f6' }}>
                  <Facebook />
                </IconButton>
                <IconButton sx={{ color: '#1da1f2' }}>
                  <Twitter />
                </IconButton>
                <IconButton sx={{ color: '#e1306c' }}>
                  <Instagram />
                </IconButton>
                <IconButton sx={{ color: '#0077b5' }}>
                  <LinkedIn />
                </IconButton>
              </Stack>
            </Grid>

            {/* Company */}
            <Grid item xs={6} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                {t.company}
              </Typography>
              <Stack spacing={1}>
                <Link 
                  href="#" 
                  color="inherit" 
                  sx={{ opacity: 0.8, textDecoration: 'none', '&:hover': { opacity: 1 }, fontSize: { xs: '0.85rem', md: '0.875rem' } }}
                  onClick={() => navigate('/about')}
                >
                  {t.about}
                </Link>
                <Link 
                  href="#" 
                  color="inherit" 
                  sx={{ opacity: 0.8, textDecoration: 'none', '&:hover': { opacity: 1 }, fontSize: { xs: '0.85rem', md: '0.875rem' } }}
                  onClick={() => navigate('/company')}
                >
                  {language === 'en' ? 'Careers' : language === 'tr' ? 'Kariyer' : 'Карьера'}
                </Link>
                <Link 
                  href="#" 
                  color="inherit" 
                  sx={{ opacity: 0.8, textDecoration: 'none', '&:hover': { opacity: 1 }, fontSize: { xs: '0.85rem', md: '0.875rem' } }}
                  onClick={() => navigate('/company')}
                >
                  {language === 'en' ? 'Partners' : language === 'tr' ? 'Ortaklar' : 'Партнеры'}
                </Link>
              </Stack>
            </Grid>

            {/* Support */}
            <Grid item xs={6} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                {t.support}
              </Typography>
              <Stack spacing={1}>
                <Link 
                  href="#" 
                  color="inherit" 
                  sx={{ opacity: 0.8, textDecoration: 'none', '&:hover': { opacity: 1 }, fontSize: { xs: '0.85rem', md: '0.875rem' } }}
                  onClick={() => navigate('/support')}
                >
                  {language === 'en' ? 'Help Center' : language === 'tr' ? 'Yardım Merkezi' : 'Центр помощи'}
                </Link>
                <Link 
                  href="#" 
                  color="inherit" 
                  sx={{ opacity: 0.8, textDecoration: 'none', '&:hover': { opacity: 1 }, fontSize: { xs: '0.85rem', md: '0.875rem' } }}
                  onClick={() => navigate('/support')}
                >
                  {language === 'en' ? 'Contact Us' : language === 'tr' ? 'İletişim' : 'Связаться с нами'}
                </Link>
                <Link 
                  href="#" 
                  color="inherit" 
                  sx={{ opacity: 0.8, textDecoration: 'none', '&:hover': { opacity: 1 }, fontSize: { xs: '0.85rem', md: '0.875rem' } }}
                  onClick={() => navigate('/support')}
                >
                  {language === 'en' ? 'FAQ' : language === 'tr' ? 'SSS' : 'FAQ'}
                </Link>
                <Link 
                  href="#" 
                  color="inherit" 
                  sx={{ opacity: 0.8, textDecoration: 'none', '&:hover': { opacity: 1 }, fontSize: { xs: '0.85rem', md: '0.875rem' } }}
                  onClick={() => navigate('/support')}
                >
                  {language === 'en' ? 'Safety' : language === 'tr' ? 'Güvenlik' : 'Безопасность'}
                </Link>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ my: { xs: 3, md: 4 }, borderColor: 'rgba(255,255,255,0.1)' }} />

          {/* Bottom Footer */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: 2,
            textAlign: { xs: 'center', md: 'left' }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' } }}>
              <Copyright sx={{ mr: 1, fontSize: { xs: 14, md: 16 } }} />
              <Typography variant="body2" sx={{ opacity: 0.8, fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                2024 Aponti. {language === 'en' ? 'All rights reserved.' : language === 'tr' ? 'Tüm hakları saklıdır.' : 'Все права защищены.'}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.6, fontSize: { xs: '0.8rem', md: '0.875rem' }, textAlign: { xs: 'center', md: 'right' } }}>
              {language === 'en' ? 'Made for Europe' : language === 'tr' ? 'Avrupa için yapıldı' : 'Сделано для Европы'} 🇪🇺
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Mobile Drawer */}
      <Drawer 
        anchor="left" 
        open={drawerOpen} 
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: { xs: 260, sm: 280 } }
        }}
      >
        <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2d3748', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
              {t.brand}
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <Close />
            </IconButton>
          </Box>

          {/* User Profile Section in Drawer */}
          {isAuthenticated && (
            <Box sx={{ mb: 2, p: 2, bgcolor: '#f0fffe', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={user?.avatar}
                  sx={{ width: 40, height: 40 }}
                />
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {user?.name || 'User'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email || ''}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          <Divider sx={{ mb: 2 }} />
          <List>
            <ListItemButton onClick={() => { navigate('/'); setDrawerOpen(false); }}>
              <ListItemIcon><HomeIcon /></ListItemIcon>
              <ListItemText primary={t.home} />
            </ListItemButton>
            <ListItemButton onClick={() => { navigate('/services'); setDrawerOpen(false); }}>
              <ListItemIcon><ContentCut /></ListItemIcon>
              <ListItemText primary={t.services} />
            </ListItemButton>
            <ListItemButton onClick={() => { navigate('/about'); setDrawerOpen(false); }}>
              <ListItemIcon><Person /></ListItemIcon>
              <ListItemText primary={t.about} />
            </ListItemButton>
            <ListItemButton onClick={() => { navigate('/company'); setDrawerOpen(false); }}>
              <ListItemIcon><Business /></ListItemIcon>
              <ListItemText primary={t.company} />
            </ListItemButton>
            <ListItemButton onClick={() => { navigate('/support'); setDrawerOpen(false); }}>
              <ListItemIcon><SupportIcon /></ListItemIcon>
              <ListItemText primary={t.support} />
            </ListItemButton>
            <ListItemButton onClick={() => { navigate('/contact'); setDrawerOpen(false); }}>
              <ListItemIcon><Schedule /></ListItemIcon>
              <ListItemText primary={language === 'en' ? 'Appoint' : language === 'tr' ? 'Randevu Al' : 'Записатьс��'} />
            </ListItemButton>
            <Divider sx={{ my: 1 }} />
            <ListItemButton
              onClick={() => { navigate('/business-signup'); setDrawerOpen(false); }}
              sx={{
                bgcolor: 'rgba(255, 107, 53, 0.08)',
                '&:hover': { bgcolor: 'rgba(255, 107, 53, 0.15)' },
                mb: 1,
                borderRadius: 1,
                mx: 1
              }}
            >
              <ListItemIcon><Business sx={{ color: '#ff6b35' }} /></ListItemIcon>
              <ListItemText
                primary={t.tryBusiness}
                sx={{ '& .MuiTypography-root': { color: '#ff6b35', fontWeight: 600 } }}
              />
            </ListItemButton>
            <ListItemButton onClick={() => { navigate('/dashboard'); setDrawerOpen(false); }}>
              <ListItemIcon><Schedule /></ListItemIcon>
              <ListItemText primary={t.appointments} />
            </ListItemButton>
            <ListItemButton onClick={() => { navigate('/favorites'); setDrawerOpen(false); }}>
              <ListItemIcon><Favorite /></ListItemIcon>
              <ListItemText primary={t.favorites} />
            </ListItemButton>
            <Divider sx={{ my: 2 }} />
            {isAuthenticated ? (
              <>
                <ListItemButton onClick={() => { navigate('/profile'); setDrawerOpen(false); }}>
                  <ListItemIcon><Person /></ListItemIcon>
                  <ListItemText primary={t.profile} />
                </ListItemButton>
                <ListItemButton onClick={() => { navigate('/dashboard'); setDrawerOpen(false); }}>
                  <ListItemIcon><Schedule /></ListItemIcon>
                  <ListItemText primary={t.appointments} />
                </ListItemButton>
                <ListItemButton onClick={() => { navigate('/settings'); setDrawerOpen(false); }}>
                  <ListItemIcon><Settings /></ListItemIcon>
                  <ListItemText primary={language === 'en' ? 'Settings' : language === 'tr' ? 'Ayarlar' : 'Настройки'} />
                </ListItemButton>
                <ListItemButton onClick={() => { handleLogout(); setDrawerOpen(false); }}>
                  <ListItemIcon><Logout /></ListItemIcon>
                  <ListItemText primary={language === 'en' ? 'Sign Out' : language === 'tr' ? 'Çıkış Yap' : 'Выйти'} />
                </ListItemButton>
              </>
            ) : (
              <>
                <ListItem>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      bgcolor: '#2d3748',
                      color: 'white',
                      fontWeight: 600,
                      mr: 1,
                      '&:hover': { bgcolor: '#1a202c' }
                    }}
                    onClick={() => { navigate('/signin'); setDrawerOpen(false); }}
                  >
                    {t.login}
                  </Button>
                </ListItem>
                <ListItem>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      bgcolor: '#2d3748',
                      color: 'white',
                      fontWeight: 600,
                      '&:hover': { bgcolor: '#1a202c' }
                    }}
                    onClick={() => { navigate('/signup'); setDrawerOpen(false); }}
                  >
                    {t.signup}
                  </Button>
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>

      {/* Bottom Navigation for Mobile */}
      {isMobile && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            bgcolor: 'white',
            borderTop: '1px solid #e5e7eb',
            display: { xs: 'block', md: 'none' }
          }}
        >
          <BottomNavigation
            value={bottomNavValue}
            onChange={(event, newValue) => setBottomNavValue(newValue)}
            sx={{ height: { xs: 56, sm: 60 } }}
          >
            <BottomNavigationAction
              label={t.home}
              icon={<HomeIcon />}
              onClick={() => { navigate('/'); setBottomNavValue(0); }}
            />
            <BottomNavigationAction
              label={t.services}
              icon={<ContentCut />}
              onClick={() => { navigate('/services'); setBottomNavValue(1); }}
            />
            <BottomNavigationAction
              label={t.appointments}
              icon={<Schedule />}
              onClick={() => { navigate('/dashboard'); setBottomNavValue(2); }}
            />
            <BottomNavigationAction
              label={t.profile}
              icon={<AccountCircle />}
              onClick={() => setBottomNavValue(3)}
            />
          </BottomNavigation>
        </Box>
      )}

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: { xs: 76, sm: 80 },
            right: { xs: 12, sm: 16 },
            bgcolor: '#ff6b35',
            color: 'white',
            '&:hover': { bgcolor: '#e55a2e' },
            zIndex: 1000
          }}
          onClick={() => {
            // Scroll to search section
            const searchSection = document.querySelector('[data-search="hero"]');
            if (searchSection) {
              searchSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          <Search />
        </Fab>
      )}
    </Box>
  );
};

export default Home;
