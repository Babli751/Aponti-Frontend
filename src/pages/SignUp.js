import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { authAPI } from '../services/api';
import Footer from '../components/Footer';
import Logo from '../components/Logo';
import { countryData } from '../data/countries';
import AddressAutocomplete from '../components/AddressAutocomplete';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  FormControl,
  Select,
  MenuItem,
  Divider,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Alert,
  useTheme,
  useMediaQuery,
  LinearProgress
} from '@mui/material';
import {
  ArrowBack,
  Visibility,
  VisibilityOff,
  Google,
  CheckCircle,
  Cancel
} from '@mui/icons-material';

const SignUp = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { language, changeLanguage, t: translations } = useLanguage();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    country: '',
    city: '',
    latitude: null,
    longitude: null,
    agreeToTerms: false,
    isBarber: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableCities, setAvailableCities] = useState([]);

  // Page-specific translations
  const t = {
    ...translations,
    signUpTitle: language === 'en' ? 'Create Your Account' : language === 'tr' ? 'Hesabınızı Oluşturun' : 'Создайте свой аккаунт',
    signUpSubtitle: language === 'en' ? 'Join thousands of happy customers' : language === 'tr' ? 'Binlerce mutlu müşteriye katılın' : 'Присоединяйтесь к тысячам довольных клиентов',
    isBarber: language === 'en' ? 'I am a worker' : language === 'tr' ? 'Çalışanım' : 'Я работник',
    firstName: language === 'en' ? 'First Name' : language === 'tr' ? 'Ad' : 'Имя',
    lastName: language === 'en' ? 'Last Name' : language === 'tr' ? 'Soyad' : 'Фамилия',
    email: language === 'en' ? 'Email Address' : language === 'tr' ? 'E-posta Adresi' : 'Адрес электронной почты',
    password: language === 'en' ? 'Password' : language === 'tr' ? 'Şifre' : 'Пароль',
    confirmPassword: language === 'en' ? 'Confirm Password' : language === 'tr' ? 'Şifreyi Onayla' : 'Подтвердите пароль',
    phone: language === 'en' ? 'Phone Number (Optional)' : language === 'tr' ? 'Telefon Numarası (İsteğe Bağlı)' : 'Номер телефона (Необязательно)',
    agreeToTerms: language === 'en' ? 'I agree to the Terms of Service and Privacy Policy' : language === 'tr' ? 'Hizmet Şartları ve Gizlilik Politikası\'nı kabul ediyorum' : 'Я согласен с Условиями обс��уживания и Политикой конфиденциальности',
    termsOfService: language === 'en' ? 'Terms of Service' : language === 'tr' ? 'Hizmet Şartları' : 'Условия обслуживания',
    privacyPolicy: language === 'en' ? 'Privacy Policy' : language === 'tr' ? 'Gizlilik Politikası' : 'Политика конфиденциальности',
    signUpButton: language === 'en' ? 'Create Account' : language === 'tr' ? 'Hesap Oluştur' : 'Создать аккаунт',
    orContinueWith: language === 'en' ? 'Or continue with' : language === 'tr' ? 'Veya şununla devam edin' : 'Или продолжить с',
    alreadyHaveAccount: language === 'en' ? 'Already have an account?' : language === 'tr' ? 'Zaten hesabınız var mı?' : 'Уже есть аккаунт?',
    signInLink: language === 'en' ? 'Sign in here' : language === 'tr' ? 'Buradan giriş yapın' : 'Войдите здесь',
    continueWithGoogle: language === 'en' ? 'Continue with Google' : language === 'tr' ? 'Google ile devam et' : 'Продо��жить с Google',
    emailExists: language === 'en' ? 'Email already exists' : language === 'tr' ? 'E-posta zaten mevcut' : 'Email уже существует',
    passwordMismatch: language === 'en' ? 'Passwords do not match' : language === 'tr' ? 'Şifreler eşleşmiyor' : 'Пароли не совпадают',
    passwordWeak: language === 'en' ? 'Password must be at least 8 characters' : language === 'tr' ? 'Şifre en az 8 karakter olmalı' : 'Пароль должен содержать не менее 8 символов',
    passwordStrength: language === 'en' ? 'Password Strength:' : language === 'tr' ? 'Şifre Gücü:' : 'Сила пароля:',
    weak: language === 'en' ? 'Weak' : language === 'tr' ? 'Zayıf' : 'Слабый',
    medium: language === 'en' ? 'Medium' : language === 'tr' ? 'Orta' : 'Средний',
    strong: language === 'en' ? 'Strong' : language === 'tr' ? 'Güçlü' : 'Сильный'
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Update available cities when country changes
    if (field === 'country' && countryData[value]) {
      setAvailableCities(countryData[value].cities);
      // Reset city if country changes
      setFormData(prev => ({ ...prev, city: '' }));
    }

    setError('');
    setSuccess('');
  };

  const getPasswordStrength = (password) => {
    if (password.length < 6) return { strength: 0, label: t.weak, color: '#ef4444' };
    if (password.length < 10) return { strength: 50, label: t.medium, color: '#f59e0b' };
    return { strength: 100, label: t.strong, color: '#10b981' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError(t.passwordMismatch);
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError(t.passwordWeak);
      setLoading(false);
      return;
    }

    if (!formData.agreeToTerms) {
      setError(t.agreeToTerms);
      setLoading(false);
      return;
    }

    try {

      // Gerçek backend çağrısı
      await authAPI.register({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone_number: formData.phone || null,
        is_barber: formData.isBarber
      });
      navigate('/'); // Başarılı olursa ana sayfaya yönlendir
    } catch (err) {
      const errorMessage = err.response?.data?.detail || t.emailExists;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`Signing up with ${provider}`);
    // Implement social login logic here
    // After social signup, redirect to signin page
    navigate('/signin');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff' }}>
      <Navbar />

      {/* Main Content */}
      <Container maxWidth="sm" sx={{ py: { xs: 4, md: 6 } }}>
        <Card sx={{ 
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 166, 147, 0.1)',
          overflow: 'hidden'
        }}>
          {/* Header Section */}
          <Box sx={{ 
            background: 'linear-gradient(135deg, #2d3748 0%, #4fd5c7 100%)',
            color: 'white',
            p: { xs: 3, md: 4 },
            textAlign: 'center'
          }}>
            <Typography variant="h4" sx={{ 
              fontWeight: 'bold', 
              mb: 1,
              fontSize: { xs: '1.4rem', md: '2rem' }
            }}>
              {t.signUpTitle}
            </Typography>
            <Typography variant="body1" sx={{ 
              opacity: 0.9,
              fontSize: { xs: '0.9rem', md: '1rem' }
            }}>
              {t.signUpSubtitle}
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}


            <form onSubmit={handleSubmit}>
              {/* Name Fields */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  fullWidth
                  label={t.firstName}
                  value={formData.firstName}
                  onChange={handleInputChange('firstName')}
                  required
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label={t.lastName}
                  value={formData.lastName}
                  onChange={handleInputChange('lastName')}
                  required
                  variant="outlined"
                />
              </Box>

              {/* Email Field */}
              <TextField
                fullWidth
                label={t.email}
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                required
                sx={{ mb: 3 }}
                variant="outlined"
              />

              {/* Phone Field */}
              <TextField
                fullWidth
                label={t.phone}
                type="tel"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                sx={{ mb: 3 }}
                variant="outlined"
              />

              {/* Country Dropdown */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <Select
                  value={formData.country}
                  onChange={handleInputChange('country')}
                  displayEmpty
                  variant="outlined"
                >
                  <MenuItem value="" disabled>
                    {language === 'en' ? 'Select Country' : language === 'tr' ? 'Ülke Seçin' : 'Выберите страну'}
                  </MenuItem>
                  {Object.keys(countryData).map((countryKey) => (
                    <MenuItem key={countryKey} value={countryKey}>
                      {countryData[countryKey].name[language] || countryData[countryKey].name.en}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* City Dropdown */}
              <FormControl fullWidth disabled={!formData.country} sx={{ mb: 3 }}>
                <Select
                  value={formData.city}
                  onChange={handleInputChange('city')}
                  displayEmpty
                  variant="outlined"
                >
                  <MenuItem value="" disabled>
                    {language === 'en' ? 'Select City' : language === 'tr' ? 'Şehir Seçin' : 'Выберите город'}
                  </MenuItem>
                  {availableCities.map((city) => (
                    <MenuItem key={city} value={city}>
                      {city}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Address Autocomplete */}
              <AddressAutocomplete
                value={formData.address}
                onChange={(address) => handleInputChange('address')({ target: { value: address } })}
                onLocationSelect={(locationData) => {
                  setFormData(prev => ({
                    ...prev,
                    address: locationData.address,
                    latitude: locationData.latitude,
                    longitude: locationData.longitude
                  }));
                }}
                country={formData.country}
                city={formData.city}
                label={language === 'en' ? 'Address (Optional)' : language === 'tr' ? 'Adres (İsteğe Bağlı)' : 'Адрес (Необязательно)'}
                placeholder={language === 'en' ? 'Start typing your address...' : language === 'tr' ? 'Adresinizi yazmaya başlayın...' : 'Начните вводить адрес...'}
              />

              {/* Password Field */}
              <TextField
                fullWidth
                label={t.password}
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange('password')}
                required
                sx={{ mb: 2 }}
                variant="outlined"
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

              {/* Password Strength Indicator */}
              {formData.password && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ mr: 1, fontSize: '0.8rem' }}>
                      {t.passwordStrength}
                    </Typography>
                    <Typography variant="body2" sx={{ color: passwordStrength.color, fontWeight: 'bold', fontSize: '0.8rem' }}>
                      {passwordStrength.label}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={passwordStrength.strength} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: passwordStrength.color
                      }
                    }}
                  />
                </Box>
              )}

              {/* Confirm Password Field */}
              <TextField
                fullWidth
                label={t.confirmPassword}
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                required
                sx={{ mb: 3 }}
                variant="outlined"
                error={formData.confirmPassword && formData.password !== formData.confirmPassword}
                helperText={formData.confirmPassword && formData.password !== formData.confirmPassword ? t.passwordMismatch : ''}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                      {formData.confirmPassword && (
                        <Box sx={{ ml: 1 }}>
                          {formData.password === formData.confirmPassword ? 
                            <CheckCircle sx={{ color: '#10b981', fontSize: 20 }} /> : 
                            <Cancel sx={{ color: '#ef4444', fontSize: 20 }} />
                          }
                        </Box>
                      )}
                    </InputAdornment>
                  ),
                }}
              />

              {/* Barber Checkbox */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isBarber}
                    onChange={(e) => setFormData(prev => ({ ...prev, isBarber: e.target.checked }))}
                    sx={{ color: '#2d3748' }}
                  />
                }
                label={t.isBarber}
                sx={{ mb: 2 }}
              />

              {/* Terms Agreement */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.agreeToTerms}
                    onChange={(e) => setFormData(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
                    sx={{ color: '#2d3748' }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                    {language === 'en' ? 'I agree to the ' : language === 'tr' ? '' : 'Я согласен с '}
                    <Button variant="text" sx={{ p: 0, minWidth: 'auto', textTransform: 'none', color: '#2d3748', fontSize: 'inherit' }}>
                      {t.termsOfService}
                    </Button>
                    {language === 'en' ? ' and ' : language === 'tr' ? ' ve ' : ' и '}
                    <Button variant="text" sx={{ p: 0, minWidth: 'auto', textTransform: 'none', color: '#2d3748', fontSize: 'inherit' }}>
                      {t.privacyPolicy}
                    </Button>
                    {language === 'tr' ? '\'nı kabul ediyorum' : ''}
                  </Typography>
                }
                sx={{ mb: 3, alignItems: 'flex-start' }}
              />

              {/* Sign Up Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || !formData.agreeToTerms}
                sx={{
                  bgcolor: '#2d3748',
                  fontWeight: 'bold',
                  py: 1.5,
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  '&:hover': { bgcolor: '#007562' }
                }}
              >
                {loading ? t.loading : t.signUpButton}
              </Button>
            </form>

            {/* Sign In Link */}
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                {t.alreadyHaveAccount}{' '}
                <Button
                  component={Link}
                  to="/signin"
                  variant="text"
                  sx={{ 
                    color: '#2d3748', 
                    textTransform: 'none',
                    fontWeight: 'bold',
                    p: 0,
                    minWidth: 'auto'
                  }}
                >
                  {t.signInLink}
                </Button>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>

      <Footer />
    </Box>
  );
};

export default SignUp;
