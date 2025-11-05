import { businessAPI, authAPI } from '../services/api';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Footer from '../components/Footer';
import Logo from '../components/Logo';
import {
  Box, Typography, TextField, Button, Container, Card, CardContent, Grid,
  Stepper, Step, StepLabel, Stack, IconButton, AppBar, Toolbar, FormControl,
  Select, MenuItem, List, Paper, Tabs, Tab, Divider, InputAdornment, Checkbox,
  FormControlLabel, Alert
} from '@mui/material';
import {
  Business, Person, LocationOn, Phone, Description, ContentCut, Euro, Email, Lock, LocationCity,
  AccessTime, CheckCircle, TrendingUp, Schedule, Star, ArrowBack, Add, Delete,
  Login, AppRegistration, Google, Visibility, VisibilityOff
} from '@mui/icons-material';

const BusinessSignup = () => {
  const navigate = useNavigate();
  const { language, changeLanguage, t } = useLanguage();

  const [activeTab, setActiveTab] = useState(0); // 0: Login, 1: Business Sign Up
  const [activeStep, setActiveStep] = useState(0);

  const [businessData, setBusinessData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    description: '',
    category: '',
    services: []
  });

  const [loginData, setLoginData] = useState({ email: '', password: '', rememberMe: false });
  const [showBusinessPassword, setShowBusinessPassword] = useState(false);

  const [newService, setNewService] = useState({ name: '', price: '', duration: '' });

  const handleInputChange = (field, value) => {
    setBusinessData(prev => ({ ...prev, [field]: value }));
  };

  const handleLoginChange = (field, value) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialLogin = (provider, tab) => {
    console.log(`Authenticating with ${provider} for tab ${tab}`);
    if (tab === 0 || tab === 1) {
      // Business login or sign up
      navigate('/business-dashboard');
    } else if (tab === 2) {
      // Workers
      navigate('/barber-dashboard');
    }
  };

  const handleGoogleCallback = async (response) => {
    try {
      const result = await authAPI.socialLogin('google', response.credential);
      localStorage.setItem('access_token', result.access_token);
      navigate('/business-dashboard');
    } catch (err) {
      alert('Google login failed: ' + (err.response?.data?.detail || err.message));
    }
  };


  const handleAddService = () => {
    if (newService.name && newService.price && newService.duration) {
      setBusinessData(prev => ({
        ...prev,
        services: [...prev.services, { ...newService, id: Date.now() }]
      }));
      setNewService({ name: '', price: '', duration: '' });
    }
  };

  const handleRemoveService = (serviceId) => {
    setBusinessData(prev => ({
      ...prev,
      services: prev.services.filter(s => s.id !== serviceId)
    }));
  };

  const handleNext = () => setActiveStep(prev => prev + 1);
  const handleBack = () => setActiveStep(prev => prev - 1);

  // ------------------------------
  // LOGIN FUNCTIONS
  // ------------------------------

  const handleUserLogin = async () => {
    try {
      const result = await authAPI.login(loginData.email, loginData.password);
      localStorage.setItem('access_token', result.access_token);
      navigate('/user-dashboard');
    } catch (err) {
      alert('User login error: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleBusinessLogin = async () => {
    try {
      const result = await businessAPI.login(loginData.email, loginData.password);
      localStorage.setItem('business_token', result.access_token);
      navigate('/business-dashboard');
    } catch (err) {
      alert('Business login error: ' + (err.response?.data?.detail || err.message));
    }
  };


  // ------------------------------
  // SIGNUP FUNCTIONS
  // ------------------------------

  const handleSubmit = async () => {
    try {
      const payload = {
        name: businessData.businessName,
        owner_name: businessData.ownerName,
        email: businessData.email,
        password: businessData.password,
        phone: businessData.phone,
        address: businessData.address,
        city: businessData.city,
        country: businessData.country,
        description: businessData.description,
        category: businessData.category,
        services: []  // Services will be added later in dashboard
      };
      const result = await businessAPI.signup(payload);

      // Show success message and redirect to login
      alert(language === 'en'
        ? 'Registration successful! Please login to continue.'
        : language === 'tr'
        ? 'Kayıt başarılı! Devam etmek için lütfen giriş yapın.'
        : 'Регистрация успешна! Пожалуйста, войдите.');

      // Switch to login tab
      setActiveTab(0);
      setActiveStep(0);
      // Pre-fill login email
      setLoginData(prev => ({ ...prev, email: businessData.email }));
    } catch (err) {
      alert('Business signup error: ' + (err.response?.data?.message || err.message));
    }
  };


  const steps = [
    t.businessInfo
  ];

  const canProceed = () => {
    return businessData.businessName && businessData.ownerName &&
           businessData.email && businessData.password &&
           businessData.phone && businessData.address &&
           businessData.city && businessData.country && businessData.category;
  };

  useEffect(() => {
    const initGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: 'replace-with-your-google-client-id', // Replace with actual client ID from Google Cloud Console for project intense-runner-463211-r4
          callback: handleGoogleCallback
        });
      }
    };

    if (window.google) {
      initGoogle();
    } else {
      window.addEventListener('load', initGoogle);
    }

    return () => {
      window.removeEventListener('load', initGoogle);
    };
  }, []);

  return (
    <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#2d3748', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Logo size="small" variant="white" onClick={() => navigate('/')} />
            </Box>
            <FormControl size="small">
              <Select value={language} onChange={(e) => changeLanguage(e.target.value)} sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, '& .MuiSvgIcon-root': { color: 'white' } }}>
                <MenuItem value="en">🇬🇧 EN</MenuItem>
                <MenuItem value="tr">🇹🇷 TR</MenuItem>
                <MenuItem value="ru">🇷🇺 RU</MenuItem>
              </Select>
            </FormControl>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Card sx={{ maxWidth: 800, mx: 'auto', borderRadius: 3, mb: 4 }}>
          <CardContent sx={{ p: 0 }}>
            {/* Tabs */}
            <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} variant="fullWidth"
              sx={{ '& .MuiTab-root': { py: 2, fontSize: '1rem', fontWeight: 'bold' }, '& .Mui-selected': { color: '#2d3748 !important' } }}
            >
              <Tab icon={<Login />} iconPosition="start" label={language === 'en' ? 'Business Login' : language === 'tr' ? 'İşletme Giriş' : 'Вход бизнеса'} />
              <Tab icon={<AppRegistration />} iconPosition="start" label={language === 'en' ? 'Business Sign Up' : language === 'tr' ? 'İşletme Kaydı' : 'Бизнес Регистрация'} />
            </Tabs>
            <Divider />

