import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Stack,
  useTheme,
  useMediaQuery,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Drawer,
  ListItemButton,
  Divider,
  Avatar
} from '@mui/material';
import {
  ArrowBack,
  Language,
  Work,
  Business,
  Article,
  Handshake,
  Email,
  Phone,
  LocationOn,
  Group,
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

const Company = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { language, changeLanguage, t: translations } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Language content
  const content = {
    en: {
      brand: 'BarberPro',
      company: 'Company',
      subtitle: 'Building the future of grooming services',
      careers: 'Careers',
      careersDesc: 'Join our team and help revolutionize the barbering industry',
      press: 'Press & Media',
      pressDesc: 'Latest news, press releases, and media resources',
      partners: 'Partners',
      partnersDesc: 'Collaborate with us to grow your business',
      contact: 'Contact Us',
      contactDesc: 'Get in touch with our team',
      joinTeam: 'Join Our Team',
      viewPositions: 'View Open Positions',
      mediaKit: 'Download Media Kit',
      becomePartner: 'Become a Partner',
      getInTouch: 'Get in Touch'
    },
    tr: {
      brand: 'BarberPro',
      company: 'Şirket',
      subtitle: 'Bakım hizmetlerinin geleceğini inşa ediyoruz',
      careers: 'Kariyer',
      careersDesc: 'Ekibimize katılın ve berberlik sektöründe devrime yardım edin',
      press: 'Basın ve Medya',
      pressDesc: 'Son haberler, basın bültenleri ve medya kaynakları',
      partners: 'Ortaklar',
      partnersDesc: 'İşinizi büyütmek için bizimle işbirliği yapın',
      contact: 'İletişim',
      contactDesc: 'Ekibimizle iletişime geçin',
      joinTeam: 'Ekibimize Katılın',
      viewPositions: 'Açık Pozisyonları Görüntüle',
      mediaKit: 'Medya Kitini İndir',
      becomePartner: 'Ortak Olun',
      getInTouch: 'İletişime Geçin'
    },
    ru: {
      brand: 'BarberPro',
      company: 'Компания',
      subtitle: 'Строим будущее услуг по уходу',
      careers: 'Карьера',
      careersDesc: 'Присоединяйтесь к нашей команде и помогите революционизировать парикмахерскую индустрию',
      press: 'Пресса и медиа',
      pressDesc: 'Последние новости, пресс-релизы и медиа-ресурсы',
      partners: 'Партнеры',
      partnersDesc: 'Сотрудничайте с нами для развития вашего бизнеса',
      contact: 'Связаться с нами',
      contactDesc: 'Свяжитесь с нашей командой',
      joinTeam: 'Присоединиться к команде',
      viewPositions: 'Посмотреть открытые позиции',
      mediaKit: 'Скачать медиа-кит',
      becomePartner: 'Стать партнером',
      getInTouch: 'Связаться'
    }
  };

  // Use centralized translations with page-specific content
  const t = {
    ...translations,
    subtitle: language === 'en' ? 'Building the future of grooming services' : language === 'tr' ? 'Bakım hizmetlerinin geleceğini inşa ediyoruz' : 'Строим будущее услуг по уходу',
    careersDesc: language === 'en' ? 'Join our team and help revolutionize the barbering industry' : language === 'tr' ? 'Ekibimize katılın ve berberlik sektöründe devrime yardım edin' : 'Присоединяйтесь к нашей команде и помогите революционизировать парикмахерскую индустрию',
    pressDesc: language === 'en' ? 'Latest news, press releases, and media resources' : language === 'tr' ? 'Son haberler, basın bültenleri ve medya kaynakları' : 'Последние новости, пресс-релизы и медиа-ресурсы',
    partnersDesc: language === 'en' ? 'Collaborate with us to grow your business' : language === 'tr' ? 'İşinizi büyütmek için bizimle işbirliği yapın' : 'Сотрудничайте с нами для развития вашего бизнеса',
    contactDesc: language === 'en' ? 'Get in touch with our team' : language === 'tr' ? 'Ekibimizle iletişime geçin' : 'Свяжитесь с нашей командой',
    joinTeam: language === 'en' ? 'Join Our Team' : language === 'tr' ? 'Ekibimize Katılın' : 'Присоединиться к команде',
    viewPositions: language === 'en' ? 'View Open Positions' : language === 'tr' ? 'Açık Pozisyonları Görüntüle' : 'Посмотреть открытые позиции',
    mediaKit: language === 'en' ? 'Download Media Kit' : language === 'tr' ? 'Medya Kitini İndir' : 'Скачать медиа-кит',
    becomePartner: language === 'en' ? 'Become a Partner' : language === 'tr' ? 'Ortak Olun' : 'Стать партнером',
    getInTouch: language === 'en' ? 'Get in Touch' : language === 'tr' ? 'İletişime Geçin' : 'Связаться'
  };

  const sections = [
    {
      id: 'careers',
      title: t.careers,
      description: t.careersDesc,
      icon: <Work />,
      color: '#2d3748',
      action: t.viewPositions,
      details: [
        language === 'en' ? 'Remote-first culture' : language === 'tr' ? 'Uzaktan çalışma odaklı kültür' : 'Культура удаленной работы',
        language === 'en' ? 'Competitive compensation' : language === 'tr' ? 'Rekabetçi maaş' : 'Конкурентная компенсация',
        language === 'en' ? 'Professional development' : language === 'tr' ? 'Profesyonel gelişim' : 'Профессиональное развитие',
        language === 'en' ? 'Health & wellness benefits' : language === 'tr' ? 'Sağlık ve refah faydaları' : 'Льготы по здоровью и благополучию'
      ]
    },
    {
      id: 'press',
      title: t.press,
      description: t.pressDesc,
      icon: <Article />,
      color: '#ff6b35',
      action: t.mediaKit,
      details: [
        language === 'en' ? 'Brand guidelines' : language === 'tr' ? 'Marka kılavuzları' : 'Руководство по бренду',
        language === 'en' ? 'High-resolution logos' : language === 'tr' ? 'Yüksek çözünürlüklü logolar' : 'Логотипы высокого разрешения',
        language === 'en' ? 'Press releases' : language === 'tr' ? 'Basın bültenleri' : 'П��есс-релизы',
        language === 'en' ? 'Executive bios' : language === 'tr' ? 'Yönetici biyografileri' : 'Биографии руководителей'
      ]
    },
    {
      id: 'partners',
      title: t.partners,
      description: t.partnersDesc,
      icon: <Handshake />,
      color: '#8b5cf6',
      action: t.becomePartner,
      details: [
        language === 'en' ? 'Business development opportunities' : language === 'tr' ? 'İş geliştirme fırsatları' : 'Возможности развития бизнеса',
        language === 'en' ? 'Marketing support' : language === 'tr' ? 'Pazarlama desteği' : 'Маркетинговая поддержка',
        language === 'en' ? 'Technical integration' : language === 'tr' ? 'Teknik entegrasyon' : 'Техническая интеграция',
        language === 'en' ? 'Revenue sharing programs' : language === 'tr' ? 'Gelir paylaşım programları' : 'Программы разделения доходов'
      ]
    },
    {
      id: 'contact',
      title: t.contact,
      description: t.contactDesc,
      icon: <Email />,
      color: '#10b981',
      action: t.getInTouch,
      details: [
        language === 'en' ? '24/7 support available' : language === 'tr' ? '7/24 destek mevcut' : 'Поддержка 24/7',
        language === 'en' ? 'Multiple contact channels' : language === 'tr' ? 'Çoklu iletişim kanalları' : 'Множественные каналы связи',
        language === 'en' ? 'Quick response times' : language === 'tr' ? 'Hızlı yanıt süreleri' : 'Быстрое время ответа',
        language === 'en' ? 'Dedicated account managers' : language === 'tr' ? 'Özel hesap yöneticileri' : 'Выделенные менеджеры по работе с клиентами'
      ]
    }
  ];

  const contactInfo = [
    {
      icon: <LocationOn />,
      label: language === 'en' ? 'Headquarters' : language === 'tr' ? 'Merkez Ofis' : 'Штаб-квартира',
      value: 'Amsterdam, Netherlands'
    },
    {
      icon: <Email />,
      label: language === 'en' ? 'General Inquiries' : language === 'tr' ? 'Genel Sorular' : 'Общие вопросы',
      value: 'hello@barberpro.eu'
    },
    {
      icon: <Phone />,
      label: language === 'en' ? 'Phone' : language === 'tr' ? 'Telefon' : 'Телефон',
      value: '+31 20 123 4567'
    },
    {
      icon: <Work />,
      label: language === 'en' ? 'Careers' : language === 'tr' ? 'Kariyer' : 'Карьера',
      value: 'careers@barberpro.eu'
    }
  ];

  const offices = [
    {
      city: 'Amsterdam',
      country: 'Netherlands',
      address: 'Prinsengracht 263-267, 1016 GV Amsterdam',
      type: language === 'en' ? 'Headquarters' : language === 'tr' ? 'Merkez Ofis' : 'Штаб-квартира'
    },
    {
      city: 'Berlin',
      country: 'Germany',
      address: 'Friedrichstraße 68, 10117 Berlin',
      type: language === 'en' ? 'Regional Office' : language === 'tr' ? 'Bölge Ofisi' : 'Региональный офис'
    },
    {
      city: 'Paris',
      country: 'France',
      address: '75 Avenue des Champs-Élysées, 75008 Paris',
      type: language === 'en' ? 'Regional Office' : language === 'tr' ? 'Bölge Ofisi' : 'Ре��иональный офис'
    }
  ];

  return (
    <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="sticky" elevation={0} sx={{
        background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)',
        borderBottom: '1px solid #1a202c'
      }}>
        <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              edge="start"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 1, color: 'white', display: { xs: 'flex', md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Logo size="small" variant="white" />
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <Select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              sx={{
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                '& .MuiSvgIcon-root': { color: 'white' }
              }}
            >
              <MenuItem value="en">🇬🇧 English</MenuItem>
              <MenuItem value="tr">🇹🇷 Türkçe</MenuItem>
              <MenuItem value="ru">🇷🇺 Русский</MenuItem>
            </Select>
          </FormControl>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, rgba(0, 166, 147, 0.95) 0%, rgba(79, 213, 199, 0.9) 100%)',
        color: 'white',
        py: { xs: 6, md: 10 },
        textAlign: 'center'
      }}>
        <Container>
          <Business sx={{ fontSize: 60, mb: 2, opacity: 0.9 }} />
          <Typography variant="h2" component="h1" sx={{ 
            fontWeight: 'bold', 
            mb: 2,
            fontSize: { xs: '2rem', md: '3rem' }
          }}>
            {t.company}
          </Typography>
          <Typography variant="h6" sx={{ 
            opacity: 0.9,
            fontSize: { xs: '1rem', md: '1.25rem' },
            maxWidth: 600,
            mx: 'auto'
          }}>
            {t.subtitle}
          </Typography>
        </Container>
      </Box>

      {/* Main Sections */}
      <Container sx={{ py: { xs: 4, md: 6 } }}>
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {sections.map((section) => (
            <Grid item xs={12} md={6} key={section.id}>
              <Card sx={{ 
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': { 
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 40px rgba(0, 166, 147, 0.15)'
                }
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ 
                      bgcolor: `${section.color}15`, 
                      borderRadius: '50%', 
                      p: 2, 
                      mr: 2,
                      color: section.color
                    }}>
                      {React.cloneElement(section.icon, { sx: { fontSize: 32 } })}
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1f2937' }}>
                      {section.title}
                    </Typography>
                  </Box>

                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {section.description}
                  </Typography>

                  <List sx={{ mb: 3 }}>
                    {section.details.map((detail, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <Box sx={{ 
                            width: 6, 
                            height: 6, 
                            borderRadius: '50%', 
                            bgcolor: section.color 
                          }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={detail}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      bgcolor: section.color,
                      fontWeight: 'bold',
                      '&:hover': { bgcolor: `${section.color}dd` }
                    }}
                    onClick={() => {
                      if (section.id === 'careers') {
                        window.location.href = 'mailto:careers@barberpro.eu';
                      } else if (section.id === 'press') {
                        navigate('/support');
                      } else if (section.id === 'partners') {
                        navigate('/business-signup');
                      } else if (section.id === 'contact') {
                        navigate('/support');
                      }
                    }}
                  >
                    {section.action}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Contact Information */}
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, textAlign: 'center' }}>
          {language === 'en' ? 'Contact Information' : language === 'tr' ? 'İletişim Bilgileri' : 'Контактная информация'}
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {contactInfo.map((info, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper sx={{ 
                p: 3, 
                textAlign: 'center',
                height: '100%',
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <Box sx={{ 
                  bgcolor: '#e6f7f5', 
                  borderRadius: '50%', 
                  p: 2, 
                  display: 'inline-flex',
                  mb: 2,
                  color: '#2d3748'
                }}>
                  {React.cloneElement(info.icon, { sx: { fontSize: 24 } })}
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {info.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {info.value}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>


        {/* Call to Action */}
        <Box sx={{ 
          textAlign: 'center', 
          p: 4,
          bgcolor: '#e6f7f5',
          borderRadius: 3
        }}>
          <Group sx={{ fontSize: 48, color: '#2d3748', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, color: '#1f2937' }}>
            {language === 'en' 
              ? 'Ready to work with us?'
              : language === 'tr' 
              ? 'Bizimle çalışmaya hazır mısınız?'
              : 'Готовы работать с нами?'
            }
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
            {language === 'en' 
              ? 'Whether you\'re looking to join our team, partner with us, or just want to learn more about BarberPro, we\'d love to hear from you.'
              : language === 'tr' 
              ? 'Ekibimize katılmak, bizimle ortaklık kurmak veya sadece BarberPro hakkında daha fazla bilgi edinmek istiyorsanız, sizden haber almak isteriz.'
              : 'Хотите ли вы присоединиться к нашей команде, стать партне��ом или просто узнать больше о BarberPro, мы будем рады услышать от вас.'
            }
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: '#2d3748',
                fontWeight: 'bold',
                px: 4,
                py: 1.5,
                '&:hover': { bgcolor: '#007562' }
              }}
              onClick={() => navigate('/support')}
            >
              {language === 'en' ? 'Contact Us' : language === 'tr' ? 'İletişime Geçin' : 'Связаться с нами'}
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                color: '#2d3748',
                borderColor: '#2d3748',
                fontWeight: 'bold',
                px: 4,
                py: 1.5,
                '&:hover': { bgcolor: '#e6f7f5' }
              }}
              onClick={() => { window.location.href = 'mailto:careers@barberpro.eu'; }}
            >
              {language === 'en' ? 'View Careers' : language === 'tr' ? 'Kariyer Fırsatları' : 'Посмотреть вакансии'}
            </Button>
          </Stack>
        </Box>
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
              Aponti
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
    </Box>
  );
};

export default Company;
