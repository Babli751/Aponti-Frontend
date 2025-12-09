import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { getServicesCatalog } from '../data/servicesCatalog';
import api, { bookingAPI } from '../services/api';
import { formatDate, formatTime, formatDateTime } from '../utils/dateUtils';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Avatar,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Stack,
  FormControl,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
  TextField,
  Tabs,
  Tab,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  Drawer,
  ListItemButton,
  ListItemIcon,
  BottomNavigation,
  BottomNavigationAction
} from '@mui/material';
import {
   ArrowBack,
   Schedule,
   Star,
   History,
   Favorite,
   LocationOn,
   AccessTime,
   EuroSymbol,
   PhotoCamera,
   Edit,
   CalendarToday,
   TrendingUp,
   Person,
   Menu as MenuIcon,
   Close,
   Home as HomeIcon,
   ContentCut,
   Business,
   Support as SupportIcon,
   Settings,
   Logout,
   AccountCircle
 } from '@mui/icons-material';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, updateUser, isAuthenticated, logout } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bottomNavValue, setBottomNavValue] = useState(2); // Dashboard is at index 2

  const [tabValue, setTabValue] = useState(() => {
    if (location.pathname === '/favorites') {
      return 1;
    }
    return location.state?.tab ?? 0;
  });

  // Scroll to profile section if coming from profile menu
  useEffect(() => {
    if (location.state?.scrollToProfile) {
      setTimeout(() => {
        const profileCard = document.getElementById('profile-card');
        if (profileCard) {
          profileCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [location.state]);
  const [photoUploadOpen, setPhotoUploadOpen] = useState(false);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: ''
  });
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(user?.avatar_url || user?.avatar || user?.profile_picture || '');

  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [favoriteBarbers, setFavoriteBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [profileInfo, setProfileInfo] = useState(null);
  const [searchCity, setSearchCity] = useState('');
  const [availableServices, setAvailableServices] = useState([]);
  const [favoriteServices, setFavoriteServices] = useState([]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const content = {
    en: {
      dashboard: 'My Dashboard',
      upcomingAppointment: 'Upcoming',
      pastAppointment: 'Completed',
      favoriteServices: 'Favorites',
      confirmed: 'Confirmed',
      pending: 'Pending',
      completed: 'Completed',
      cancelled: 'Cancelled',
      givenRating: 'Given rating',
      writeReview: 'Write Review',
      visits: 'visits',
      bookAppointment: 'Book Appointment',
      phone: 'Phone',
      pastAppointmentsTitle: 'Past Appointments',
      search: 'Search',
      findServices: 'Find Services',
      viewBarberProfile: 'View Barber Profile',
      noPastAppointments: 'No past appointments',
      noFavoriteServices: 'No favorite services',
      loadingPast: 'Loading past appointments...',
      loadingFavorites: 'Loading favorite barbers...',
      failedPast: 'Failed to load past appointments',
      failedFavorites: 'Failed to load favorite barbers',
      retry: 'Retry',
      membership: 'Membership',
      userType: 'User Type',
      memberSince: 'Member Since',
      editProfile: 'Edit Profile',
      uploadPhoto: 'Upload Photo',
      brand: 'Aponti',
      home: 'Home',
      services: 'Services',
      about: 'About',
      company: 'Company',
      support: 'Support',
      appointments: 'Appointments',
      favorites: 'Favorites',
      profile: 'Profile',
      login: 'Login',
      signup: 'Sign Up',
      tryBusiness: 'Try Business'
    },
    tr: {
      dashboard: 'Kontrol Panelim',
      upcomingAppointment: 'Yaklaşan',
      pastAppointment: 'Tamamlanan',
      favoriteServices: 'Favoriler',
      confirmed: 'Onaylandı',
      pending: 'Beklemede',
      completed: 'Tamamlandı',
      cancelled: 'İptal Edildi',
      givenRating: 'Verilen puan',
      writeReview: 'Yorum Yaz',
      visits: 'ziyaret',
      bookAppointment: 'Randevu Al',
      phone: 'Telefon',
      pastAppointmentsTitle: 'Geçmiş Randevular',
      search: 'Ara',
      findServices: 'Servis Bul',
      viewBarberProfile: 'Profili Gör',
      noPastAppointments: 'Geçmiş randevu yok',
      noFavoriteServices: 'Favori servis yok',
      loadingPast: 'Geçmiş randevular yükleniyor...',
      loadingFavorites: 'Favori berberler yükleniyor...',
      failedPast: 'Geçmiş randevular yüklenemedi',
      failedFavorites: 'Favori berberler yüklenemedi',
      retry: 'Tekrar Dene',
      membership: 'Üyelik',
      userType: 'Kullanıcı Tipi',
      memberSince: 'Üye Olma Tarihi',
      editProfile: 'Profili Düzenle',
      uploadPhoto: 'Fotoğraf Yükle',
      brand: 'Aponti',
      home: 'Ana Sayfa',
      services: 'Hizmetler',
      about: 'Hakkımızda',
      company: 'Şirket',
      support: 'Destek',
      appointments: 'Randevularım',
      favorites: 'Favoriler',
      profile: 'Profil',
      login: 'Giriş',
      signup: 'Kayıt Ol',
      tryBusiness: 'İşletme Kayıt'
    },
    ru: {
      dashboard: 'Моя панель',
      upcomingAppointment: 'Предстоящие',
      pastAppointment: 'Завершенные',
      favoriteServices: 'Избранное',
      confirmed: 'Подтверждено',
      pending: 'В ожидании',
      completed: 'Завершено',
      cancelled: 'Отменено',
      givenRating: 'Оценка',
      writeReview: 'Написать отзыв',
      visits: 'визиты',
      bookAppointment: 'Записаться',
      phone: 'Телефон',
      pastAppointmentsTitle: 'Прошлые записи',
      search: 'Поиск',
      findServices: 'Найти услугу',
      viewBarberProfile: 'Профиль',
      noPastAppointments: 'Нет прошлых записей',
      noFavoriteServices: 'Нет избранных',
      loadingPast: 'Загрузка...',
      loadingFavorites: 'Загрузка избранных...',
      failedPast: 'Ошибка загрузки',
      failedFavorites: 'Ошибка загрузки избранных',
      retry: 'Повторить',
      membership: 'Членство',
      userType: 'Тип пользователя',
      memberSince: 'Дата регистрации',
      editProfile: 'Редактировать',
      uploadPhoto: 'Загрузить фото',
      brand: 'Aponti',
      home: 'Главная',
      services: 'Услуги',
      about: 'О нас',
      company: 'Компания',
      support: 'Поддержка',
      appointments: 'Записи',
      favorites: 'Избранное',
      profile: 'Профиль',
      login: 'Войти',
      signup: 'Регистрация',
      tryBusiness: 'Бизнес регистрация'
    }
  };

  const t = content[language];

  // Update profile photo when user changes
  useEffect(() => {
    const avatarUrl = user?.avatar_url || user?.avatar || user?.profile_picture || '';
    setProfilePhotoUrl(avatarUrl);
    // Initialize profileInfo from user data
    if (user) {
      setProfileInfo({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number,
        avatar_url: user.avatar_url,
        membership_tier: user.membership_tier
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch appointments from real database
        const appointmentsResponse = await bookingAPI.getAppointments().catch(() => []);
        console.log('📅 Fetched appointments from database:', appointmentsResponse);

        // Fetch all barbers and services from database
        const workersMap = {};
        const servicesMap = {};

        // Fetch all barbers
        try {
          const barbersResponse = await api.get('/barbers/');
          const barbers = barbersResponse.data || [];
          barbers.forEach(b => {
            // Use full_name if available, otherwise combine first_name and last_name
            const name = b.full_name || `${b.first_name || ''} ${b.last_name || ''}`.trim() || 'Worker';
            workersMap[b.id] = name;
          });
          console.log('👨‍💼 Fetched barbers from database:', barbers.length);
        } catch (error) {
          console.error('Error fetching barbers:', error);
        }

        // Fetch all services
        try {
          const servicesResponse = await api.get('/services/');
          const services = servicesResponse.data || [];
          services.forEach(s => {
            servicesMap[s.id] = {
              name: s.name || 'Service',
              price: s.price || 0,
              duration: s.duration || 0
            };
          });
          console.log('✂️ Fetched services from database:', services.length);
        } catch (error) {
          console.error('Error fetching services:', error);
        }

        // Transform appointments to display format with real data
        const transformedAppointments = (appointmentsResponse || []).map(apt => {
          const workerName = workersMap[apt.barber_id] || 'Worker';
          const serviceInfo = servicesMap[apt.service_id] || { name: 'Service', price: 0, duration: 0 };

          return {
            id: apt.id,
            barberName: workerName,
            service: serviceInfo.name,
            price: serviceInfo.price ? `€${serviceInfo.price}` : '',
            date: formatDate(apt.start_time, language),
            time: formatTime(apt.start_time, language),
            status: apt.status,
            barberImage: null,
            start_time: apt.start_time
          };
        });

        // Separate upcoming and past appointments
        const now = new Date();
        const upcoming = transformedAppointments.filter(apt => new Date(apt.start_time) >= now);
        const past = transformedAppointments.filter(apt => new Date(apt.start_time) < now);

        setUpcomingAppointments(upcoming);
        setPastAppointments(past);

        // Fetch favorite services
        try {
          const favoritesResponse = await api.get('/users/favorites');
          const favorites = favoritesResponse.data || [];
          console.log('⭐ Fetched favorites from database:', favorites);

          // Backend now returns services directly in the right format
          setFavoriteServices(favorites);
          console.log('⭐ Favorites set:', favorites.length, 'items');
        } catch (error) {
          console.error('Error fetching favorites:', error);
          setFavoriteServices([]);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [language]);

  const getUserFullName = () => {
    // Prioritize profileInfo since it gets updated immediately when user edits profile
    if (profileInfo?.first_name && profileInfo?.last_name) {
      return `${profileInfo.first_name} ${profileInfo.last_name}`;
    }
    if (profileInfo?.first_name) return profileInfo.first_name;

    // Fallback to user from AuthContext
    if (user?.full_name) return user.full_name;
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user?.first_name) return user.first_name;

    return profileInfo?.email?.split('@')[0] || user?.email?.split('@')[0] || 'User';
  };

  const getUserInitials = () => {
    const fullName = getUserFullName();
    const names = fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  const getUserEmail = () => {
    return user?.email || profileInfo?.email || 'user@example.com';
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        // Upload to backend
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/users/avatar', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        // Update local state with the avatar URL from backend
        const avatarUrl = response.data.avatar_url;
        setProfilePhotoUrl(avatarUrl);

        // Update user context
        await updateUser({ avatar_url: avatarUrl });

        setPhotoUploadOpen(false);
        alert(language === 'en' ? 'Profile photo updated!' : language === 'tr' ? 'Profil fotoğrafı güncellendi!' : 'Фото профиля обновлено!');
      } catch (error) {
        console.error('Error uploading photo:', error);
        alert(language === 'en' ? 'Failed to upload photo' : language === 'tr' ? 'Fotoğraf yüklenemedi' : 'Ошибка загрузки');
      }
    }
  };

  function TabPanel({ children, value, index }) {
    return value === index ? <Box sx={{ p: 3 }}>{children}</Box> : null;
  }

  return (
    <Box sx={{ bgcolor: '#f0f4f8', minHeight: '100vh', pb: { xs: '70px', md: 0 } }}>
      {/* Navbar Component */}
      <Navbar onMenuClick={() => setDrawerOpen(true)} />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {console.log('🖼️ Dashboard render: profilePhotoUrl =', profilePhotoUrl, 'user.avatar_url =', user?.avatar_url)}
        {/* Profile Card - Top */}
        <Card id="profile-card" sx={{
          mb: 4,
          background: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
          color: 'white',
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(102,126,234,0.3)'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <IconButton
                      sx={{
                        bgcolor: '#2d3748',
                        color: 'white',
                        width: 40,
                        height: 40,
                        '&:hover': { bgcolor: '#1a202c' }
                      }}
                      onClick={() => setPhotoUploadOpen(true)}
                    >
                      <PhotoCamera />
                    </IconButton>
                  }
                >
                  <Avatar
                    src={profilePhotoUrl}
                    sx={{
                      width: 120,
                      height: 120,
                      border: '4px solid white',
                      bgcolor: 'rgba(255,255,255,0.3)',
                      fontSize: '3rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {!profilePhotoUrl && getUserInitials()}
                  </Avatar>
                </Badge>
              </Grid>
              <Grid item xs>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {getUserFullName()}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                  {getUserEmail()}
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Chip
                    icon={<Person />}
                    label={profileInfo?.membership_tier || 'Standard Member'}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }}
                  />
                  <Chip
                    icon={<CalendarToday />}
                    label={`Member since ${new Date().getFullYear()}`}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }}
                  />
                </Stack>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={() => {
                    setEditFormData({
                      first_name: user?.first_name || '',
                      last_name: user?.last_name || '',
                      email: user?.email || '',
                      phone_number: user?.phone_number || ''
                    });
                    setProfileEditOpen(true);
                  }}
                  sx={{
                    bgcolor: 'white',
                    color: '#2d3748',
                    fontWeight: 'bold',
                    px: 3,
                    py: 1.5,
                    '&:hover': { bgcolor: '#f0f0f0' }
                  }}
                >
                  {t.editProfile}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
              color: 'white',
              borderRadius: 3,
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 12px 40px rgba(102,126,234,0.4)' }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Schedule sx={{ fontSize: 50, mb: 2, opacity: 0.9 }} />
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {upcomingAppointments.length}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {t.upcomingAppointment}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)',
              color: 'white',
              borderRadius: 3,
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 12px 40px rgba(245,87,108,0.4)' }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <History sx={{ fontSize: 50, mb: 2, opacity: 0.9 }} />
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {pastAppointments.length}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {t.pastAppointment}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, #718096 0%, #4a5568 100%)',
              color: 'white',
              borderRadius: 3,
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 12px 40px rgba(79,172,254,0.4)' }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Favorite sx={{ fontSize: 50, mb: 2, opacity: 0.9 }} />
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {favoriteServices.length}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {t.favoriteServices}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, #a0aec0 0%, #718096 100%)',
              color: 'white',
              borderRadius: 3,
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 12px 40px rgba(67,233,123,0.4)' }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <TrendingUp sx={{ fontSize: 50, mb: 2, opacity: 0.9 }} />
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {pastAppointments.length * 2}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Total Visits
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs Section */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#fafafa' }}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              variant={isMobile ? "scrollable" : "standard"}
              scrollButtons={isMobile ? "auto" : false}
              sx={{
                '& .MuiTab-root': {
                  fontSize: '1rem',
                  fontWeight: 600,
                  py: 2.5
                },
                '& .Mui-selected': {
                  color: '#2d3748'
                }
              }}
            >
              <Tab label={language === 'en' ? '📅 My Appointments' : language === 'tr' ? '📅 Randevularım' : '📅 Мои записи'} />
              <Tab label={language === 'en' ? '❤️ Favorites' : language === 'tr' ? '❤️ Favoriler' : '❤️ Избранное'} />
              <Tab label={language === 'en' ? '📊 History' : language === 'tr' ? '📊 Geçmiş' : '📊 История'} />
            </Tabs>
          </Box>

          {/* My Appointments Tab */}
          <TabPanel value={tabValue} index={0}>
            {upcomingAppointments.length > 0 ? (
              <List>
                {upcomingAppointments.map((appointment, index) => (
                  <React.Fragment key={appointment.id}>
                    <ListItem sx={{
                      px: 3,
                      py: 3,
                      borderRadius: 2,
                      mb: 2,
                      bgcolor: '#f8f9fa',
                      '&:hover': { bgcolor: '#e9ecef' }
                    }}>
                      <ListItemAvatar>
                        <Avatar
                          src={appointment.barberImage}
                          sx={{ width: 70, height: 70, border: '3px solid #2d3748' }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        sx={{ ml: 2 }}
                        primary={
                          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                            {appointment.barberName || 'Service'}
                          </Typography>
                        }
                        secondary={
                          <Stack spacing={1}>
                            <Typography variant="body1" sx={{ color: '#2d3748', fontWeight: 600 }}>
                              {appointment.service}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                              <Chip icon={<CalendarToday />} label={appointment.date} size="small" />
                              <Chip icon={<AccessTime />} label={appointment.time} size="small" />
                              <Chip
                                label={appointment.status || 'Confirmed'}
                                size="small"
                                sx={{
                                  bgcolor: '#e8f5e9',
                                  color: '#2e7d32',
                                  fontWeight: 'bold'
                                }}
                              />
                            </Box>
                          </Stack>
                        }
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Schedule sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No upcoming appointments
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => {
                    navigate('/');
                    // Scroll to booking form after navigation
                    setTimeout(() => {
                      const bookingForm = document.getElementById('booking-form');
                      if (bookingForm) {
                        bookingForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }, 100);
                  }}
                  sx={{
                    mt: 3,
                    bgcolor: '#2d3748',
                    '&:hover': { bgcolor: '#1a202c' },
                    px: 4,
                    py: 1.5
                  }}
                >
                  Book Now
                </Button>
              </Box>
            )}
          </TabPanel>

          {/* Favorites Tab */}
          <TabPanel value={tabValue} index={1}>
            {favoriteServices.length > 0 ? (
              <Grid container spacing={3}>
                {favoriteServices.map((service) => (
                  <Grid item xs={12} sm={6} md={4} key={service.id}>
                    <Card sx={{
                      borderRadius: 3,
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                      }
                    }}>
                      <CardContent>
                        <Avatar
                          src={service.image}
                          sx={{ width: 60, height: 60, mb: 2, bgcolor: '#2d3748' }}
                        >
                          {service.name?.[0]}
                        </Avatar>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {service.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {service.description}
                        </Typography>
                        <Button
                          variant="outlined"
                          fullWidth
                          sx={{
                            color: '#2d3748',
                            borderColor: '#2d3748',
                            '&:hover': { bgcolor: '#edf2f7', borderColor: '#2d3748' }
                          }}
                          onClick={() => {
                            // Navigate to barber/business detail page
                            // Assuming business ID is 1 for now (we can improve this later)
                            navigate(`/business/1`);
                          }}
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Favorite sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  {t.noFavoriteServices}
                </Typography>
              </Box>
            )}
          </TabPanel>

          {/* History Tab */}
          <TabPanel value={tabValue} index={2}>
            {pastAppointments.length > 0 ? (
              <List>
                {pastAppointments.map((appointment, index) => (
                  <React.Fragment key={appointment.id}>
                    <ListItem sx={{ px: 3, py: 3 }}>
                      <ListItemAvatar>
                        <Avatar src={appointment.barberImage} sx={{ width: 60, height: 60 }} />
                      </ListItemAvatar>
                      <ListItemText
                        sx={{ ml: 2 }}
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              {appointment.barberName}
                            </Typography>
                            <Typography variant="h6" sx={{ color: '#2d3748', fontWeight: 'bold' }}>
                              {appointment.price}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Stack spacing={1}>
                            <Typography variant="body1">{appointment.service}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {appointment.date} - {appointment.time}
                            </Typography>
                            {appointment.rating && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Star sx={{ color: '#fbbf24' }} />
                                <Typography>{appointment.rating}/5</Typography>
                              </Box>
                            )}
                          </Stack>
                        }
                      />
                    </ListItem>
                    {index < pastAppointments.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <History sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  {t.noPastAppointments}
                </Typography>
              </Box>
            )}
          </TabPanel>
        </Card>
      </Container>

      {/* Photo Upload Dialog */}
      <Dialog open={photoUploadOpen} onClose={() => setPhotoUploadOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#edf2f7', color: '#2d3748', fontWeight: 'bold' }}>
          📸 {t.uploadPhoto}
        </DialogTitle>
        <DialogContent sx={{ py: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="photo-upload"
              type="file"
              onChange={handlePhotoUpload}
            />
            <label htmlFor="photo-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={<PhotoCamera />}
                sx={{
                  bgcolor: '#2d3748',
                  '&:hover': { bgcolor: '#1a202c' },
                  px: 4,
                  py: 2,
                  fontSize: '1.1rem'
                }}
              >
                Choose Photo
              </Button>
            </label>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setPhotoUploadOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={profileEditOpen} onClose={() => setProfileEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#2d3748', color: 'white' }}>
          {t.editProfile}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={language === 'en' ? 'First Name' : language === 'tr' ? 'Ad' : 'Имя'}
                value={editFormData.first_name}
                onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                sx={{ mt: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={language === 'en' ? 'Last Name' : language === 'tr' ? 'Soyad' : 'Фамилия'}
                value={editFormData.last_name}
                onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                sx={{ mt: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={language === 'en' ? 'Email' : language === 'tr' ? 'E-posta' : 'Email'}
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={language === 'en' ? 'Phone Number' : language === 'tr' ? 'Telefon' : 'Телефон'}
                value={editFormData.phone_number}
                onChange={(e) => setEditFormData({ ...editFormData, phone_number: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setProfileEditOpen(false)}>
            {language === 'en' ? 'Cancel' : language === 'tr' ? 'İptal' : 'Отмена'}
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              try {
                // Update user in AuthContext and localStorage (this also calls API)
                await updateUser(editFormData);

                // Update local profileInfo state to reflect changes immediately
                setProfileInfo(prev => ({
                  ...prev,
                  first_name: editFormData.first_name,
                  last_name: editFormData.last_name,
                  email: editFormData.email,
                  phone_number: editFormData.phone_number
                }));

                setProfileEditOpen(false);
                alert(language === 'en' ? 'Profile updated!' : language === 'tr' ? 'Profil güncellendi!' : 'Профиль обновлен!');
              } catch (err) {
                console.error('Profile update error:', err);
                alert(language === 'en' ? 'Update failed' : language === 'tr' ? 'Güncelleme başarısız' : 'Ошибка');
              }
            }}
            sx={{ bgcolor: '#2d3748', '&:hover': { bgcolor: '#1a202c' } }}
          >
            {language === 'en' ? 'Save' : language === 'tr' ? 'Kaydet' : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mobile Quick Action Buttons */}
      {isMobile && (
        <Box sx={{
          px: 2,
          pb: 10,  // Extra padding to account for bottom navigation
          mt: 3
        }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<Schedule />}
                onClick={() => {
                  navigate('/');
                  // Scroll to booking form after navigation
                  setTimeout(() => {
                    const bookingForm = document.getElementById('booking-form');
                    if (bookingForm) {
                      bookingForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }, 100);
                }}
                sx={{
                  bgcolor: '#2d3748',
                  color: 'white',
                  py: 2,
                  borderRadius: 3,
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(45, 55, 72, 0.3)',
                  '&:hover': {
                    bgcolor: '#1a202c',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(45, 55, 72, 0.4)'
                  },
                  transition: 'all 0.3s'
                }}
              >
                {language === 'en' ? 'Book Now' : language === 'tr' ? 'Randevu Al' : 'Записаться'}
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<Favorite />}
                onClick={() => setTabValue(1)}
                sx={{
                  bgcolor: '#4a5568',
                  color: 'white',
                  py: 2,
                  borderRadius: 3,
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(74, 85, 104, 0.3)',
                  '&:hover': {
                    bgcolor: '#2d3748',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(74, 85, 104, 0.4)'
                  },
                  transition: 'all 0.3s'
                }}
              >
                {language === 'en' ? 'My Favorites' : language === 'tr' ? 'Favorilerim' : 'Избранное'}
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<History />}
                onClick={() => setTabValue(2)}
                sx={{
                  bgcolor: '#718096',
                  color: 'white',
                  py: 2,
                  borderRadius: 3,
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(113, 128, 150, 0.3)',
                  '&:hover': {
                    bgcolor: '#4a5568',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(113, 128, 150, 0.4)'
                  },
                  transition: 'all 0.3s'
                }}
              >
                {language === 'en' ? 'History' : language === 'tr' ? 'Geçmiş' : 'История'}
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<Edit />}
                onClick={() => {
                  setEditFormData({
                    first_name: user?.first_name || '',
                    last_name: user?.last_name || '',
                    email: user?.email || '',
                    phone_number: user?.phone_number || ''
                  });
                  setProfileEditOpen(true);
                }}
                sx={{
                  bgcolor: '#a0aec0',
                  color: 'white',
                  py: 2,
                  borderRadius: 3,
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(160, 174, 192, 0.3)',
                  '&:hover': {
                    bgcolor: '#718096',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(160, 174, 192, 0.4)'
                  },
                  transition: 'all 0.3s'
                }}
              >
                {language === 'en' ? 'Edit Profile' : language === 'tr' ? 'Profili Düzenle' : 'Редактировать'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Footer Component */}
      <Footer />

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
            <Box sx={{ mb: 2, p: 2, bgcolor: '#f3f4f6', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={user?.avatar_url || user?.avatar}
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
              <ListItemText primary={language === 'en' ? 'Appoint' : language === 'tr' ? 'Randevu Al' : 'Записаться'} />
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
              label={language === 'en' ? 'Home' : language === 'tr' ? 'Ana Sayfa' : 'Главная'}
              icon={<HomeIcon />}
              onClick={() => { navigate('/'); setBottomNavValue(0); }}
            />
            <BottomNavigationAction
              label={language === 'en' ? 'Services' : language === 'tr' ? 'Hizmetler' : 'Услуги'}
              icon={<ContentCut />}
              onClick={() => { navigate('/services'); setBottomNavValue(1); }}
            />
            <BottomNavigationAction
              label={language === 'en' ? 'Appointments' : language === 'tr' ? 'Randevular' : 'Записи'}
              icon={<Schedule />}
              onClick={() => { navigate('/dashboard'); setBottomNavValue(2); }}
            />
            <BottomNavigationAction
              label={language === 'en' ? 'Profile' : language === 'tr' ? 'Profil' : 'Профиль'}
              icon={<AccountCircle />}
              onClick={() => {
                if (isAuthenticated) {
                  navigate('/profile');
                  setBottomNavValue(3);
                } else {
                  navigate('/signin');
                  setBottomNavValue(3);
                }
              }}
            />
          </BottomNavigation>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;
