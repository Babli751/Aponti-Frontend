import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { barberAPI, bookingAPI, profileApi } from '../services/api';
import Logo from '../components/Logo';
import WeeklySchedule from '../components/WeeklySchedule';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  Menu,
  Badge,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Toolbar,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  ArrowBack,
  Schedule,
  Phone,
  Delete,
  Edit,
  Notifications as NotificationsIcon
} from '@mui/icons-material';

// Use the same API base URL as the rest of the app
const API_BASE_URL = window.API_BASE_URL || process.env.REACT_APP_API_URL || '/api';

function formatDate(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Removed mock data - now using only real database connections

const BarberDashboard = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('tr');
  const [loading, setLoading] = useState({
    appointments: false,
    services: false,
    profile: false,
    barberId: true // Start with true to show loading while determining barber ID
  });
  const [error, setError] = useState(null);
  const [authFailed, setAuthFailed] = useState(false);

  const dict = useMemo(() => ({
    en: {
      title: 'Workers Portal',
      tabs: ['My Calendar', 'My Appointments', 'My Customers', 'My Profile'],
      addFree: 'Add Free Slot',
      editFree: 'Edit Free Slot',
      date: 'Date', start: 'Start', end: 'End', save: 'Save', cancel: 'Cancel', add: 'Add',
      today: 'Today', tomorrow: 'Tomorrow', week: 'This Week',
      time: 'Time', client: 'Client', service: 'Service', phone: 'Phone', call: 'Call', rating: 'Rating',
      customers: 'Customers', noCustomers: 'No customers yet',
      profile: 'Profile', services: 'Services', price: 'Price', duration: 'Duration (min)', bio: 'Bio', uploadPhoto: 'Upload Photo',
      reschedule: 'Reschedule',
      cancelAppt: 'Cancel',
      notifications: 'Notifications',
      loading: 'Loading...',
      error: 'Error loading data',
      backendError: 'Backend connection error'
    },
    tr: {
      title: 'İşçi Portalı',
      tabs: ['Takvimim', 'Randevularım', 'Müşterilerim', 'Profilim'],
      addFree: 'Boş Saat Ekle',
      editFree: 'Boş Saati Düzenle',
      date: 'Tarih', start: 'Başlangıç', end: 'Bitiş', save: 'Kaydet', cancel: 'İptal', add: 'Ekle',
      today: 'Bugün', tomorrow: 'Yarın', week: 'Haftalık',
      time: 'Saat', client: 'Müşteri', service: 'Hizmet', phone: 'Telefon', call: 'Ara', rating: 'Puan',
      customers: 'Müşteriler', noCustomers: 'Henüz müşteri yok',
      profile: 'Profil', services: 'Hizmetler', price: 'Fiyat', duration: 'Süre (dk)', bio: 'Hakkımda', uploadPhoto: 'Fotoğraf Yükle',
      reschedule: 'Yeniden Planla',
      cancelAppt: 'İptal',
      notifications: 'Bildirimler',
      loading: 'Yükleniyor...',
      error: 'Veri yüklenirken hata oluştu',
      backendError: 'Backend bağlantı hatası'
    },
    ru: {
      title: 'Портал Работника',
      tabs: ['Календарь', 'Мои встречи', 'Клиенты', 'Профиль'],
      addFree: 'Добавить окно',
      editFree: 'Изменить окно',
      date: 'Дата', start: 'Начало', end: 'Конец', save: 'Сохранит��', cancel: 'Отмена', add: 'Добавить',
      today: 'Сегодня', tomorrow: 'Завтра', week: 'Неделя',
      time: 'Время', client: 'Клиент', service: 'Услуга', phone: 'Телефон', call: 'Позвонить', rating: 'Рейтинг',
      customers: 'Клиенты', noCustomers: 'Пока нет клиентов',
      profile: 'Профиль', services: 'Услуги', price: 'Цена', duration: 'Длительность (мин)', bio: 'О себе', uploadPhoto: 'Загрузить фото',
      reschedule: 'Перенести',
      cancelAppt: 'Отменить',
      notifications: 'Уведомления',
      loading: 'Загрузка...',
      error: 'Ошибка загрузки данных',
      backendError: 'Ошибка подключения к серверу'
    }
  })[language], [language]);

  const [tab, setTab] = useState(0);
  const [barberId, setBarberId] = useState(null);
  const [appointmentFilter, setAppointmentFilter] = useState('today');

  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [profile, setProfile] = useState({
    avatar_url: '',
    barber_bio: '',
    barber_shop_name: '',
    barber_shop_address: ''
  });
  const [newService, setNewService] = useState({ name: '', price: '', duration: '' });

  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [slotForm, setSlotForm] = useState({ date: formatDate(new Date()), start: '', end: '' });
  const [freeSlots, setFreeSlots] = useState([]);

  const [notifAnchor, setNotifAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const [apptDialogOpen, setApptDialogOpen] = useState(false);
  const [editingAppt, setEditingAppt] = useState(null);
  const [apptForm, setApptForm] = useState({ date: formatDate(new Date()), time: '' });

  // Debug state for authentication issues
  const [debugInfo, setDebugInfo] = useState({});
  const [testResult, setTestResult] = useState('');

  // Get current barber ID from authentication
  const getCurrentBarberId = async () => {
    try {
      setLoading(prev => ({ ...prev, barberId: true }));

      // Clear any conflicting business tokens to ensure we only use barber tokens
      localStorage.removeItem('business_token');
      localStorage.removeItem('businessToken');

      const token = localStorage.getItem('access_token');
      console.log('🔍 Checking barber authentication...');
      console.log('📝 Token found:', token ? 'YES' : 'NO');
      console.log('🔑 Full token (first 50 chars):', token ? token.substring(0, 50) + '...' : 'NONE');
      console.log('🌐 API_BASE_URL:', API_BASE_URL);
      console.log('📡 Full auth URL:', `${API_BASE_URL}/auth/me`);

      if (!token) {
        console.error('❌ No access token found for barber');
        setLoading(prev => ({ ...prev, barberId: false }));
        return null;
      }

      console.log('🔗 API URL:', `${API_BASE_URL}/auth/me`);
      console.log('🔑 Token preview:', token.substring(0, 20) + '...');

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Auth response status:', response.status);
      console.log('📡 Auth response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const userData = await response.json();
        console.log('✅ Auth response:', userData);
        console.log('👤 Is barber:', userData.is_barber);
        console.log('🆔 User ID:', userData.id);
        console.log('📧 User email:', userData.email);
        console.log('📱 User phone:', userData.phone_number);
        console.log('✅ User active:', userData.is_active);

        if (userData.is_barber) {
          console.log('🎉 Barber authenticated successfully, ID:', userData.id);
          setLoading(prev => ({ ...prev, barberId: false }));
          return userData.id;
        } else {
          console.error('❌ Current user is not a barber! User data:', JSON.stringify(userData, null, 2));
          console.error('❌ User role/type:', userData.is_barber ? 'BARBER' : 'NOT_BARBER');
          console.error('❌ User ID:', userData.id);
          console.error('❌ User email:', userData.email);
          console.error('❌ User first_name:', userData.first_name);
          console.error('❌ User last_name:', userData.last_name);
          setLoading(prev => ({ ...prev, barberId: false }));
          return null;
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Auth API failed:', response.status, errorText);
        setLoading(prev => ({ ...prev, barberId: false }));
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting current barber ID:', error);
      setLoading(prev => ({ ...prev, barberId: false }));
      return null;
    }
  };

  // API çağrıları
  const fetchAppointments = async () => {
    try {
      setLoading(prev => ({ ...prev, appointments: true }));
      setError(null);

      console.log('🔍 Fetching appointments for barber ID:', barberId);
      const data = await barberAPI.getBarberAppointments(barberId);
      console.log('✅ Appointments data received:', data);
      setAppointments(data);

    } catch (err) {
      console.error('❌ Error fetching appointments:', err.message);
      setError(`Failed to load appointments: ${err.message}`);
      setAppointments([]);
    } finally {
      setLoading(prev => ({ ...prev, appointments: false }));
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(prev => ({ ...prev, services: true }));
      setError(null);

      console.log('🔍 Fetching services for barber ID:', barberId);
      const data = await barberAPI.getBarberServices(barberId);
      console.log('��� Services data received:', data);
      setServices(data);

    } catch (err) {
      console.error('❌ Error fetching services:', err.message);
      setError(`Failed to load services: ${err.message}`);
      setServices([]);
    } finally {
      setLoading(prev => ({ ...prev, services: false }));
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(prev => ({ ...prev, profile: true }));
      setError(null);

      console.log('🔍 Fetching profile for barber ID:', barberId);
      const data = await barberAPI.getBarberById(barberId);
      console.log('✅ Profile data received:', data);
      setProfile(data);

    } catch (err) {
      console.error('❌ Error fetching profile:', err.message);
      setError(`Failed to load profile: ${err.message}`);
      setProfile({
        avatar_url: '',
        barber_bio: '',
        barber_shop_name: '',
        barber_shop_address: ''
      });
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  const fetchNotifications = async () => {
    setNotifications([]);
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      if (!barberId) {
        const currentBarberId = await getCurrentBarberId();
        if (currentBarberId) {
          setBarberId(currentBarberId);
        } else {
          console.error('Could not determine barber ID - showing error');
          // Clear all tokens and show error message
          localStorage.removeItem('access_token');
          localStorage.removeItem('business_token');
          localStorage.removeItem('businessToken');
          setAuthFailed(true);
          setError('Barber authentication failed. Please log in as a barber first.');
        }
      } else {
        fetchAppointments();
        fetchServices();
        fetchProfile();
        fetchNotifications();
      }
    };

    initializeDashboard();
  }, [barberId, navigate]);

  const today = formatDate(new Date());
  const tomorrow = formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000));

  const weekDates = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 7; i++) arr.push(formatDate(new Date(Date.now() + i * 86400000)));
    return new Set(arr);
  }, []);

  const filteredAppointments = (range) => {
    if (range === 'today') return appointments.filter(a => a.start_time && a.start_time.split('T')[0] === today);
    if (range === 'tomorrow') return appointments.filter(a => a.start_time && a.start_time.split('T')[0] === tomorrow);
    return appointments.filter(a => a.start_time && weekDates.has(a.start_time.split('T')[0]));
  };

  const customers = useMemo(() => {
    const map = new Map();
    for (const a of appointments) {
      const clientName = a.customer_name || 'Unknown Customer';
      const clientPhone = a.customer_phone || 'No phone';
      if (!map.has(clientName)) map.set(clientName, { name: clientName, phone: clientPhone, visits: 0 });
      map.get(clientName).visits += 1;
    }
    return Array.from(map.values());
  }, [appointments]);

  const openAddSlot = () => {
    setEditingSlot(null);
    setSlotForm({ date: today, start: '', end: '' });
    setSlotDialogOpen(true);
  };

  const openEditSlot = (slot) => {
    setEditingSlot(slot);
    setSlotForm({ date: slot.date, start: slot.start, end: slot.end });
    setSlotDialogOpen(true);
  };

  const saveSlot = async () => {
    if (!slotForm.date || !slotForm.start || !slotForm.end) return;

    try {
      if (editingSlot) {
        // Edit existing slot
        setFreeSlots(prev => prev.map(slot =>
          slot.id === editingSlot.id ? { ...slot, ...slotForm } : slot
        ));
      } else {
        // Add new slot
        const newSlot = { id: Date.now(), ...slotForm };
        setFreeSlots(prev => [...prev, newSlot]);
      }
      setSlotDialogOpen(false);
      setEditingSlot(null);
      setSlotForm({ date: formatDate(new Date()), start: '', end: '' });
    } catch (err) {
      setError(err.message);
      console.error('Error saving slot:', err);
    }
  };

  const deleteSlot = async (id) => {
    try {
      setFreeSlots(prev => prev.filter(slot => slot.id !== id));
    } catch (err) {
      setError(err.message);
      console.error('Error deleting slot:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const handleNotifOpen = (e) => setNotifAnchor(e.currentTarget);
  const handleNotifClose = () => setNotifAnchor(null);

  const markAllNotificationsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = async () => {
    setNotifications([]);
  };

  const openReschedule = (a) => {
    setEditingAppt(a);
    const appointmentDate = a.start_time ? a.start_time.split('T')[0] : today;
    const appointmentTime = a.start_time ? a.start_time.split('T')[1].substring(0, 5) : '10:00';
    setApptForm({ date: appointmentDate, time: appointmentTime });
    setApptDialogOpen(true);
  };

  const saveReschedule = async () => {
    if (!apptForm.date || !apptForm.time) return;

    try {
      const newDateTime = `${apptForm.date}T${apptForm.time}:00`;

      await bookingAPI.updateBooking(editingAppt.id, {
        start_time: newDateTime
      });

      fetchAppointments();
      setApptDialogOpen(false);
    } catch (err) {
      setError(err.message);
      console.error('Error rescheduling appointment:', err);
    }
  };

  const cancelAppointment = async (a) => {
    if (!window.confirm(language === 'tr' ? 'Randevu iptal edilsin mi?' : language === 'en' ? 'Cancel this appointment?' : 'Отменить встречу?')) return;

    try {
      await bookingAPI.cancelBooking(a.id);
      fetchAppointments();
    } catch (err) {
      setError(err.message);
      console.error('Error canceling appointment:', err);
    }
  };

  const addService = async () => {
    if (!newService.name || !newService.price || !newService.duration) {
      setError(language === 'tr' ? 'Lütfen tüm alanları doldurun' : language === 'en' ? 'Please fill in all fields' : 'Пожалуйста, заполните все поля');
      return;
    }

    try {
      const serviceData = {
        name: newService.name,
        price: parseFloat(newService.price),
        duration: parseInt(newService.duration)
      };

      await barberAPI.createBarberService(barberId, serviceData);
      fetchServices();
      setNewService({ name: '', price: '', duration: '' });
      setError(null); // Clear any previous errors
    } catch (err) {
      setError(err.message);
      console.error('Error adding service:', err);
    }
  };

  const removeService = async (id) => {
    if (!window.confirm(language === 'tr' ? 'Hizmeti silmek istediğinizden emin misiniz?' : language === 'en' ? 'Are you sure you want to delete this service?' : 'Вы уверены, что хотите удалить эту услугу?')) {
      return;
    }

    try {
      await barberAPI.deleteBarberService(barberId, id);
      fetchServices();
      setError(null); // Clear any previous errors
    } catch (err) {
      setError(err.message);
      console.error('Error removing service:', err);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const data = await profileApi.uploadAvatar(formData);
      setProfile(prev => ({ ...prev, avatar_url: data.avatar_url }));
    } catch (err) {
      setError(err.message);
      console.error('Error uploading photo:', err);
    }
  };

  const updateBio = async (newBio) => {
    try {
      await barberAPI.updateBarberProfile(barberId, {
        bio: newBio,
        shop_name: profile.barber_shop_name,
        shop_address: profile.barber_shop_address
      });

      fetchProfile();
    } catch (err) {
      setError(err.message);
      console.error('Error updating bio:', err);
    }
  };

  // Initialize debug info
  useEffect(() => {
    const info = {
      access_token: localStorage.getItem('access_token') ? 'PRESENT' : 'MISSING',
      business_token: localStorage.getItem('business_token') ? 'PRESENT' : 'MISSING',
      businessToken: localStorage.getItem('businessToken') ? 'PRESENT' : 'MISSING',
      api_base_url: window.API_BASE_URL,
      current_url: window.location.href
    };
    setDebugInfo(info);
  }, []);

  if (authFailed) {

    const testAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setTestResult('❌ No access token found');
        return;
      }

      try {
        const response = await fetch(`${window.API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setTestResult(`✅ Auth successful: ${JSON.stringify(data)}`);
        } else {
          const error = await response.text();
          setTestResult(`❌ Auth failed (${response.status}): ${error}`);
        }
      } catch (error) {
        setTestResult(`❌ Network error: ${error.message}`);
      }
    };

    const clearTokens = () => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('business_token');
      localStorage.removeItem('businessToken');
      setDebugInfo(prev => ({
        ...prev,
        access_token: 'MISSING',
        business_token: 'MISSING',
        businessToken: 'MISSING'
      }));
      setTestResult('🗑️ Tokens cleared');
    };

    return (
      <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="md">
          <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', color: '#ef4444', fontWeight: 'bold' }}>
            Authentication Required
          </Typography>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Token Status</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography><strong>Access Token:</strong> {debugInfo.access_token}</Typography>
                <Typography><strong>Business Token:</strong> {debugInfo.business_token}</Typography>
                <Typography><strong>BusinessToken:</strong> {debugInfo.businessToken}</Typography>
              </Box>
              <Typography><strong>API Base URL:</strong> {debugInfo.api_base_url}</Typography>
              <Typography><strong>Current URL:</strong> {debugInfo.current_url}</Typography>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Test Authentication</Typography>
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Button variant="contained" onClick={testAuth}>Test Auth API</Button>
                <Button variant="outlined" color="error" onClick={clearTokens}>Clear Tokens</Button>
              </Stack>
              {testResult && (
                <Typography sx={{ fontFamily: 'monospace', bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                  {testResult}
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Instructions</Typography>
              <Typography variant="body2" paragraph>
                1. If tokens are missing, go to the signup page and login as a barber.
              </Typography>
              <Typography variant="body2" paragraph>
                2. Click "Test Auth API" to verify authentication works.
              </Typography>
              <Typography variant="body2" paragraph>
                3. If auth fails, check the API response for details.
              </Typography>
              <Typography variant="body2" paragraph>
                4. Try accessing the barber dashboard after successful auth.
              </Typography>
            </CardContent>
          </Card>

          <Box sx={{ textAlign: 'center' }}>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/')}
                sx={{ bgcolor: '#2d3748', '&:hover': { bgcolor: '#007562' } }}
              >
                Go to Login Page
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => window.location.reload()}
                sx={{ color: '#2d3748', borderColor: '#2d3748' }}
              >
                Retry
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>
    );
  }

  if (loading.barberId || (loading.appointments && loading.services && loading.profile)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>
          {loading.barberId ? 'Loading barber profile...' : dict.loading}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #e5e7eb', color: '#1f2937' }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={() => navigate('/')}> <ArrowBack /> </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 'bold', background: 'linear-gradient(135deg, #2d3748 0%, #4fd5c7 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                {dict.title}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControl size="small">
                <Select value={language} onChange={(e) => setLanguage(e.target.value)} sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}>
                  <MenuItem value="en">🇬🇧 EN</MenuItem>
                  <MenuItem value="tr">🇹🇷 TR</MenuItem>
                  <MenuItem value="ru">🇷🇺 RU</MenuItem>
                </Select>
              </FormControl>
              <IconButton onClick={handleNotifOpen} sx={{ color: '#2d3748' }}>
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              <Avatar alt="Barber" src={profile.avatar_url} />
            </Box>
          </Toolbar>
        </Container>
      </AppBar>


      {error && (
        <Alert severity="error" sx={{ mx: 2, mt: 2 }} onClose={() => setError(null)}>
          {dict.error}: {error}
        </Alert>
      )}

      <Menu anchorEl={notifAnchor} open={Boolean(notifAnchor)} onClose={handleNotifClose} sx={{ mt: 1 }}>
        <Box sx={{ px: 2, py: 1, minWidth: 320 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{dict.notifications}</Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" onClick={markAllNotificationsRead}>{language === 'tr' ? 'Tümünü okundu' : 'Mark all read'}</Button>
              <Button size="small" color="error" onClick={clearNotifications}>{language === 'tr' ? 'Temizle' : 'Clear'}</Button>
            </Stack>
          </Box>
          {notifications.length ? (
            <List sx={{ pt: 0 }}>
              {notifications.map(n => (
                <ListItem key={n.id} sx={{ px: 0 }}>
                  <ListItemText 
                    primary={<Typography sx={{ fontWeight: n.read ? 400 : 700 }}>{n.title}</Typography>} 
                    secondary={<Typography color="text.secondary">{n.body} • {n.time}</Typography>} 
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">{language === 'tr' ? 'Bildirim yok' : 'No notifications'}</Typography>
          )}
        </Box>
      </Menu>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tab} onChange={(e, v) => setTab(v)}>
            {dict.tabs.map((label, i) => (<Tab key={i} label={label} />))}
          </Tabs>
        </Box>

        {tab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{dict.tabs[0]}</Typography>
                    <Button variant="contained" onClick={openAddSlot} sx={{ bgcolor: '#2d3748', '&:hover': { bgcolor: '#007562' } }}>{dict.addFree}</Button>
                  </Box>
                  <List>
                    {freeSlots.length > 0 ? freeSlots.map((slot) => (
                      <ListItem key={slot.id} sx={{ px: 0 }}>
                        <ListItemText
                          primary={`${slot.date} • ${slot.start} - ${slot.end}`}
                          secondary={language === 'tr' ? 'Boş saat' : language === 'en' ? 'Free slot' : 'Свободное время'}
                        />
                        <Stack direction="row" spacing={1}>
                          <Button size="small" onClick={() => openEditSlot(slot)}>{dict.editFree}</Button>
                          <Button size="small" color="error" onClick={() => deleteSlot(slot.id)}>{dict.cancel}</Button>
                        </Stack>
                      </ListItem>
                    )) : (
                      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                        {language === 'tr'
                          ? 'Henüz boş saat eklenmemiş'
                          : language === 'en'
                            ? 'No free slots added yet'
                            : 'Свободные слоты еще не добавлены'}
                      </Typography>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {tab === 1 && (
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip
                  label={dict.today}
                  icon={<Schedule sx={{ color: appointmentFilter === 'today' ? '#2d3748' : 'inherit' }} />}
                  onClick={() => setAppointmentFilter('today')}
                  variant={appointmentFilter === 'today' ? 'filled' : 'outlined'}
                  sx={{
                    bgcolor: appointmentFilter === 'today' ? '#e6f7f5' : 'transparent',
                    color: appointmentFilter === 'today' ? '#2d3748' : 'inherit',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                />
                <Chip
                  label={dict.tomorrow}
                  onClick={() => setAppointmentFilter('tomorrow')}
                  variant={appointmentFilter === 'tomorrow' ? 'filled' : 'outlined'}
                  sx={{
                    bgcolor: appointmentFilter === 'tomorrow' ? '#e6f7f5' : 'transparent',
                    color: appointmentFilter === 'tomorrow' ? '#2d3748' : 'inherit',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                />
                <Chip
                  label={dict.week}
                  onClick={() => setAppointmentFilter('week')}
                  variant={appointmentFilter === 'week' ? 'filled' : 'outlined'}
                  sx={{
                    bgcolor: appointmentFilter === 'week' ? '#e6f7f5' : 'transparent',
                    color: appointmentFilter === 'week' ? '#2d3748' : 'inherit',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                />
              </Stack>

              {/* Weekly Schedule Calendar */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  {language === 'en' ? '📅 Weekly Schedule' : language === 'tr' ? '📅 Haftalık Program' : '📅 Недельное расписание'}
                </Typography>
                <WeeklySchedule
                  appointments={appointments || []}
                  language={language}
                />
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>{dict.tabs[1]}</Typography>
              {loading.appointments ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <List>
                  {filteredAppointments(appointmentFilter) && filteredAppointments(appointmentFilter).map((a) => {
                    const appointmentDate = a.start_time ? a.start_time.split('T')[0] : '';
                    const appointmentTime = a.start_time ? a.start_time.split('T')[1].substring(0, 5) : '';
                    return (
                      <ListItem key={`${appointmentFilter}-${a.id}`} sx={{ px: 0 }}>
                        <ListItemText
                          primary={`${appointmentDate} • ${appointmentTime} — ${a.customer_name}`}
                          secondary={`${dict.service}: ${a.service?.name || 'Unknown'}`}
                        />
                        <Stack direction="row" spacing={1}>
                          <Button size="small" onClick={() => openReschedule(a)}>{dict.reschedule}</Button>
                          <Button size="small" color="error" onClick={() => cancelAppointment(a)}>{dict.cancelAppt}</Button>
                          <Button size="small" startIcon={<Phone />} sx={{ color: '#2d3748' }}>{dict.call}</Button>
                        </Stack>
                      </ListItem>
                    );
                  })}
                  {(!filteredAppointments(appointmentFilter) || filteredAppointments(appointmentFilter).length === 0) && (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                      {language === 'tr' ? 'Bu dönemde randevu yok' : language === 'en' ? 'No appointments in this period' : 'Нет встреч в этот период'}
                    </Typography>
                  )}
                </List>
              )}
            </CardContent>
          </Card>
        )}

        {tab === 2 && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>{dict.tabs[2]}</Typography>
              {loading.appointments ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <List>
                  {customers && customers.map((c, idx) => (
                    <React.Fragment key={c.name}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText primary={`${c.name} • ${c.visits}`} secondary={`${dict.phone}: ${c.phone}`} />
                        <Button size="small" startIcon={<Phone />} sx={{ color: '#2d3748' }}>{dict.call}</Button>
                      </ListItem>
                      {idx < customers.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                  {(!customers || !customers.length) && (
                    <Typography variant="body2" color="text.secondary">{dict.noCustomers}</Typography>
                  )}
                </List>
              )}
            </CardContent>
          </Card>
        )}

        {tab === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>{dict.services}</Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                    <TextField fullWidth label={<span>{dict.services}</span>} placeholder="Saç Kesimi" value={newService.name} onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))} />
                    <TextField label={dict.price} value={newService.price} onChange={(e) => setNewService(prev => ({ ...prev, price: e.target.value }))} />
                    <TextField label={dict.duration} value={newService.duration} onChange={(e) => setNewService(prev => ({ ...prev, duration: e.target.value }))} />
                    <Button variant="contained" onClick={addService} sx={{ bgcolor: '#2d3748', '&:hover': { bgcolor: '#007562' } }}>{dict.add}</Button>
                  </Stack>
                  {loading.services ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <List>
                      {services && services.map((s) => (
                        <React.Fragment key={s.id}>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemText primary={`${s.name} — ₺${s.price}`} secondary={`${dict.duration}: ${s.duration}`} />
                            <IconButton onClick={() => removeService(s.id)} sx={{ color: '#ef4444' }}><Delete /></IconButton>
                          </ListItem>
                          <Divider />
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>{dict.profile}</Typography>
                  {loading.profile ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <Avatar src={profile.avatar_url} sx={{ width: 120, height: 120 }} />
                      <Button component="label" variant="outlined" sx={{ color: '#2d3748', borderColor: '#2d3748' }}>
                        {dict.uploadPhoto}
                        <input hidden accept="image/*" type="file" onChange={handlePhotoChange} />
                      </Button>
                      <TextField 
                        fullWidth 
                        multiline 
                        rows={4} 
                        label={dict.bio} 
                        value={profile.barber_bio || ''} 
                        onChange={(e) => setProfile(prev => ({ ...prev, barber_bio: e.target.value }))}
                        onBlur={(e) => updateBio(e.target.value)}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>

      <Dialog open={slotDialogOpen} onClose={() => setSlotDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editingSlot ? dict.editFree : dict.addFree}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label={dict.date} type="date" value={slotForm.date} onChange={(e) => setSlotForm(prev => ({ ...prev, date: e.target.value }))} InputLabelProps={{ shrink: true }} />
            <Stack direction="row" spacing={2}>
              <TextField label={dict.start} type="time" value={slotForm.start} onChange={(e) => setSlotForm(prev => ({ ...prev, start: e.target.value }))} InputLabelProps={{ shrink: true }} />
              <TextField label={dict.end} type="time" value={slotForm.end} onChange={(e) => setSlotForm(prev => ({ ...prev, end: e.target.value }))} InputLabelProps={{ shrink: true }} />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSlotDialogOpen(false)}>{dict.cancel}</Button>
          <Button variant="contained" onClick={saveSlot} sx={{ bgcolor: '#2d3748', '&:hover': { bgcolor: '#007562' } }}>{dict.save}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={apptDialogOpen} onClose={() => setApptDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{dict.reschedule}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
  label={dict.time}
  type="time"
  value={apptForm.time}
  onChange={(e) => setApptForm(prev => ({ ...prev, time: e.target.value }))}
  InputLabelProps={{ shrink: true }}
/>
</Stack>
</DialogContent>
<DialogActions>
  <Button onClick={() => setApptDialogOpen(false)}>{dict.cancel}</Button>
  <Button variant="contained" onClick={saveReschedule} sx={{ bgcolor: '#2d3748', '&:hover': { bgcolor: '#007562' } }}>{dict.reschedule}</Button>
</DialogActions>
</Dialog>
</Box>
);
};

export default BarberDashboard;
