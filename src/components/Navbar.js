import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Logo from './Logo';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Avatar,
  Typography,
  Stack,
  FormControl,
  Select,
  MenuItem,
  Container,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Business,
  Notifications
} from '@mui/icons-material';

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const { isAuthenticated, user } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);

  const t = {
    services: language === 'en' ? 'Services' : language === 'tr' ? 'Hizmetler' : 'Услуги',
    about: language === 'en' ? 'About' : language === 'tr' ? 'Hakkımızda' : 'О нас',
    contact: language === 'en' ? 'Contact Us' : language === 'tr' ? 'İletişim' : 'Контакт',
    tryBusiness: language === 'en' ? 'Try Aponti Business' : language === 'tr' ? 'İşletme Kaydı' : 'Для бизнеса',
    login: language === 'en' ? 'Log In' : language === 'tr' ? 'Giriş Yap' : 'Войти',
    signup: language === 'en' ? 'Sign Up' : language === 'tr' ? 'Kayıt Ol' : 'Регистрация'
  };

  const handleProfileMenuOpen = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      style={{
        backgroundColor: '#374151',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        color: 'white'
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{
          justifyContent: 'space-between',
          py: { xs: 0.5, md: 1 },
          minHeight: { xs: '56px', sm: '64px', md: '72px' },
          px: { xs: 0.5, sm: 1, md: 2 }
        }}>
          {/* Left Side - Brand + Mobile Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && onMenuClick && (
              <IconButton
                edge="start"
                onClick={onMenuClick}
                sx={{ mr: 1, color: 'white' }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Logo size={isMobile ? "small" : "medium"} variant="white" />

            {/* Desktop/Tablet Navigation Links */}
            {!isMobile && (
              <Stack direction="row" spacing={{ md: 3, lg: 4 }} sx={{ ml: { md: 2, lg: 4 } }}>
                <Button
                  color="inherit"
                  sx={{ fontWeight: 500 }}
                  onClick={() => navigate('/')}
                >
                  {language === 'en' ? 'Home' : language === 'tr' ? 'Ana Sayfa' : 'Главная'}
                </Button>
                <Button
                  color="inherit"
                  sx={{ fontWeight: 500 }}
                  onClick={() => navigate('/services')}
                >
                  {t.services}
                </Button>
                <Button
                  color="inherit"
                  sx={{ fontWeight: 500 }}
                  onClick={() => navigate('/about')}
                >
                  {t.about}
                </Button>
                <Button
                  color="inherit"
                  sx={{ fontWeight: 500 }}
                  onClick={() => navigate('/contact')}
                >
                  {t.contact}
                </Button>
              </Stack>
            )}
          </Box>

          {/* Right Side - Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
            {/* Language Selector */}
            <FormControl size="small" sx={{ minWidth: { xs: 60, sm: 80, md: 100 } }}>
              <Select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                  '& .MuiSelect-select': { py: { xs: 0.5, md: 1 }, display: 'flex', alignItems: 'center', fontSize: { xs: '0.75rem', sm: '0.85rem', md: '1rem' } },
                  '& .MuiSvgIcon-root': { color: 'white' }
                }}
              >
                <MenuItem value="en">🇬🇧 {isMobile ? 'EN' : isTablet ? 'EN' : 'English'}</MenuItem>
                <MenuItem value="tr">🇹🇷 {isMobile ? 'TR' : isTablet ? 'TR' : 'Türkçe'}</MenuItem>
                <MenuItem value="ru">🇷🇺 {isMobile ? 'RU' : isTablet ? 'RU' : 'Русский'}</MenuItem>
              </Select>
            </FormControl>

            {/* Try Business Button */}
            {!isMobile && (
              <Button
                variant="contained"
                startIcon={<Business />}
                disableElevation={false}
                sx={{
                  backgroundColor: '#ef4444 !important',
                  background: '#ef4444 !important',
                  color: 'white !important',
                  fontWeight: 600,
                  px: 3,
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4) !important',
                  backgroundImage: 'none !important',
                  '&:hover': {
                    backgroundColor: '#dc2626 !important',
                    background: '#dc2626 !important',
                    boxShadow: '0 6px 16px rgba(239, 68, 68, 0.5) !important'
                  },
                  display: { xs: 'none', sm: 'flex' }
                }}
                onClick={() => navigate('/business-signup')}
              >
                {t.tryBusiness}
              </Button>
            )}

            {!isMobile && (
              <>
                {isAuthenticated ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton sx={{ color: 'white' }}>
                      <Notifications />
                    </IconButton>
                    <Button
                      onClick={() => navigate('/profile')}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        color: 'white',
                        textTransform: 'none',
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                      }}
                    >
                      <Avatar
                        src={user?.avatar_url || user?.avatar || user?.profile_picture || undefined}
                        sx={{ width: 32, height: 32 }}
                      >
                        {!user?.avatar_url && (user?.first_name?.[0] || user?.name?.[0] || 'U')}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {user?.first_name || user?.name || 'Profile'}
                      </Typography>
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      sx={{
                        color: 'white',
                        borderColor: 'white',
                        '&:hover': {
                          borderColor: 'white',
                          bgcolor: 'rgba(255, 255, 255, 0.1)'
                        }
                      }}
                      onClick={() => navigate('/signin')}
                    >
                      {t.login}
                    </Button>
                    <Button
                      variant="contained"
                      sx={{
                        bgcolor: 'white',
                        color: '#374151',
                        '&:hover': {
                          bgcolor: '#e5e7eb'
                        }
                      }}
                      onClick={() => navigate('/signup')}
                    >
                      {t.signup}
                    </Button>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
