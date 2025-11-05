import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';
import colors from '../theme/colors';
import {
  AppBar, Toolbar, Button, Stack, IconButton, Menu, MenuItem, Box
} from '@mui/material';
import { ArrowBack, AccountCircle } from '@mui/icons-material';

const Header = ({ showBack = false }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleClose();
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{
      background: colors.primary.gradient,
      borderBottom: `1px solid ${colors.primary.dark}`,
      color: 'white'
    }}>
      <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
        {showBack && (
          <IconButton
            color="inherit"
            onClick={() => navigate(-1)}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
        )}

        <Box sx={{ flexGrow: 1 }}>
          <Logo size="small" variant="white" />
        </Box>

        <Stack direction="row" spacing={{ xs: 1, md: 2 }} alignItems="center">
          <Button
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            {language === 'en' ? 'Home' : language === 'tr' ? 'Ana Sayfa' : 'Главная'}
          </Button>
          <Button
            color="inherit"
            onClick={() => navigate('/appointment')}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            {language === 'en' ? 'Book' : language === 'tr' ? 'Randevu' : 'Запись'}
          </Button>

          {user ? (
            <>
              <IconButton
                color="inherit"
                onClick={handleMenu}
              >
                <AccountCircle />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={() => { navigate('/dashboard'); handleClose(); }}>
                  {language === 'en' ? 'Dashboard' : language === 'tr' ? 'Panel' : 'Панель'}
                </MenuItem>
                <MenuItem onClick={() => { navigate('/dashboard', { state: { scrollToProfile: true } }); handleClose(); }}>
                  {language === 'en' ? 'Profile' : language === 'tr' ? 'Profil' : 'Профиль'}
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  {language === 'en' ? 'Logout' : language === 'tr' ? 'Çıkış' : 'Выход'}
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              color="inherit"
              onClick={() => navigate('/signin')}
              variant="outlined"
              sx={{
                borderColor: 'white',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              {language === 'en' ? 'Sign In' : language === 'tr' ? 'Giriş' : 'Войти'}
            </Button>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
