import React from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Logo = ({ size = 'medium', variant = 'color' }) => {
  const navigate = useNavigate();

  const sizes = {
    small: { width: 120, height: 48 },
    medium: { width: 160, height: 64 },
    large: { width: 200, height: 80 }
  };

  const currentSize = sizes[size] || sizes.medium;

  // SVG Logo based on the provided design
  const logoSVG = `
    <svg width="100%" height="100%" viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Logo icon: stylized 'a' with appointment marker -->
      <g transform="translate(0, 10)">
        <!-- Outer circle of 'a' -->
        <circle cx="30" cy="30" r="22" stroke="${variant === 'white' ? '#ffffff' : '#1f2937'}" stroke-width="7" fill="none"/>
        <!-- Diagonal stem creating appointment/pin marker effect -->
        <path d="M 44 12 L 54 12 L 54 48 L 44 48 Z" fill="${variant === 'white' ? '#ffffff' : '#1f2937'}" transform="rotate(22 49 30)"/>
      </g>

      <!-- Text: aponti -->
      <text x="75" y="52" font-family="'Inter', 'Helvetica', 'Arial', sans-serif" font-size="36" font-weight="800" fill="${variant === 'white' ? '#ffffff' : '#1f2937'}" letter-spacing="-1.5">
        aponti
      </text>
    </svg>
  `;

  return (
    <Box
      onClick={() => navigate('/')}
      sx={{
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: currentSize.width,
        height: currentSize.height,
        transition: 'transform 0.2s ease-in-out, opacity 0.2s',
        '&:hover': {
          transform: 'scale(1.05)',
          opacity: 0.9
        }
      }}
      dangerouslySetInnerHTML={{ __html: logoSVG }}
    />
  );
};

export default Logo;
