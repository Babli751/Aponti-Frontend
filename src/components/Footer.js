import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Logo from './Logo';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Stack,
  Divider
} from '@mui/material';

const Footer = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  return (
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
                : 'Ведущая платформа для бронирования профессиональных парикмахерских услуг по всей Европе. Найдите и забронируйте лучших парикмахеров в своем городе.'
              }
            </Typography>
          </Grid>

          {/* Company */}
          <Grid item xs={6} md={3}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, fontSize: { xs: '1rem', md: '1.25rem' } }}>
              {language === 'en' ? 'Company' : language === 'tr' ? 'Şirket' : 'Компания'}
            </Typography>
            <Stack spacing={1}>
              <Link
                href="#"
                color="inherit"
                sx={{ opacity: 0.8, textDecoration: 'none', '&:hover': { opacity: 1 }, fontSize: { xs: '0.85rem', md: '0.875rem' }, cursor: 'pointer' }}
                onClick={(e) => { e.preventDefault(); navigate('/about'); }}
              >
                {language === 'en' ? 'About' : language === 'tr' ? 'Hakkımızda' : 'О нас'}
              </Link>
              <Link
                href="#"
                color="inherit"
                sx={{ opacity: 0.8, textDecoration: 'none', '&:hover': { opacity: 1 }, fontSize: { xs: '0.85rem', md: '0.875rem' }, cursor: 'pointer' }}
                onClick={(e) => { e.preventDefault(); navigate('/company'); }}
              >
                {language === 'en' ? 'Careers' : language === 'tr' ? 'Kariyer' : 'Карьера'}
              </Link>
              <Link
                href="#"
                color="inherit"
                sx={{ opacity: 0.8, textDecoration: 'none', '&:hover': { opacity: 1 }, fontSize: { xs: '0.85rem', md: '0.875rem' }, cursor: 'pointer' }}
                onClick={(e) => { e.preventDefault(); navigate('/company'); }}
              >
                {language === 'en' ? 'Partners' : language === 'tr' ? 'Ortaklar' : 'Партнеры'}
              </Link>
            </Stack>
          </Grid>

          {/* Support */}
          <Grid item xs={6} md={3}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, fontSize: { xs: '1rem', md: '1.25rem' } }}>
              {language === 'en' ? 'Support' : language === 'tr' ? 'Destek' : 'Поддержка'}
            </Typography>
            <Stack spacing={1}>
              <Link
                href="#"
                color="inherit"
                sx={{ opacity: 0.8, textDecoration: 'none', '&:hover': { opacity: 1 }, fontSize: { xs: '0.85rem', md: '0.875rem' }, cursor: 'pointer' }}
                onClick={(e) => { e.preventDefault(); navigate('/support'); }}
              >
                {language === 'en' ? 'Help Center' : language === 'tr' ? 'Yardım Merkezi' : 'Центр помощи'}
              </Link>
              <Link
                href="#"
                color="inherit"
                sx={{ opacity: 0.8, textDecoration: 'none', '&:hover': { opacity: 1 }, fontSize: { xs: '0.85rem', md: '0.875rem' }, cursor: 'pointer' }}
                onClick={(e) => { e.preventDefault(); navigate('/contact'); }}
              >
                {language === 'en' ? 'Contact Us' : language === 'tr' ? 'İletişim' : 'Связаться с нами'}
              </Link>
              <Link
                href="#"
                color="inherit"
                sx={{ opacity: 0.8, textDecoration: 'none', '&:hover': { opacity: 1 }, fontSize: { xs: '0.85rem', md: '0.875rem' }, cursor: 'pointer' }}
                onClick={(e) => { e.preventDefault(); navigate('/support'); }}
              >
                {language === 'en' ? 'FAQ' : language === 'tr' ? 'SSS' : 'FAQ'}
              </Link>
              <Link
                href="#"
                color="inherit"
                sx={{ opacity: 0.8, textDecoration: 'none', '&:hover': { opacity: 1 }, fontSize: { xs: '0.85rem', md: '0.875rem' }, cursor: 'pointer' }}
                onClick={(e) => { e.preventDefault(); navigate('/support'); }}
              >
                {language === 'en' ? 'Safety' : language === 'tr' ? 'Güvenlik' : 'Безопасность'}
              </Link>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: { xs: 3, md: 4 }, borderColor: 'rgba(255,255,255,0.1)' }} />

        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Typography variant="body2" sx={{ opacity: 0.8, fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
            © 2024 Aponti. {language === 'en' ? 'All rights reserved.' : language === 'tr' ? 'Tüm hakları saklıdır.' : 'Все права защищены.'}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.6, fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
            {language === 'en' ? 'Made for World' : language === 'tr' ? 'Dünya için yapıldı' : 'Сделано для мира'} 🌍
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
