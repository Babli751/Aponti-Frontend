import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';
import colors from '../theme/colors';
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Button,
  Stack,
  Avatar,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  ListItem,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person,
  Notifications,
  Home as HomeIcon,
  ContentCut,
  Business,
  Support as SupportIcon,
  Schedule,
  Favorite,
  Settings,
  Logout,
  Close,
  AccountCircle,
  ArrowBack
} from '@mui/icons-material';

const Header = ({ showBack = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { language, changeLanguage } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);

  // Translations
  const t = {
    home: language === 'en' ? 'Home' : language === 'tr' ? 'Ana Sayfa' : 'Главная',
    services: language === 'en' ? 'Services' : language === 'tr' ? 'Hizmetler' : 'Услуги',
    about: language === 'en' ? 'About' : language === 'tr' ? 'Hakkımızda' : 'О нас',
    company: language === 'en' ? 'Company' : language === 'tr' ? 'Şirket' : 'Компания',
    support: language === 'en' ? 'Support' : language === 'tr' ? 'Destek' : 'Поддержка',
    contact: language === 'en' ? 'Contact Us' : language === 'tr' ? 'İletişim' : 'Контакт',
    appointments: language === 'en' ? 'Appointments' : language === 'tr' ? 'Randevular' : 'Записи',
    favorites: language === 'en' ? 'Favorites' : language === 'tr' ? 'Favoriler' : 'Избранное',
    profile: language === 'en' ? 'Profile' : language === 'tr' ? 'Profil' : 'Профиль',
    settings: language === 'en' ? 'Settings' : language === 'tr' ? 'Ayarlar' : 'Настройки',
    login: language === 'en' ? 'Sign In' : language === 'tr' ? 'Giriş Yap' : 'Войти',
    signup: language === 'en' ? 'Sign Up' : language === 'tr' ? 'Kayıt Ol' : 'Регистрация',
    signout: language === 'en' ? 'Sign Out' : language === 'tr' ? 'Çıkış Yap' : 'Выйти',
    tryBusiness: language === 'en' ? 'Try Business' : language === 'tr' ? 'İşletme Deneyin' : 'Попробуйте бизнес',
    brand: 'Aponti',
    appoint: language === 'en' ? 'Appoint' : language === 'tr' ? 'Randevu Al' : 'Записаться',
    dashboard: language === 'en' ? 'Dashboard' : language === 'tr' ? 'Panel' : 'Панель'
  };

  // Don't show header on certain pages
  const hideOnPages = ['/signin', '/signup', '/business-signup', '/business-dashboard', '/barber-dashboard'];
  if (hideOnPages.includes(location.pathname)) {
    return null;
  }

  const handleLogout = () => {
    logout();
    setProfileMenuAnchor(null);
    navigate('/');
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: colors.primary.gradient,
          borderBottom: `1px solid ${colors.primary.dark}`,
          color: 'white'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: { xs: 0.5, sm: 1 }, px: { xs: 2, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {showBack && (
              <IconButton
                color="inherit"
                onClick={() => navigate(-1)}
                sx={{ mr: 1 }}
              >
                <ArrowBack />
              </IconButton>
            )}
            {isMobile && !showBack && (
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => setDrawerOpen(true)}
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

          {/* Right Side Actions */}
          <Stack direction="row" spacing={{ xs: 0.5, sm: 1, md: 2 }} alignItems="center">
            {/* Language Selector */}
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                const langs = ['en', 'tr', 'ru'];
                const currentIndex = langs.indexOf(language);
                const nextLang = langs[(currentIndex + 1) % langs.length];
                changeLanguage(nextLang);
              }}
              sx={{
                minWidth: { xs: 40, sm: 50 },
                fontWeight: 'bold',
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              {language.toUpperCase()}
            </Button>

            {!isMobile && !isAuthenticated && (
              <>
                <Button
                  variant="outlined"
                  sx={{
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                  onClick={() => navigate('/signin')}
                >
                  {t.login}
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: '#00a693',
                    color: 'white',
                    '&:hover': { bgcolor: '#008577' }
                  }}
                  onClick={() => navigate('/signup')}
                >
                  {t.signup}
                </Button>
              </>
            )}

            {!isMobile && isAuthenticated && (
              <>
                <IconButton color="inherit">
                  <Notifications />
                </IconButton>
                <IconButton
                  onClick={(e) => setProfileMenuAnchor(e.currentTarget)}
                  sx={{ p: 0.5 }}
                >
                  <Avatar
                    src={user?.avatar_url || user?.avatar}
                    sx={{ width: 32, height: 32 }}
                  />
                </IconButton>
              </>
            )}

            {isMobile && isAuthenticated && (
              <IconButton
                onClick={(e) => setProfileMenuAnchor(e.currentTarget)}
                sx={{ p: 0.5 }}
              >
                <Avatar
                  src={user?.avatar_url || user?.avatar}
                  sx={{ width: 32, height: 32 }}
                />
              </IconButton>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={() => setProfileMenuAnchor(null)}
        sx={{ mt: 1 }}
      >
        <MenuItem onClick={() => { navigate('/profile'); setProfileMenuAnchor(null); }}>
          <Person sx={{ mr: 1 }} /> {t.profile}
        </MenuItem>
        <MenuItem onClick={() => { navigate('/dashboard'); setProfileMenuAnchor(null); }}>
          <Schedule sx={{ mr: 1 }} /> {t.dashboard}
        </MenuItem>
        <MenuItem onClick={() => { navigate('/settings'); setProfileMenuAnchor(null); }}>
          <Settings sx={{ mr: 1 }} /> {t.settings}
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <Logout sx={{ mr: 1 }} /> {t.signout}
        </MenuItem>
      </Menu>

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
              <ListItemText primary={t.appoint} />
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
                  <ListItemText primary={t.settings} />
                </ListItemButton>
                <ListItemButton onClick={() => { handleLogout(); setDrawerOpen(false); }}>
                  <ListItemIcon><Logout /></ListItemIcon>
                  <ListItemText primary={t.signout} />
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
    </>
  );
};

export default Header;
