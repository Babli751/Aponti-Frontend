import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import Footer from '../components/Footer';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Grid,
  AppBar,
  Toolbar,
  FormControl,
  Select,
  MenuItem,
  Avatar,
  Paper,
  Stack,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Business,
  People,
  Security,
  Star,
  TrendingUp,
  CheckCircle,
  EuroSymbol,
  ArrowForward,
  Verified,
  Menu as MenuIcon,
  Close,
  Home as HomeIcon,
  ContentCut,
  Person,
  Support as SupportIcon,
  Schedule,
  Favorite,
  Settings,
  Logout
} from '@mui/icons-material';

const About = () => {
  const navigate = useNavigate();
  const { language, changeLanguage } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const translations = {
    brand: 'Aponti',
    home: language === 'en' ? 'Home' : language === 'tr' ? 'Ana Sayfa' : 'Главная',
    services: language === 'en' ? 'Services' : language === 'tr' ? 'Hizmetler' : 'Услуги',
    about: language === 'en' ? 'About' : language === 'tr' ? 'Hakkımızda' : 'О нас',
    company: language === 'en' ? 'Company' : language === 'tr' ? 'Şirket' : 'Компания',
    support: language === 'en' ? 'Support' : language === 'tr' ? 'Destek' : 'Поддержка',
    appointments: language === 'en' ? 'Appointments' : language === 'tr' ? 'Randevularım' : 'Записи',
    favorites: language === 'en' ? 'Favorites' : language === 'tr' ? 'Favoriler' : 'Избранное',
    profile: language === 'en' ? 'Profile' : language === 'tr' ? 'Profil' : 'Профиль',
    login: language === 'en' ? 'Login' : language === 'tr' ? 'Giriş' : 'Войти',
    signup: language === 'en' ? 'Sign Up' : language === 'tr' ? 'Kayıt Ol' : 'Регистрация',
    tryBusiness: language === 'en' ? 'Try Business' : language === 'tr' ? 'İşletme Kayıt' : 'Бизнес регистрация'
  };

  const stats = [
    {
      number: '2,000+',
      label: language === 'en' ? 'Businesses' : language === 'tr' ? 'İşletme' : 'Компаний',
      icon: <Business />
    },
    {
      number: '50+',
      label: language === 'en' ? 'Cities' : language === 'tr' ? 'Şehir' : 'Городов',
      icon: <EuroSymbol />
    },
    {
      number: '150K+',
      label: language === 'en' ? 'Customers' : language === 'tr' ? 'Müşteri' : 'Клиентов',
      icon: <People />
    },
    {
      number: '4.8/5',
      label: language === 'en' ? 'Rating' : language === 'tr' ? 'Puan' : 'Оценка',
      icon: <Star />
    }
  ];

  const values = [
    {
      title: language === 'en' ? 'Quality' : language === 'tr' ? 'Kalite' : 'Качество',
      description: language === 'en' 
        ? 'Top-tier professionals vetted and verified'
        : language === 'tr' 
        ? 'Kontrol edilmiş profesyoneller'
        : 'Проверенные профессионалы',
      icon: <CheckCircle />,
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop'
    },
    {
      title: language === 'en' ? 'Safety' : language === 'tr' ? 'Güvenlik' : 'Безопасность',
      description: language === 'en' 
        ? 'Secure booking with verified hygiene protocols'
        : language === 'tr' 
        ? 'Güvenli rezervasyon sistemi'
        : 'Безопасное бронирование',
      icon: <Security />,
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop'
    },
    {
      title: language === 'en' ? 'Innovation' : language === 'tr' ? 'İnovasyon' : 'Инновация',
      description: language === 'en' 
        ? 'Cutting-edge technology for seamless experience'
        : language === 'tr' 
        ? 'Yüksek teknoloji ile kolay deneyim'
        : 'Современные технологии',
      icon: <TrendingUp />,
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop'
    }
  ];

  const team = [
    {
      name: 'Babek Mammadov',
      position: language === 'en' ? 'CEO & Founder' : language === 'tr' ? 'CEO ve Kurucu' : 'Генеральный директор',
      bio: language === 'en' ? 'Visionary entrepreneur' : language === 'tr' ? 'Vizyoner girişimci' : 'Предприниматель',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    {
      name: 'Cavansir Mammadov',
      position: language === 'en' ? 'COO' : language === 'tr' ? 'Operasyon Direktörü' : 'Операционный директор',
      bio: language === 'en' ? 'Operations expert' : language === 'tr' ? 'Operasyon uzmanı' : 'Эксперт операций',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
    }
  ];

  return (
    <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh' }}>
      <Navbar onMenuClick={() => setDrawerOpen(true)} />

      {/* Hero Section */}
      <Box sx={{
        background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
        color: 'white',
        py: { xs: 8, sm: 10, md: 12 },
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background */}
        <Box sx={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          zIndex: 0
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: '-10%',
          left: '5%',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.03)',
          zIndex: 0
        }} />

        <Container sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
            <Verified sx={{ fontSize: 24 }} />
            <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: '2px' }}>
              {language === 'en' ? 'About Us' : language === 'tr' ? 'Hakkımızda' : 'О нас'}
            </Typography>
          </Box>

          <Typography variant="h1" component="h1" sx={{
            fontWeight: 900,
            mb: 3,
            fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
            lineHeight: 1.1
          }}>
            {language === 'en' 
              ? 'Europe\'s #1 Booking Platform'
              : language === 'tr'
              ? 'Avrupa\'nın #1 Rezervasyon Platformu'
              : 'Ведущая платформа бронирования'
            }
          </Typography>

          <Typography variant="h5" sx={{
            opacity: 0.9,
            fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
            maxWidth: 700,
            mx: 'auto',
            fontWeight: 300,
            lineHeight: 1.6
          }}>
            {language === 'en'
              ? 'Connecting customers with top professionals across Europe'
              : language === 'tr'
              ? 'Müşterileri Avrupa\'daki en iyi profesyonellerle buluşturu'
              : 'Соединяем клиентов с лучшими профессионалами'
            }
          </Typography>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container sx={{ py: { xs: 6, md: 8 } }}>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {stats.map((stat, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Paper sx={{
                p: 3,
                textAlign: 'center',
                height: '100%',
                background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                border: '1px solid #d1d5db',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 32px rgba(55, 65, 81, 0.15)',
                  borderColor: '#374151'
                }
              }}>
                <Box sx={{
                  bgcolor: 'white',
                  borderRadius: '50%',
                  p: 2,
                  display: 'inline-flex',
                  mb: 2,
                  color: '#374151'
                }}>
                  {React.cloneElement(stat.icon, { sx: { fontSize: 32 } })}
                </Box>
                <Typography variant="h3" sx={{
                  fontWeight: 900,
                  color: '#1f2937',
                  fontSize: { xs: '1.75rem', md: '2.5rem' }
                }}>
                  {stat.number}
                </Typography>
                <Typography variant="body1" sx={{ color: '#6b7280', fontWeight: 500 }}>
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Mission, Vision, Values with Images */}
      <Box sx={{ bgcolor: '#f9fafb', py: { xs: 6, md: 8 } }}>
        <Container>
          <Typography variant="h3" sx={{
            fontWeight: 900,
            textAlign: 'center',
            mb: 8,
            color: '#1f2937',
            fontSize: { xs: '2rem', md: '3rem' }
          }}>
            {language === 'en' ? 'Why Choose Us' : language === 'tr' ? 'Neden Biz' : 'Почему мы'}
          </Typography>

          <Grid container spacing={4}>
            {values.map((value, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{
                  height: '100%',
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-12px)',
                    boxShadow: '0 20px 48px rgba(55, 65, 81, 0.15)',
                    borderColor: '#374151'
                  }
                }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={value.image}
                    alt={value.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{
                      bgcolor: '#f3f4f6',
                      borderRadius: '50%',
                      p: 2,
                      display: 'inline-flex',
                      mb: 3,
                      color: '#374151'
                    }}>
                      {React.cloneElement(value.icon, { sx: { fontSize: 28 } })}
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, color: '#1f2937' }}>
                      {value.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280', lineHeight: 1.6, fontWeight: 500 }}>
                      {value.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Team Section */}
      <Container sx={{ py: { xs: 6, md: 8 } }}>
        <Typography variant="h3" sx={{
          fontWeight: 900,
          textAlign: 'center',
          mb: 8,
          color: '#1f2937',
          fontSize: { xs: '2rem', md: '3rem' }
        }}>
          {language === 'en' ? 'Leadership Team' : language === 'tr' ? 'Liderlik Takımı' : 'Команда руководства'}
        </Typography>

        <Grid container spacing={4} sx={{ maxWidth: 900, mx: 'auto' }}>
          {team.map((member, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Card sx={{
                textAlign: 'center',
                height: '100%',
                borderRadius: 3,
                border: '1px solid #e5e7eb',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 16px 40px rgba(55, 65, 81, 0.12)',
                  borderColor: '#374151'
                }
              }}>
                <Box sx={{
                  background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                  p: 4,
                  pb: 2
                }}>
                  <Avatar
                    src={member.image}
                    sx={{
                      width: 120,
                      height: 120,
                      mx: 'auto',
                      border: '4px solid white',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                    }}
                  />
                </Box>

                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#1f2937' }}>
                    {member.name}
                  </Typography>
                  <Typography variant="subtitle2" sx={{
                    mb: 3,
                    fontWeight: 700,
                    color: '#374151',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontSize: '0.8rem'
                  }}>
                    {member.position}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500 }}>
                    {member.bio}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to Action */}
      <Box sx={{
        background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
        color: 'white',
        py: { xs: 6, md: 8 },
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          zIndex: 0
        }} />

        <Container sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" sx={{
            fontWeight: 900,
            mb: 3,
            fontSize: { xs: '2rem', md: '3rem' }
          }}>
            {language === 'en'
              ? 'Ready to Get Started?'
              : language === 'tr'
              ? 'Başlamaya Hazır?'
              : 'Готовы начать?'
            }
          </Typography>

          <Typography variant="h6" sx={{
            mb: 6,
            opacity: 0.9,
            maxWidth: 600,
            mx: 'auto',
            fontWeight: 300,
            fontSize: { xs: '1rem', md: '1.2rem' }
          }}>
            {language === 'en'
              ? 'Join thousands of satisfied customers and book your appointment today'
              : language === 'tr'
              ? 'Binlerce memnun müşterimize katılın ve randevunuzu alın'
              : 'Присоединитесь к тысячам довольных клиентов'
            }
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              sx={{
                bgcolor: 'white',
                color: '#374151',
                fontWeight: 700,
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                borderRadius: '50px',
                textTransform: 'none',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
                  bgcolor: '#f3f4f6'
                }
              }}
              onClick={() => navigate('/')}
            >
              {language === 'en'
                ? 'Book Now'
                : language === 'tr'
                ? 'Şimdi Rezervasyon Yap'
                : 'Забронировать'
              }
            </Button>

            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'white',
                color: 'white',
                fontWeight: 700,
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                borderRadius: '50px',
                borderWidth: 2,
                textTransform: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-3px)'
                }
              }}
              onClick={() => navigate('/business-signup')}
            >
              {language === 'en'
                ? 'For Businesses'
                : language === 'tr'
                ? 'İşletmeler İçin'
                : 'Для бизнеса'
              }
            </Button>
          </Stack>
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
              {translations.brand}
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
              <ListItemText primary={translations.home} />
            </ListItemButton>
            <ListItemButton onClick={() => { navigate('/services'); setDrawerOpen(false); }}>
              <ListItemIcon><ContentCut /></ListItemIcon>
              <ListItemText primary={translations.services} />
            </ListItemButton>
            <ListItemButton onClick={() => { navigate('/about'); setDrawerOpen(false); }}>
              <ListItemIcon><Person /></ListItemIcon>
              <ListItemText primary={translations.about} />
            </ListItemButton>
            <ListItemButton onClick={() => { navigate('/company'); setDrawerOpen(false); }}>
              <ListItemIcon><Business /></ListItemIcon>
              <ListItemText primary={translations.company} />
            </ListItemButton>
            <ListItemButton onClick={() => { navigate('/support'); setDrawerOpen(false); }}>
              <ListItemIcon><SupportIcon /></ListItemIcon>
              <ListItemText primary={translations.support} />
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
                primary={translations.tryBusiness}
                sx={{ '& .MuiTypography-root': { color: '#ff6b35', fontWeight: 600 } }}
              />
            </ListItemButton>
            <ListItemButton onClick={() => { navigate('/dashboard'); setDrawerOpen(false); }}>
              <ListItemIcon><Schedule /></ListItemIcon>
              <ListItemText primary={translations.appointments} />
            </ListItemButton>
            <ListItemButton onClick={() => { navigate('/favorites'); setDrawerOpen(false); }}>
              <ListItemIcon><Favorite /></ListItemIcon>
              <ListItemText primary={translations.favorites} />
            </ListItemButton>
            <Divider sx={{ my: 2 }} />
            {isAuthenticated ? (
              <>
                <ListItemButton onClick={() => { navigate('/profile'); setDrawerOpen(false); }}>
                  <ListItemIcon><Person /></ListItemIcon>
                  <ListItemText primary={translations.profile} />
                </ListItemButton>
                <ListItemButton onClick={() => { navigate('/dashboard'); setDrawerOpen(false); }}>
                  <ListItemIcon><Schedule /></ListItemIcon>
                  <ListItemText primary={translations.appointments} />
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
                    {translations.login}
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
                    {translations.signup}
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

export default About;
