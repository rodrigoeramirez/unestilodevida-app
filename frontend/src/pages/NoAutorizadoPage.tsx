import * as React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NoAutorizadoPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        p: 2,
      }}
    >
      <Typography variant="h4" color="error" gutterBottom>
        🚫 Acceso no autorizado
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        No tenés permisos para acceder a esta página.
      </Typography>
      <Button variant="contained" onClick={() => navigate("/dashboard")}>
        Volver al inicio
      </Button>
    </Box>
  );
};

export default NoAutorizadoPage;
