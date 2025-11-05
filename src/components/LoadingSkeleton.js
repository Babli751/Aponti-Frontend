import React from 'react';
import { Box, Card, CardContent, Skeleton, Grid } from '@mui/material';

// Business Card Skeleton
export const BusinessCardSkeleton = () => (
  <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
    <Skeleton variant="rectangular" height={200} animation="wave" />
    <CardContent>
      <Skeleton variant="text" width="80%" height={30} animation="wave" />
      <Skeleton variant="text" width="60%" height={20} animation="wave" sx={{ mt: 1 }} />
      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <Skeleton variant="circular" width={40} height={40} animation="wave" />
        <Skeleton variant="circular" width={40} height={40} animation="wave" />
        <Skeleton variant="circular" width={40} height={40} animation="wave" />
      </Box>
      <Skeleton variant="rectangular" height={40} sx={{ mt: 2, borderRadius: 2 }} animation="wave" />
    </CardContent>
  </Card>
);

// Worker Card Skeleton
export const WorkerCardSkeleton = () => (
  <Card sx={{ borderRadius: 3 }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Skeleton variant="circular" width={60} height={60} animation="wave" sx={{ mr: 2 }} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="70%" height={25} animation="wave" />
          <Skeleton variant="text" width="50%" height={20} animation="wave" />
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Skeleton variant="rounded" width={60} height={25} animation="wave" />
        <Skeleton variant="rounded" width={60} height={25} animation="wave" />
      </Box>
      <Skeleton variant="text" width="100%" animation="wave" />
      <Skeleton variant="text" width="80%" animation="wave" />
    </CardContent>
  </Card>
);

// List Skeleton
export const ListSkeleton = ({ count = 5 }) => (
  <Box>
    {[...Array(count)].map((_, index) => (
      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 2 }}>
        <Skeleton variant="circular" width={50} height={50} animation="wave" sx={{ mr: 2 }} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="60%" height={25} animation="wave" />
          <Skeleton variant="text" width="40%" height={20} animation="wave" />
        </Box>
        <Skeleton variant="rounded" width={80} height={36} animation="wave" />
      </Box>
    ))}
  </Box>
);

// Grid Skeleton
export const GridSkeleton = ({ count = 6, xs = 12, md = 6, lg = 4 }) => (
  <Grid container spacing={3}>
    {[...Array(count)].map((_, index) => (
      <Grid item xs={xs} md={md} lg={lg} key={index}>
        <BusinessCardSkeleton />
      </Grid>
    ))}
  </Grid>
);

// Shimmer effect wrapper
export const ShimmerWrapper = ({ children, loading }) => {
  if (!loading) return children;

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          transform: 'translateX(-100%)',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          animation: 'shimmer 2s infinite',
        },
        '@keyframes shimmer': {
          '100%': {
            transform: 'translateX(100%)',
          },
        },
      }}
    >
      {children}
    </Box>
  );
};

export default {
  BusinessCardSkeleton,
  WorkerCardSkeleton,
  ListSkeleton,
  GridSkeleton,
  ShimmerWrapper
};
