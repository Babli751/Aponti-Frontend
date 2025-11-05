import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { getServicesCatalog } from '../data/servicesCatalog';
import { TextField, Button, MenuItem, Box, Typography } from '@mui/material';

export default function AppointmentForm({ barberId }) {
  const { language } = useLanguage();
  const [date, setDate] = useState('');
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');

  // Load services: try API then fallback to local catalog matching Services page
  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get(`/services`, { params: { barberId } });
        const data = Array.isArray(response.data) ? response.data : (response.data?.items || []);
        if (data.length > 0) {
          setServices(data.map((s) => ({
            id: s.id || s._id || s.uuid || s.service_id || String(Math.random()),
            name: s.name,
            price: s.price,
            duration: s.duration
          })));
          return;
        }
        throw new Error('Empty services');
      } catch (_) {
        const { services } = getServicesCatalog(language);
        setServices(services);
      }
    };
    load();
  }, [barberId, language]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      barber_id: barberId,
      service_id: selectedService,
      start_time: new Date(date).toISOString()
    };
    try {
      await api.post('/bookings/', payload);
      alert(language === 'tr' ? 'Randevu başarıyla oluşturuldu!' : language === 'ru' ? 'Запись успешно создана!' : 'Appointment created successfully!');
    } catch (err) {
      // Fallback: store locally so app works without backend
      const list = JSON.parse(localStorage.getItem('appointments') || '[]');
      const service = services.find(s => s.id === selectedService);
      list.push({ id: Date.now().toString(), barberId, serviceId: selectedService, serviceName: service?.name, date: payload.start_time });
      localStorage.setItem('appointments', JSON.stringify(list));
      alert(language === 'tr' ? 'Randevu oluşturuldu (yerel kayıt).' : language === 'ru' ? 'Запись создана (локально).' : 'Appointment saved locally.');
    }
  };

  const labels = {
    title: language === 'en' ? 'Make Appointment' : language === 'tr' ? 'Randevu Al' : 'Записаться',
    selectService: language === 'en' ? 'Select Service' : language === 'tr' ? 'Hizmet Seçin' : 'Выберите услугу',
    dateTime: language === 'en' ? 'Date & Time' : language === 'tr' ? 'Tarih ve Saat' : 'Дата и время',
    book: language === 'en' ? 'Book' : language === 'tr' ? 'Randevu Al' : 'Забронировать'
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Typography variant="h6">{labels.title}</Typography>
      <TextField
        select
        label={labels.selectService}
        value={selectedService}
        onChange={(e) => setSelectedService(e.target.value)}
        fullWidth
        margin="normal"
        required
      >
        {(services || []).map((service) => (
          <MenuItem key={service.id} value={service.id}>
            {service.name} • €{service.price} ({service.duration} min)
          </MenuItem>
        ))}
      </TextField>
      <TextField
        type="datetime-local"
        label={labels.dateTime}
        value={date}
        onChange={(e) => setDate(e.target.value)}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        required
      />
      <Button type="submit" variant="contained" sx={{ mt: 2 }}>
        {labels.book}
      </Button>
    </Box>
  );
}
