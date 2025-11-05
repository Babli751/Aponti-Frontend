import React from 'react';
import { Card, CardContent, Box } from '@mui/material';
import { motion } from 'framer-motion';

const GlassCard = ({
  children,
  hover = true,
  blur = 10,
  opacity = 0.1,
  borderOpacity = 0.2,
  elevation = 0,
  sx = {},
  ...props
}) => {
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: hover ? {
      y: -10,
      boxShadow: '0 20px 40px rgba(0, 166, 147, 0.2)',
      transition: { duration: 0.3 }
    } : {}
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      style={{ height: '100%' }}
    >
      <Card
        elevation={elevation}
        sx={{
          background: `rgba(255, 255, 255, ${opacity})`,
          backdropFilter: `blur(${blur}px)`,
          border: `1px solid rgba(255, 255, 255, ${borderOpacity})`,
          borderRadius: 3,
          overflow: 'hidden',
          height: '100%',
          transition: 'all 0.3s ease',
          ...sx
        }}
        {...props}
      >
        {children}
      </Card>
    </motion.div>
  );
};

// Glassmorphism with gradient background
export const GlassCardGradient = ({
  children,
  gradient = 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
  ...props
}) => {
  return (
    <GlassCard
      {...props}
      sx={{
        background: gradient,
        ...props.sx
      }}
    >
      {children}
    </GlassCard>
  );
};

// Dark glassmorphism variant
export const GlassCardDark = ({ children, ...props }) => {
  return (
    <GlassCard
      {...props}
      opacity={0.8}
      blur={20}
      sx={{
        background: 'rgba(0, 0, 0, 0.4)',
        color: 'white',
        ...props.sx
      }}
    >
      {children}
    </GlassCard>
  );
};

export default GlassCard;
