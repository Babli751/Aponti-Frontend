import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();

  useEffect(() => {
    // Log payment parameters for debugging
    const orderId = searchParams.get('merchant-order-id');
    const totalPrice = searchParams.get('total');
    console.log('Payment success - Order ID:', orderId, 'Total:', totalPrice);
  }, [searchParams]);

  const content = {
    en: {
      title: 'Payment Successful!',
      message: 'Your booking has been confirmed and payment completed successfully.',
      viewBookings: 'View My Bookings',
      orderNumber: 'Order Number'
    },
    tr: {
      title: 'Ödeme Başarılı!',
      message: 'Rezervasyonunuz onaylandı ve ödemeniz başarıyla tamamlandı.',
      viewBookings: 'Rezervasyonlarımı Gör',
      orderNumber: 'Sipariş Numarası'
    },
    ru: {
      title: 'Оплата успешна!',
      message: 'Ваше бронирование подтверждено, оплата успешно завершена.',
      viewBookings: 'Мои бронирования',
      orderNumber: 'Номер заказа'
    }
  };

  const t = content[language];

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="sm">
        <Card sx={{ borderRadius: 3, textAlign: 'center' }}>
          <CardContent sx={{ p: 6 }}>
            <CheckCircle sx={{ fontSize: 80, color: '#00BFA6', mb: 3 }} />

            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, color: '#2d3748' }}>
              {t.title}
            </Typography>

            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
              {t.message}
            </Typography>

            {searchParams.get('merchant-order-id') && (
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
                {t.orderNumber}: {searchParams.get('merchant-order-id')}
              </Typography>
            )}

            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/dashboard')}
              sx={{
                bgcolor: '#2d3748',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                '&:hover': {
                  bgcolor: '#1a202c'
                }
              }}
            >
              {t.viewBookings}
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default PaymentSuccess;
