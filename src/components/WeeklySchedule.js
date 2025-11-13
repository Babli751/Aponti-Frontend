import React, { useState } from 'react';
import {
  Box, Typography, Paper, Grid, IconButton, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, Chip
} from '@mui/material';
import { ChevronLeft, ChevronRight, AccessTime, Person, EventAvailable } from '@mui/icons-material';

const WeeklySchedule = ({ appointments = [], onAddAvailability, language = 'en' }) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Start from Monday
    return new Date(today.setDate(diff));
  });
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Time slots (8 AM to 11 PM, 30-minute intervals)
  const timeSlots = [];
  for (let hour = 8; hour <= 23; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 23) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }

  // Get week days starting from Monday - show 1 week (7 days)
  const getWeekDays = (startDate) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const weekDays = getWeekDays(currentWeekStart);

  const dayNames = {
    en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    tr: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cts', 'Paz'],
    ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    setCurrentWeekStart(new Date(today.setDate(diff)));
  };

  // Check if a slot has an appointment
  const getSlotStatus = (day, time) => {
    const dateStr = day.toISOString().split('T')[0];

    // Find appointment matching this date and time
    const appointment = appointments.find(apt => {
      if (!apt.start_time && !apt.appointment_date && !apt.date) return false;

      // Handle different date/time formats
      let aptDate, aptTime;

      if (apt.start_time) {
        // Format: "2024-10-02T14:30:00" or "2024-10-02 14:30:00"
        const dateTimeStr = apt.start_time.replace(' ', 'T');
        const parts = dateTimeStr.split('T');
        aptDate = parts[0];
        aptTime = parts[1] ? parts[1].substring(0, 5) : null;
      } else if (apt.appointment_date && apt.appointment_time) {
        // Separate date and time fields
        aptDate = apt.appointment_date;
        aptTime = apt.appointment_time.substring(0, 5);
      } else if (apt.date && apt.time) {
        // Legacy format
        aptDate = apt.date;
        aptTime = apt.time.substring(0, 5);
      }

      return aptDate === dateStr && aptTime === time;
    });

    if (appointment) {
      return {
        status: 'booked',
        appointment: {
          id: appointment.id,
          customerName: appointment.customer_name || appointment.customerName || 'Customer',
          serviceName: appointment.service?.name || appointment.service_name || appointment.serviceName || 'Service',
          customerPhone: appointment.customer_phone || appointment.customerPhone || '',
          workerName: appointment.worker_name || appointment.workerName || '',
          status: appointment.status || 'confirmed'
        }
      };
    }
    return { status: 'available' };
  };

  const handleSlotClick = (day, time) => {
    const slot = getSlotStatus(day, time);
    setSelectedSlot({ day, time, ...slot });
    setDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return '#2d3748';
      case 'pending':
        return '#f59e0b';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#2d3748';
    }
  };

  return (
    <Box>
      {/* Header with navigation */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3,
        p: 2,
        bgcolor: 'linear-gradient(135deg, #edf2f7 0%, #b2dfdb 100%)',
        borderRadius: 2,
        border: '1px solid #2d3748'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccessTime sx={{ color: '#2d3748', fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#00695c' }}>
            {language === 'en' ? 'Weekly Schedule' : language === 'tr' ? 'Haftalık Program' : 'Недельный график'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            size="small"
            onClick={goToToday}
            variant="contained"
            sx={{
              bgcolor: '#2d3748',
              '&:hover': { bgcolor: '#007562' },
              fontWeight: 'bold'
            }}
          >
            {language === 'en' ? 'Today' : language === 'tr' ? 'Bugün' : 'Сегодня'}
          </Button>
          <IconButton
            onClick={goToPreviousWeek}
            size="small"
            sx={{
              bgcolor: 'white',
              '&:hover': { bgcolor: '#edf2f7' }
            }}
          >
            <ChevronLeft />
          </IconButton>
          <Typography variant="body1" sx={{ minWidth: 180, textAlign: 'center', fontWeight: 600, color: '#00695c' }}>
            {weekDays[0].toLocaleDateString(language, { month: 'long', year: 'numeric' })}
          </Typography>
          <IconButton
            onClick={goToNextWeek}
            size="small"
            sx={{
              bgcolor: 'white',
              '&:hover': { bgcolor: '#edf2f7' }
            }}
          >
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>

      {/* Legend */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap', px: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EventAvailable sx={{ color: '#4caf50', fontSize: 20 }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {language === 'en' ? 'Available' : language === 'tr' ? 'Müsait' : 'Доступно'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 20, height: 20, bgcolor: '#2d3748', borderRadius: 1 }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {language === 'en' ? 'Confirmed' : language === 'tr' ? 'Onaylandı' : 'Подтверждено'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 20, height: 20, bgcolor: '#f59e0b', borderRadius: 1 }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {language === 'en' ? 'Pending' : language === 'tr' ? 'Beklemede' : 'Ожидание'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 20, height: 20, bgcolor: '#ef4444', borderRadius: 1 }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {language === 'en' ? 'Cancelled' : language === 'tr' ? 'İptal Edildi' : 'Отменено'}
          </Typography>
        </Box>
      </Box>

      {/* Schedule Grid - Modern Style */}
      <Paper sx={{
        overflow: 'hidden',
        overflowY: 'auto',
        maxHeight: 500,
        boxShadow: '0 4px 12px rgba(0,166,147,0.15)',
        borderRadius: 2,
        border: '1px solid #edf2f7'
      }}>
        <Box sx={{ width: '100%' }}>
          {/* Days Header */}
          <Grid container sx={{
            position: 'sticky',
            top: 0,
            bgcolor: 'white',
            zIndex: 10,
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <Grid item sx={{
              py: 2.5,
              px: 2,
              width: '12.5%',
              borderRight: '3px solid #2d3748',
              borderBottom: '3px solid #2d3748',
              bgcolor: 'linear-gradient(135deg, #edf2f7 0%, #b2dfdb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box'
            }}>
              <Typography variant="body2" fontWeight="bold" sx={{ color: '#00695c' }}>
                {language === 'en' ? 'TIME' : language === 'tr' ? 'SAAT' : 'ВРЕМЯ'}
              </Typography>
            </Grid>
            {weekDays.map((day, index) => {
              const isToday = day.toDateString() === new Date().toDateString();
              const dayIndex = (day.getDay() + 6) % 7; // Convert to Monday-first
              return (
                <Grid item key={index} sx={{
                  py: 2.5,
                  px: 1,
                  width: '12.5%',
                  textAlign: 'center',
                  borderRight: '3px solid #2d3748',
                  borderBottom: '3px solid #2d3748',
                  bgcolor: 'linear-gradient(135deg, #edf2f7 0%, #b2dfdb 100%)',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}>
                  <Typography variant="caption" fontWeight="bold" sx={{
                    color: '#00695c',
                    mb: 0.3,
                    fontSize: '0.65rem'
                  }}>
                    {(dayNames[language] || dayNames.en)[dayIndex]}
                  </Typography>
                  <Box sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 32,
                    minHeight: 32,
                    borderRadius: 2,
                    bgcolor: isToday ? '#2d3748' : 'transparent',
                    px: 1,
                    py: 0.3
                  }}>
                    <Typography variant="body2" sx={{
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      color: isToday ? 'white' : '#1f2937'
                    }}>
                      {day.getDate()}
                    </Typography>
                  </Box>
                  {isToday && (
                    <Typography variant="caption" sx={{
                      display: 'block',
                      color: '#2d3748',
                      fontWeight: 'bold',
                      mt: 0.3,
                      fontSize: '0.55rem'
                    }}>
                      {language === 'en' ? 'TODAY' : language === 'tr' ? 'BUGÜN' : 'СЕГОДНЯ'}
                    </Typography>
                  )}
                </Grid>
              );
            })}
          </Grid>

          {/* Time Slots */}
          {timeSlots.map((time, timeIndex) => (
            <Grid container key={time} sx={{
              '&:hover': {
                bgcolor: '#f9fafb'
              }
            }}>
              <Grid item sx={{
                py: 3.5,
                px: 2,
                width: '12.5%',
                borderRight: '3px solid #2d3748',
                borderBottom: '3px solid #2d3748',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: timeIndex % 2 === 0 ? '#fafafa' : 'white',
                boxSizing: 'border-box'
              }}>
                <Typography variant="body2" fontWeight="600" sx={{ color: '#374151' }}>
                  {time}
                </Typography>
              </Grid>
              {weekDays.map((day, index) => {
                const slotInfo = getSlotStatus(day, time);
                const isToday = day.toDateString() === new Date().toDateString();
                return (
                  <Grid
                    item
                    key={index}
                    onClick={() => handleSlotClick(day, time)}
                    sx={{
                      py: 3.5,
                      px: 1,
                      width: '12.5%',
                      borderRight: '3px solid #2d3748',
                      borderBottom: '3px solid #2d3748',
                      cursor: 'pointer',
                      minHeight: 85,
                      bgcolor: isToday ? '#edf2f7' : 'white',
                      transition: 'all 0.15s',
                      boxSizing: 'border-box',
                      '&:hover': {
                        bgcolor: isToday ? '#b2dfdb' : '#f0fdfa'
                      }
                    }}
                  >
                    {slotInfo.status === 'booked' ? (
                      <Box sx={{
                        bgcolor: getStatusColor(slotInfo.appointment.status),
                        color: 'white',
                        borderRadius: 1,
                        p: 0.5,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: '0 3px 8px rgba(0,0,0,0.25)',
                          transform: 'translateY(-1px)'
                        }
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, mb: 0.2 }}>
                          <Person sx={{ fontSize: 10, opacity: 0.9 }} />
                          <Typography variant="caption" sx={{
                            fontWeight: 'bold',
                            fontSize: '0.6rem',
                            lineHeight: 1.1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {slotInfo.appointment.customerName}
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{
                          fontSize: '0.55rem',
                          opacity: 0.85,
                          lineHeight: 1.1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {slotInfo.appointment.serviceName}
                        </Typography>
                      </Box>
                    ) : null}
                  </Grid>
                );
              })}
            </Grid>
          ))}
        </Box>
      </Paper>

      {/* Slot Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,166,147,0.2)'
          }
        }}
      >
        <DialogTitle sx={{
          bgcolor: 'linear-gradient(135deg, #edf2f7 0%, #b2dfdb 100%)',
          borderBottom: '2px solid #2d3748',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <AccessTime sx={{ color: '#2d3748' }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#00695c' }}>
              {selectedSlot?.day?.toLocaleDateString(language, { weekday: 'long', month: 'long', day: 'numeric' })}
            </Typography>
            <Typography variant="body2" sx={{ color: '#2d3748', fontWeight: 600 }}>
              {selectedSlot?.time}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedSlot?.status === 'booked' ? (
            <Box>
              <Box sx={{
                bgcolor: '#f0fdfa',
                borderRadius: 2,
                p: 2,
                mb: 2,
                border: '1px solid #2d3748'
              }}>
                <Typography variant="subtitle2" gutterBottom sx={{
                  fontWeight: 'bold',
                  color: '#00695c',
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Person sx={{ fontSize: 20 }} />
                  {language === 'en' ? 'Appointment Details' : language === 'tr' ? 'Randevu Detayları' : 'Детали записи'}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                      {language === 'en' ? 'Customer' : language === 'tr' ? 'Müşteri' : 'Клиент'}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>
                      {selectedSlot?.appointment?.customerName}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                      {language === 'en' ? 'Service' : language === 'tr' ? 'Hizmet' : 'Услуга'}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>
                      {selectedSlot?.appointment?.serviceName}
                    </Typography>
                  </Box>

                  {selectedSlot?.appointment?.workerName && (
                    <Box>
                      <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                        {language === 'en' ? 'Worker' : language === 'tr' ? 'Çalışan' : 'Работник'}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>
                        {selectedSlot?.appointment?.workerName}
                      </Typography>
                    </Box>
                  )}

                  {selectedSlot?.appointment?.customerPhone && (
                    <Box>
                      <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                        {language === 'en' ? 'Phone' : language === 'tr' ? 'Telefon' : 'Телефон'}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>
                        {selectedSlot?.appointment?.customerPhone}
                      </Typography>
                    </Box>
                  )}

                  <Box>
                    <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600, mb: 0.5 }}>
                      {language === 'en' ? 'Status' : language === 'tr' ? 'Durum' : 'Статус'}
                    </Typography>
                    <Chip
                      label={
                        selectedSlot?.appointment?.status === 'confirmed'
                          ? (language === 'en' ? 'Confirmed' : language === 'tr' ? 'Onaylandı' : 'Подтверждено')
                          : selectedSlot?.appointment?.status === 'pending'
                            ? (language === 'en' ? 'Pending' : language === 'tr' ? 'Beklemede' : 'Ожидание')
                            : (language === 'en' ? 'Cancelled' : language === 'tr' ? 'İptal Edildi' : 'Отменено')
                      }
                      size="small"
                      sx={{
                        bgcolor: `${getStatusColor(selectedSlot?.appointment?.status)}20`,
                        color: getStatusColor(selectedSlot?.appointment?.status),
                        fontWeight: 'bold',
                        border: `1px solid ${getStatusColor(selectedSlot?.appointment?.status)}`
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box sx={{
              textAlign: 'center',
              py: 4,
              bgcolor: '#f0fdf4',
              borderRadius: 2,
              border: '1px dashed #4caf50'
            }}>
              <EventAvailable sx={{ fontSize: 48, color: '#4caf50', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#166534', mb: 1 }}>
                {language === 'en' ? 'Available Slot' : language === 'tr' ? 'Müsait Saat' : 'Доступный слот'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#16a34a' }}>
                {language === 'en' ? 'This time slot is available for booking' : language === 'tr' ? 'Bu saat rezervasyon için müsait' : 'Этот слот доступен для бронирования'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f9fafb' }}>
          <Button
            onClick={() => setDialogOpen(false)}
            variant="contained"
            sx={{
              bgcolor: '#2d3748',
              '&:hover': { bgcolor: '#007562' },
              fontWeight: 'bold',
              px: 3
            }}
          >
            {language === 'en' ? 'Close' : language === 'tr' ? 'Kapat' : 'Закрыть'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WeeklySchedule;
