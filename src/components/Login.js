import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Container,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Divider,
  Link,
  Stack,
  FormControl,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Person, 
  ContentCut,
  Star,
  Schedule,
  Language
} from '@mui/icons-material';

export default function Login() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [language, setLanguage] = useState('en'); // Default to English

  // Language content
  const content = {
    en: {
      brand: 'BarberPro',
      welcomeTitle: 'Welcome Back',
      createAccountTitle: 'Create Account',
      welcomeSubtitle: 'Sign in to your account',
      createAccountSubtitle: 'Create a new account and discover barbers',
      fullName: 'Full Name',
      email: 'Email',
      password: 'Password',
      signIn: 'Sign In',
      createAccount: 'Create Account',
      or: 'or',
      alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: "Don't have an account?",
      signInLink: 'Sign In',
      signUpLink: 'Sign Up',
      features: {
        professional: 'Professional Barbers',
        easy: 'Easy Booking System',
        reviews: 'Reviews & Ratings'
      }
    },
    tr: {
      brand: 'BarberPro',
      welcomeTitle: 'Hoş Geldiniz',
      createAccountTitle: 'Hesap Oluştur',
      welcomeSubtitle: 'Hesabınıza giriş yapın',
      createAccountSubtitle: 'Yeni hesap oluşturun ve berberleri keşfedin',
      fullName: 'Ad Soyad',
      email: 'E-posta',
      password: 'Şifre',
      signIn: 'Giriş Yap',
      createAccount: 'Hesap Oluştur',
      or: 'veya',
      alreadyHaveAccount: 'Zaten hesabınız var mı?',
      dontHaveAccount: 'Hesabınız yok mu?',
      signInLink: 'Giriş Yap',
      signUpLink: 'Kayıt Ol',
      features: {
        professional: 'Profesyonel Berberler',
        easy: 'Kolay Randevu Sistemi',
        reviews: 'Değerlendirme & Yorum'
      }
    },
    ru: {
      brand: 'BarberPro',
      welcomeTitle: 'Добро пожаловать',
      createAccountTitle: 'Создать аккаунт',
      welcomeSubtitle: 'Войдите в свой аккаунт',
      createAccountSubtitle: 'Создайте новый аккаунт и открывайте парикмахеров',
      fullName: 'Полное имя',
      email: 'Электронная по��та',
      password: 'Пароль',
      signIn: 'Войти',
      createAccount: 'Создать аккаунт',
      or: 'или',
      alreadyHaveAccount: 'Уже есть аккаунт?',
      dontHaveAccount: 'Нет аккаунта?',
      signInLink: 'Войти',
      signUpLink: 'Регистрация',
      features: {
        professional: 'Профессиональные парикмахеры',
        easy: 'Простая система бронирования',
        reviews: 'Отзывы и рейтинги'
      }
    }
  };

  const t = content[language];

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        // Register without auto-login and then redirect to signin
        await authAPI.register(email, password, name.split(' ')[0] || '', name.split(' ')[1] || '');
        navigate('/signin');
      } else {
        // Login and redirect to dashboard
        await login(email, password);
        navigate('/dashboard');
      }
    } catch (err) {
      const errorMessage = isRegister
        ? (language === 'en' ? 'Registration failed: ' : language === 'tr' ? 'Kayıt başarısız: ' : 'Регистрация не удалась: ')
        : (language === 'en' ? 'Login failed: ' : language === 'tr' ? 'Giriş başарısız: ' : 'Вход не удался: ');
      alert(errorMessage + (err.response?.data?.detail || err.response?.data?.error || err.message || 'Unknown error'));
    }
  };

  const features = [
    { icon: <ContentCut />, text: t.features.professional },
    { icon: <Schedule />, text: t.features.easy },
    { icon: <Star />, text: t.features.reviews }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #6b46c1 0%, #9333ea 100%)',
      display: 'flex',
      alignItems: 'center',
      position: 'relative'
    }}>
      {/* Language Selector - Top Right */}
      <Box sx={{ 
        position: 'absolute', 
        top: 20, 
        right: 20, 
        zIndex: 10 
      }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            startAdornment={<Language sx={{ mr: 1, fontSize: 20, color: 'white' }} />}
            sx={{ 
              color: 'white',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
              '& .MuiSvgIcon-root': { color: 'white' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' }
            }}
          >
            <MenuItem value="en">🇺🇸 English</MenuItem>
            <MenuItem value="tr">🇹🇷 Türkçe</MenuItem>
            <MenuItem value="ru">🇷🇺 Русский</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Container maxWidth="lg">
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          minHeight: '80vh',
          gap: { xs: 0, md: 8 },
          flexDirection: { xs: 'column', md: 'row' }
        }}>
          {/* Left Side - Brand & Features (Hidden on mobile) */}
          {!isMobile && (
            <Box sx={{ 
              flex: 1, 
              color: 'white',
              pr: 4
            }}>
              <Typography variant="h2" sx={{ 
                fontWeight: 'bold', 
                mb: 2,
                fontSize: { md: '3rem', lg: '4rem' }
              }}>
                {t.brand}
              </Typography>
              <Typography variant="h5" sx={{ 
                mb: 4, 
                opacity: 0.9,
                fontWeight: 300
              }}>
                {language === 'en' 
                  ? 'Discover the best barbers and book appointments easily'
                  : language === 'tr'
                  ? 'En iyi berberleri keşfedin ve kolayca randevu alın'
                  : 'Откройте для себя лучших парикмахеров и легко записывайтесь на прием'
                }
              </Typography>
              
              <Stack spacing={3}>
                {features.map((feature, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      borderRadius: '50%', 
                      p: 1.5, 
                      mr: 2 
                    }}>
                      {React.cloneElement(feature.icon, { sx: { fontSize: 24 } })}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                      {feature.text}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {/* Right Side - Login Form */}
          <Box sx={{ 
            flex: { xs: 1, md: 0.6 },
            width: '100%',
            maxWidth: { xs: 400, md: 'none' }
          }}>
            <Card sx={{ 
              borderRadius: 3,
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              overflow: 'hidden',
              mx: { xs: 2, md: 0 }
            }}>
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                {/* Mobile Brand (shown only on mobile) */}
                {isMobile && (
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 'bold',
                      background: 'linear-gradient(135deg, #6b46c1 0%, #9333ea 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent',
                      mb: 1
                    }}>
                      {t.brand}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Box sx={{ 
                    bgcolor: '#6b46c1', 
                    borderRadius: '50%', 
                    width: 60, 
                    height: 60, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}>
                    <Person sx={{ color: 'white', fontSize: 32 }} />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {isRegister ? t.createAccountTitle : t.welcomeTitle}
                  </Typography>
                  <Typography color="text.secondary">
                    {isRegister ? t.createAccountSubtitle : t.welcomeSubtitle}
                  </Typography>
                </Box>

                <Box component="form" onSubmit={handleSubmit}>
                  {isRegister && (
                    <TextField
                      label={t.fullName}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      fullWidth
                      margin="normal"
                      required
                      sx={{ mb: 2 }}
                    />
                  )}
                  
                  <TextField
                    label={t.email}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                    sx={{ mb: 2 }}
                  />
                  
                  <TextField
                    label={t.password}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                    sx={{ mb: 3 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <Button 
                    type="submit" 
                    variant="contained" 
                    fullWidth 
                    size="large"
                    sx={{ 
                      bgcolor: '#6b46c1',
                      fontWeight: 'bold',
                      py: 1.5,
                      mb: 3,
                      '&:hover': { bgcolor: '#553c9a' }
                    }}
                  >
                    {isRegister ? t.createAccount : t.signIn}
                  </Button>

                  <Divider sx={{ mb: 3 }}>
                    <Typography color="text.secondary" variant="body2">
                      {t.or}
                    </Typography>
                  </Divider>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {isRegister ? t.alreadyHaveAccount : t.dontHaveAccount}
                    </Typography>
                    <Link
                      component="button"
                      type="button"
                      variant="body2"
                      onClick={() => setIsRegister(!isRegister)}
                      sx={{ 
                        color: '#6b46c1', 
                        fontWeight: 'bold',
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      {isRegister ? t.signInLink : t.signUpLink}
                    </Link>
                  </Box>
                </Box>

                {/* Mobile Features (shown only on mobile) */}
                {isMobile && (
                  <Box sx={{ mt: 4 }}>
                    <Divider sx={{ mb: 3 }} />
                    <Stack spacing={2}>
                      {features.map((feature, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ 
                            bgcolor: '#ede9fe', 
                            borderRadius: '50%', 
                            p: 1, 
                            mr: 2,
                            color: '#6b46c1'
                          }}>
                            {React.cloneElement(feature.icon, { sx: { fontSize: 20 } })}
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {feature.text}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
