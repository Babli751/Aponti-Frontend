import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import api from '../services/api';
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
  Menu,
  Chip,
  Rating
} from '@mui/material';
import {
  Search,
  LocationOn,
  Star,
  Person,
  Notifications,
  Schedule,
  Favorite,
  CheckCircle,
  Menu as MenuIcon,
  Close,
  Business,
  ExpandMore,
  ArrowForward,
  Verified,
  People,
  TrendingUp,
  Settings,
  Logout,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

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
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [userLocation, setUserLocation] = useState({ lat: 41.0082, lng: 28.9784 });
  const [featuredBusinesses, setFeaturedBusinesses] = useState([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [mapCategory, setMapCategory] = useState('all');

  useEffect(() => {
    if (isAuthenticated && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          setUserLocation({ lat: 41.0082, lng: 28.9784 });
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
      );
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoadingBusinesses(true);
        let allWorkers = [];
        let allServices = [];
        
        try {
          const workersResponse = await api.get('/barbers/');
          allWorkers = Array.isArray(workersResponse.data) ? workersResponse.data : [];
        } catch (err) {
          console.error('Error fetching workers:', err);
        }

        try {
          const servicesResponse = await api.get('/services/');
          allServices = Array.isArray(servicesResponse.data) ? servicesResponse.data : [];
        } catch (err) {
          console.error('Error fetching services:', err);
        }

        const businessMap = {};
        allWorkers.forEach(worker => {
          const businessId = worker.business_id || worker.barber_shop_id || 1;
          const businessName = worker.business_name || worker.barber_shop_name || 'Professional Services';

          if (!businessMap[businessId]) {
            businessMap[businessId] = {
              id: businessId,
              business_name: businessName,
              name: businessName,
              address: worker.address || worker.barber_shop_address || 'Location TBD',
              phone: worker.phone_number || '+90 555 123 4567',
              latitude: worker.latitude || 41.0082,
              longitude: worker.longitude || 28.9784,
              business_type: worker.business_type || 'Services',
              description: worker.description || 'Professional services provided'
            };
          }
        });

        const businesses = Object.values(businessMap).slice(0, 6);
        const businessesWithCounts = businesses.map(business => {
          const businessId = business.id;
          const businessWorkers = allWorkers.filter(w => String(w.business_id || w.barber_shop_id || 1) === String(businessId));
          const businessServices = allServices.filter(s => String(s.business_id || s.barber_shop_id || 1) === String(businessId));

          return {
            ...business,
            workers_count: businessWorkers.length || 1,
            services_count: businessServices.length || 3,
            rating: 4.5 + (Math.random() * 0.5)
          };
        });

        setFeaturedBusinesses(businessesWithCounts);
      } catch (error) {
        console.error('Error fetching businesses:', error);
        setFeaturedBusinesses([]);
      } finally {
        setLoadingBusinesses(false);
      }
    };
    fetchBusinesses();
  }, []);

  const t = translations;

  const categories = [
    { id: 'beauty', label: language === 'en' ? '💅 Beauty & Wellness' : language === 'tr' ? '💅 Güzellik & Sağlık' : '💅 Красота', icon: '💅', color: '#ec4899' },
    { id: 'barber', label: language === 'en' ? '💈 Barber' : language === 'tr' ? '💈 Berber' : '💈 Парикмахер', icon: '💈', color: '#ef4444' },
    { id: 'automotive', label: language === 'en' ? '🚗 Automotive' : language === 'tr' ? '🚗 Otomotiv' : '🚗 Авто', icon: '🚗', color: '#3b82f6' },
    { id: 'pet_care', label: language === 'en' ? '🐾 Pet Care' : language === 'tr' ? '🐾 Evcil Hayvan' : '🐾 Питомцы', icon: '🐾', color: '#f59e0b' },
    { id: 'home_services', label: language === 'en' ? '🏠 Home Services' : language === 'tr' ? '🏠 Ev Hizmetleri' : '🏠 Дом', icon: '🏠', color: '#10b981' },
    { id: 'health', label: language === 'en' ? '⚕️ Health' : language === 'tr' ? '⚕️ Sağlık' : '⚕️ Здоровье', icon: '⚕️', color: '#06b6d4' }
  ];

  const handleCategorySelect = async (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedBusiness('');
    setSelectedWorker('');
    setSelectedService('');

    const filtered = featuredBusinesses.filter(b => {
      const businessCat = (b.category || b.business_type || 'barber').toLowerCase().trim();
      const selectedCat = categoryId.toLowerCase().trim();
      return businessCat === selectedCat || businessCat.includes(selectedCat) || selectedCat.includes(businessCat);
    });

    setCategoryBusinesses(filtered);
  };

  const handleBusinessSelect = async (businessId) => {
    setSelectedBusiness(businessId);
    setSelectedWorker('');
    setSelectedService('');

    try {
      const response = await api.get(`/business/${businessId}/workers`);
      let workers = [];
      if (Array.isArray(response.data)) {
        workers = response.data;
      } else if (Array.isArray(response.data?.workers)) {
        workers = response.data.workers;
      } else if (response.data && typeof response.data === 'object') {
        workers = Object.values(response.data);
      }
      setBusinessWorkers(workers);
    } catch (error) {
      console.error('Error fetching workers:', error);
      setBusinessWorkers([]);
    }
  };

  const handleWorkerSelect = async (workerId) => {
    setSelectedWorker(workerId);
    setSelectedService('');

    try {
      const response = await api.get(`/business/worker/${workerId}/services`);
      let services = [];
      if (Array.isArray(response.data)) {
        services = response.data;
      } else if (Array.isArray(response.data?.services)) {
        services = response.data.services;
      } else if (response.data && typeof response.data === 'object') {
        services = Object.values(response.data);
      }
      setWorkerServices(services);
    } catch (error) {
      console.error('Error fetching services:', error);
      setWorkerServices([]);
    }
  };

  const handleBookNow = async () => {
    if (selectedBusiness && selectedWorker && selectedService && selectedDate && selectedTime) {
      try {
        const startTime = `${selectedDate}T${selectedTime}:00`;
        const response = await api.post('/bookings/', {
          service_id: parseInt(selectedService),
          barber_id: parseInt(selectedWorker),
          start_time: startTime
        });

        alert(language === 'en'
          ? 'Booking successful! Redirecting to dashboard...'
          : language === 'tr'
          ? 'Rezervasyon başarılı! Yönlendiriliyor...'
          : 'Бронирование успешно! Перенаправление...');

        navigate('/dashboard');
      } catch (error) {
        console.error('Booking failed:', error);
        alert(language === 'en'
          ? 'Booking failed. Please try again.'
          : language === 'tr'
          ? 'Rezervasyon başarısız. Lütfen tekrar deneyin.'
          : 'Ошибка бронирования. Попробуйте еще раз.');
      }
    } else {
      alert(language === 'en'
        ? 'Please select all fields'
        : language === 'tr'
        ? 'Lütfen tüm alanları doldurun'
        : 'Пожалуйста, заполните все поля');
    }
  };

  const handleFindMyLocation = () => {
    const confirmMessage = language === 'en'
      ? 'Enable location access to find businesses near you?'
      : language === 'tr'
      ? 'Konumunuza yakın işletmeleri bulmak için konum erişimini etkinleştir?'
      : 'Включить доступ к местоположению, чтобы найти ближайшие предприятия?';

    const userConfirmed = window.confirm(confirmMessage);

    if (!userConfirmed) {
      setUserLocation({ lat: 41.0082, lng: 28.9784 });
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          setUserLocation({ lat: 41.0082, lng: 28.9784 });
        }
      );
    }
  };

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

  const getBusinessImage = (businessId) => {
    const images = [
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80',
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
      'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=800&q=80',
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80',
      'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=800&q=80',
      'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&q=80'
    ];
    return images[businessId % images.length];
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#ffffff', minHeight: '100vh' }}>
      {/* Navigation Bar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #1a1f36 0%, #2d3548 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{
            justifyContent: 'space-between',
            py: { xs: 0.5, md: 1 },
            minHeight: { xs: '56px', sm: '64px', md: '72px' },
            px: { xs: 0.5, sm: 1, md: 2 }
          }}>
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
              
              {!isMobile && (
                <Stack direction="row" spacing={{ md: 3, lg: 4 }} sx={{ ml: { md: 3, lg: 5 } }}>
                  <Button
                    color="inherit"
                    sx={{ fontWeight: 500, fontSize: '0.95rem', '&:hover': { opacity: 0.8 } }}
                    onClick={() => navigate('/services')}
                  >
                    {t.services}
                  </Button>
                  <Button
                    color="inherit"
                    sx={{ fontWeight: 500, fontSize: '0.95rem', '&:hover': { opacity: 0.8 } }}
                    onClick={() => navigate('/about')}
                  >
                    {t.about}
                  </Button>
                  <Button
                    color="inherit"
                    sx={{ fontWeight: 500, fontSize: '0.95rem', '&:hover': { opacity: 0.8 } }}
                    onClick={() => navigate('/contact')}
                  >
                    {language === 'en' ? 'Contact' : language === 'tr' ? 'İletişim' : 'Контакт'}
                  </Button>
                </Stack>
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
              <FormControl size="small" sx={{ minWidth: { xs: 60, sm: 80, md: 100 } }}>
                <Select
                  value={language}
                  onChange={(e) => changeLanguage(e.target.value)}
                  sx={{
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                    '& .MuiSelect-select': { py: { xs: 0.5, md: 1 }, display: 'flex', alignItems: 'center', fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.95rem' } },
                    '& .MuiSvgIcon-root': { color: 'white' }
                  }}
                >
                  <MenuItem value="en">🇬🇧 {isMobile ? 'EN' : 'English'}</MenuItem>
                  <MenuItem value="tr">🇹🇷 {isMobile ? 'TR' : 'Türkçe'}</MenuItem>
                  <MenuItem value="ru">🇷🇺 {isMobile ? 'RU' : 'Русский'}</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                startIcon={<Business />}
                sx={{
                  backgroundColor: '#ff6b6b',
                  color: 'white',
                  fontWeight: 700,
                  px: 2.5,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  boxShadow: '0 8px 20px rgba(255, 107, 107, 0.3)',
                  '&:hover': {
                    backgroundColor: '#ff5252',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 24px rgba(255, 107, 107, 0.4)'
                  },
                  display: { xs: 'none', sm: 'flex' }
                }}
                onClick={() => navigate('/business-signup')}
              >
                {t.tryBusiness}
              </Button>

              {!isMobile && (
                <>
                  {isAuthenticated ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton sx={{ color: 'white', '&:hover': { opacity: 0.8 } }}>
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
                          '&:hover': { opacity: 0.8 }
                        }}
                      >
                        <Avatar
                          src={user?.avatar || user?.profile_picture || undefined}
                          sx={{ width: 32, height: 32, bgcolor: '#ff6b6b' }}
                        >
                          {!user?.avatar && !user?.profile_picture && (user?.name?.[0] || 'U')}
                        </Avatar>
                        <ExpandMore sx={{ fontSize: 18 }} />
                      </Button>
                    </Box>
                  ) : (
                    <>
                      <Button
                        variant="outlined"
                        sx={{
                          color: 'white',
                          borderColor: 'white',
                          fontWeight: 600,
                          px: 3,
                          '&:hover': {
                            borderColor: 'white',
                            bgcolor: 'rgba(255,255,255,0.1)'
                          }
                        }}
                        onClick={() => navigate('/signin')}
                      >
                        {t.login}
                      </Button>
                      <Button
                        variant="contained"
                        sx={{
                          bgcolor: 'white',
                          color: '#1a1f36',
                          fontWeight: 700,
                          px: 3,
                          '&:hover': {
                            bgcolor: '#f0f0f0',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 20px rgba(255,255,255,0.3)'
                          }
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
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          {language === 'en' ? 'Sign Out' : language === 'tr' ? 'Çıkış Yap' : 'Выход'}
        </MenuItem>
      </Menu>

      {/* Hero Section */}
      <Box sx={{
        position: 'relative',
        minHeight: { xs: '600px', sm: '680px', md: '720px' },
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          zIndex: 0
        }
      }}>
        {/* Animated shape elements */}
        <Box sx={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          zIndex: 0,
          animation: 'float 6s ease-in-out infinite'
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: '-10%',
          left: '5%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          zIndex: 0,
          animation: 'float 8s ease-in-out infinite reverse'
        }} />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: { xs: 6, md: 8 } }}>
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ color: 'white' }}>
                <Typography variant="overline" sx={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  opacity: 0.9,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Verified sx={{ fontSize: '16px' }} />
                  {language === 'en' ? 'TRUSTED BY MILLIONS' : language === 'tr' ? 'MİLYONLAR TARAFINDAN GÜVENILIR' : 'ДОВЕРЯЮТ МИЛЛИОНЫ'}
                </Typography>

                <Typography variant="h1" sx={{
                  fontWeight: 900,
                  mb: 3,
                  fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.8rem' },
                  lineHeight: { xs: 1.2, md: 1.1 },
                  textShadow: '0 4px 20px rgba(0,0,0,0.2)'
                }}>
                  {t.heroTitle || 'Find Your Perfect Service'}
                </Typography>

                <Typography variant="h5" sx={{
                  mb: 4,
                  fontSize: { xs: '1rem', sm: '1.15rem', md: '1.35rem' },
                  opacity: 0.95,
                  fontWeight: 300,
                  lineHeight: 1.6,
                  textShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                  {t.heroSubtitle || 'Book appointments with top-rated professionals across Europe'}
                </Typography>

                <Box sx={{
                  display: 'flex',
                  gap: 2,
                  flexWrap: 'wrap',
                  mb: 6
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ fontSize: '20px' }} />
                    <Typography variant="body2" sx={{ fontSize: '0.95rem', fontWeight: 500 }}>
                      2000+ Providers
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Star sx={{ fontSize: '20px' }} />
                    <Typography variant="body2" sx={{ fontSize: '0.95rem', fontWeight: 500 }}>
                      150K+ Happy Clients
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUp sx={{ fontSize: '20px' }} />
                    <Typography variant="body2" sx={{ fontSize: '0.95rem', fontWeight: 500 }}>
                      Fast & Reliable
                    </Typography>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  sx={{
                    bgcolor: 'white',
                    color: '#667eea',
                    fontWeight: 700,
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    borderRadius: '50px',
                    textTransform: 'none',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 16px 40px rgba(0,0,0,0.2)'
                    }
                  }}
                  onClick={() => {
                    document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {language === 'en' ? 'Book Now' : language === 'tr' ? 'Şimdi Rezervasyon Yap' : 'Забронировать'}
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box sx={{
                position: 'relative',
                height: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Box sx={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '80px'
                }}>
                  ✨
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(20px); }
          }
        `}</style>
      </Box>

      {/* Booking Section */}
      <Box id="booking-section" sx={{ py: { xs: 6, md: 8 }, bgcolor: '#f8f9ff' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{
            fontWeight: 900,
            textAlign: 'center',
            mb: { xs: 2, md: 3 },
            color: '#1a1f36',
            fontSize: { xs: '2rem', md: '2.8rem' }
          }}>
            {language === 'en' ? 'Quick Booking' : language === 'tr' ? 'Hızlı Rezervasyon' : 'Быстрое бронирование'}
          </Typography>
          <Typography variant="h6" sx={{
            textAlign: 'center',
            mb: 5,
            color: '#6b7280',
            maxWidth: 600,
            mx: 'auto'
          }}>
            {language === 'en' ? 'Select your preferred service and book your appointment in seconds' : language === 'tr' ? 'Tercih ettiğiniz hizmeti seçin ve dakikalar içinde randevu alın' : 'Выберите услугу и зарезервируйте встречу за секунды'}
          </Typography>

          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(102, 126, 234, 0.15)',
            border: '1px solid rgba(102, 126, 234, 0.1)',
            backdropFilter: 'blur(20px)'
          }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Grid container spacing={{ xs: 2, md: 3 }} alignItems="flex-end">
                {/* Category */}
                <Grid item xs={12} sm={6} md={1.7}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#667eea', display: 'block', mb: 1 }}>
                    {language === 'en' ? 'CATEGORY' : language === 'tr' ? 'KATEGORİ' : 'КАТЕГОРИЯ'}
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={selectedCategory}
                      onChange={(e) => handleCategorySelect(e.target.value)}
                      displayEmpty
                      renderValue={(selected) => {
                        if (!selected) return <em style={{ color: '#9ca3af' }}>Select</em>;
                        const cat = categories.find(c => c.id === selected);
                        return cat ? cat.label : selected;
                      }}
                      sx={{
                        borderRadius: 2,
                        bgcolor: 'white',
                        fontSize: '0.9rem',
                        '& .MuiOutlinedInput-notchedOutline': { borderWidth: '2px', borderColor: '#e5e7eb' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea' }
                      }}
                    >
                      {categories.map(cat => (
                        <MenuItem key={cat.id} value={cat.id}>{cat.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Arrow */}
                <Grid item xs={false} md={0.3} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center', mb: 1 }}>
                  <ArrowForward sx={{ color: '#d1d5db', fontSize: 20 }} />
                </Grid>

                {/* Business */}
                <Grid item xs={12} sm={6} md={1.7}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#667eea', display: 'block', mb: 1 }}>
                    {language === 'en' ? 'BUSINESS' : language === 'tr' ? 'İŞLETME' : 'БИЗНЕС'}
                  </Typography>
                  <FormControl fullWidth disabled={!selectedCategory}>
                    <Select
                      value={selectedBusiness}
                      onChange={(e) => handleBusinessSelect(e.target.value)}
                      displayEmpty
                      renderValue={(selected) => {
                        if (!selected) return <em style={{ color: '#9ca3af' }}>Select</em>;
                        const business = categoryBusinesses.find(b => b.id === selected);
                        return business ? (business.business_name || business.name) : selected;
                      }}
                      sx={{
                        borderRadius: 2,
                        bgcolor: 'white',
                        fontSize: '0.9rem',
                        '& .MuiOutlinedInput-notchedOutline': { borderWidth: '2px', borderColor: '#e5e7eb' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea' }
                      }}
                    >
                      {categoryBusinesses.map(business => (
                        <MenuItem key={business.id} value={business.id}>
                          {business.business_name || business.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Arrow */}
                <Grid item xs={false} md={0.3} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center', mb: 1 }}>
                  <ArrowForward sx={{ color: '#d1d5db', fontSize: 20 }} />
                </Grid>

                {/* Worker */}
                <Grid item xs={12} sm={6} md={1.7}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#667eea', display: 'block', mb: 1 }}>
                    {language === 'en' ? 'PROVIDER' : language === 'tr' ? 'ÇALIŞAN' : 'РАБОТНИК'}
                  </Typography>
                  <FormControl fullWidth disabled={!selectedBusiness}>
                    <Select
                      value={selectedWorker}
                      onChange={(e) => handleWorkerSelect(e.target.value)}
                      displayEmpty
                      renderValue={(selected) => {
                        if (!selected) return <em style={{ color: '#9ca3af' }}>Select</em>;
                        const worker = businessWorkers.find(w => w.id === selected);
                        return worker ? worker.name : selected;
                      }}
                      sx={{
                        borderRadius: 2,
                        bgcolor: 'white',
                        fontSize: '0.9rem',
                        '& .MuiOutlinedInput-notchedOutline': { borderWidth: '2px', borderColor: '#e5e7eb' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea' }
                      }}
                    >
                      {businessWorkers.map(worker => (
                        <MenuItem key={worker.id} value={worker.id}>{worker.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Arrow */}
                <Grid item xs={false} md={0.3} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center', mb: 1 }}>
                  <ArrowForward sx={{ color: '#d1d5db', fontSize: 20 }} />
                </Grid>

                {/* Service */}
                <Grid item xs={12} sm={6} md={1.8}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#667eea', display: 'block', mb: 1 }}>
                    {language === 'en' ? 'SERVICE' : language === 'tr' ? 'HİZMET' : 'УСЛУГА'}
                  </Typography>
                  <FormControl fullWidth disabled={!selectedWorker}>
                    <Select
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      displayEmpty
                      renderValue={(selected) => {
                        if (!selected) return <em style={{ color: '#9ca3af' }}>Select</em>;
                        const service = workerServices.find(s => s.id === selected);
                        return service ? `${service.name}` : selected;
                      }}
                      sx={{
                        borderRadius: 2,
                        bgcolor: 'white',
                        fontSize: '0.9rem',
                        '& .MuiOutlinedInput-notchedOutline': { borderWidth: '2px', borderColor: '#e5e7eb' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea' }
                      }}
                    >
                      {workerServices.map(service => (
                        <MenuItem key={service.id} value={service.id}>
                          {service.name} - €{service.price}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Date */}
                <Grid item xs={12} sm={6} md={1.65}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#667eea', display: 'block', mb: 1 }}>
                    {language === 'en' ? 'DATE' : language === 'tr' ? 'TARİH' : 'ДАТА'}
                  </Typography>
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
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '& fieldset': { borderWidth: '2px', borderColor: '#e5e7eb' },
                        '&:hover fieldset': { borderColor: '#667eea' },
                        '&.Mui-focused fieldset': { borderColor: '#667eea' }
                      }
                    }}
                  />
                </Grid>

                {/* Time */}
                <Grid item xs={12} sm={6} md={1.55}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#667eea', display: 'block', mb: 1 }}>
                    {language === 'en' ? 'TIME' : language === 'tr' ? 'SAAT' : 'ВРЕМЯ'}
                  </Typography>
                  <TextField
                    fullWidth
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    disabled={!selectedDate}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '& fieldset': { borderWidth: '2px', borderColor: '#e5e7eb' },
                        '&:hover fieldset': { borderColor: '#667eea' },
                        '&.Mui-focused fieldset': { borderColor: '#667eea' }
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
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      fontWeight: 700,
                      py: 1.8,
                      fontSize: '1.1rem',
                      borderRadius: 2,
                      textTransform: 'none',
                      boxShadow: '0 12px 32px rgba(102, 126, 234, 0.3)',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 16px 40px rgba(102, 126, 234, 0.4)'
                      },
                      '&:disabled': {
                        opacity: 0.5,
                        cursor: 'not-allowed'
                      }
                    }}
                  >
                    {language === 'en' ? '📅 Book Appointment' : language === 'tr' ? '📅 Randevu Al' : '📅 Забронировать'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Container>
      </Box>

      {/* Featured Businesses */}
      <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="overline" sx={{
              fontSize: '0.85rem',
              fontWeight: 700,
              letterSpacing: '2px',
              color: '#667eea',
              mb: 2
            }}>
              OUR PARTNERS
            </Typography>
            <Typography variant="h2" sx={{
              fontWeight: 900,
              color: '#1a1f36',
              fontSize: { xs: '2rem', md: '2.8rem' },
              mb: 3
            }}>
              {language === 'en' ? 'Featured Businesses' : language === 'tr' ? 'Öne Çıkan İşletmeler' : 'Избранные предприятия'}
            </Typography>
            <Typography variant="h6" sx={{
              color: '#6b7280',
              maxWidth: 600,
              mx: 'auto'
            }}>
              {language === 'en' ? 'Discover top-rated professionals in your area' : language === 'tr' ? 'Bölgenizde en yüksek puanlı profesyonelleri keşfedin' : 'Откройте лучших профессионалов в вашем районе'}
            </Typography>
          </Box>

          {loadingBusinesses ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="body1" sx={{ color: '#6b7280' }}>
                {language === 'en' ? 'Loading businesses...' : language === 'tr' ? 'İşletmeler yükleniyor...' : 'Загрузка...'}
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {featuredBusinesses.map((business) => (
                <Grid item xs={12} sm={6} lg={4} key={business.id}>
                  <Card
                    onClick={() => navigate(`/business/${business.id}`)}
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      overflow: 'hidden',
                      border: '1px solid #f0f0f0',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-12px)',
                        boxShadow: '0 24px 48px rgba(102, 126, 234, 0.2)',
                        borderColor: '#667eea'
                      }
                    }}
                  >
                    <Box sx={{ position: 'relative', height: 280 }}>
                      <CardMedia
                        component="img"
                        height="280"
                        image={getBusinessImage(business.id)}
                        alt={business.business_name || business.name}
                        sx={{ objectFit: 'cover' }}
                      />
                      <Box sx={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.6) 100%)',
                        zIndex: 1
                      }} />

                      <Box sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: 3,
                        zIndex: 2,
                        color: 'white'
                      }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                          {business.business_name || business.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Rating value={Math.min(business.rating, 5)} readOnly size="small" sx={{ color: '#fbbf24' }} />
                          <Typography variant="caption" sx={{ opacity: 0.9 }}>
                            {business.rating?.toFixed(1) || 4.5}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <CardContent sx={{ p: 3 }}>
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                          <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#f8f9ff', textAlign: 'center' }}>
                            <People sx={{ fontSize: 24, color: '#667eea', mb: 0.5 }} />
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1f36' }}>
                              {business.workers_count || 0}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#6b7280' }}>
                              {language === 'en' ? 'Professionals' : language === 'tr' ? 'Profesyoneller' : 'Специалисты'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#f8f9ff', textAlign: 'center' }}>
                            <Star sx={{ fontSize: 24, color: '#fbbf24', mb: 0.5 }} />
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1f36' }}>
                              {business.services_count || 0}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#6b7280' }}>
                              {language === 'en' ? 'Services' : language === 'tr' ? 'Hizmetler' : 'Услуги'}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      <Divider sx={{ my: 2 }} />

                      <Button
                        fullWidth
                        variant="contained"
                        sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          fontWeight: 700,
                          textTransform: 'none',
                          borderRadius: 2,
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
                          }
                        }}
                      >
                        {language === 'en' ? 'View Details' : language === 'tr' ? 'Detayları Gör' : 'Подробнее'}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Button
              variant="outlined"
              size="large"
              endIcon={<ArrowForward />}
              sx={{
                borderColor: '#667eea',
                color: '#667eea',
                fontWeight: 700,
                px: 4,
                py: 1.5,
                borderRadius: 50,
                borderWidth: 2,
                '&:hover': {
                  borderColor: '#764ba2',
                  color: '#764ba2',
                  bgcolor: 'transparent'
                }
              }}
            >
              {language === 'en' ? 'See All Businesses' : language === 'tr' ? 'Tüm İşletmeleri Gör' : 'Все бизнесы'}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Map Section */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: '#f8f9ff' }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="overline" sx={{
              fontSize: '0.85rem',
              fontWeight: 700,
              letterSpacing: '2px',
              color: '#667eea',
              mb: 2
            }}>
              FIND NEAR YOU
            </Typography>
            <Typography variant="h2" sx={{
              fontWeight: 900,
              color: '#1a1f36',
              fontSize: { xs: '2rem', md: '2.8rem' },
              mb: 3
            }}>
              {language === 'en' ? 'Discover Nearby Services' : language === 'tr' ? 'Yakın Hizmetleri Keşfet' : 'Откройте рядом'}
            </Typography>
          </Box>

          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
            mb: 3,
            border: '1px solid rgba(102, 126, 234, 0.1)'
          }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder={language === 'en' ? 'Search location...' : language === 'tr' ? 'Konum ara...' : 'Поиск...'}
                    value={mapSearchQuery}
                    onChange={(e) => setMapSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ color: '#667eea' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '& fieldset': { borderColor: '#e5e7eb' },
                        '&:hover fieldset': { borderColor: '#667eea' },
                        '&.Mui-focused fieldset': { borderColor: '#667eea' }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <Select
                      value={mapCategory}
                      onChange={(e) => setMapCategory(e.target.value)}
                      displayEmpty
                      sx={{
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e7eb' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea' }
                      }}
                    >
                      <MenuItem value="all">{language === 'en' ? 'All Services' : language === 'tr' ? 'Tüm Hizmetler' : 'Все услуги'}</MenuItem>
                      <MenuItem value="barber">💈 {language === 'en' ? 'Barber' : language === 'tr' ? 'Berber' : 'Парикмахер'}</MenuItem>
                      <MenuItem value="beauty">💅 {language === 'en' ? 'Beauty' : language === 'tr' ? 'Güzellik' : 'Красота'}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<LocationOn />}
                    onClick={handleFindMyLocation}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      fontWeight: 700,
                      borderRadius: 2,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
                      }
                    }}
                  >
                    {language === 'en' ? 'Find Location' : language === 'tr' ? 'Konum Bul' : 'Найти'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Box sx={{
            height: { xs: 350, md: 500 },
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
            border: '2px solid rgba(102, 126, 234, 0.2)'
          }}>
            <iframe
              src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${userLocation.lat},${userLocation.lng}&zoom=13`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={language === 'en' ? 'Map' : language === 'tr' ? 'Harita' : 'Карта'}
            />
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#1a1f36', color: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} sx={{ mb: 6 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Logo size="medium" variant="white" />
              <Typography variant="body2" sx={{ mt: 2, opacity: 0.8, lineHeight: 1.8 }}>
                {language === 'en' ? 'Book appointments with the best professionals' : language === 'tr' ? 'En iyi profesyonellerle randevu alın' : 'Забронируйте встречу с лучшими специалистами'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                {language === 'en' ? 'Quick Links' : language === 'tr' ? 'Hızlı Bağlantılar' : 'Быстрые ссылки'}
              </Typography>
              <Stack spacing={1}>
                <Link href="/services" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>{t.services}</Link>
                <Link href="/about" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>{t.about}</Link>
                <Link href="/contact" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>Contact</Link>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                {language === 'en' ? 'Company' : language === 'tr' ? 'Şirket' : 'Компания'}
              </Typography>
              <Stack spacing={1}>
                <Link href="/company" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>About Us</Link>
                <Link href="/support" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>Support</Link>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                {language === 'en' ? 'For Businesses' : language === 'tr' ? 'İşletmeler İçin' : 'Для бизнеса'}
              </Typography>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontWeight: 700,
                  borderRadius: 2
                }}
                onClick={() => navigate('/business-signup')}
              >
                {t.tryBusiness}
              </Button>
            </Grid>
          </Grid>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 4 }} />

          <Box sx={{ textAlign: 'center', opacity: 0.7 }}>
            <Typography variant="body2">
              © 2024 Aponti. {language === 'en' ? 'All rights reserved.' : language === 'tr' ? 'Tüm hakları saklıdır.' : 'Все права защищены.'}
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