{/* BUSINESS LOGIN */}
{activeTab === 0 && (
  <Box sx={{ p: { xs: 3, md: 4 } }}>
    <Stack spacing={3}>
      <TextField
        fullWidth
        label={language === 'en' ? 'Email' : language === 'tr' ? 'E-posta' : 'Email'}
        value={loginData.email}
        onChange={(e) => handleLoginChange('email', e.target.value)}
        type="email"
      />
      <TextField
        fullWidth
        label={language === 'en' ? 'Password' : language === 'tr' ? 'Şifre' : 'Пароль'}
        value={loginData.password}
        onChange={(e) => handleLoginChange('password', e.target.value)}
        type={showBusinessPassword ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowBusinessPassword(!showBusinessPassword)}
                edge="end"
              >
                {showBusinessPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* Remember Me & Forgot Password */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1, sm: 0 }
      }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={loginData.rememberMe}
              onChange={(e) => handleLoginChange('rememberMe', e.target.checked)}
              sx={{ color: '#2d3748' }}
            />
          }
          label={language === 'en' ? 'Remember me' : language === 'tr' ? 'Beni hatırla' : 'Запомнить меня'}
        />
        <Button
          variant="text"
          sx={{
            color: '#2d3748',
            textTransform: 'none',
            fontSize: { xs: '0.85rem', md: '0.875rem' }
          }}
        >
          {language === 'en' ? 'Forgot Password?' : language === 'tr' ? 'Şifremi Unuttum?' : 'Забыли пароль?'}
        </Button>
      </Box>

      <Button
        variant="contained"
        size="large"
        onClick={handleBusinessLogin}
        disabled={!loginData.email || !loginData.password}
        sx={{ bgcolor: '#2d3748', '&:hover': { bgcolor: '#007562' } }}
      >
        {language === 'en' ? 'Business Login' : language === 'tr' ? 'İşletme Giriş' : 'Войти'}
      </Button>

      {/* Divider */}
      <Box sx={{ my: 2 }}>
        <Divider>
          <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
            {language === 'en' ? 'Or continue with' : language === 'tr' ? 'Veya şununla devam edin' : 'Или продолжить с'}
          </Typography>
        </Divider>
      </Box>

      {/* Social Login Buttons */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Google />}
          onClick={() => {
            if (window.google) {
              window.google.accounts.id.prompt();
            } else {
              alert('Google Sign-In not loaded');
            }
          }}
          sx={{
            borderColor: '#db4437',
            color: '#db4437',
            '&:hover': { bgcolor: '#fef7f7' }
          }}
        >
          {language === 'en' ? 'Continue with Google' : language === 'tr' ? 'Google ile devam et' : 'Продолжить с Google'}
        </Button>
      </Box>
    </Stack>
  </Box>
)}

            {/* BUSINESS SIGNUP */}
            {activeTab === 1 && (
              <Box sx={{ p: { xs: 3, md: 4 } }}>
                {/* Business Information Form */}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth label={t.businessName} value={businessData.businessName} onChange={(e) => handleInputChange('businessName', e.target.value)} InputProps={{ startAdornment: <Business sx={{ mr: 1, color: '#2d3748' }} /> }} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth label={t.ownerName} value={businessData.ownerName} onChange={(e) => handleInputChange('ownerName', e.target.value)} InputProps={{ startAdornment: <Person sx={{ mr: 1, color: '#2d3748' }} /> }} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth label={language === 'en' ? 'Email' : language === 'tr' ? 'E-posta' : 'Email'} value={businessData.email} onChange={(e) => handleInputChange('email', e.target.value)} type="email" InputLabelProps={{ shrink: true }} InputProps={{ startAdornment: <Email sx={{ mr: 1, color: '#2d3748' }} /> }} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth label="Password" value={businessData.password} onChange={(e) => handleInputChange('password', e.target.value)} type="password" InputLabelProps={{ shrink: true }} InputProps={{ startAdornment: <Lock sx={{ mr: 1, color: '#2d3748' }} /> }} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth label={t.phoneNumber} value={businessData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} InputProps={{ startAdornment: <Phone sx={{ mr: 1, color: '#2d3748' }} /> }} />
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <TextField fullWidth label={t.businessAddress} value={businessData.address} onChange={(e) => handleInputChange('address', e.target.value)} InputProps={{ startAdornment: <LocationOn sx={{ mr: 1, color: '#2d3748' }} /> }} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField fullWidth label={t.city} value={businessData.city} onChange={(e) => handleInputChange('city', e.target.value)} InputLabelProps={{ shrink: true }} InputProps={{ startAdornment: <LocationCity sx={{ mr: 1, color: '#2d3748' }} /> }} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label={language === 'en' ? 'Country' : language === 'tr' ? 'Ülke' : 'Страна'}
                        value={businessData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{ startAdornment: <LocationOn sx={{ mr: 1, color: '#2d3748' }} /> }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <Select
                          value={businessData.category}
                          onChange={(e) => handleInputChange('category', e.target.value)}
                          displayEmpty
                          sx={{ '& .MuiSelect-select': { display: 'flex', alignItems: 'center', gap: 1 } }}
                        >
                          <MenuItem value="" disabled>
                            {language === 'en' ? 'Select Category' : language === 'tr' ? 'Kategori Seçin' : 'Выберите категорию'}
                          </MenuItem>
                          <MenuItem value="beauty">
                            {language === 'en' ? '💅 Beauty & Wellness' : language === 'tr' ? '💅 Güzellik & Sağlık' : '💅 Красота и здоровье'}
                          </MenuItem>
                          <MenuItem value="barber">
                            {language === 'en' ? '💈 Barber' : language === 'tr' ? '💈 Berber' : '💈 Парикмахер'}
                          </MenuItem>
                          <MenuItem value="automotive">
                            {language === 'en' ? '🚗 Automotive Services' : language === 'tr' ? '🚗 Otomotiv Hizmetleri' : '🚗 Автомобильные услуги'}
                          </MenuItem>
                          <MenuItem value="pet_care">
                            {language === 'en' ? '🐾 Pet Care' : language === 'tr' ? '🐾 Evcil Hayvan Bakımı' : '🐾 Уход за животными'}
                          </MenuItem>
                          <MenuItem value="home_services">
                            {language === 'en' ? '🏠 Home Services' : language === 'tr' ? '🏠 Ev Hizmetleri' : '🏠 Домашние услуги'}
                          </MenuItem>
                          <MenuItem value="health">
                            {language === 'en' ? '⚕️ Health & Medical' : language === 'tr' ? '⚕️ Sağlık & Medikal' : '⚕️ Здоровье и медицина'}
                          </MenuItem>
                          <MenuItem value="other">
                            {language === 'en' ? '📋 Other' : language === 'tr' ? '📋 Diğer' : '📋 Другое'}
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField fullWidth label={t.businessDescription} multiline rows={3} value={businessData.description} onChange={(e) => handleInputChange('description', e.target.value)} InputProps={{ startAdornment: <Description sx={{ mr: 1, color: '#2d3748', mt: 1 }} /> }} />
                    </Grid>
                  </Grid>

                {/* Done Button */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleSubmit}
                    disabled={!canProceed()}
                    sx={{
                      bgcolor: '#2d3748',
                      px: 6,
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:hover': { bgcolor: '#1a202c' }
                    }}
                  >
                    {language === 'en' ? 'Done' : language === 'tr' ? 'Tamamla' : 'Готово'}
                  </Button>
                </Box>
                {/* Divider */}
                <Box sx={{ my: 2 }}>
                  <Divider>
                    <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
                      {language === 'en' ? 'Or continue with' : language === 'tr' ? 'Veya şununla devam edin' : 'Или продолжить с'}
                    </Typography>
                  </Divider>
                </Box>
                {/* Social Login Buttons */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Google />}
                    onClick={() => handleSocialLogin('google', activeTab)}
                    sx={{
                      borderColor: '#db4437',
                      color: '#db4437',
                      '&:hover': { bgcolor: '#fef7f7' }
                    }}
                  >
                    {language === 'en' ? 'Continue with Google' : language === 'tr' ? 'Google ile devam et' : 'Продолжить с Google'}
                  </Button>
                </Box>
              </Box>
            )}

          </CardContent>
        </Card>
      </Container>

      <Footer />
    </Box>
  );
};

export default BusinessSignup;
