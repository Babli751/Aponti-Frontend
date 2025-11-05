import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  Stack
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn,
  Send
} from '@mui/icons-material';
import Header from '../components/Header';

const ContactUs = () => {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setError(language === 'en'
        ? 'Please fill all fields'
        : language === 'tr'
          ? 'Lütfen tüm alanları doldurun'
          : 'Заполните все поля');
      return;
    }

    // TODO: Send to backend API
    console.log('Contact form submitted:', formData);

    // Simulate success
    setSuccess(true);
    setFormData({ name: '', email: '', subject: '', message: '' });

    // Hide success message after 5 seconds
    setTimeout(() => setSuccess(false), 5000);
  };

  const content = {
    en: {
      title: 'Contact Us',
      subtitle: 'Get in touch with our team',
      name: 'Full Name',
      email: 'Email Address',
      subject: 'Subject',
      message: 'Message',
      send: 'Send Message',
      successMessage: 'Thank you! Your message has been sent successfully.',
      contactInfo: 'Contact Information',
      phone: '+1 (555) 123-4567',
      emailAddress: 'info@aponti.com',
      address: 'Berlin, Germany'
    },
    tr: {
      title: 'İletişim',
      subtitle: 'Ekibimizle iletişime geçin',
      name: 'Ad Soyad',
      email: 'E-posta Adresi',
      subject: 'Konu',
      message: 'Mesaj',
      send: 'Gönder',
      successMessage: 'Teşekkürler! Mesajınız başarıyla gönderildi.',
      contactInfo: 'İletişim Bilgileri',
      phone: '+1 (555) 123-4567',
      emailAddress: 'info@aponti.com',
      address: 'Berlin, Almanya'
    },
    ru: {
      title: 'Контакт',
      subtitle: 'Свяжитесь с нашей командой',
      name: 'Полное имя',
      email: 'Электронная почта',
      subject: 'Тема',
      message: 'Сообщение',
      send: 'Отправить',
      successMessage: 'Спасибо! Ваше сообщение успешно отправлено.',
      contactInfo: 'Контактная информация',
      phone: '+1 (555) 123-4567',
      emailAddress: 'info@aponti.com',
      address: 'Берлин, Германия'
    }
  };

  const t = content[language] || content.en;

  return (
    <>
      <Header />
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 8
      }}>
        <Container maxWidth="lg">
          <Typography variant="h2" sx={{
            color: 'white',
            fontWeight: 'bold',
            textAlign: 'center',
            mb: 2
          }}>
            {t.title}
          </Typography>
          <Typography variant="h5" sx={{
            color: 'rgba(255,255,255,0.9)',
            textAlign: 'center',
            mb: 6
          }}>
            {t.subtitle}
          </Typography>

          <Grid container spacing={4}>
            {/* Contact Form */}
            <Grid item xs={12} md={7}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ p: 4 }}>
                  {success && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                      {t.successMessage}
                    </Alert>
                  )}
                  {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label={t.name}
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label={t.email}
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label={t.subject}
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label={t.message}
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          variant="outlined"
                          multiline
                          rows={6}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          fullWidth
                          size="large"
                          startIcon={<Send />}
                          sx={{
                            bgcolor: '#667eea',
                            py: 2,
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            '&:hover': {
                              bgcolor: '#5568d3',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)'
                            }
                          }}
                        >
                          {t.send}
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </CardContent>
              </Card>
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12} md={5}>
              <Card sx={{
                borderRadius: 3,
                bgcolor: 'rgba(255,255,255,0.95)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
                    {t.contactInfo}
                  </Typography>

                  <Stack spacing={3}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Phone sx={{ color: '#667eea', fontSize: 30 }} />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          {language === 'en' ? 'Phone' : language === 'tr' ? 'Telefon' : 'Телефон'}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {t.phone}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Email sx={{ color: '#667eea', fontSize: 30 }} />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {t.emailAddress}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <LocationOn sx={{ color: '#667eea', fontSize: 30 }} />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          {language === 'en' ? 'Address' : language === 'tr' ? 'Adres' : 'Адрес'}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {t.address}
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>

                  <Box sx={{
                    mt: 4,
                    p: 3,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
                  }}>
                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                      {language === 'en'
                        ? 'We typically respond within 24 hours on business days.'
                        : language === 'tr'
                          ? 'Genellikle iş günlerinde 24 saat içinde yanıt veriyoruz.'
                          : 'Обычно мы отвечаем в течение 24 часов в рабочие дни.'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default ContactUs;
