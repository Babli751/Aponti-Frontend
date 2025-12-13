import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Divider,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Slider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  useMediaQuery,
  Avatar,
  Chip,
  Drawer,
  ListItemButton
} from '@mui/material';
import {
  ArrowBack,
  Language,
  Notifications,
  Security,
  Palette,
  VolumeUp,
  LocationOn,
  Visibility,
  DataUsage,
  Storage,
  Update,
  Info,
  Delete,
  Backup,
  Download,
  Shield,
  Lock,
  Fingerprint,
  PhoneAndroid,
  Email,
  Sms,
  DarkMode,
  LightMode,
  AutoMode,
  Schedule,
  Business,
  PersonAdd,
  Menu as MenuIcon,
  Close,
  Home as HomeIcon,
  ContentCut,
  Person,
  Favorite,
  Settings as SettingsIcon,
  Logout,
  Support as SupportIcon
} from '@mui/icons-material';

const Settings = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout, isAuthenticated } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Settings state
  const [settings, setSettings] = useState({
    // Notification settings
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    promotionalEmails: false,
    weeklyDigest: true,
    
    // Privacy settings
    profileVisibility: 'public',
    showPhoneNumber: false,
    showEmail: false,
    allowLocationTracking: true,
    shareAnalytics: true,
    
    // App settings
    theme: 'auto',
    soundEnabled: true,
    soundVolume: 50,
    autoBackup: true,
    downloadQuality: 'high',
    
    // Security settings
    twoFactorAuth: false,
    biometricAuth: false,
    sessionTimeout: 30,
    secureMode: false
  });

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [updateAvailable, setUpdateAvailable] = useState(false);

  // Translations
  const t = {
    title: language === 'en' ? 'Settings' : language === 'tr' ? 'Ayarlar' : 'Настройки',
    generalSettings: language === 'en' ? 'General Settings' : language === 'tr' ? 'Genel Ayarlar' : 'Общие настройки',
    notificationSettings: language === 'en' ? 'Notification Settings' : language === 'tr' ? 'Bildirim Ayarları' : 'Настройки уведомлений',
    privacySettings: language === 'en' ? 'Privacy & Security' : language === 'tr' ? 'Gizlilik ve Güvenlik' : 'Конфиденциальность и безопасность',
    appSettings: language === 'en' ? 'App Settings' : language === 'tr' ? 'Uygulama Ayarları' : 'Настройки приложения',
    accountSettings: language === 'en' ? 'Account Settings' : language === 'tr' ? 'Hesap Ayarları' : 'Настройки аккаунта',
    
    // Language
    languageLabel: language === 'en' ? 'Language' : language === 'tr' ? 'Dil' : 'Язык',
    
    // Notifications
    emailNotifications: language === 'en' ? 'Email Notifications' : language === 'tr' ? 'E-posta Bildirimleri' : 'Email уведомления',
    pushNotifications: language === 'en' ? 'Push Notifications' : language === 'tr' ? 'Anlık Bildirimler' : 'Push уведомления',
    smsNotifications: language === 'en' ? 'SMS Notifications' : language === 'tr' ? 'SMS Bildirimleri' : 'SMS уведомления',
    appointmentReminders: language === 'en' ? 'Appointment Reminders' : language === 'tr' ? 'Randevu Hatırlatıcıları' : 'Напоминания о встречах',
    promotionalEmails: language === 'en' ? 'Promotional Emails' : language === 'tr' ? 'Promosyon E-postaları' : 'Рекламные письма',
    weeklyDigest: language === 'en' ? 'Weekly Digest' : language === 'tr' ? 'Haftalık Özet' : 'Еженедельная сводка',
    
    // Privacy
    profileVisibility: language === 'en' ? 'Profile Visibility' : language === 'tr' ? 'Profil Görünürlüğü' : 'Видимость профиля',
    public: language === 'en' ? 'Public' : language === 'tr' ? 'Herkese Açık' : 'Публичный',
    private: language === 'en' ? 'Private' : language === 'tr' ? 'Özel' : 'Приватный',
    friendsOnly: language === 'en' ? 'Friends Only' : language === 'tr' ? 'Sadece Arkadaşlar' : 'Только друзья',
    showPhoneNumber: language === 'en' ? 'Show Phone Number' : language === 'tr' ? 'Telefon Numarasını Göster' : 'Показать номер телефона',
    showEmail: language === 'en' ? 'Show Email Address' : language === 'tr' ? 'E-posta Adresini Göster' : 'Показать email адрес',
    allowLocationTracking: language === 'en' ? 'Allow Location Tracking' : language === 'tr' ? 'Konum Takibine İzin Ver' : 'Разрешить отслеживание местоположения',
    shareAnalytics: language === 'en' ? 'Share Usage Analytics' : language === 'tr' ? 'Kullanım Analizlerini Paylaş' : 'Поделиться аналитикой использования',
    
    // App Settings
    themeLabel: language === 'en' ? 'Theme' : language === 'tr' ? 'Tema' : 'Тема',
    auto: language === 'en' ? 'Auto' : language === 'tr' ? 'Otomatik' : 'Авто',
    light: language === 'en' ? 'Light' : language === 'tr' ? 'Açık' : 'Светлый',
    dark: language === 'en' ? 'Dark' : language === 'tr' ? 'Koyu' : 'Темный',
    soundEnabled: language === 'en' ? 'Sound Effects' : language === 'tr' ? 'Ses Efektleri' : 'Звуковые эффекты',
    soundVolume: language === 'en' ? 'Sound Volume' : language === 'tr' ? 'Ses Seviyesi' : 'Громкость звука',
    autoBackup: language === 'en' ? 'Auto Backup' : language === 'tr' ? 'Otomatik Yedekleme' : 'Автоматическое резервное копирование',
    downloadQuality: language === 'en' ? 'Download Quality' : language === 'tr' ? 'İndirme Kalitesi' : 'Качество загрузки',
    high: language === 'en' ? 'High' : language === 'tr' ? 'Yüksek' : 'Высокое',
    medium: language === 'en' ? 'Medium' : language === 'tr' ? 'Orta' : 'Среднее',
    low: language === 'en' ? 'Low' : language === 'tr' ? 'Düşük' : 'Низкое',
    
    // Security
    twoFactorAuth: language === 'en' ? 'Two-Factor Authentication' : language === 'tr' ? 'İki Faktörlü Doğrulama' : 'Двухфакторная аутентификация',
    biometricAuth: language === 'en' ? 'Biometric Authentication' : language === 'tr' ? 'Biyometrik Doğrulama' : 'Биометрическая аутентификация',
    sessionTimeout: language === 'en' ? 'Session Timeout (minutes)' : language === 'tr' ? 'Oturum Zaman Aşımı (dakika)' : 'Тайм-аут сеанса (минуты)',
    secureMode: language === 'en' ? 'Secure Mode' : language === 'tr' ? 'Güvenli Mod' : 'Безопасный режим',
    
    // Account Actions
    exportData: language === 'en' ? 'Export My Data' : language === 'tr' ? 'Verilerimi Dışa Aktar' : 'Экспорт моих данных',
    deleteAccount: language === 'en' ? 'Delete Account' : language === 'tr' ? 'Hesabı Sil' : 'Удалить аккаунт',
    checkUpdates: language === 'en' ? 'Check for Updates' : language === 'tr' ? 'Güncellemeleri Kontrol Et' : 'Проверить обновления',
    appInfo: language === 'en' ? 'App Information' : language === 'tr' ? 'Uygulama Bilgileri' : 'Информация о приложении',
    
    // Buttons
    save: language === 'en' ? 'Save Changes' : language === 'tr' ? 'Değişiklikleri Kaydet' : 'Сохранить изменения',
    cancel: language === 'en' ? 'Cancel' : language === 'tr' ? 'İptal' : 'Отмена',
    export: language === 'en' ? 'Export' : language === 'tr' ? 'Dışa Aktar' : 'Экспорт',
    delete: language === 'en' ? 'Delete' : language === 'tr' ? 'Sil' : 'Удалить',
    
    // Messages
    updateAvailable: language === 'en' ? 'Update Available!' : language === 'tr' ? 'Güncelleme Mevcut!' : 'Доступно обновление!',
    settingsSaved: language === 'en' ? 'Settings saved successfully!' : language === 'tr' ? 'Ayarlar başarıyla kaydedildi!' : 'Настройки успешно сохранены!',
    deleteWarning: language === 'en' ? 'This action cannot be undone. Type "DELETE" to confirm.' : language === 'tr' ? 'Bu işlem geri alınamaz. Onaylamak için "DELETE" yazın.' : 'Это действие нельзя отменить. Введите "DELETE" для подтверждения.'
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);

  // Simulate update check
  useEffect(() => {
    const timer = setTimeout(() => {
      setUpdateAvailable(Math.random() > 0.7); // 30% chance of update
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleSettingChange = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSliderChange = (key) => (event, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    // In real app, save to backend
    console.log('Saving settings:', settings);
    // Show success message
  };

  const handleExportData = () => {
    setShowExportDialog(true);
  };

  const handleDeleteAccount = () => {
    setShowDeleteDialog(true);
  };

  const confirmDeleteAccount = () => {
    if (deleteConfirmText === 'DELETE') {
      // In real app, call delete API
      logout();
      navigate('/');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <Navbar onMenuClick={() => setDrawerOpen(true)} />

      <Container sx={{ py: { xs: 2, md: 3 } }}>
        <Stack spacing={3}>
          {/* General Settings */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                <Language sx={{ mr: 1, color: '#2d3748' }} />
                {t.generalSettings}
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>{t.languageLabel}</InputLabel>
                <Select
                  value={language}
                  onChange={(e) => changeLanguage(e.target.value)}
                  label={t.languageLabel}
                >
                  <MenuItem value="tr">🇹🇷 Türkçe</MenuItem>
                  <MenuItem value="en">🇺🇸 English</MenuItem>
                  <MenuItem value="ru">🇷🇺 Русский</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                <Notifications sx={{ mr: 1, color: '#2d3748' }} />
                {t.notificationSettings}
              </Typography>
              
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.emailNotifications}
                      onChange={handleSettingChange('emailNotifications')}
                      sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#2d3748' } }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Email sx={{ mr: 1, fontSize: 20 }} />
                      {t.emailNotifications}
                    </Box>
                  }
                />
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.pushNotifications}
                      onChange={handleSettingChange('pushNotifications')}
                      sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#2d3748' } }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PhoneAndroid sx={{ mr: 1, fontSize: 20 }} />
                      {t.pushNotifications}
                    </Box>
                  }
                />
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.smsNotifications}
                      onChange={handleSettingChange('smsNotifications')}
                      sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#2d3748' } }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Sms sx={{ mr: 1, fontSize: 20 }} />
                      {t.smsNotifications}
                    </Box>
                  }
                />
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.appointmentReminders}
                      onChange={handleSettingChange('appointmentReminders')}
                      sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#2d3748' } }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Schedule sx={{ mr: 1, fontSize: 20 }} />
                      {t.appointmentReminders}
                    </Box>
                  }
                />
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.promotionalEmails}
                      onChange={handleSettingChange('promotionalEmails')}
                      sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#2d3748' } }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Business sx={{ mr: 1, fontSize: 20 }} />
                      {t.promotionalEmails}
                    </Box>
                  }
                />
              </Stack>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                <Security sx={{ mr: 1, color: '#2d3748' }} />
                {t.privacySettings}
              </Typography>
              
              <Stack spacing={3}>
                <FormControl fullWidth>
                  <InputLabel>{t.profileVisibility}</InputLabel>
                  <Select
                    value={settings.profileVisibility}
                    onChange={handleSettingChange('profileVisibility')}
                    label={t.profileVisibility}
                  >
                    <MenuItem value="public">{t.public}</MenuItem>
                    <MenuItem value="friends">{t.friendsOnly}</MenuItem>
                    <MenuItem value="private">{t.private}</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.showPhoneNumber}
                      onChange={handleSettingChange('showPhoneNumber')}
                      sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#2d3748' } }}
                    />
                  }
                  label={t.showPhoneNumber}
                />
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.allowLocationTracking}
                      onChange={handleSettingChange('allowLocationTracking')}
                      sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#2d3748' } }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOn sx={{ mr: 1, fontSize: 20 }} />
                      {t.allowLocationTracking}
                    </Box>
                  }
                />
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.twoFactorAuth}
                      onChange={handleSettingChange('twoFactorAuth')}
                      sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#2d3748' } }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Shield sx={{ mr: 1, fontSize: 20 }} />
                      {t.twoFactorAuth}
                    </Box>
                  }
                />
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.biometricAuth}
                      onChange={handleSettingChange('biometricAuth')}
                      sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#2d3748' } }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Fingerprint sx={{ mr: 1, fontSize: 20 }} />
                      {t.biometricAuth}
                    </Box>
                  }
                />
              </Stack>
            </CardContent>
          </Card>

          {/* App Settings */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                <Palette sx={{ mr: 1, color: '#2d3748' }} />
                {t.appSettings}
              </Typography>
              
              <Stack spacing={3}>
                <FormControl fullWidth>
                  <InputLabel>{t.themeLabel}</InputLabel>
                  <Select
                    value={settings.theme}
                    onChange={handleSettingChange('theme')}
                    label={t.themeLabel}
                  >
                    <MenuItem value="auto">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AutoMode sx={{ mr: 1 }} />
                        {t.auto}
                      </Box>
                    </MenuItem>
                    <MenuItem value="light">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LightMode sx={{ mr: 1 }} />
                        {t.light}
                      </Box>
                    </MenuItem>
                    <MenuItem value="dark">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DarkMode sx={{ mr: 1 }} />
                        {t.dark}
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.soundEnabled}
                      onChange={handleSettingChange('soundEnabled')}
                      sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#2d3748' } }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <VolumeUp sx={{ mr: 1, fontSize: 20 }} />
                      {t.soundEnabled}
                    </Box>
                  }
                />
                
                {settings.soundEnabled && (
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>{t.soundVolume}</Typography>
                    <Slider
                      value={settings.soundVolume}
                      onChange={handleSliderChange('soundVolume')}
                      min={0}
                      max={100}
                      sx={{ color: '#2d3748' }}
                    />
                  </Box>
                )}
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.autoBackup}
                      onChange={handleSettingChange('autoBackup')}
                      sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#2d3748' } }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Backup sx={{ mr: 1, fontSize: 20 }} />
                      {t.autoBackup}
                    </Box>
                  }
                />
              </Stack>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                <Storage sx={{ mr: 1, color: '#2d3748' }} />
                {t.accountSettings}
              </Typography>
              
              <Stack spacing={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={handleExportData}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {t.exportData}
                </Button>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Update />}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {t.checkUpdates}
                </Button>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Info />}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {t.appInfo}
                </Button>
                
                <Divider sx={{ my: 2 }} />
                
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={handleDeleteAccount}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {t.deleteAccount}
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Paper sx={{ p: 2, position: 'sticky', bottom: 16 }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleSaveSettings}
              sx={{ 
                bgcolor: '#2d3748',
                '&:hover': { bgcolor: '#007562' }
              }}
            >
              {t.save}
            </Button>
          </Paper>
        </Stack>
      </Container>

      {/* Export Data Dialog */}
      <Dialog open={showExportDialog} onClose={() => setShowExportDialog(false)}>
        <DialogTitle>{t.exportData}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {language === 'en' 
              ? 'Your data will be exported as a JSON file containing your profile information, appointments, and preferences.'
              : language === 'tr'
              ? 'Verileriniz profil bilgilerinizi, randevularınızı ve tercihlerinizi içeren bir JSON dosyası olarak dışa aktarılacak.'
              : 'Ваши данные будут экспортированы как JSON файл, содержащий информацию профиля, встречи и настройки.'
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExportDialog(false)}>
            {t.cancel}
          </Button>
          <Button 
            variant="contained" 
            sx={{ bgcolor: '#2d3748' }}
            onClick={() => {
              // In real app, trigger download
              setShowExportDialog(false);
            }}
          >
            {t.export}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle color="error">{t.deleteAccount}</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            {t.deleteWarning}
          </Alert>
          <TextField
            fullWidth
            label="Type 'DELETE' to confirm"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>
            {t.cancel}
          </Button>
          <Button 
            variant="contained" 
            color="error"
            disabled={deleteConfirmText !== 'DELETE'}
            onClick={confirmDeleteAccount}
          >
            {t.delete}
          </Button>
        </DialogActions>
      </Dialog>

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
              Aponti
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <Close />
            </IconButton>
          </Box>

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
              <ListItemText primary={language === 'en' ? 'Home' : language === 'tr' ? 'Ana Sayfa' : 'Главная'} />
            </ListItemButton>
            <ListItemButton onClick={() => { navigate('/services'); setDrawerOpen(false); }}>
              <ListItemIcon><ContentCut /></ListItemIcon>
              <ListItemText primary={language === 'en' ? 'Services' : language === 'tr' ? 'Hizmetler' : 'Услуги'} />
            </ListItemButton>
            <ListItemButton onClick={() => { navigate('/about'); setDrawerOpen(false); }}>
              <ListItemIcon><Person /></ListItemIcon>
              <ListItemText primary={language === 'en' ? 'About' : language === 'tr' ? 'Hakkımızda' : 'О нас'} />
            </ListItemButton>
            <ListItemButton onClick={() => { navigate('/company'); setDrawerOpen(false); }}>
              <ListItemIcon><Business /></ListItemIcon>
              <ListItemText primary={language === 'en' ? 'Company' : language === 'tr' ? 'Şirket' : 'Компания'} />
            </ListItemButton>
            <ListItemButton onClick={() => { navigate('/support'); setDrawerOpen(false); }}>
              <ListItemIcon><SupportIcon /></ListItemIcon>
              <ListItemText primary={language === 'en' ? 'Support' : language === 'tr' ? 'Destek' : 'Поддержка'} />
            </ListItemButton>
            <ListItemButton onClick={() => { navigate('/contact'); setDrawerOpen(false); }}>
              <ListItemIcon><Schedule /></ListItemIcon>
              <ListItemText primary={language === 'en' ? 'Appoint' : language === 'tr' ? 'Randevu Al' : 'Записаться'} />
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
                primary={language === 'en' ? 'Try Business' : language === 'tr' ? 'İşletme Kayıt' : 'Бизнес регистрация'}
                sx={{ '& .MuiTypography-root': { color: '#ff6b35', fontWeight: 600 } }}
              />
            </ListItemButton>
            <ListItemButton onClick={() => { navigate('/dashboard'); setDrawerOpen(false); }}>
              <ListItemIcon><Schedule /></ListItemIcon>
              <ListItemText primary={language === 'en' ? 'Appointments' : language === 'tr' ? 'Randevularım' : 'Записи'} />
            </ListItemButton>
            <ListItemButton onClick={() => { navigate('/favorites'); setDrawerOpen(false); }}>
              <ListItemIcon><Favorite /></ListItemIcon>
              <ListItemText primary={language === 'en' ? 'Favorites' : language === 'tr' ? 'Favoriler' : 'Избранное'} />
            </ListItemButton>
            <Divider sx={{ my: 2 }} />
            {isAuthenticated ? (
              <>
                <ListItemButton onClick={() => { navigate('/profile'); setDrawerOpen(false); }}>
                  <ListItemIcon><Person /></ListItemIcon>
                  <ListItemText primary={language === 'en' ? 'Profile' : language === 'tr' ? 'Profil' : 'Профиль'} />
                </ListItemButton>
                <ListItemButton onClick={() => { navigate('/dashboard'); setDrawerOpen(false); }}>
                  <ListItemIcon><Schedule /></ListItemIcon>
                  <ListItemText primary={language === 'en' ? 'Appointments' : language === 'tr' ? 'Randevularım' : 'Записи'} />
                </ListItemButton>
                <ListItemButton onClick={() => { navigate('/settings'); setDrawerOpen(false); }}>
                  <ListItemIcon><SettingsIcon /></ListItemIcon>
                  <ListItemText primary={language === 'en' ? 'Settings' : language === 'tr' ? 'Ayarlar' : 'Настройки'} />
                </ListItemButton>
                <ListItemButton onClick={() => { handleLogout(); setDrawerOpen(false); }}>
                  <ListItemIcon><Logout /></ListItemIcon>
                  <ListItemText primary={language === 'en' ? 'Sign Out' : language === 'tr' ? 'Çıkış Yap' : 'Выйти'} />
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
                    {language === 'en' ? 'Login' : language === 'tr' ? 'Giriş' : 'Войти'}
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
                    {language === 'en' ? 'Sign Up' : language === 'tr' ? 'Kayıt Ol' : 'Регистрация'}
                  </Button>
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

export default Settings;
