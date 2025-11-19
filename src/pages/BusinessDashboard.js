import React, { useState, useEffect } from 'react';
import WeeklySchedule from '../components/WeeklySchedule';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useLanguage } from '../contexts/LanguageContext';
import { businessAPI } from '../services/api';
import api from '../services/api';
import { formatDate, formatTime, formatDateTime } from '../utils/dateUtils';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Grid,
  Button,
  Avatar,
  IconButton,
  AppBar,
  Toolbar,
  FormControl,
  Select,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tab,
  Tabs,
  Badge,
  Menu,
  Snackbar,
  Alert,
  CircularProgress,
  Checkbox
} from '@mui/material';
import {
  Business,
  Schedule,
  ContentCut,
  Star,
  Euro,
  Settings,
  Notifications,
  Add,
  Edit,
  Delete,
  Phone,
  CheckCircle,
  Cancel,
  Pending,
  Logout,
  ExpandMore
} from '@mui/icons-material';

const BusinessDashboard = () => {
  const navigate = useNavigate();
  const { language, changeLanguage, t } = useLanguage();
  const API_BASE =
    (typeof window !== 'undefined' && window.API_BASE_URL) ||
    'http://localhost:8003';

  const [currentTab, setCurrentTab] = useState(0);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [newService, setNewService] = useState({
    name: '',
    price: '',
    duration: '',
    description: '',
    worker_ids: [] // Array of worker IDs who can provide this service
  });

  const [notifAnchor, setNotifAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [businessInfo, setBusinessInfo] = useState({
    address: '',
    photoUrl: '',
    workingHours: {
      mon: { open: '09:00', close: '19:00' },
      tue: { open: '09:00', close: '19:00' },
      wed: { open: '09:00', close: '19:00' },
      thu: { open: '09:00', close: '19:00' },
      fri: { open: '09:00', close: '19:00' },
      sat: { open: '10:00', close: '18:00' },
      sun: { open: 'Closed', close: 'Closed' }
    }
  });

  const [barbers, setBarbers] = useState([]);
  const [availableBarbers, setAvailableBarbers] = useState([]);
  const [barberDialogOpen, setBarberDialogOpen] = useState(false);
  const [selectedBarberId, setSelectedBarberId] = useState('');
  const [newWorker, setNewWorker] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: 'TempPassword123!', // Temporary default password
    is_barber: true
  });

  // State for business data fetched from API
  const [businessData, setBusinessData] = useState({
    name: '',
    owner_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    description: '',
    avatar: '',
    coverPhoto: '',
    facebook: '',
    instagram: '',
    rating: 0,
    reviewCount: 0,
    totalBookings: 0,
    monthlyRevenue: 0,
    services: []
  });

  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [photoUploadOpen, setPhotoUploadOpen] = useState(false);
  const [uploadType, setUploadType] = useState('avatar'); // 'avatar' or 'cover'

  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Worker hours state
  const [workerHoursDialogOpen, setWorkerHoursDialogOpen] = useState(false);
  const [selectedWorkerForHours, setSelectedWorkerForHours] = useState(null);
  const [workerHours, setWorkerHours] = useState([
    { day_of_week: 0, start_time: '09:00', end_time: '17:00', is_working: true },
    { day_of_week: 1, start_time: '09:00', end_time: '17:00', is_working: true },
    { day_of_week: 2, start_time: '09:00', end_time: '17:00', is_working: true },
    { day_of_week: 3, start_time: '09:00', end_time: '17:00', is_working: true },
    { day_of_week: 4, start_time: '09:00', end_time: '17:00', is_working: true },
    { day_of_week: 5, start_time: '10:00', end_time: '18:00', is_working: true },
    { day_of_week: 6, start_time: '09:00', end_time: '17:00', is_working: false }
  ]);

  const dayNames = {
    en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    tr: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
    ru: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']
  };

  // Time options for dropdown (every 30 minutes from 06:00 to 23:00)
  const timeOptions = [
    'Closed',
    '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
    '22:00', '22:30', '23:00'
  ];

  // Fetch worker hours
  const fetchWorkerHours = async (workerId) => {
    try {
      const token = localStorage.getItem('business_token');
      const response = await api.get(`/businesses/workers/${workerId}/hours`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.length > 0) {
        setWorkerHours(response.data);
      } else {
        // Default hours if none set
        setWorkerHours([
          { day_of_week: 0, start_time: '09:00', end_time: '17:00', is_working: true },
          { day_of_week: 1, start_time: '09:00', end_time: '17:00', is_working: true },
          { day_of_week: 2, start_time: '09:00', end_time: '17:00', is_working: true },
          { day_of_week: 3, start_time: '09:00', end_time: '17:00', is_working: true },
          { day_of_week: 4, start_time: '09:00', end_time: '17:00', is_working: true },
          { day_of_week: 5, start_time: '10:00', end_time: '18:00', is_working: true },
          { day_of_week: 6, start_time: '09:00', end_time: '17:00', is_working: false }
        ]);
      }
    } catch (err) {
      console.error('Failed to fetch worker hours:', err);
    }
  };

  // Save worker hours
  const saveWorkerHours = async () => {
    if (!selectedWorkerForHours) return;
    try {
      const token = localStorage.getItem('business_token');
      await api.put(`/businesses/workers/${selectedWorkerForHours.id}/hours`, workerHours, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbar({
        open: true,
        message: language === 'en' ? 'Working hours saved successfully' :
                 language === 'tr' ? 'Çalışma saatleri kaydedildi' :
                 'Рабочее время сохранено',
        severity: 'success'
      });
      setWorkerHoursDialogOpen(false);
    } catch (err) {
      console.error('Failed to save worker hours:', err);
      setSnackbar({
        open: true,
        message: language === 'en' ? 'Failed to save working hours' :
                 language === 'tr' ? 'Çalışma saatleri kaydedilemedi' :
                 'Не удалось сохранить рабочее время',
        severity: 'error'
      });
    }
  };

  // Open worker hours dialog
  const openWorkerHoursDialog = (worker) => {
    setSelectedWorkerForHours(worker);
    fetchWorkerHours(worker.id);
    setWorkerHoursDialogOpen(true);
  };

  // Check authentication first
  useEffect(() => {
    const token = localStorage.getItem('business_token');
    if (!token) {
      console.log('No token found, redirecting to business signup/login');
      navigate('/business-signup');
      return;
    }
    setIsAuthenticated(true);
  }, [navigate]);

  // Fetch business data from API only if authenticated
// useEffect for fetching business data
useEffect(() => {
 if (!isAuthenticated) return;

 const fetchBusinessData = async () => {
   try {
     setLoading(true);
     setError(null);

     const token = localStorage.getItem('business_token');
     if (!token) {
       navigate('/business/login');
       return;
     }

     // 1️⃣ Fetch business profile
     const businessDataResponse = await businessAPI.getProfile();
     setBusinessData({
       ...businessDataResponse,
       owner: businessDataResponse.owner_name,
       address: `${businessDataResponse.address || ''}, ${businessDataResponse.city || ''}`
     });

     // Set working hours if available
     if (businessDataResponse.workingHours) {
       setBusinessInfo(prev => ({
         ...prev,
         workingHours: businessDataResponse.workingHours
       }));
     }

     // 2️⃣ Fetch appointments
     const appointmentsData = await businessAPI.getAppointments();
     setUpcomingAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);

     // 3️⃣ Fetch recent activity
     const activityData = await businessAPI.getActivity();
     setRecentActivity(activityData);

    const barbersResponse = await api.get("/barbers/");
    const barbersData = barbersResponse.data || [];
    setAvailableBarbers(barbersData);

   } catch (err) {
     console.error('Failed to fetch business data:', err);
     setError(err.message);
     setSnackbar({
       open: true,
       message: language === 'en' ? 'Failed to load data' :
                language === 'tr' ? 'Veriler yüklenemedi' :
                'Не удалось загрузить данные',
       severity: 'error'
     });
   } finally {
     setLoading(false);
   }
 };

 fetchBusinessData();
}, [language, navigate, isAuthenticated]);

  // Debug için businessData değiştiğinde loglama
  useEffect(() => {
    console.log('Business data updated:', businessData);
  }, [businessData]);

  // Debug için appointments değiştiğinde loglama
  useEffect(() => {
    console.log('Appointments updated:', upcomingAppointments);
  }, [upcomingAppointments]);

  // Eğer yükleniyorsa loading gösterimi
  if (!isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: '#2d3748' }} />
        <Typography sx={{ ml: 2 }}>Redirecting to login...</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: '#2d3748' }} />
        <Typography sx={{ ml: 2 }}>Loading...</Typography>
      </Box>
    );
  }

  // Eğer hata varsa hata gösterimi
  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <Typography color="error" variant="h6">Error: {error}</Typography>
        <Button onClick={() => window.location.reload()} sx={{ mt: 2 }}>
          Try Again
        </Button>
      </Box>
    );
  }

  const stats = [
    {
      title: language === 'en' ? 'Total Bookings' : language === 'tr' ? 'Toplam Rezervasyon' : 'Всего бронирований',
      value: businessData.totalBookings,
      change: '+12%',
      icon: <Schedule sx={{ color: '#2d3748' }} />
    },
    {
      title: language === 'en' ? 'Monthly Revenue' : language === 'tr' ? 'Aylık Gelir' : 'Месячный доход',
      value: `€${businessData.monthlyRevenue}`,
      change: '+8%',
      icon: <Euro sx={{ color: '#2d3748' }} />
    },
    {
      title: language === 'en' ? 'Average Rating' : language === 'tr' ? 'Ortalama Puan' : 'Средний рейтинг',
      value: businessData.rating,
      change: '+0.2',
      icon: <Star sx={{ color: '#2d3748' }} />
    },
    {
      title: language === 'en' ? 'Active Services' : language === 'tr' ? 'Aktif Hizmetler' : 'Активные услуги',
      value: businessData.services?.length || 0,
      change: '+1',
      icon: <ContentCut sx={{ color: '#2d3748' }} />
    }
  ];

  console.log('Rendering with stats:', stats);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleProfileMenuOpen = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('business_token');
    handleProfileMenuClose();
    navigate('/');
  };

  const handleSettings = () => {
    handleProfileMenuClose();
    setCurrentTab(2); // Navigate to Salon Info tab (settings section)
  };

  const handleAddService = async () => {
    if (newService.name && newService.price && newService.duration && newService.worker_ids.length > 0) {
      try {
        // Create service for each selected worker
        const createdServices = [];
        for (const workerId of newService.worker_ids) {
          const serviceData = {
            name: newService.name,
            price: parseFloat(newService.price),
            duration: parseInt(newService.duration),
            description: newService.description,
            barber_id: workerId
          };

          const newServiceData = await businessAPI.createService(serviceData);
          createdServices.push(newServiceData);
        }

        setBusinessData(prev => ({
          ...prev,
          services: [...(prev.services || []), ...createdServices]
        }));
        setServiceDialogOpen(false);
        setNewService({ name: '', price: '', duration: '', description: '', worker_ids: [] });
        setSnackbar({
          open: true,
          message: language === 'en' ? `Service added for ${newService.worker_ids.length} worker(s)` :
                   language === 'tr' ? `Hizmet ${newService.worker_ids.length} çalışan için eklendi` :
                   `Услуга добавлена для ${newService.worker_ids.length} сотрудника(ов)`,
          severity: 'success'
        });
      } catch (err) {
        console.error('Failed to add service:', err);
        setSnackbar({
          open: true,
          message: language === 'en' ? 'Failed to add service' :
                   language === 'tr' ? 'Hizmet eklenemedi' :
                   'Не удалось добавить услугу',
          severity: 'error'
        });
      }
    }
  };

  const handleDeleteService = async (serviceId) => {
    try {
      await businessAPI.deleteService(serviceId);
      setBusinessData(prev => ({
        ...prev,
        services: (prev.services || []).filter(service => service.id !== serviceId)
      }));
      setSnackbar({
        open: true,
        message: language === 'en' ? 'Service deleted successfully' :
                 language === 'tr' ? 'Hizmet başarıyla silindi' :
                 'Услуга успешно удалена',
        severity: 'success'
      });
    } catch (err) {
      console.error('Failed to delete service:', err);
      setSnackbar({
        open: true,
        message: language === 'en' ? 'Failed to delete service' :
                 language === 'tr' ? 'Hizmet silinemedi' :
                 'Не удалось удалить услугу',
        severity: 'error'
      });
    }
  };

  const handleNotifOpen = (e) => setNotifAnchor(e.currentTarget);
  const handleNotifClose = () => setNotifAnchor(null);
  const markAllNotificationsRead = () => setNotifications(prev => (prev || []).map(n => ({ ...n, read: true })));
  const clearNotifications = () => setNotifications([]);

  const handleBusinessPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setBusinessInfo(prev => ({ ...prev, photoUrl: URL.createObjectURL(file) }));
  };

  const saveBusinessInfo = async () => {
    try {
      const profileData = {
        address: businessData.address,
        description: businessData.description,
        name: businessData.name,
        owner_name: businessData.owner_name,
        phone: businessData.phone,
        city: businessData.city,
        working_hours: businessInfo.workingHours
      };

      await businessAPI.updateProfile(profileData);
      setSnackbar({
        open: true,
        message: language === 'en' ? 'Saved successfully' :
                 language === 'tr' ? 'Başarıyla kaydedildi' :
                 'Успешно сохранено',
        severity: 'success'
      });
    } catch (err) {
      console.error('Failed to save business info:', err);
      setSnackbar({
        open: true,
        message: language === 'en' ? 'Failed to save' :
                 language === 'tr' ? 'Kaydedilemedi' :
                 'Не удалось сохранить',
        severity: 'error'
      });
    }
  };

  const addBarber = async () => {
    try {
      // Validate inputs
      if (!newWorker.first_name || !newWorker.last_name || !newWorker.email) {
        setSnackbar({
          open: true,
          message: language === 'en' ? 'Please fill in all required fields' :
                   language === 'tr' ? 'Lütfen tüm gerekli alanları doldurun' :
                   'Пожалуйста, заполните все обязательные поля',
          severity: 'error'
        });
        return;
      }

      // Add worker to business via new endpoint
      const response = await api.post('/businesses/workers/add', {
        email: newWorker.email,
        password: newWorker.password,
        first_name: newWorker.first_name,
        last_name: newWorker.last_name,
        phone_number: newWorker.phone_number || '',
        is_barber: true
      });

      // Add the new worker to businessData immediately for instant UI update
      const newWorkerData = response.data.worker;
      setBusinessData(prev => ({
        ...prev,
        workers: [...(prev.workers || []), newWorkerData]
      }));

      setSnackbar({
        open: true,
        message: language === 'en' ? 'Worker added successfully!' :
                 language === 'tr' ? 'Çalışan başarıyla eklendi!' :
                 'Работник успешно добавлен!',
        severity: 'success'
      });

      // Reset form
      setNewWorker({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        password: 'TempPassword123!',
        is_barber: true
      });

      setBarberDialogOpen(false);

    } catch (err) {
      console.error('Failed to add worker:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || (
          language === 'en' ? 'Failed to add worker' :
          language === 'tr' ? 'Çalışan eklenemedi' :
          'Не удалось добавить работника'
        ),
        severity: 'error'
      });
    }
  };
  const removeBarber = (id) => setBarbers(prev => prev.filter(b => b.id !== id));

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return '#2d3748';
      case 'pending':
        return '#f59e0b';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case 'pending':
        return <Pending sx={{ fontSize: 16 }} />;
      case 'cancelled':
        return <Cancel sx={{ fontSize: 16 }} />;
      default:
        return null;
    }
  };

  const tabLabels = [
    language === 'en' ? 'Overview' : language === 'tr' ? 'Genel Bakış' : 'Обзор',
    t.services,
    language === 'en' ? 'Salon Info' : language === 'tr' ? 'Salon Bilgisi' : 'Инфо салона',
    language === 'en' ? 'Workers' : language === 'tr' ? 'İşçiler' : 'Работники',
    language === 'en' ? 'Appointments' : language === 'tr' ? 'Randevular' : 'Встречи',
    language === 'en' ? 'Income Reports' : language === 'tr' ? 'Gelir Raporları' : 'Отчеты о доходах'
  ];

  return (
    <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)',
          borderBottom: '1px solid #1a202c'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
            <Box sx={{ flexGrow: 1 }}>
              <Logo size="small" variant="white" />
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={handleProfileMenuClose}
        sx={{ mt: 1 }}
      >
        <MenuItem onClick={handleSettings}>
          <Settings sx={{ mr: 2 }} />
          {language === 'en' ? 'Settings' : language === 'tr' ? 'Ayarlar' : 'Настройки'}
        </MenuItem>
        <MenuItem onClick={() => setCurrentTab(0)}>
          <Business sx={{ mr: 2 }} />
          {language === 'en' ? 'Dashboard' : language === 'tr' ? 'Gösterge Paneli' : 'Панель управления'}
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <Logout sx={{ mr: 2 }} />
          {language === 'en' ? 'Sign Out' : language === 'tr' ? 'Çıkış Yap' : 'Выйти'}
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={notifAnchor}
        open={Boolean(notifAnchor)}
        onClose={handleNotifClose}
        sx={{ mt: 1 }}
      >
        <Box sx={{ px: 2, py: 1, minWidth: 320 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {language === 'en' ? 'Notifications' : language === 'tr' ? 'Bildirimler' : 'Уведомления'}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" onClick={markAllNotificationsRead}>
                {language === 'en' ? 'Mark all read' : language === 'tr' ? 'Tümünü okundu yap' : 'Отметить как прочит.'}
              </Button>
              <Button size="small" color="error" onClick={clearNotifications}>
                {language === 'en' ? 'Clear' : language === 'tr' ? 'Temizle' : 'Очистить'}
              </Button>
            </Stack>
          </Box>
          {notifications.length ? (
            <List sx={{ pt: 0 }}>
              {(notifications || []).map(n => (
                <ListItem key={n.id} sx={{ px: 0 }}>
                  <ListItemText
                    primary={<Typography sx={{ fontWeight: n.read ? 400 : 700 }}>{n.title}</Typography>}
                    secondary={<Typography color="text.secondary">{n.body} • {n.time}</Typography>}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {language === 'en' ? 'No notifications' : language === 'tr' ? 'Bildirim yok' : 'Нет уведомлений'}
            </Typography>
          )}
        </Box>
      </Menu>

      {/* Business Profile Banner */}
      <Box sx={{
        bgcolor: 'white',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <Container maxWidth="xl">
          {/* Cover Photo */}
          <Box sx={{
            height: 200,
            background: businessData.coverPhoto
              ? `url(${businessData.coverPhoto}) center/cover`
              : 'linear-gradient(135deg, #2d3748 0%, #4fd5c7 100%)',
            borderRadius: '0 0 16px 16px',
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            p: 2
          }}>
            <IconButton
              onClick={() => { setUploadType('cover'); setPhotoUploadOpen(true); }}
              sx={{
                bgcolor: 'rgba(255,255,255,0.9)',
                '&:hover': { bgcolor: 'white' },
                mb: 1,
                mr: 1
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Box>

          {/* Profile Info */}
          <Box sx={{ px: 3, pb: 3, display: 'flex', gap: 3, alignItems: 'flex-start', mt: -6 }}>
            {/* Avatar */}
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={businessData.avatar}
                sx={{
                  width: 120,
                  height: 120,
                  border: '4px solid white',
                  fontSize: '2.5rem',
                  bgcolor: '#2d3748'
                }}
              >
                {businessData.name ? businessData.name.charAt(0) : 'B'}
              </Avatar>
              <IconButton
                onClick={() => { setUploadType('avatar'); setPhotoUploadOpen(true); }}
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: 'white',
                  boxShadow: 2,
                  '&:hover': { bgcolor: '#f3f4f6' },
                  width: 36,
                  height: 36
                }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Box>

            {/* Business Info */}
            <Box sx={{ flex: 1, mt: 8 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {businessData.name || 'Your Business'}
                </Typography>
                <Chip
                  icon={<Star sx={{ color: '#fbbf24 !important' }} />}
                  label={`${businessData.rating || 4.5} (${businessData.reviewCount || 0} reviews)`}
                  sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 600 }}
                />
              </Box>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {businessData.description || 'Add a description to your business'}
              </Typography>

              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Phone fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {businessData.phone || 'Add phone'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Business fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {businessData.address}, {businessData.city}
                  </Typography>
                </Box>
              </Box>

              {/* Social Media Links */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                {businessData.facebook && (
                  <IconButton
                    component="a"
                    href={businessData.facebook}
                    target="_blank"
                    sx={{
                      bgcolor: '#1877f2',
                      color: 'white',
                      '&:hover': { bgcolor: '#166fe5' },
                      width: 36,
                      height: 36
                    }}
                  >
                    <Typography sx={{ fontSize: 18, fontWeight: 'bold' }}>f</Typography>
                  </IconButton>
                )}
                {businessData.instagram && (
                  <IconButton
                    component="a"
                    href={businessData.instagram}
                    target="_blank"
                    sx={{
                      background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
                      color: 'white',
                      '&:hover': { opacity: 0.9 },
                      width: 36,
                      height: 36
                    }}
                  >
                    <Typography sx={{ fontSize: 18, fontWeight: 'bold' }}>IG</Typography>
                  </IconButton>
                )}
                <Button
                  size="small"
                  startIcon={<Edit />}
                  onClick={() => setProfileEditOpen(true)}
                  sx={{ ml: 1 }}
                  variant="outlined"
                >
                  Edit Profile
                </Button>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            {language === 'en'
              ? "Dashboard Overview"
              : language === 'tr'
                ? 'Panel Özeti'
                : 'Обзор панели'
            }
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {language === 'en'
              ? "Here's what's happening with your business today."
              : language === 'tr'
                ? 'İşletmenizde bugün neler oluyor.'
                : 'Вот что происходит с вашим бизнесом сегодня.'
            }
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {(stats || []).map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      {stat.icon}
                    </Box>
                    <Chip 
                      label={stat.change} 
                      size="small" 
                      sx={{ 
                        bgcolor: '#e6f7f5', 
                        color: '#2d3748',
                        fontWeight: 'bold'
                      }} 
                    />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
            {(tabLabels || []).map((label, index) => (
              <Tab key={index} label={label} />
            ))}
          </Tabs>
        </Box>

        {/* Tab Content */}
        {currentTab === 0 && (
          <Grid container spacing={3}>
            {/* Today's Appointments */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {language === 'en' ? 'Today\'s Appointments' : language === 'tr' ? 'Bugünün Randevuları' : 'Сегодняшние встречи'}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Schedule />}
                      sx={{ color: '#2d3748', borderColor: '#2d3748' }}
                    >
                      {language === 'en' ? 'View All' : language === 'tr' ? 'Tümünü Gör' : 'Смотреть все'}
                    </Button>
                  </Box>

                  {upcomingAppointments && upcomingAppointments.length > 0 ? (
                    <List>
                      {(upcomingAppointments || []).map((appointment) => (
                        <ListItem
                          key={appointment.id}
                          sx={{
                            border: '1px solid #e5e7eb',
                            borderRadius: 2,
                            mb: 1,
                            '&:last-child': { mb: 0 }
                          }}
                        >
                          <Box sx={{ width: '100%' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                {appointment.customer_name}
                              </Typography>
                              <Chip
                                label={appointment.status}
                                size="small"
                                icon={getStatusIcon(appointment.status)}
                                sx={{
                                  bgcolor: `${getStatusColor(appointment.status)}15`,
                                  color: getStatusColor(appointment.status),
                                  fontWeight: 'bold'
                                }}
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {appointment.service_name} • {formatTime(appointment.start_time, language)}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button size="small" startIcon={<Phone />}>
                                {appointment.customer_phone}
                              </Button>
                            </Box>
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          {language === 'en' ? 'No appointments today' :
                            language === 'tr' ? 'Bugün randevu yok' :
                            'Сегодня нет встреч'}
                        </Typography>
                      </Box>
                    )}
                </CardContent>
              </Card>
            </Grid>

            {/* Weekly Schedule */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                    {language === 'en' ? '📅 Weekly Schedule' : language === 'tr' ? '📅 Haftalık Program' : '📅 Недельное расписание'}
                  </Typography>
                  <WeeklySchedule
                    appointments={upcomingAppointments || []}
                    language={language}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Activity */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                    {language === 'en' ? 'Recent Activity' : language === 'tr' ? 'Son Aktiviteler' : 'Недавняя активность'}
                  </Typography>

                  {recentActivity && recentActivity.length > 0 ? (
                    <List>
                      {(recentActivity || []).map((activity) => (
                        <ListItem key={activity.id} sx={{ px: 0 }}>
                          <ListItemText
                            primary={activity.message}
                            secondary={formatDate(activity.timestamp, language)}
                            primaryTypographyProps={{ variant: 'body2' }}
                            secondaryTypographyProps={{ variant: 'caption' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          {language === 'en' ? 'No recent activity' :
                            language === 'tr' ? 'Son aktivite yok' :
                            'Нет недавней активности'}
                        </Typography>
                      </Box>
                    )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {currentTab === 2 && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                {language === 'en' ? 'Salon Information' : language === 'tr' ? 'Salon Bilgisi' : 'Информация о салоне'}
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label={language === 'en' ? 'Address' : language === 'tr' ? 'Adres' : 'Адрес'}
                    value={businessData.address}
                    onChange={(e) => setBusinessData(prev => ({ ...prev, address: e.target.value }))}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label={language === 'en' ? 'Description' : language === 'tr' ? 'Açıklama' : 'Описание'}
                    value={businessData.description || ''}
                    onChange={(e) => setBusinessData(prev => ({ ...prev, description: e.target.value }))}
                    multiline
                    rows={4}
                  />
                  <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                    {[
                      { key: 'mon', label: language==='en'?'Mon':language==='tr'?'Pzt':'Пн' },
                      { key: 'tue', label: language==='en'?'Tue':language==='tr'?'Sal':'Вт' },
                      { key: 'wed', label: language==='en'?'Wed':language==='tr'?'Çar':'Ср' },
                      { key: 'thu', label: language==='en'?'Thu':language==='tr'?'Per':'Чт' },
                      { key: 'fri', label: language==='en'?'Fri':language==='tr'?'Cum':'Пт' },
                      { key: 'sat', label: language==='en'?'Sat':language==='tr'?'Cts':'Сб' },
                      { key: 'sun', label: language==='en'?'Sun':language==='tr'?'Paz':'Вс' },
                    ].map(d => d && (
                      <Box key={d.key} sx={{ display: 'flex', alignItems: 'center', gap: 1, width: { xs: '100%', sm: '48%', md: '32%' } }}>
                        <Typography variant="body2" sx={{ width: 40 }}>{d.label}</Typography>
                        <FormControl size="small" sx={{ minWidth: 90 }}>
                          <Select
                            value={businessInfo.workingHours[d.key].open}
                            onChange={(e)=> setBusinessInfo(prev=> ({ ...prev, workingHours: { ...prev.workingHours, [d.key]: { ...prev.workingHours[d.key], open: e.target.value } } }))}
                          >
                            {timeOptions.map(time => (
                              <MenuItem key={time} value={time}>{time}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <Typography variant="body2">-</Typography>
                        <FormControl size="small" sx={{ minWidth: 90 }}>
                          <Select
                            value={businessInfo.workingHours[d.key].close}
                            onChange={(e)=> setBusinessInfo(prev=> ({ ...prev, workingHours: { ...prev.workingHours, [d.key]: { ...prev.workingHours[d.key], close: e.target.value } } }))}
                          >
                            {timeOptions.map(time => (
                              <MenuItem key={time} value={time}>{time}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Avatar src={businessInfo.photoUrl} sx={{ width: 120, height: 120 }} />
                    <Button component="label" variant="outlined" sx={{ color: '#2d3748', borderColor: '#2d3748' }}>
                      {language === 'en' ? 'Upload Photo' : language === 'tr' ? 'Fotoğraf Yükle' : 'Загрузить фото'}
                      <input hidden accept="image/*" type="file" onChange={handleBusinessPhotoChange} />
                    </Button>
                    <Button variant="contained" sx={{ bgcolor: '#2d3748', '&:hover': { bgcolor: '#007562' } }} onClick={saveBusinessInfo}>
                      {language === 'en' ? 'Save' : language === 'tr' ? 'Kaydet' : 'Сохранить'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {currentTab === 1 && (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {t.manageServices}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setServiceDialogOpen(true)}
                  sx={{ bgcolor: '#2d3748', '&:hover': { bgcolor: '#007562' } }}
                >
                  {t.addService}
                </Button>
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t.serviceName}</TableCell>
                      <TableCell>{t.servicePrice}</TableCell>
                      <TableCell>{t.serviceDuration}</TableCell>
                      <TableCell>{language === 'en' ? 'Worker' : language === 'tr' ? 'Çalışan' : 'Работник'}</TableCell>
                      <TableCell>{language === 'en' ? 'Description' : language === 'tr' ? 'Açıklama' : 'Описание'}</TableCell>
                      <TableCell align="right">{language === 'en' ? 'Actions' : language === 'tr' ? 'İşlemler' : 'Действия'}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {businessData.services && businessData.services.length > 0 ? (
                      (() => {
                        // Group services by name
                        const grouped = (businessData.services || []).reduce((acc, service) => {
                          if (!acc[service.name]) {
                            acc[service.name] = [];
                          }
                          acc[service.name].push(service);
                          return acc;
                        }, {});

                        return Object.entries(grouped).map(([serviceName, serviceGroup]) => {
                          const firstService = serviceGroup[0];
                          const serviceWorkers = serviceGroup
                            .map(s => (businessData.workers || []).find(w => w.id === s.barber_id))
                            .filter(Boolean);

                          return (
                            <TableRow key={serviceName}>
                              <TableCell>{serviceName}</TableCell>
                              <TableCell>€{firstService.price}</TableCell>
                              <TableCell>{firstService.duration} min</TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                  {serviceWorkers.map((worker, idx) => (
                                    <Chip
                                      key={idx}
                                      label={worker?.full_name || worker?.email || `Worker ${worker?.id}`}
                                      size="small"
                                      sx={{ bgcolor: '#edf2f7', color: '#2d3748' }}
                                    />
                                  ))}
                                </Box>
                              </TableCell>
                              <TableCell>{firstService.description}</TableCell>
                              <TableCell align="right">
                                {serviceGroup.map(service => (
                                  <IconButton key={service.id} color="error" onClick={() => handleDeleteService(service.id)}>
                                    <Delete />
                                  </IconButton>
                                ))}
                              </TableCell>
                            </TableRow>
                          );
                        });
                      })()
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body2" color="text.secondary">
                            {language === 'en' ? 'No services found' : language === 'tr' ? 'Hizmet bulunamadı' : 'Услуги не найдены'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {currentTab === 3 && (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {language === 'en' ? 'Manage Workers' : language === 'tr' ? 'İşçileri Yönet' : 'Управление работниками'}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setBarberDialogOpen(true)}
                  sx={{ bgcolor: '#2d3748', '&:hover': { bgcolor: '#007562' } }}
                >
                  {language === 'en' ? 'Add Worker' : language === 'tr' ? 'İşçi Ekle' : 'Добавить работника'}
                </Button>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{language === 'en' ? 'Name' : language === 'tr' ? 'İsim' : 'Имя'}</TableCell>
                      <TableCell>{language === 'en' ? 'Email' : language === 'tr' ? 'E-posta' : 'Эл. почта'}</TableCell>
                      <TableCell>{language === 'en' ? 'Working Hours' : language === 'tr' ? 'Çalışma Saatleri' : 'Рабочее время'}</TableCell>
                      <TableCell align="right">{language === 'en' ? 'Actions' : language === 'tr' ? 'İşlemler' : 'Действия'}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {businessData.workers && businessData.workers.length > 0 ? (
                      (businessData.workers || []).map((worker) => (
                        <TableRow key={worker.id}>
                          <TableCell>{worker.full_name || `${worker.first_name || ''} ${worker.last_name || ''}`.trim() || worker.email}</TableCell>
                          <TableCell>{worker.email}</TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => openWorkerHoursDialog(worker)}
                              sx={{ textTransform: 'none' }}
                            >
                              {language === 'en' ? 'Set Hours' : language === 'tr' ? 'Saat Ayarla' : 'Установить часы'}
                            </Button>
                          </TableCell>
                          <TableCell align="right">
                            <IconButton color="error" onClick={() => removeBarber(worker.id)}>
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography variant="body2" color="text.secondary">
                            {language === 'en' ? 'No workers found' : language === 'tr' ? 'İşçi bulunamadı' : 'Работники не найдены'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {currentTab === 4 && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                {language === 'en' ? 'Appointments' : language === 'tr' ? 'Randevular' : 'Встречи'}
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{language === 'en' ? 'Customer' : language === 'tr' ? 'Müşteri' : 'Клиент'}</TableCell>
                      <TableCell>{language === 'en' ? 'Service' : language === 'tr' ? 'Hizmet' : 'Услуга'}</TableCell>
                      <TableCell>{language === 'en' ? 'Date' : language === 'tr' ? 'Tarih' : 'Дата'}</TableCell>
                      <TableCell>{language === 'en' ? 'Time' : language === 'tr' ? 'Saat' : 'Время'}</TableCell>
                      <TableCell>{language === 'en' ? 'Status' : language === 'tr' ? 'Durum' : 'Статус'}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {upcomingAppointments && upcomingAppointments.length > 0 ? (
                      (upcomingAppointments || []).map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>{appointment.customer_name}</TableCell>
                          <TableCell>{appointment.service_name}</TableCell>
                          <TableCell>
                            {formatDate(appointment.start_time, language)}
                          </TableCell>
                          <TableCell>
                            {formatTime(appointment.start_time, language)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={appointment.status}
                              size="small"
                              icon={getStatusIcon(appointment.status)}
                              sx={{
                                bgcolor: `${getStatusColor(appointment.status)}15`,
                                color: getStatusColor(appointment.status),
                                fontWeight: 'bold'
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography variant="body2" color="text.secondary">
                            {language === 'en'
                              ? 'No appointments found'
                              : language === 'tr'
                                ? 'Randevu bulunamadı'
                                : 'Встречи не найдены'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {/* Income Reports Tab */}
        {currentTab === 5 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                    💰 {language === 'en' ? 'Income Reports' : language === 'tr' ? 'Gelir Raporları' : 'Отчеты о доходах'}
                  </Typography>

                  {/* Monthly Summary */}
                  <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{
                        p: 2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: 2,
                        color: 'white'
                      }}>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          {language === 'en' ? 'This Month' : language === 'tr' ? 'Bu Ay' : 'Этот месяц'}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                          €{businessData.monthlyRevenue || 0}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{
                        p: 2,
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        borderRadius: 2,
                        color: 'white'
                      }}>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          {language === 'en' ? 'Total Bookings' : language === 'tr' ? 'Toplam Rezervasyon' : 'Всего бронирований'}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                          {upcomingAppointments?.length || 0}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{
                        p: 2,
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        borderRadius: 2,
                        color: 'white'
                      }}>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          {language === 'en' ? 'Avg. Booking Value' : language === 'tr' ? 'Ort. Rezervasyon Değeri' : 'Средний чек'}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                          €{upcomingAppointments?.length > 0 ? Math.round((businessData.monthlyRevenue || 0) / upcomingAppointments.length) : 0}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{
                        p: 2,
                        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                        borderRadius: 2,
                        color: 'white'
                      }}>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          {language === 'en' ? 'Active Services' : language === 'tr' ? 'Aktif Hizmetler' : 'Активные услуги'}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                          {businessData.services?.length || 0}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Revenue Chart Placeholder */}
                  <Box sx={{
                    border: '2px dashed #e5e7eb',
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    bgcolor: '#f9fafb'
                  }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#6b7280' }}>
                      📊 {language === 'en' ? 'Revenue Chart' : language === 'tr' ? 'Gelir Grafiği' : 'График доходов'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {language === 'en'
                        ? 'Detailed revenue analytics and charts will be displayed here'
                        : language === 'tr'
                        ? 'Detaylı gelir analitiği ve grafikler burada görüntülenecek'
                        : 'Здесь будут отображаться подробная аналитика доходов и графики'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

      </Container>

      {/* Add Service Dialog */}
      <Dialog open={serviceDialogOpen} onClose={() => setServiceDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>{t.addService}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t.serviceName}
            type="text"
            fullWidth
            variant="outlined"
            value={newService.name}
            onChange={(e) => setNewService({ ...newService, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label={t.servicePrice}
            type="number"
            fullWidth
            variant="outlined"
            value={newService.price}
            onChange={(e) => setNewService({ ...newService, price: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label={t.serviceDuration}
            type="number"
            fullWidth
            variant="outlined"
            value={newService.duration}
            onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label={language === 'en' ? 'Description' : language === 'tr' ? 'Açıklama' : 'Описание'}
            type="text"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={newService.description}
            onChange={(e) => setNewService({ ...newService, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
              {language === 'en' ? 'Select Workers *' : language === 'tr' ? 'Çalışanları Seçin *' : 'Выберите сотрудников *'}
            </Typography>
            <Select
              multiple
              value={newService.worker_ids}
              onChange={(e) => setNewService({ ...newService, worker_ids: e.target.value })}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const worker = businessData.workers?.find(w => w.id === value);
                    return (
                      <Chip key={value} label={worker?.full_name || worker?.email || `Worker ${value}`} size="small" />
                    );
                  })}
                </Box>
              )}
            >
              {(businessData.workers || []).map((worker) => (
                <MenuItem key={worker.id} value={worker.id}>
                  <Checkbox checked={newService.worker_ids.indexOf(worker.id) > -1} />
                  <ListItemText primary={worker.full_name || worker.email} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setServiceDialogOpen(false)}>{language === 'en' ? 'Cancel' : language === 'tr' ? 'İptal' : 'Отмена'}</Button>
          <Button onClick={handleAddService} variant="contained" sx={{ bgcolor: '#2d3748', '&:hover': { bgcolor: '#007562' } }}>
            {language === 'en' ? 'Add' : language === 'tr' ? 'Ekle' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Worker Dialog */}
      <Dialog open={barberDialogOpen} onClose={() => setBarberDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#edf2f7', color: '#2d3748' }}>
          {language === 'en' ? '👤 Add New Worker' : language === 'tr' ? '👤 Yeni İşçi Ekle' : '👤 Добавить нового работника'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            fullWidth
            label={language === 'en' ? 'First Name *' : language === 'tr' ? 'Ad *' : 'Имя *'}
            placeholder={language === 'en' ? 'Enter first name...' : language === 'tr' ? 'Adı girin...' : 'Введите имя...'}
            value={newWorker.first_name}
            onChange={(e) => setNewWorker({ ...newWorker, first_name: e.target.value })}
            sx={{ mb: 3 }}
            InputProps={{
              style: { fontSize: '1.1rem' }
            }}
            required
          />
          <TextField
            fullWidth
            label={language === 'en' ? 'Last Name *' : language === 'tr' ? 'Soyad *' : 'Фамилия *'}
            placeholder={language === 'en' ? 'Enter last name...' : language === 'tr' ? 'Soyadı girin...' : 'Введите фамилию...'}
            value={newWorker.last_name}
            onChange={(e) => setNewWorker({ ...newWorker, last_name: e.target.value })}
            sx={{ mb: 3 }}
            InputProps={{
              style: { fontSize: '1.1rem' }
            }}
            required
          />
          <TextField
            fullWidth
            type="email"
            label={language === 'en' ? 'Email *' : language === 'tr' ? 'E-posta *' : 'Эл. почта *'}
            placeholder="worker@example.com"
            value={newWorker.email}
            onChange={(e) => setNewWorker({ ...newWorker, email: e.target.value })}
            sx={{ mb: 3 }}
            InputProps={{
              style: { fontSize: '1.1rem' }
            }}
            required
          />
          <TextField
            fullWidth
            type="tel"
            label={language === 'en' ? 'Phone Number' : language === 'tr' ? 'Telefon Numarası' : 'Номер телефона'}
            placeholder="+90 555 123 4567"
            value={newWorker.phone_number}
            onChange={(e) => setNewWorker({ ...newWorker, phone_number: e.target.value })}
            sx={{ mb: 3 }}
            InputProps={{
              style: { fontSize: '1.1rem' }
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            {language === 'en'
              ? '* A temporary password will be assigned. The worker can change it after first login.'
              : language === 'tr'
              ? '* Geçici bir şifre atanacaktır. Çalışan ilk girişten sonra değiştirebilir.'
              : '* Будет назначен временный пароль. Работник может изменить его после первого входа.'}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setBarberDialogOpen(false)}
            sx={{ fontSize: '1rem' }}
          >
            {language === 'en' ? 'Cancel' : language === 'tr' ? 'İptal' : 'Отмена'}
          </Button>
          <Button
            onClick={addBarber}
            variant="contained"
            sx={{
              bgcolor: '#2d3748',
              '&:hover': { bgcolor: '#007562' },
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}
          >
            {language === 'en' ? '✅ Add Worker' : language === 'tr' ? '✅ İşçi Ekle' : '✅ Добавить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Photo Upload Dialog */}
      <Dialog open={photoUploadOpen} onClose={() => setPhotoUploadOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {uploadType === 'avatar'
            ? (language === 'en' ? 'Upload Profile Photo' : language === 'tr' ? 'Profil Fotoğrafı Yükle' : 'Загрузить фото профиля')
            : (language === 'en' ? 'Upload Cover Photo' : language === 'tr' ? 'Kapak Fotoğrafı Yükle' : 'Загрузить обложку')
          }
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="photo-upload-input"
              type="file"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (file) {
                  try {
                    // Upload to backend
                    const formData = new FormData();
                    formData.append('file', file);

                    const endpoint = uploadType === 'avatar' ? '/businesses/avatar' : '/businesses/cover-photo';
                    const response = await api.post(endpoint, formData, {
                      headers: {
                        'Content-Type': 'multipart/form-data'
                      }
                    });

                    // Update local state with the URL from backend
                    if (uploadType === 'avatar') {
                      setBusinessData({ ...businessData, avatar: response.data.avatar_url });
                    } else {
                      setBusinessData({ ...businessData, coverPhoto: response.data.cover_photo_url });
                    }

                    setSnackbar({
                      open: true,
                      message: language === 'en' ? 'Photo uploaded successfully!' : language === 'tr' ? 'Fotoğraf başarıyla yüklendi!' : 'Фото загружено!',
                      severity: 'success'
                    });
                    setPhotoUploadOpen(false);
                  } catch (error) {
                    console.error('Error uploading photo:', error);
                    setSnackbar({
                      open: true,
                      message: language === 'en' ? 'Failed to upload photo' : language === 'tr' ? 'Fotoğraf yüklenemedi' : 'Ошибка загрузки',
                      severity: 'error'
                    });
                  }
                }
              }}
            />
            <label htmlFor="photo-upload-input">
              <Button
                variant="contained"
                component="span"
                sx={{ bgcolor: '#2d3748', '&:hover': { bgcolor: '#007562' } }}
              >
                {language === 'en' ? 'Choose Photo' : language === 'tr' ? 'Fotoğraf Seç' : 'Выбрать фото'}
              </Button>
            </label>
            <Typography variant="caption" display="block" sx={{ mt: 2 }} color="text.secondary">
              {language === 'en' ? 'Recommended: JPG, PNG (Max 5MB)' : language === 'tr' ? 'Önerilen: JPG, PNG (Max 5MB)' : 'Рекомендуется: JPG, PNG (Max 5MB)'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPhotoUploadOpen(false)}>
            {language === 'en' ? 'Cancel' : language === 'tr' ? 'İptal' : 'Отмена'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Profile Edit Dialog */}
      <Dialog open={profileEditOpen} onClose={() => setProfileEditOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {language === 'en' ? 'Edit Business Profile' : language === 'tr' ? 'İşletme Profilini Düzenle' : 'Редактировать профиль'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={language === 'en' ? 'Business Name' : language === 'tr' ? 'İşletme Adı' : 'Название бизнеса'}
                  value={businessData.name}
                  onChange={(e) => setBusinessData({ ...businessData, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={language === 'en' ? 'Owner Name' : language === 'tr' ? 'Sahip Adı' : 'Имя владельца'}
                  value={businessData.owner_name}
                  onChange={(e) => setBusinessData({ ...businessData, owner_name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={language === 'en' ? 'Phone' : language === 'tr' ? 'Telefon' : 'Телефон'}
                  value={businessData.phone}
                  onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={language === 'en' ? 'Email' : language === 'tr' ? 'E-posta' : 'Email'}
                  value={businessData.email}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={language === 'en' ? 'Address' : language === 'tr' ? 'Adres' : 'Адрес'}
                  value={businessData.address}
                  onChange={(e) => setBusinessData({ ...businessData, address: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={language === 'en' ? 'City' : language === 'tr' ? 'Şehir' : 'Город'}
                  value={businessData.city}
                  onChange={(e) => setBusinessData({ ...businessData, city: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={language === 'en' ? 'Description' : language === 'tr' ? 'Açıklama' : 'Описание'}
                  value={businessData.description || ''}
                  onChange={(e) => setBusinessData({ ...businessData, description: e.target.value })}
                  placeholder={language === 'en' ? 'Tell customers about your business...' : language === 'tr' ? 'Müşterilere işletmenizden bahsedin...' : 'Расскажите о своем бизнесе...'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Facebook URL"
                  value={businessData.facebook || ''}
                  onChange={(e) => setBusinessData({ ...businessData, facebook: e.target.value })}
                  placeholder="https://facebook.com/yourbusiness"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Instagram URL"
                  value={businessData.instagram || ''}
                  onChange={(e) => setBusinessData({ ...businessData, instagram: e.target.value })}
                  placeholder="https://instagram.com/yourbusiness"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileEditOpen(false)}>
            {language === 'en' ? 'Cancel' : language === 'tr' ? 'İptal' : 'Отмена'}
          </Button>
          <Button
            onClick={async () => {
              try {
                await businessAPI.updateProfile(businessData);
                setSnackbar({
                  open: true,
                  message: language === 'en' ? 'Profile updated successfully!' : language === 'tr' ? 'Profil başarıyla güncellendi!' : 'Профиль обновлен!',
                  severity: 'success'
                });
                setProfileEditOpen(false);
              } catch (err) {
                setSnackbar({
                  open: true,
                  message: language === 'en' ? 'Failed to update profile' : language === 'tr' ? 'Profil güncellenemedi' : 'Не удалось обновить профиль',
                  severity: 'error'
                });
              }
            }}
            variant="contained"
            sx={{ bgcolor: '#2d3748', '&:hover': { bgcolor: '#007562' } }}
          >
            {language === 'en' ? 'Save Changes' : language === 'tr' ? 'Değişiklikleri Kaydet' : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Worker Hours Dialog */}
      <Dialog
        open={workerHoursDialogOpen}
        onClose={() => setWorkerHoursDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {language === 'en' ? 'Working Hours for ' : language === 'tr' ? 'Çalışma Saatleri: ' : 'Рабочее время: '}
          {selectedWorkerForHours?.full_name || selectedWorkerForHours?.first_name || ''}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {workerHours.map((hour, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                <Box sx={{ width: 100 }}>
                  <Typography variant="body2" fontWeight="bold">
                    {dayNames[language]?.[hour.day_of_week] || dayNames.en[hour.day_of_week]}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                  <input
                    type="checkbox"
                    checked={hour.is_working}
                    onChange={(e) => {
                      const newHours = [...workerHours];
                      newHours[index].is_working = e.target.checked;
                      setWorkerHours(newHours);
                    }}
                  />
                  {hour.is_working ? (
                    <>
                      <TextField
                        size="small"
                        type="time"
                        value={hour.start_time}
                        onChange={(e) => {
                          const newHours = [...workerHours];
                          newHours[index].start_time = e.target.value;
                          setWorkerHours(newHours);
                        }}
                        sx={{ width: 120 }}
                      />
                      <Typography>-</Typography>
                      <TextField
                        size="small"
                        type="time"
                        value={hour.end_time}
                        onChange={(e) => {
                          const newHours = [...workerHours];
                          newHours[index].end_time = e.target.value;
                          setWorkerHours(newHours);
                        }}
                        sx={{ width: 120 }}
                      />
                    </>
                  ) : (
                    <Typography color="text.secondary">
                      {language === 'en' ? 'Day Off' : language === 'tr' ? 'Tatil' : 'Выходной'}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWorkerHoursDialogOpen(false)}>
            {language === 'en' ? 'Cancel' : language === 'tr' ? 'İptal' : 'Отмена'}
          </Button>
          <Button
            variant="contained"
            onClick={saveWorkerHours}
            sx={{ bgcolor: '#00BFA6', '&:hover': { bgcolor: '#00A693' } }}
          >
            {language === 'en' ? 'Save Hours' : language === 'tr' ? 'Saatleri Kaydet' : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default BusinessDashboard;