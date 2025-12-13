import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
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
  Chip,
  useTheme,
  useMediaQuery,
  Paper
} from '@mui/material';
import {
  ArrowBack,
  LocalOffer,
  AccessTime,
  Star,
  Language,
  FlashOn,
  CardGiftcard,
  Percent,
  Schedule
} from '@mui/icons-material';

const Offers = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { language, changeLanguage, t: translations } = useLanguage();

  // Use centralized translations
  const t = {
    ...translations,
    offers: translations.specialOffers
  };

  const offers = [
    {
      id: 1,
      title: language === 'en' ? '30% Off First Visit' : language === 'tr' ? 'İlk Ziyarete %30 İndirim' : '30% скидка на первое посещение',
      description: language === 'en' 
        ? 'Get 30% discount on your first appointment with any verified business'
        : language === 'tr' 
        ? 'Doğrulanmış herhangi bir berberle ilk randevunuzda %30 indirim kazanın'
        : 'Получите 30% скидку на первую запись к любому проверенному парикмахеру',
      discount: '30%',
      originalPrice: 50,
      discountedPrice: 35,
      validUntil: language === 'en' ? 'March 31, 2024' : language === 'tr' ? '31 Mart 2024' : '31 марта 2024',
      code: 'WELCOME30',
      type: 'new_customer',
      backgroundColor: '#2d3748',
      icon: <FlashOn />
    },
    {
      id: 2,
      title: language === 'en' ? 'Premium Package Deal' : language === 'tr' ? 'Premium Paket Anlaşması' : 'Премиум пакет',
      description: language === 'en' 
        ? 'Complete service package: Professional treatment + Styling + Care'
        : language === 'tr' 
        ? 'Komple bakım paketi: Kesim + Tıraş + Şekillendirme + Y��z Bakımı'
        : 'Полный пакет ухода: Стрижка + Бритье + Укладка + Уход за лицом',
      discount: '25%',
      originalPrice: 80,
      discountedPrice: 60,
      validUntil: language === 'en' ? 'April 15, 2024' : language === 'tr' ? '15 Nisan 2024' : '15 апреля 2024',
      code: 'PREMIUM25',
      type: 'limited_time',
      backgroundColor: '#ff6b35',
      icon: <Star />
    },
    {
      id: 3,
      title: language === 'en' ? 'Weekend Special' : language === 'tr' ? 'Hafta Sonu Özel' : 'Выходные специально',
      description: language === 'en' 
        ? 'Book weekend appointments and save 20% on all services'
        : language === 'tr' 
        ? 'Hafta sonu randevuları ayırtın ve tüm hizmetlerde %20 tasarruf edin'
        : 'Бронируйте встречи на выходные и экономьте 20% на всех услугах',
      discount: '20%',
      originalPrice: 40,
      discountedPrice: 32,
      validUntil: language === 'en' ? 'Every Weekend' : language === 'tr' ? 'Her Hafta Sonu' : 'Каждые выходные',
      code: 'WEEKEND20',
      type: 'exclusive',
      backgroundColor: '#8b5cf6',
      icon: <Schedule />
    },
    {
      id: 4,
      title: language === 'en' ? 'Loyalty Rewards' : language === 'tr' ? 'Sadakat Ödülleri' : 'Программа лояльности',
      description: language === 'en' 
        ? 'Book 5 appointments and get the 6th one completely free'
        : language === 'tr' 
        ? '5 randevu ayırtın ve 6. randevuyu tamamen ücretsiz alın'
        : 'Забронируйте 5 встреч и получите 6-ю совершенно бесплатно',
      discount: language === 'en' ? 'Free 6th' : language === 'tr' ? '6. Ücretsiz' : '6-й бесплатно',
      originalPrice: 240,
      discountedPrice: 200,
      validUntil: language === 'en' ? 'Ongoing' : language === 'tr' ? 'Devam Ediyor' : 'Постоянно',
      code: 'LOYAL6',
      type: 'popular',
      backgroundColor: '#10b981',
      icon: <CardGiftcard />
    },
    {
      id: 5,
      title: language === 'en' ? 'Student Discount' : language === 'tr' ? 'Öğrenci İndirimi' : 'Студенческая скидка',
      description: language === 'en' 
        ? 'Students get 15% off on all services with valid student ID'
        : language === 'tr' 
        ? 'Öğrenciler geçerli öğrenci kartı ile tüm hizmetlerde %15 indirim alır'
        : 'Студенты получают 15% скидку на все услуги при предъявлении студенческого билета',
      discount: '15%',
      originalPrice: 35,
      discountedPrice: 30,
      validUntil: language === 'en' ? 'Always Available' : language === 'tr' ? 'Her Zaman Geçerli' : 'Всегда доступно',
      code: 'STUDENT15',
      type: 'exclusive',
      backgroundColor: '#3b82f6',
      icon: <Percent />
    },
    {
      id: 6,
      title: language === 'en' ? 'Referral Bonus' : language === 'tr' ? 'Tavsiye Bonusu' : 'Реферальный бонус',
      description: language === 'en' 
        ? 'Refer a friend and both get €10 credit for your next appointment'
        : language === 'tr' 
        ? 'Bir arkadaşınızı tavsiye edin ve ikiniz de sonraki randevunuz için €10 kredi alın'
        : 'Пригласите друга и оба получите кредит €10 на следующую запись',
      discount: '€10',
      originalPrice: 0,
      discountedPrice: 10,
      validUntil: language === 'en' ? 'No Expiry' : language === 'tr' ? 'Son Kullanma Yok' : 'Без срока действия',
      code: 'REFER10',
      type: 'popular',
      backgroundColor: '#f59e0b',
      icon: <LocalOffer />
    }
  ];

  const getTypeLabel = (type) => {
    switch (type) {
      case 'new_customer': return t.newCustomers;
      case 'limited_time': return t.limitedTime;
      case 'exclusive': return t.exclusive;
      case 'popular': return t.popular;
      default: return '';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'new_customer': return '#2d3748';
      case 'limited_time': return '#ff6b35';
      case 'exclusive': return '#8b5cf6';
      case 'popular': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh' }}>
      {/* Header */}
      <Navbar onMenuClick={() => setDrawerOpen(true)} />

      {/* Hero Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, rgba(0, 166, 147, 0.95) 0%, rgba(79, 213, 199, 0.9) 100%)',
        color: 'white',
        py: { xs: 4, md: 6 },
        textAlign: 'center'
      }}>
        <Container>
          <LocalOffer sx={{ fontSize: 60, mb: 2, opacity: 0.9 }} />
          <Typography variant="h2" component="h1" sx={{ 
            fontWeight: 'bold', 
            mb: 2,
            fontSize: { xs: '2rem', md: '3rem' }
          }}>
            {t.offers}
          </Typography>
          <Typography variant="h6" sx={{ 
            opacity: 0.9,
            fontSize: { xs: '1rem', md: '1.25rem' }
          }}>
            {t.subtitle}
          </Typography>
        </Container>
      </Box>

      {/* Offers Grid */}
      <Container sx={{ py: { xs: 3, md: 6 }, px: { xs: 2, md: 3 } }}>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {offers.map((offer) => (
            <Grid item xs={12} sm={6} md={6} lg={4} key={offer.id}>
              <Card sx={{
                height: '100%',
                position: 'relative',
                overflow: 'visible',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                minHeight: { xs: '450px', md: '500px' },
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 40px rgba(0, 166, 147, 0.2)'
                }
              }}>
                {/* Background Gradient */}
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: { xs: '160px', md: '140px' },
                  background: `linear-gradient(135deg, ${offer.backgroundColor} 0%, ${offer.backgroundColor}dd 100%)`,
                  zIndex: 0
                }} />

                {/* Text Shadow Overlay */}
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: { xs: '160px', md: '140px' },
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)',
                  zIndex: 1
                }} />

                {/* Offer Type Badge */}
                <Chip
                  label={getTypeLabel(offer.type)}
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    bgcolor: 'rgba(255,255,255,0.95)',
                    color: getTypeColor(offer.type),
                    fontWeight: 'bold',
                    zIndex: 3,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                />

                <CardContent sx={{
                  position: 'relative',
                  zIndex: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  p: { xs: 2, md: 3 }
                }}>
                  {/* Icon and Discount */}
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: { xs: 1.5, md: 2 },
                    pt: { xs: 1, md: 2 },
                    minHeight: '60px',
                    position: 'relative',
                    zIndex: 2
                  }}>
                    <Box sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      borderRadius: '50%', 
                      p: 1.5,
                      color: 'white'
                    }}>
                      {React.cloneElement(offer.icon, { sx: { fontSize: 28 } })}
                    </Box>
                    <Typography variant="h3" sx={{
                      fontWeight: 'bold',
                      color: 'white',
                      fontSize: { xs: '1.8rem', md: '2.5rem' },
                      lineHeight: 1,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                      zIndex: 2,
                      position: 'relative'
                    }}>
                      {offer.discount}
                    </Typography>
                  </Box>

                  {/* Title */}
                  <Typography variant="h5" sx={{
                    fontWeight: 'bold',
                    mb: { xs: 1.5, md: 2 },
                    color: 'white',
                    fontSize: { xs: '1.1rem', md: '1.5rem' },
                    lineHeight: 1.2,
                    wordWrap: 'break-word',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                    zIndex: 2,
                    position: 'relative'
                  }}>
                    {offer.title}
                  </Typography>

                  {/* Description */}
                  <Paper sx={{
                    p: { xs: 1.5, md: 2 },
                    mb: { xs: 2, md: 3 },
                    bgcolor: 'rgba(255,255,255,0.95)',
                    borderRadius: 2,
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <Typography variant="body2" color="text.secondary" sx={{
                      mb: 2,
                      fontSize: { xs: '0.85rem', md: '0.875rem' },
                      lineHeight: 1.4,
                      wordWrap: 'break-word'
                    }}>
                      {offer.description}
                    </Typography>

                    {/* Pricing */}
                    {offer.originalPrice > 0 && (
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: { xs: 1, md: 2 },
                        mb: 2,
                        flexWrap: 'wrap'
                      }}>
                        <Typography
                          variant="h6"
                          sx={{
                            textDecoration: 'line-through',
                            color: '#6b7280',
                            fontSize: { xs: '0.9rem', md: '1rem' }
                          }}
                        >
                          {t.currency}{offer.originalPrice}
                        </Typography>
                        <Typography variant="h5" sx={{
                          fontWeight: 'bold',
                          color: offer.backgroundColor,
                          fontSize: { xs: '1.3rem', md: '1.5rem' }
                        }}>
                          {t.currency}{offer.discountedPrice}
                        </Typography>
                      </Box>
                    )}

                    {/* Validity */}
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 2,
                      flexWrap: 'wrap'
                    }}>
                      <AccessTime sx={{ fontSize: 16, color: '#6b7280' }} />
                      <Typography variant="body2" color="text.secondary" sx={{
                        fontSize: { xs: '0.8rem', md: '0.875rem' }
                      }}>
                        {t.validUntil}: {offer.validUntil}
                      </Typography>
                    </Box>

                    {/* Promo Code */}
                    <Paper sx={{
                      p: { xs: 0.8, md: 1 },
                      bgcolor: '#f3f4f6',
                      textAlign: 'center',
                      mb: 2,
                      border: '2px dashed #d1d5db',
                      borderRadius: 1
                    }}>
                      <Typography variant="body2" color="text.secondary" sx={{
                        fontSize: { xs: '0.7rem', md: '0.8rem' }
                      }}>
                        {language === 'en' ? 'Promo Code' : language === 'tr' ? 'Promosyon Kodu' : 'Промо код'}
                      </Typography>
                      <Typography variant="h6" sx={{
                        fontWeight: 'bold',
                        color: '#1f2937',
                        fontSize: { xs: '1rem', md: '1.25rem' },
                        letterSpacing: '0.5px'
                      }}>
                        {offer.code}
                      </Typography>
                    </Paper>
                  </Paper>

                  {/* Claim Button */}
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{
                      bgcolor: 'white',
                      color: offer.backgroundColor,
                      fontWeight: 'bold',
                      py: { xs: 1.2, md: 1.5 },
                      fontSize: { xs: '0.9rem', md: '1rem' },
                      borderRadius: 2,
                      mt: 'auto',
                      '&:hover': {
                        bgcolor: '#f9fafb',
                        transform: 'scale(1.02)'
                      }
                    }}
                    onClick={() => navigate('/')}
                  >
                    {t.claimOffer}
                  </Button>

                  {/* Terms */}
                  <Typography variant="caption" sx={{
                    display: 'block',
                    textAlign: 'center',
                    mt: { xs: 0.8, md: 1 },
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: { xs: '0.65rem', md: '0.7rem' },
                    lineHeight: 1.2
                  }}>
                    * {t.termsApply}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Newsletter Signup */}
        <Box sx={{ 
          textAlign: 'center', 
          mt: 6,
          p: 4,
          bgcolor: 'white',
          borderRadius: 3,
          border: '2px solid #e6f7f5'
        }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, color: '#1f2937' }}>
            {language === 'en' 
              ? 'Never miss a deal!'
              : language === 'tr' 
              ? 'Hiçbir fırsatı kaçırmayın!'
              : 'Никогда не пропускайте сделки!'
            }
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            {language === 'en' 
              ? 'Subscribe to get exclusive offers and early access to new deals'
              : language === 'tr' 
              ? 'Özel teklifler ve yeni fırsatlara erken erişim için abone olun'
              : 'Подпишитесь, чтобы получать эксклюзивные предложения и ранний доступ к новым сделкам'
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
            {language === 'en' 
              ? 'Subscribe Now'
              : language === 'tr' 
              ? 'Şimdi Abone Ol'
              : 'Подписаться сейчас'
            }
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Offers;
