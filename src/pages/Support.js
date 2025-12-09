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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Chip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar
} from '@mui/material';
import {
  ArrowBack,
  Language,
  Support as SupportIcon,
  Help,
  Security,
  Chat,
  Email,
  Phone,
  Schedule,
  ExpandMore,
  Search,
  QuestionAnswer,
  ContactSupport,
  LiveHelp,
  Menu as MenuIcon,
  Close,
  Home as HomeIcon,
  ContentCut,
  Person,
  Favorite,
  Settings,
  Logout,
  Business
} from '@mui/icons-material';

const Support = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { language, changeLanguage, t: translations } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
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
      support: 'Support Center',
      subtitle: 'Get help and find answers to your questions',
      helpCenter: 'Help Center',
      contactUs: 'Contact Us',
      faq: 'Frequently Asked Questions',
      safety: 'Safety & Security',
      searchPlaceholder: 'Search for help articles...',
      searchHelp: 'Search Help',
      getSupport: 'Get Support',
      livechat: 'Live Chat',
      emailSupport: 'Email Support',
      phoneSupport: 'Phone Support',
      available247: 'Available 24/7',
      businessHours: 'Business Hours Only',
      fastResponse: 'Fast Response',
      expandedHours: 'Extended Hours'
    },
    tr: {
      brand: 'BarberPro',
      support: 'Destek Merkezi',
      subtitle: 'Yardım alın ve sorularınızın cevaplarını bulun',
      helpCenter: 'Yardım Merkezi',
      contactUs: 'İletişim',
      faq: 'Sık Sorulan Sorular',
      safety: 'Güvenlik ve Emniyet',
      searchPlaceholder: 'Yardım makalelerini arayın...',
      searchHelp: 'Yardım Ara',
      getSupport: 'Destek Al',
      livechat: 'Canlı Sohbet',
      emailSupport: 'E-posta Desteği',
      phoneSupport: 'Telefon Desteği',
      available247: '7/24 Erişilebilir',
      businessHours: 'Sadece Mesai Saatleri',
      fastResponse: 'Hızlı Yanıt',
      expandedHours: 'Genişletilmiş Saatler'
    },
    ru: {
      brand: 'BarberPro',
      support: 'Центр поддержки',
      subtitle: 'Получите помощь и найдите ответы на свои вопросы',
      helpCenter: 'Центр помощи',
      contactUs: 'Связаться с нами',
      faq: 'Часто задаваемые вопросы',
      safety: 'Безопасность и защита',
      searchPlaceholder: 'Поиск статей помощи...',
      searchHelp: 'Поиск помощи',
      getSupport: 'Получить поддержку',
      livechat: 'Живой чат',
      emailSupport: 'Поддержка по email',
      phoneSupport: 'Телефонная поддержка',
      available247: 'Доступ��о 24/7',
      businessHours: 'Только в рабочие часы',
      fastResponse: 'Быстрый ответ',
      expandedHours: 'Расширенные часы'
    }
  };

  // Use centralized translations with page-specific content
  const t = {
    ...translations,
    subtitle: language === 'en' ? 'Get help and find answers to your questions' : language === 'tr' ? 'Yardım alın ve sorularınızın cevaplarını bulun' : 'Получите помощь и найдите ответы на свои вопросы',
    searchPlaceholder: language === 'en' ? 'Search for help articles...' : language === 'tr' ? 'Yardım makalelerini arayın...' : 'Поиск статей помощи...',
    searchHelp: language === 'en' ? 'Search Help' : language === 'tr' ? 'Yardım Ara' : 'Поиск помощи',
    getSupport: language === 'en' ? 'Get Support' : language === 'tr' ? 'Destek Al' : 'Получить поддержку',
    livechat: language === 'en' ? 'Live Chat' : language === 'tr' ? 'Canlı Sohbet' : 'Онлайн-чат',
    emailSupport: language === 'en' ? 'Email Support' : language === 'tr' ? 'E-posta Desteği' : 'Поддержка по электронной почте',
    phoneSupport: language === 'en' ? 'Phone Support' : language === 'tr' ? 'Telefon Desteği' : 'Телеф��нная поддержка',
    available247: language === 'en' ? 'Available 24/7' : language === 'tr' ? '7/24 Erişilebilir' : 'Доступно 24/7',
    businessHours: language === 'en' ? 'Business Hours Only' : language === 'tr' ? 'Sadece Mesai Saatleri' : 'Только в рабочие часы',
    fastResponse: language === 'en' ? 'Fast Response' : language === 'tr' ? 'Hızlı Yanıt' : 'Быстрый ответ',
    expandedHours: language === 'en' ? 'Extended Hours' : language === 'tr' ? 'Genişletilmiş Saatler' : 'Расширенные часы'
  };

  const supportOptions = [
    {
      title: t.livechat,
      description: language === 'en' 
        ? 'Chat with our support team in real-time' 
        : language === 'tr' 
        ? 'Destek ekibimizle gerçek zamanlı sohbet edin'
        : 'Общайтесь с нашей службой поддержки в режиме реального времени',
      icon: <Chat />,
      color: '#2d3748',
      availability: t.available247,
      responseTime: language === 'en' ? '< 2 minutes' : language === 'tr' ? '< 2 dakika' : '< 2 минуты',
      action: language === 'en' ? 'Start Chat' : language === 'tr' ? 'Sohbeti Başlat' : 'Начать чат'
    },
    {
      title: t.emailSupport,
      description: language === 'en' 
        ? 'Send us a detailed message and we\'ll get back to you' 
        : language === 'tr' 
        ? 'Bize detaylı mesaj gönderin, size geri döneceğiz'
        : 'Отправьте нам подробное сообщение, и мы свяжемся с вами',
      icon: <Email />,
      color: '#ff6b35',
      availability: t.available247,
      responseTime: language === 'en' ? '< 4 hours' : language === 'tr' ? '< 4 saat' : '< 4 часа',
      action: language === 'en' ? 'Send Email' : language === 'tr' ? 'E-posta Gönder' : 'Отправить email'
    },
    {
      title: t.phoneSupport,
      description: language === 'en' 
        ? 'Speak directly with our support specialists' 
        : language === 'tr' 
        ? 'Destek uzmanlarımızla doğrudan konuşun'
        : 'Говорите напрямую с нашими специалистами поддержки',
      icon: <Phone />,
      color: '#8b5cf6',
      availability: t.expandedHours,
      responseTime: language === 'en' ? 'Immediate' : language === 'tr' ? 'Anında' : 'Немедленно',
      action: language === 'en' ? 'Call Now' : language === 'tr' ? 'Şimdi Ara' : 'Позвонить сейчас'
    }
  ];

  const faqCategories = [
    {
      category: language === 'en' ? 'Booking & Appointments' : language === 'tr' ? 'Rezervasyon ve Randevular' : 'Бронирование и встречи',
      questions: [
        {
          question: language === 'en' ? 'How do I book an appointment?' : language === 'tr' ? 'Nasıl randevu alırım?' : 'Как забронировать встречу?',
          answer: language === 'en' 
            ? 'You can book an appointment by searching for barbers in your area, selecting your preferred service and time slot, and confirming your booking.' 
            : language === 'tr' 
            ? 'Bölgenizdeki berberleri arayarak, tercih ettiğiniz hizmeti ve zaman dilimini seçerek ve rezervasyonunuzu onaylayarak randevu alabilirsiniz.'
            : 'Вы можете забронировать встречу, найдя парикмахеров в вашем районе, выбрав предпочитаемую услугу и время, и подтвердив бронирование.'
        },
        {
          question: language === 'en' ? 'Can I cancel or reschedule my appointment?' : language === 'tr' ? 'Randevumu iptal edebilir veya erteleyebilir miyim?' : 'Могу ли я отменить или перенести встречу?',
          answer: language === 'en' 
            ? 'Yes, you can cancel or reschedule your appointment up to 24 hours before your scheduled time without any fees.' 
            : language === 'tr' 
            ? 'Evet, planlanmış saatinizden 24 saat öncesine kadar herhangi bir ücret ödemeden randevunuzu iptal edebilir veya erteleyebilirsiniz.'
            : 'Да, вы можете отменить или перенести встречу за 24 часа до запланированного времени без дополнительных платежей.'
        }
      ]
    },
    {
      category: language === 'en' ? 'Payments & Pricing' : language === 'tr' ? 'Ödemeler ve Fiyatlandırma' : 'Платежи и цены',
      questions: [
        {
          question: language === 'en' ? 'What payment methods do you accept?' : language === 'tr' ? 'Hangi ödeme yöntemlerini kabul ediyorsunuz?' : 'К��кие способы оплаты вы принимаете?',
          answer: language === 'en' 
            ? 'We accept all major credit cards, debit cards, PayPal, and various digital wallet options including Apple Pay and Google Pay.' 
            : language === 'tr' 
            ? 'Tüm büyük kredi kartları, banka kartları, PayPal ve Apple Pay ve Google Pay dahil çeşitli dijital cüzdan seçeneklerini kabul ediyoruz.'
            : 'Мы принимаем все основные кредитные карты, дебетовые карты, PayPal и различные цифровые кошельки, включая Apple Pay и Google Pay.'
        },
        {
          question: language === 'en' ? 'Are there any booking fees?' : language === 'tr' ? 'Rezervasyon ücreti var mı?' : 'Есть ли плата за бронирование?',
          answer: language === 'en' 
            ? 'No, there are no booking fees. You only pay for the services you receive from the barber.' 
            : language === 'tr' 
            ? 'Hayır, rezervasyon ücreti yoktur. Sadece berberden aldığınız hizmetler için ödeme yaparsınız.'
            : 'Нет, плата за бронирование отсутствует. Вы платите только за услуги, которые получаете от парикмахера.'
        }
      ]
    },
    {
      category: language === 'en' ? 'Account & Profile' : language === 'tr' ? 'Hesap ve Profil' : 'Аккаунт и профиль',
      questions: [
        {
          question: language === 'en' ? 'How do I create an account?' : language === 'tr' ? 'Nasıl hesap oluştururum?' : 'Как создать аккаунт?',
          answer: language === 'en' 
            ? 'Click on "Sign Up" and provide your email address, create a password, and verify your email. You can also sign up using your social media accounts.' 
            : language === 'tr' 
            ? '"Kayıt Ol"a tıklayın ve e-posta adresinizi verin, şifre oluşturun ve e-postanızı doğrulayın. Sosyal medya hesaplarınızı kullanarak da kayıt olabilirsiniz.'
            : 'Нажмите "Регистрация" и укажите свой email адрес, создайте пароль и подтвердите email. Вы также можете зарегистрироваться через социальные сети.'
        },
        {
          question: language === 'en' ? 'How do I reset my password?' : language === 'tr' ? 'Şifremi nasıl sıfırlarım?' : 'Как сбросить пароль?',
          answer: language === 'en' 
            ? 'On the login page, click "Forgot Password" and enter your email address. We\'ll send you a reset link.' 
            : language === 'tr' 
            ? 'Giriş sayfasında "Şifremi Unuttum"a tıklayın ve e-posta adresinizi girin. Size sıfırlama bağlantısı göndereceğiz.'
            : 'На странице входа нажмите "Забыли пароль" и введите свой email адрес. Мы отправим вам ссылку для сброса.'
        }
      ]
    }
  ];

  const helpTopics = [
    {
      title: language === 'en' ? 'Getting Started' : language === 'tr' ? 'Başlangıç' : 'Начало работы',
      description: language === 'en' ? 'Learn the basics of using BarberPro' : language === 'tr' ? 'BarberPro kullanımının temellerini öğrenin' : 'Изучите основы использования BarberPro',
      icon: <Help />,
      articles: 12
    },
    {
      title: language === 'en' ? 'Booking Help' : language === 'tr' ? 'Rezervasyon Yardımı' : 'Помощь с бронированием',
      description: language === 'en' ? 'Everything about making and managing bookings' : language === 'tr' ? 'Rezervasyon yapma ve yönetme hakkında her şey' : 'Все о создании и управлении бронирования��и',
      icon: <Schedule />,
      articles: 18
    },
    {
      title: language === 'en' ? 'Account Settings' : language === 'tr' ? 'Hesap Ayarları' : 'Настройки аккаунта',
      description: language === 'en' ? 'Manage your profile and preferences' : language === 'tr' ? 'Profilinizi ve tercihlerinizi yönetin' : 'Управляйте профилем и настройками',
      icon: <ContactSupport />,
      articles: 8
    },
    {
      title: language === 'en' ? 'Safety & Security' : language === 'tr' ? 'Güvenlik ve Emniyet' : 'Безопасность и защита',
      description: language === 'en' ? 'Information about safety and security measures' : language === 'tr' ? 'Güvenlik ve emniyet önlemleri hakkında bilgi' : 'Информация о мерах безопасности и защиты',
      icon: <Security />,
      articles: 6
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
        py: { xs: 6, md: 8 },
        textAlign: 'center'
      }}>
        <Container>
          <SupportIcon sx={{ fontSize: 60, mb: 2, opacity: 0.9 }} />
          <Typography variant="h2" component="h1" sx={{ 
            fontWeight: 'bold', 
            mb: 2,
            fontSize: { xs: '2rem', md: '3rem' }
          }}>
            {t.support}
          </Typography>
          <Typography variant="h6" sx={{ 
            opacity: 0.9,
            fontSize: { xs: '1rem', md: '1.25rem' },
            mb: 4
          }}>
            {t.subtitle}
          </Typography>

          {/* Search Bar */}
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <TextField
              fullWidth
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                bgcolor: 'white',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { border: 'none' }
                }
              }}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: '#6b7280' }} />,
                endAdornment: (
                  <Button 
                    variant="contained" 
                    sx={{ 
                      bgcolor: '#2d3748', 
                      ml: 1,
                      '&:hover': { bgcolor: '#007562' }
                    }}
                  >
                    {t.searchHelp}
                  </Button>
                )
              }}
            />
          </Box>
        </Container>
      </Box>

      <Container sx={{ py: { xs: 4, md: 6 } }}>
        {/* Support Options */}
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, textAlign: 'center' }}>
          {t.getSupport}
        </Typography>

        <Grid container spacing={3} sx={{ mb: 6 }}>
          {supportOptions.map((option, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ 
                height: '100%',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                '&:hover': { 
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 40px rgba(0, 166, 147, 0.15)'
                }
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ 
                    bgcolor: `${option.color}15`, 
                    borderRadius: '50%', 
                    p: 3, 
                    display: 'inline-flex',
                    mb: 3,
                    color: option.color
                  }}>
                    {React.cloneElement(option.icon, { sx: { fontSize: 40 } })}
                  </Box>
                  
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                    {option.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {option.description}
                  </Typography>

                  <Stack spacing={1} sx={{ mb: 3 }}>
                    <Chip 
                      label={option.availability}
                      size="small"
                      sx={{ bgcolor: `${option.color}15`, color: option.color }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {language === 'en' ? 'Response time' : language === 'tr' ? 'Yanıt süresi' : 'Время ответа'}: {option.responseTime}
                    </Typography>
                  </Stack>

                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      bgcolor: option.color,
                      fontWeight: 'bold',
                      '&:hover': { bgcolor: `${option.color}dd` }
                    }}
                  >
                    {option.action}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Help Topics */}
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, textAlign: 'center' }}>
          {t.helpCenter}
        </Typography>

        <Grid container spacing={3} sx={{ mb: 6 }}>
          {helpTopics.map((topic, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': { 
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0, 166, 147, 0.1)'
                }
              }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Box sx={{ 
                    bgcolor: '#e6f7f5', 
                    borderRadius: '50%', 
                    p: 2, 
                    display: 'inline-flex',
                    mb: 2,
                    color: '#2d3748'
                  }}>
                    {React.cloneElement(topic.icon, { sx: { fontSize: 32 } })}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {topic.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {topic.description}
                  </Typography>
                  <Typography variant="body2" color="primary" sx={{ fontWeight: 'medium' }}>
                    {topic.articles} {language === 'en' ? 'articles' : language === 'tr' ? 'makale' : 'статей'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* FAQ Section */}
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, textAlign: 'center' }}>
          {t.faq}
        </Typography>

        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          {faqCategories.map((category, categoryIndex) => (
            <Box key={categoryIndex} sx={{ mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: '#2d3748' }}>
                {category.category}
              </Typography>
              {category.questions.map((item, questionIndex) => (
                <Accordion key={questionIndex} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                      {item.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary">
                      {item.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          ))}
        </Box>

        {/* Contact CTA */}
        <Box sx={{ 
          textAlign: 'center', 
          mt: 6,
          p: 4,
          bgcolor: '#e6f7f5',
          borderRadius: 3
        }}>
          <LiveHelp sx={{ fontSize: 48, color: '#2d3748', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, color: '#1f2937' }}>
            {language === 'en' 
              ? 'Still need help?'
              : language === 'tr' 
              ? 'Hala yardıma mı ihtiyacınız var?'
              : 'Все еще нужна помощь?'
            }
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            {language === 'en' 
              ? 'Our support team is available 24/7 to help you with any questions or issues.'
              : language === 'tr' 
              ? 'Destek ekibimiz herhangi bir soru veya sorun için size yardımcı olmak üzere 7/24 hazır.'
              : 'Наша служба поддержки доступна 24/7, чтобы помочь вам с любыми вопросами или проблемами.'
            }
          </Typography>
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
          >
            {t.contactUs}
          </Button>
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

export default Support;
