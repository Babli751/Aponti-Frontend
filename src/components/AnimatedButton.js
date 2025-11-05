import React from 'react';
import { Button } from '@mui/material';
import { motion } from 'framer-motion';

const AnimatedButton = ({
  children,
  variant = 'contained',
  color = 'primary',
  animation = 'pulse',
  ...props
}) => {
  const animations = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: { duration: 0.3 }
    },
    bounce: {
      y: [0, -10, 0],
      transition: { duration: 0.4 }
    },
    rotate: {
      rotate: [0, 5, -5, 0],
      transition: { duration: 0.5 }
    },
    shake: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.5 }
    },
    glow: {
      boxShadow: [
        '0 0 0 0 rgba(0, 166, 147, 0)',
        '0 0 0 10px rgba(0, 166, 147, 0.2)',
        '0 0 0 20px rgba(0, 166, 147, 0)',
      ],
      transition: { duration: 1, repeat: Infinity }
    }
  };

  return (
    <motion.div
      whileHover={animations[animation]}
      whileTap={{ scale: 0.95 }}
      style={{ display: 'inline-block' }}
    >
      <Button
        variant={variant}
        color={color}
        {...props}
        sx={{
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 'bold',
          px: 3,
          py: 1.5,
          ...props.sx
        }}
      >
        {children}
      </Button>
    </motion.div>
  );
};

// Gradient Button
export const GradientButton = ({ children, gradient, ...props }) => {
  return (
    <AnimatedButton
      {...props}
      sx={{
        background: gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        '&:hover': {
          background: gradient || 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
        },
        ...props.sx
      }}
    >
      {children}
    </AnimatedButton>
  );
};

// Icon Button with animation
export const AnimatedIconButton = ({ children, icon, ...props }) => {
  return (
    <motion.div
      whileHover={{ rotate: 360 }}
      transition={{ duration: 0.5 }}
      style={{ display: 'inline-block' }}
    >
      <Button
        startIcon={icon}
        {...props}
        sx={{
          borderRadius: 2,
          textTransform: 'none',
          ...props.sx
        }}
      >
        {children}
      </Button>
    </motion.div>
  );
};

export default AnimatedButton;
