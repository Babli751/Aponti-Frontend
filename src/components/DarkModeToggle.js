import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useThemeMode } from '../contexts/ThemeContext';

const DarkModeToggle = ({ size = 'medium' }) => {
  const { mode, toggleTheme, isDark } = useThemeMode();

  return (
    <Tooltip title={isDark ? 'Light Mode' : 'Dark Mode'}>
      <motion.div
        whileHover={{ scale: 1.1, rotate: 180 }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        <IconButton
          onClick={toggleTheme}
          size={size}
          sx={{
            color: isDark ? '#fbbf24' : '#f59e0b',
            bgcolor: isDark ? 'rgba(251, 191, 36, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            '&:hover': {
              bgcolor: isDark ? 'rgba(251, 191, 36, 0.2)' : 'rgba(245, 158, 11, 0.2)',
            },
          }}
        >
          {isDark ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
      </motion.div>
    </Tooltip>
  );
};

export default DarkModeToggle;
