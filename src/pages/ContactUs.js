import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  AppBar,
  Toolbar,
  FormControl,
  Select,
  MenuItem,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn,
  Send,
  Verified,
  CheckCircle,
  AccessTime,
  Menu as MenuIcon,
  Close,
  Home as HomeIcon,
  ContentCut,
  Person,
  Business,
  Support as SupportIcon,
  Schedule,
  Favorite,
  Settings,
  Logout
} from '@mui/icons-material';
import Logo from '../components/Logo';
import Footer from '../components/Footer';

const ContactUs = () => {
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

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setError(language === 'en'
        ? 'Please fill all fields'
        : language === 'tr'
          ? 'Lütfen tüm alanları doldurun'
          : 'Заполните все поля');
      return;
    }

    console.log('Contact form submitted:', formData);
    setSuccess(true);
    setFormData({ name: '', email: '', subject: '', message: '' });

    setTimeout(() => setSuccess(false), 5000);
  };

  const content = {
    en: {
      title: 'Contact Us',
      subtitle: 'We\'d love to hear from you',
      name: 'Full Name',
      email: 'Email Address',
      subject: 'Subject',
      message: 'Message',
      send: 'Send Message',
      successMessage: 'Thank you! Your message has been sent successfully.',
      contactInfo: 'Get in Touch',
      phone: '+90 555 123 4567',
      emailAddress: 'info@aponti.com',
      address: 'Berlin, Germany',
      responseTime: 'We typically respond within 24 hours on business days.'
    },
    tr: {
      title: 'İletişim',
      subtitle: 'Sizden haber almaktan mutlu oluruz',
      name: 'Ad Soyad',
      email: 'E-posta Adresi',
      subject: 'Konu',
      message: 'Mesaj',
      send: 'Gönder',
      successMessage: 'Teşekkürler! Mesajınız başarıyla gönderildi.',
      contactInfo: 'İletişim Bilgileri',
      phone: '+90 555 123 4567',
      emailAddress: 'info@aponti.com',
      address: 'Berlin, Almanya',
      responseTime: 'Genellikle iş günlerinde 24 saat içinde yanıt veriyoruz.'
    },
    ru: {
      title: 'Контакт',
      subtitle: 'Мы хотим услышать от вас',
      name: 'Полное имя',
      email: 'Электронная почта',
      subject: 'Тема',
      message: 'Сообщение',
      send: 'Отправить',
      successMessage: 'Спасибо! Ваше сообщение успешно отправлено.',
      contactInfo: 'Связаться с нами',
      phone: '+90 555 123 4567',
      emailAddress: 'info@aponti.com',
      address: 'Берлин, Германия',
      responseTime: 'Обычно мы отвечаем в течение 24 часов в рабочие дни.'
    }
  };

  const t = content[language] || content.en;

  const contactMethods = [
    {
      icon: <Phone />,
      title: language === 'en' ? 'Phone' : language === 'tr' ? 'Telefon' : 'Телефон',
      value: t.phone,
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop'
    },
    {
      icon: <Email />,
      title: 'Email',
      value: t.emailAddress,
      image: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=400&h=300&fit=crop'
    },
    {
      icon: <LocationOn />,
      title: language === 'en' ? 'Address' : language === 'tr' ? 'Adres' : 'Адрес',
      value: t.address,
      image: 'https://images.unsplash.com/photo-1516534775068-bb57fbb80667?w=400&h=300&fit=crop'
    }
  ];

  return (
    <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh' }}>
      {/* Header */}
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
        {/* Animated background shapes */}
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
              {language === 'en' ? 'Contact Us' : language === 'tr' ? 'İletişim' : 'Контакт'}
            </Typography>
          </Box>

          <Typography variant="h1" component="h1" sx={{
            fontWeight: 900,
            mb: 3,
            fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
            lineHeight: 1.1
          }}>
            {t.title}
          </Typography>

          <Typography variant="h5" sx={{
            opacity: 0.9,
            fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
            maxWidth: 700,
            mx: 'auto',
            fontWeight: 300,
            lineHeight: 1.6
          }}>
            {t.subtitle}
          </Typography>
        </Container>
      </Box>

      {/* Contact Methods */}
      <Container sx={{ py: { xs: 6, md: 8 } }}>
        <Grid container spacing={3} sx={{ mb: 10 }}>
          {contactMethods.map((method, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
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
                <Box
                  sx={{
                    height: 200,
                    backgroundImage: `url(${method.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
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
                    {React.cloneElement(method.icon, { sx: { fontSize: 28 } })}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: '#1f2937' }}>
                    {method.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#6b7280', fontWeight: 500 }}>
                    {method.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Contact Form Section */}
      <Box sx={{ bgcolor: '#f9fafb', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="800px">
          <Card sx={{
            borderRadius: 3,
            border: '1px solid #e5e7eb',
            boxShadow: '0 20px 48px rgba(55, 65, 81, 0.08)'
          }}>
            <CardContent sx={{ p: { xs: 4, md: 6 } }}>
              <Typography variant="h4" sx={{
                fontWeight: 900,
                mb: 1,
                color: '#1f2937'
              }}>
                {language === 'en' ? 'Send us a Message' : language === 'tr' ? 'Bize Mesaj Gönder' : 'Отправьте нам сообщение'}
              </Typography>

              <Typography variant="body1" sx={{
                color: '#6b7280',
                mb: 6,
                fontWeight: 500
              }}>
                {language === 'en'
                  ? 'Fill out the form below and we\'ll get back to you as soon as possible'
                  : language === 'tr'
                  ? 'Aşağıdaki formu doldurun ve en kısa sürede sizinle iletişime geçeceğiz'
                  : 'Заполните форму ниже и мы ответим вам как можно скорее'
                }
              </Typography>

              {success && (
                <Alert severity="success" sx={{
                  mb: 4,
                  bgcolor: '#d1fae5',
                  color: '#065f46',
                  border: '1px solid #6ee7b7',
                  borderRadius: 2,
                  '& .MuiAlert-icon': { color: '#10b981' }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ fontSize: 20 }} />
                    {t.successMessage}
                  </Box>
                </Alert>
              )}

              {error && (
                <Alert severity="error" sx={{
                  mb: 4,
                  bgcolor: '#fee2e2',
                  color: '#7f1d1d',
                  border: '1px solid #fca5a5',
                  borderRadius: 2
                }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t.name}
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      variant="outlined"
                      size="medium"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: '#ffffff',
                          transition: 'all 0.3s ease',
                          '& fieldset': {
                            borderColor: '#d1d5db'
                          },
                          '&:hover fieldset': {
                            borderColor: '#374151'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#374151',
                            borderWidth: 2
                          }
                        },
                        '& .MuiInputBase-input': {
                          fontSize: '1rem',
                          fontWeight: 500
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t.email}
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      variant="outlined"
                      size="medium"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: '#ffffff',
                          transition: 'all 0.3s ease',
                          '& fieldset': {
                            borderColor: '#d1d5db'
                          },
                          '&:hover fieldset': {
                            borderColor: '#374151'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#374151',
                            borderWidth: 2
                          }
                        },
                        '& .MuiInputBase-input': {
                          fontSize: '1rem',
                          fontWeight: 500
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t.subject}
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      variant="outlined"
                      size="medium"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: '#ffffff',
                          transition: 'all 0.3s ease',
                          '& fieldset': {
                            borderColor: '#d1d5db'
                          },
                          '&:hover fieldset': {
                            borderColor: '#374151'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#374151',
                            borderWidth: 2
                          }
                        },
                        '& .MuiInputBase-input': {
                          fontSize: '1rem',
                          fontWeight: 500
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t.message}
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      variant="outlined"
                      multiline
                      rows={6}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: '#ffffff',
                          transition: 'all 0.3s ease',
                          '& fieldset': {
                            borderColor: '#d1d5db'
                          },
                          '&:hover fieldset': {
                            borderColor: '#374151'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#374151',
                            borderWidth: 2
                          }
                        },
                        '& .MuiInputBase-input': {
                          fontSize: '1rem',
                          fontWeight: 500
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      size="large"
                      endIcon={<Send />}
                      sx={{
                        background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
                        color: 'white',
                        py: 2,
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        borderRadius: 2,
                        textTransform: 'none',
                        boxShadow: '0 8px 24px rgba(55, 65, 81, 0.15)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 12px 32px rgba(55, 65, 81, 0.25)',
                          background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)'
                        },
                        '&:active': {
                          transform: 'translateY(-1px)'
                        }
                      }}
                    >
                      {t.send}
                    </Button>
                  </Grid>
                </Grid>
              </form>

              <Divider sx={{ my: 5 }} />

              {/* Response Time Info */}
              <Box sx={{
                p: 4,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                border: '1px solid #d1d5db'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <AccessTime sx={{ color: '#374151', fontSize: 28, mt: 0.5, flexShrink: 0 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#1f2937' }}>
                      {language === 'en' ? 'Quick Response' : language === 'tr' ? 'Hızlı Yanıt' : 'Быстрый ответ'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280', lineHeight: 1.6 }}>
                      {t.responseTime}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
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
              Aponti
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <Close />
            </IconButton>
          </Box>

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
              <ListItemText primary={language === 'en' ? 'Home' : language === 'tr' ? 'Ana Sayfa' : 'Главная'} />
            </ListItemButton>
            <ListItemButton onClick={() => { navigate('/services'); setDrawerOpen(false); }}>
              <ListItemIcon><ContentCut /></ListItemIcon>
              <ListItemText primary={language === 'en' ? 'Services' : language === 'tr' ? 'Hizmetler' : 'Услуги'} />
            </ListItemButton>
            <ListItemButton onClick={() => { navigate('/about'); setDrawerOpen(false); }}>
              <ListItemIcon><Person /></ListItemIcon>
              <ListItemText primary={language === 'en' ? 'About' : language === 'tr' ? 'Hakkımızda' : 'О нас'} />
            </ListItemButton>
            <ListItemButton onClick={() => { navigate('/company'); setDrawerOpen(false); }}>
              <ListItemIcon><Business /></ListItemIcon>
              <ListItemText primary={language === 'en' ? 'Company' : language === 'tr' ? 'Şirket' : 'Компания'} />
            </ListItemButton>
            <ListItemButton onClick={() => { navigate('/support'); setDrawerOpen(false); }}>
              <ListItemIcon><SupportIcon /></ListItemIcon>
              <ListItemText primary={language === 'en' ? 'Support' : language === 'tr' ? 'Destek' : 'Поддержка'} />
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
                primary={language === 'en' ? 'Try Business' : language === 'tr' ? 'İşletme Kayıt' : 'Бизнес регистрация'}
                sx={{ '& .MuiTypography-root': { color: '#ff6b35', fontWeight: 600 } }}
              />
            </ListItemButton>
            <ListItemButton onClick={() => { navigate('/dashboard'); setDrawerOpen(false); }}>
              <ListItemIcon><Schedule /></ListItemIcon>
              <ListItemText primary={language === 'en' ? 'Appointments' : language === 'tr' ? 'Randevularım' : 'Записи'} />
            </ListItemButton>
            <ListItemButton onClick={() => { navigate('/favorites'); setDrawerOpen(false); }}>
              <ListItemIcon><Favorite /></ListItemIcon>
              <ListItemText primary={language === 'en' ? 'Favorites' : language === 'tr' ? 'Favoriler' : 'Избранное'} />
            </ListItemButton>
            <Divider sx={{ my: 2 }} />
            {isAuthenticated ? (
              <>
                <ListItemButton onClick={() => { navigate('/profile'); setDrawerOpen(false); }}>
                  <ListItemIcon><Person /></ListItemIcon>
                  <ListItemText primary={language === 'en' ? 'Profile' : language === 'tr' ? 'Profil' : 'Профиль'} />
                </ListItemButton>
                <ListItemButton onClick={() => { navigate('/dashboard'); setDrawerOpen(false); }}>
                  <ListItemIcon><Schedule /></ListItemIcon>
                  <ListItemText primary={language === 'en' ? 'Appointments' : language === 'tr' ? 'Randevularım' : 'Записи'} />
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
                    {language === 'en' ? 'Login' : language === 'tr' ? 'Giriş' : 'Войти'}
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
                    {language === 'en' ? 'Sign Up' : language === 'tr' ? 'Kayıt Ol' : 'Регистрация'}
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

export default ContactUs;
