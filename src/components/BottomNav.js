import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, BottomNavigation, BottomNavigationAction, useMediaQuery, useTheme } from '@mui/material';
import { Home, ContentCut, Schedule, AccountCircle } from '@mui/icons-material';
import { useLanguage } from '../contexts/LanguageContext';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { language } = useLanguage();
  const [value, setValue] = useState(0);

  // Translations
  const t = {
    home: language === 'en' ? 'Home' : language === 'tr' ? 'Ana Sayfa' : 'Главная',
    services: language === 'en' ? 'Services' : language === 'tr' ? 'Hizmetler' : 'Услуги',
    appointments: language === 'en' ? 'Appointments' : language === 'tr' ? 'Randevular' : 'Записи',
    profile: language === 'en' ? 'Profile' : language === 'tr' ? 'Profil' : 'Профиль'
  };

  // Update active tab based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setValue(0);
    else if (path === '/services') setValue(1);
    else if (path === '/dashboard') setValue(2);
    else if (path === '/settings' || path === '/profile') setValue(3);
  }, [location]);

  // Don't show on certain pages
  const hideOnPages = ['/signin', '/signup', '/business-signup', '/business-dashboard', '/barber-dashboard'];
  if (hideOnPages.includes(location.pathname)) {
    return null;
  }

  // Only show on mobile
  if (!isMobile) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100vw',
        zIndex: 1100,
        bgcolor: 'white',
        borderTop: '1px solid #e5e7eb',
        display: { xs: 'block', md: 'none' },
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        willChange: 'transform'
      }}
    >
      <BottomNavigation
        value={value}
        onChange={(event, newValue) => setValue(newValue)}
        sx={{
          height: { xs: 56, sm: 60 },
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}
      >
        <BottomNavigationAction
          label={t.home}
          icon={<Home />}
          onClick={() => navigate('/')}
        />
        <BottomNavigationAction
          label={t.services}
          icon={<ContentCut />}
          onClick={() => navigate('/services')}
        />
        <BottomNavigationAction
          label={t.appointments}
          icon={<Schedule />}
          onClick={() => navigate('/dashboard')}
        />
        <BottomNavigationAction
          label={t.profile}
          icon={<AccountCircle />}
          onClick={() => navigate('/profile')}
        />
      </BottomNavigation>
    </Box>
  );
};

export default BottomNav;
