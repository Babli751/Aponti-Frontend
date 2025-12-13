import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import Footer from '../components/Footer';
import api from '../services/api';
import {
  Box, Container, Grid, Card, CardContent, Typography, Button, CircularProgress, Tabs, Tab,
  AppBar, Toolbar, FormControl, Select, MenuItem, IconButton, Drawer, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Divider, Avatar, useTheme, useMediaQuery
} from '@mui/material';
import {
  ContentCut, Spa, FitnessCenter, LocalHospital, Restaurant, Pets, ArrowForward,
  Menu as MenuIcon, Close, Home as HomeIcon, Person, Schedule, Favorite, Settings,
  Business, Support as SupportIcon, Logout
} from '@mui/icons-material';

const Services = () => {
  const navigate = useNavigate();
  const { language, changeLanguage } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Fetch all services
        const response = await api.get('/services/');
        const servicesData = Array.isArray(response.data) ? response.data : [];
        setServices(servicesData);
      } catch (error) {
        console.error('Error fetching services:', error);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const translations = {
    en: {
      title: 'Our Services',
      subtitle: 'Discover our professional services',
      bookNow: 'Book Now',
      noServices: 'No services in this category',
      all: 'All Services',
      barber: 'Barber & Hair',
      beauty: 'Beauty & Spa',
      fitness: 'Fitness',
      health: 'Healthcare',
      food: 'Food & Dining',
      pets: 'Pet Care',
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
      title: 'Hizmetlerimiz',
      subtitle: 'Profesyonel hizmetlerimizi keşfedin',
      bookNow: 'Rezerve Et',
      noServices: 'Bu kategoride hizmet yok',
      all: 'Tüm Hizmetler',
      barber: 'Berber & Kuaför',
      beauty: 'Güzellik & Spa',
      fitness: 'Fitness',
      health: 'Sağlık',
      food: 'Yemek',
      pets: 'Evcil Hayvan',
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
      title: 'Наши услуги',
      subtitle: 'Откройте для себя наши профессиональные услуги',
      bookNow: 'Забронировать',
      noServices: 'Нет услуг в этой категории',
      all: 'Все услуги',
      barber: 'Барбер',
      beauty: 'Красота',
      fitness: 'Фитнес',
      health: 'Здоровье',
      food: 'Еда',
      pets: 'Питомцы',
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

  const t = translations[language] || translations.en;

  // Categories with keywords for classification
  const categories = [
    { id: 'all', label: t.all, icon: null },
    { id: 'barber', label: t.barber, icon: ContentCut, keywords: ['gttt', 'haircut', 'barber', 'hair', 'kuaför', 'berber', 'saç', 'kesim'] },
    { id: 'beauty', label: t.beauty, icon: Spa, keywords: ['beauty', 'spa', 'massage', 'facial', 'güzellik', 'masaj', 'cilt'] },
    { id: 'fitness', label: t.fitness, icon: FitnessCenter, keywords: ['fitness', 'gym', 'yoga', 'spor', 'antrenman', 'pilates'] },
    { id: 'health', label: t.health, icon: LocalHospital, keywords: ['health', 'medical', 'doctor', 'dental', 'sağlık', 'doktor', 'diş'] },
    { id: 'food', label: t.food, icon: Restaurant, keywords: ['food', 'restaurant', 'cafe', 'yemek', 'restoran', 'kahve'] },
    { id: 'pets', label: t.pets, icon: Pets, keywords: ['pet', 'veterinary', 'grooming', 'evcil', 'veteriner', 'hayvan'] }
  ];

  const categorizeService = (service) => {
    const serviceName = (service.name || '').toLowerCase();
    const serviceDesc = (service.description || '').toLowerCase();
    const searchText = serviceName + ' ' + serviceDesc;

    for (const cat of categories) {
      if (cat.id === 'all') continue;
      if (cat.keywords && cat.keywords.some(keyword => searchText.includes(keyword.toLowerCase()))) {
        return cat.id;
      }
    }
    return 'barber'; // Default to barber if no match
  };

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.icon || ContentCut;
  };

  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter(s => categorizeService(s) === selectedCategory);

  const servicesByCategory = categories.reduce((acc, cat) => {
    if (cat.id === 'all') return acc;
    acc[cat.id] = services.filter(s => categorizeService(s) === cat.id);
    return acc;
  }, {});

  const ServiceCard = ({ service, categoryId }) => {
    const Icon = getCategoryIcon(categoryId);

    return (
      <Card sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        borderRadius: 3,
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 24px rgba(0,166,147,0.2)'
        }
      }}>
        <Box sx={{
          background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 120
        }}>
          <Icon sx={{ fontSize: 60, color: 'white' }} />
        </Box>

        <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5, color: '#1f2937' }}>
            {service.name}
          </Typography>

          {service.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
              {service.description}
            </Typography>
          )}

          <Box sx={{ mt: 'auto', pt: 2 }}>
            <Typography variant="h6" sx={{ color: '#2d3748', fontWeight: 600, mb: 1 }}>
              €{service.price}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {service.duration} min
            </Typography>
          </Box>

          <Button
            fullWidth
            variant="contained"
            endIcon={<ArrowForward />}
            onClick={() => navigate('/appointment')}
            sx={{
              mt: 2,
              py: 1.5,
              background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)'
              }
            }}
          >
            {t.bookNow}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#ffffff' }}>
      <Navbar onMenuClick={() => setDrawerOpen(true)} />

      {/* Hero Section */}
      <Box sx={{
        background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)',
        py: { xs: 2, md: 3 },
        mb: 4
      }}>
        <Container maxWidth="lg">
          <Typography variant="h2" sx={{
            color: 'white',
            fontWeight: 800,
            fontSize: { xs: '1.5rem', md: '2rem' },
            mb: 1,
            textAlign: 'center'
          }}>
            {t.title}
          </Typography>
          <Typography variant="h6" sx={{
            color: 'rgba(255,255,255,0.9)',
            textAlign: 'center',
            maxWidth: 600,
            mx: 'auto'
          }}>
            {t.subtitle}
          </Typography>
        </Container>
      </Box>

      {/* Category Tabs */}
      <Container maxWidth="lg" sx={{ mb: 4 }}>
        <Tabs
          value={selectedCategory}
          onChange={(e, newValue) => setSelectedCategory(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              color: '#6b7280',
              fontWeight: 600,
              fontSize: '1rem',
              '&.Mui-selected': {
                color: '#2d3748'
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#2d3748',
              height: 3
            }
          }}
        >
          {categories.map(cat => (
            <Tab key={cat.id} value={cat.id} label={cat.label} />
          ))}
        </Tabs>
      </Container>

      {/* Services Grid */}
      <Container maxWidth="lg" sx={{ flexGrow: 1, pb: 8 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#2d3748' }} />
          </Box>
        ) : selectedCategory === 'all' ? (
          // Show all categories with services
          categories.filter(c => c.id !== 'all' && servicesByCategory[c.id]?.length > 0).map(category => {
            const CategoryIcon = category.icon;
            return (
              <Box key={category.id} sx={{ mb: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <CategoryIcon sx={{ fontSize: 32, color: '#2d3748', mr: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1f2937' }}>
                    {category.label}
                  </Typography>
                  <Typography variant="body1" sx={{ ml: 2, color: '#6b7280' }}>
                    ({servicesByCategory[category.id].length})
                  </Typography>
                </Box>
                <Grid container spacing={3}>
                  {servicesByCategory[category.id].map((service) => (
                    <Grid item xs={12} sm={6} md={4} key={service.id}>
                      <ServiceCard service={service} categoryId={category.id} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            );
          })
        ) : filteredServices.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              {t.noServices}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredServices.map((service) => (
              <Grid item xs={12} sm={6} md={4} key={service.id}>
                <ServiceCard service={service} categoryId={categorizeService(service)} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

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

      <Footer />
    </Box>
  );
};

export default Services;
