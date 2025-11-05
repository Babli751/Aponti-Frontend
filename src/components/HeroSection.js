import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Stack,
  Avatar,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search,
  LocationOn,
  Star,
  TrendingUp,
  Schedule,
  ContentCut,
  Spa,
  FitnessCenter,
  LocalHospital
} from '@mui/icons-material';

const HeroSection = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchQuery, setSearchQuery] = useState('');

  // Popular services
  const popularServices = [
    { icon: <ContentCut />, name: 'Haircut', color: '#FF6B6B' },
    { icon: <Spa />, name: 'Spa', color: '#4ECDC4' },
    { icon: <FitnessCenter />, name: 'Fitness', color: '#95E1D3' },
    { icon: <LocalHospital />, name: 'Healthcare', color: '#F38181' }
  ];

  // Stats
  const stats = [
    { icon: <TrendingUp />, value: '10K+', label: 'Active Businesses' },
    { icon: <Star />, value: '4.9', label: 'Average Rating' },
    { icon: <Schedule />, value: '50K+', label: 'Bookings Monthly' }
  ];

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: { xs: '600px', md: '700px' },
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      {/* Animated Background Shapes */}
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          top: '-200px',
          right: '-200px',
          filter: 'blur(60px)',
        }}
      />

      <motion.div
        animate={{
          rotate: [360, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'rgba(0, 166, 147, 0.2)',
          bottom: '-150px',
          left: '-150px',
          filter: 'blur(50px)',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: { xs: 6, md: 10 } }}>
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box sx={{ textAlign: 'center', color: 'white', mb: 4 }}>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Chip
                label="🚀 Find & Book Services Near You"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  fontWeight: 'bold',
                  mb: 3,
                  fontSize: { xs: '0.8rem', md: '0.9rem' },
                  px: 1
                }}
              />
            </motion.div>

            {/* Main Heading */}
            <Typography
              variant="h1"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '2.5rem', md: '4rem', lg: '5rem' },
                mb: 2,
                background: 'linear-gradient(to right, #fff, #e0e0e0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.2
              }}
            >
              Book Your Perfect
              <br />
              <span style={{
                background: 'linear-gradient(to right, #00f5d4, #00bbf9)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Service
              </span>
            </Typography>

            {/* Subtitle */}
            <Typography
              variant="h6"
              sx={{
                opacity: 0.9,
                maxWidth: '600px',
                mx: 'auto',
                mb: 4,
                fontSize: { xs: '1rem', md: '1.2rem' }
              }}
            >
              Discover local businesses, compare services, and book appointments instantly
            </Typography>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Box
                sx={{
                  maxWidth: '700px',
                  mx: 'auto',
                  mb: 4,
                  position: 'relative'
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Search for services or businesses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: '#2d3748', fontSize: 28 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          variant="contained"
                          sx={{
                            bgcolor: '#2d3748',
                            borderRadius: 2,
                            px: 4,
                            py: 1.5,
                            '&:hover': {
                              bgcolor: '#007562',
                              transform: 'scale(1.05)',
                            },
                            transition: 'all 0.3s'
                          }}
                          onClick={() => navigate('/services')}
                        >
                          Search
                        </Button>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    bgcolor: 'white',
                    borderRadius: 3,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { border: 'none' },
                      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                      backdropFilter: 'blur(10px)',
                      py: 1,
                      fontSize: { xs: '0.9rem', md: '1rem' }
                    }
                  }}
                />
              </Box>
            </motion.div>

            {/* Popular Services */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
                Popular Services:
              </Typography>
              <Stack
                direction="row"
                spacing={2}
                sx={{
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  gap: 2
                }}
              >
                {popularServices.map((service, index) => (
                  <motion.div
                    key={service.name}
                    whileHover={{ scale: 1.1, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Chip
                      icon={service.icon}
                      label={service.name}
                      onClick={() => navigate('/services')}
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                        fontWeight: 'bold',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        px: 2,
                        py: 3,
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.25)',
                        }
                      }}
                    />
                  </motion.div>
                ))}
              </Stack>
            </motion.div>
          </Box>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Box
            sx={{
              mt: 6,
              display: 'flex',
              justifyContent: 'center',
              gap: { xs: 2, md: 6 },
              flexWrap: 'wrap'
            }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                whileHover={{ scale: 1.05 }}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <Box
                  sx={{
                    textAlign: 'center',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    p: { xs: 2, md: 3 },
                    minWidth: { xs: '100px', md: '150px' },
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <Box sx={{ color: '#00f5d4', mb: 1 }}>
                    {stat.icon}
                  </Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 'bold',
                      color: 'white',
                      mb: 0.5,
                      fontSize: { xs: '1.5rem', md: '2rem' }
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: { xs: '0.75rem', md: '0.875rem' }
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              </motion.div>
            ))}
          </Box>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            position: 'absolute',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <LocationOn sx={{ color: 'white', fontSize: 40, opacity: 0.6 }} />
        </motion.div>
      </Container>
    </Box>
  );
};

export default HeroSection;
