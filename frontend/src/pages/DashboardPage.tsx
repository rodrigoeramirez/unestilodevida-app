// src/pages/DashboardPage.tsx
import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export const DashboardPage: React.FC = () => {
  return (
    <Box
      sx={{
        width: '100%',
        p: 4, // padding
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      {/* Título principal */}
      <Typography variant="h4" gutterBottom>
        Bienvenido al Dashboard
      </Typography>

      {/* Mensaje de bienvenida */}
      <Typography variant="body1" color="text.secondary">
        Aquí podrás gestionar usuarios, células y todas las secciones de tu ministerio.
      </Typography>
    </Box>
  );
};
