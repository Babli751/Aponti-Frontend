import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Logo from './Logo';
import {
  Box, Container, Grid, Typography, Stack, Link, IconButton, Divider
} from '@mui/material';
import { Email, Phone, Facebook, Instagram, Twitter } from '@mui/icons-material';

const Footer = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  return (
    <Box sx={{
      bgcolor: '#1a1a1a',
      color: 'white',
      py: 6,
      mt: 'auto'
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 2 }}>
              <Logo size="small" variant="white" />
            </Box>
            <Typography variant="body2" sx={{ mb: 2, color: '#b0b0b0' }}>
              {language === 'en'
                ? 'Your trusted platform for booking appointments with top-rated businesses across Europe.'
                : language === 'tr'
                ? 'Avrupa genelinde en iyi işletmelerle randevu almak için güvenilir platformunuz.'
                : 'Ваша надежная платформа для записи на прием в лучшие компании Европы.'}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              {language === 'en' ? 'Quick Links' : language === 'tr' ? 'Hızlı Bağlantılar' : 'Быстрые ссылки'}
            </Typography>
            <Stack spacing={1}>
              <Link
                onClick={() => navigate('/')}
                color="inherit"
                underline="hover"
                sx={{ color: '#b0b0b0', cursor: 'pointer' }}
              >
                {language === 'en' ? 'Home' : language === 'tr' ? 'Ana Sayfa' : 'Главная'}
              </Link>
              <Link
                onClick={() => navigate('/appointment')}
                color="inherit"
                underline="hover"
                sx={{ color: '#b0b0b0', cursor: 'pointer' }}
              >
                {language === 'en' ? 'Book Appointment' : language === 'tr' ? 'Randevu Al' : 'Записаться'}
              </Link>
              <Link
                onClick={() => navigate('/about')}
                color="inherit"
                underline="hover"
                sx={{ color: '#b0b0b0', cursor: 'pointer' }}
              >
                {language === 'en' ? 'About' : language === 'tr' ? 'Hakkımızda' : 'О нас'}
              </Link>
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              {language === 'en' ? 'Contact' : language === 'tr' ? 'İletişim' : 'Контакты'}
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#b0b0b0' }}>
                <Email sx={{ fontSize: 20 }} />
                <Typography variant="body2">info@aponti.com</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#b0b0b0' }}>
                <Phone sx={{ fontSize: 20 }} />
                <Typography variant="body2">+90 555 123 4567</Typography>
              </Box>
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <IconButton
                  sx={{ color: '#2d3748', bgcolor: 'rgba(0,166,147,0.1)' }}
                  component="a"
                  href="https://facebook.com"
                  target="_blank"
                >
                  <Facebook />
                </IconButton>
                <IconButton
                  sx={{ color: '#2d3748', bgcolor: 'rgba(0,166,147,0.1)' }}
                  component="a"
                  href="https://instagram.com"
                  target="_blank"
                >
                  <Instagram />
                </IconButton>
                <IconButton
                  sx={{ color: '#2d3748', bgcolor: 'rgba(0,166,147,0.1)' }}
                  component="a"
                  href="https://twitter.com"
                  target="_blank"
                >
                  <Twitter />
                </IconButton>
              </Stack>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

        <Typography variant="body2" sx={{ textAlign: 'center', color: '#b0b0b0' }}>
          © 2025 Aponti. {language === 'en' ? 'All rights reserved.' : language === 'tr' ? 'Tüm hakları saklıdır.' : 'Все права защищены.'}
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
