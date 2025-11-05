import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Logo from '../components/Logo';
import api, { businessAPI } from '../services/api';
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  TextField,
  Button,
  Chip,
  Stack,
  Grow
} from '@mui/material';
import { ArrowBack, ContentCut } from '@mui/icons-material';

const Appointment = () => {
  const navigate = useNavigate();
  const { language, changeLanguage, t } = useLanguage();

  const [businesses, setBusinesses] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [selectedBarberId, setSelectedBarberId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedTime, setSelectedTime] = useState('');

  const addDays = (dateStr, days) => {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };
  const formatDayLabel = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(language === 'ru' ? 'ru-RU' : language === 'tr' ? 'tr-TR' : 'en-GB', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  const timeSlots = React.useMemo(() => {
    const slots = [];
    let h = 9, m = 0; // 09:00 - 19:00
    while (h < 19 || (h === 19 && m === 0)) {
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      slots.push(`${hh}:${mm}`);
      m += 30;
      if (m >= 60) { m = 0; h += 1; }
    }
    return slots;
  }, []);
  const weekDays = React.useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(selectedDate, i)), [selectedDate]);

  // Businesses fetch
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        console.log('Fetching businesses...');
        // Use direct fetch to avoid axios interceptors
        const API_BASE_URL = window.API_BASE_URL || '/api/v1';
        const response = await fetch(`${API_BASE_URL}/business/list`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Businesses data:', data);
        const normalized = (data && Array.isArray(data)) ? data.map(b => ({
          id: b.id,
          name: b.business_name || b.name
        })) : [];
        console.log('Normalized businesses:', normalized);
        setBusinesses(normalized);
        setSelectedBusinessId(normalized[0]?.id || '');
      } catch (error) {
        console.error('Error fetching businesses:', error);
        setBusinesses([]);
        setSelectedBusinessId('');
      }
    };
    fetchBusinesses();
  }, []);

  // Workers fetch (backend already filters to workers only)
  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/barbers/');
        const normalized = (data && Array.isArray(data)) ? data.map(b => ({
          id: b.id,
          name: b.full_name || b.name || b.email
        })) : [];
        setBarbers(normalized);
        setSelectedBarberId(normalized[0]?.id || '');
        setError('');
      } catch (error) {
        console.error('Error fetching workers:', error);
        setBarbers([]);
        setSelectedBarberId('');
        setError('Could not fetch workers');
      } finally {
        setLoading(false);
      }
    };
    fetchBarbers();
  }, [language]);

  // Services fetch
  useEffect(() => {
    const fetchServices = async () => {
      try {
        console.log('Fetching services...');
        const { data } = await api.get('/services/');
        console.log('Services data:', data);
        setServices(data && Array.isArray(data) ? data : []);
        setSelectedServiceId(data[0]?.id || '');
      } catch (err) {
        console.error("❌ Error fetching services:", err.response?.data || err.message);
        setServices([]);
        setSelectedServiceId('');
      }
    };
    fetchServices();
  }, []);

  const labels = {
    title: language === 'en' ? 'Make an Appointment' : language === 'tr' ? 'Randevu Al' : 'Записаться'
  };

  const handleBook = async () => {
    if (!selectedBarberId || !selectedServiceId || !selectedDate || !selectedTime) {
      alert(language === 'tr' ? "Lütfen tüm alanları doldurun" : "Please fill all fields");
      return;
    }

    try {
      const selectedDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
      const iso = selectedDateTime.toISOString();

      const payload = {
        barber_id: Number(selectedBarberId),
        service_id: Number(selectedServiceId),
        start_time: iso,
        notes: "Online booking"
      };

      console.log("📤 Booking payload >>>", payload);

      await api.post('/bookings/', payload);
      alert(language === 'tr' ? "Randevu oluşturuldu!" : "Appointment created!");
    } catch (err) {
      console.error("❌ Booking error >>>", err.response?.data || err.message);
      alert(language === 'tr'
        ? "Randevu hatası: " + JSON.stringify(err.response?.data)
        : "Booking error: " + JSON.stringify(err.response?.data));
    }
  };

  return (
    <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={0} sx={{
        background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)',
        borderBottom: '1px solid #1a202c'
      }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
            <Box sx={{ flexGrow: 1 }}>
              <Logo size="small" variant="color" />
            </Box>

            <FormControl size="small" sx={{ minWidth: 100 }}>
              <Select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                  '& .MuiSvgIcon-root': { color: 'white' }
                }}
              >
                <MenuItem value="en">🇬🇧 English</MenuItem>
                <MenuItem value="tr">🇹🇷 Türkçe</MenuItem>
                <MenuItem value="ru">🇷🇺 Русский</MenuItem>
              </Select>
            </FormControl>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <ContentCut sx={{ color: '#2d3748' }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1f2937' }}>{labels.title}</Typography>
            </Box>

            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress sx={{ color: '#2d3748' }} />
              </Box>
            )}

            {!loading && barbers.length === 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {language === 'en'
                  ? 'No workers available yet.'
                  : language === 'tr'
                    ? 'Henüz çalışan yok.'
                    : 'Работники недоступны.'}
              </Alert>
            )}

            {!loading && (
              <Grid container spacing={3}>
                {/* Business select */}
                <Grid item xs={12} md={4}>
                  <Grow in timeout={150}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: '#6b7280' }}>
                        {language === 'en' ? 'Select Business' : language === 'tr' ? 'İşletme Seçin' : 'Выберите бизнес'}
                      </Typography>
                      <FormControl fullWidth>
                        <Select
                          value={selectedBusinessId || ""}
                          onChange={(e) => setSelectedBusinessId(e.target.value)}
                        >
                          <MenuItem value="">
                            {language === 'en' ? 'Select Business' : language === 'tr' ? 'İşletme Seçin' : 'Выберите бизнес'}
                          </MenuItem>
                          {(businesses || []).map((b) => (
                            <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  </Grow>
                </Grid>

                {/* Workers select */}
                <Grid item xs={12} md={4}>
                  <Grow in timeout={300}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: '#6b7280' }}>
                        {language === 'en' ? 'Select Workers' : language === 'tr' ? 'Çalışan Seçin' : 'Выберите рабо��ников'}
                      </Typography>
                      <FormControl fullWidth>
                        <Select
                          value={selectedBarberId || ""}
                          onChange={(e) => setSelectedBarberId(e.target.value)}
                        >
                          <MenuItem value="">
                            {language === 'en' ? 'Select Workers' : language === 'tr' ? 'Çalışan Seçin' : 'Выберите работников'}
                          </MenuItem>
                          {(barbers || []).map((b) => (
                            <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  </Grow>
                </Grid>

                {/* Service select */}
                <Grid item xs={12} md={4}>
                  <Grow in timeout={450}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: '#6b7280' }}>
                        {language === 'en' ? 'Select Service' : language === 'tr' ? 'Hizmet Seçin' : 'Выберите услугу'}
                      </Typography>
                      <FormControl fullWidth>
                        <Select
                          value={selectedServiceId || ""}
                          onChange={(e) => setSelectedServiceId(Number(e.target.value))}
                        >
                          <MenuItem value="">
                            {language === 'en' ? 'Select Service' : language === 'tr' ? 'Hizmet Seçin' : 'Выберите услугу'}
                          </MenuItem>
                          {(services || []).map((s) => (
                            <MenuItem key={s.id} value={s.id}>
                              {s.name} • €{s.price} ({s.duration} min)
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  </Grow>
                </Grid>

                {/* Date & Time */}
                <Grid item xs={12} md={8}>
                  <Grow in timeout={600}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: '#6b7280' }}>
                        {language === 'en' ? 'Select Date & Time' : language === 'tr' ? 'Tarih ve Saat Seçin' : 'Выберите дату и время'}
                      </Typography>

                      {/* Week day scroller */}
                      <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1, mb: 2 }}>
                        {(weekDays || []).map((d) => (
                          <Button
                            key={d}
                            variant={selectedDate === d ? 'contained' : 'outlined'}
                            onClick={() => { setSelectedDate(d); setSelectedTime(''); }}
                            sx={{
                              whiteSpace: 'nowrap',
                              bgcolor: selectedDate === d ? '#2d3748' : 'transparent',
                              color: selectedDate === d ? 'white' : '#1f2937',
                              borderColor: '#2d3748',
                              '&:hover': { bgcolor: selectedDate === d ? '#007562' : '#e6f7f5' }
                            }}
                          >
                            {formatDayLabel(d)}
                          </Button>
                        ))}
                      </Stack>

                      {/* Time grid */}
                      <Grid container spacing={1} columns={{ xs: 12, sm: 12, md: 12 }}>
                        {(timeSlots || []).map((t) => (
                          <Grid key={t} item xs={4} sm={3} md={2}>
                            <Button
                              fullWidth
                              variant={selectedTime === t ? 'contained' : 'outlined'}
                              onClick={() => setSelectedTime(t)}
                              sx={{
                                bgcolor: selectedTime === t ? '#2d3748' : 'white',
                                color: selectedTime === t ? 'white' : '#1f2937',
                                borderColor: selectedTime === t ? '#2d3748' : '#e5e7eb',
                                fontWeight: 600
                              }}
                            >
                              {t}
                            </Button>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </Grow>
                </Grid>

                {/* Selected date preview */}
                <Grid item xs={12} md={4}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>
                        {language === 'en' ? 'Selection' : language === 'tr' ? 'Seçim' : 'Выбор'}
                      </Typography>
                      <Stack spacing={1}>
                        <TextField
                          type="date"
                          label={language === 'en' ? 'Date' : language === 'tr' ? 'Tarih' : 'Дата'}
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                          label={language === 'en' ? 'Time' : language === 'tr' ? 'Saat' : 'Время'}
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          placeholder="--:--"
                        />
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Book button */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <Button
                      variant="contained"
                      size="large"
                      sx={{ bgcolor: '#2d3748', '&:hover': { bgcolor: '#007562' } }}
                      disabled={!selectedBarberId || !selectedServiceId || !selectedDate || !selectedTime}
                      onClick={handleBook}
                    >
                      {language === 'en' ? 'Book' : language === 'tr' ? 'Randevu Al' : 'Забронировать'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Appointment;
