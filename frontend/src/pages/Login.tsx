import React, { useState, useEffect } from "react"; // Importa React, useState, y useEffect.
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Link,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom"; // Hook para manejar la navegación y obtener el state de la redirección.
import { Visibility, VisibilityOff } from "@mui/icons-material";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import { authApi } from "../api/authApi";
const theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#fafafa",
    },
    primary: {
      main: "#1976d2",
    },
  },
});

const Login = () => {
  const navigate = useNavigate(); // Inicializamos el hook para manejar la navegación.
  const location = useLocation(); // Usamos el hook useLocation para obtener el state que pasó en la redirección.
  const [form, setForm] = useState({ email: "", clave: "" }); // Estado para manejar los datos del formulario.
  const [errors, setErrors] = useState({ email: false, clave: false }); // Estado para manejar los errores de validación.
  const [errorMessage, setErrorMessage] = useState(""); // Estado para manejar mensajes de error global.
  const [redirectMessage, setRedirectMessage] = useState(""); // Nuevo estado para el mensaje de redirección.
  const [showClave, setShowClave] = useState(false); // Estado para alternar visibilidad

  // Leer el mensaje de redirección si existe
  useEffect(() => {
    if (location.state && location.state.message) {
      setRedirectMessage(location.state.message); // Si hay un mensaje en el state, lo guardamos.
    }
  }, [location.state]);

  // Función para manejar los cambios en los campos de texto.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: false });
    setErrorMessage(""); // Limpia mensajes de error generales.
  };

  // Función para manejar el envío del formulario.
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que la página se recargue.
    const newErrors = {
      email: form.email.trim() === "",
      clave: form.clave.trim() === "",
    };
    setErrors(newErrors);

    if (!newErrors.email && !newErrors.clave) {

      try {

         const response = await authApi.login({
            email: form.email,
            clave: form.clave,
            });
        
        
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("usuarioId", response.data.id);
        localStorage.setItem("usuarioNombre", response.data.nombre);
        localStorage.setItem("usuarioApellido", response.data.apellido);
        localStorage.setItem("usuarioEmail", response.data.email);
        localStorage.setItem("fotoPerfil", response.data.fotoPerfil);
        localStorage.setItem("usuarioRol", response.data.rol);

        // Redirigimos al dashboard
        navigate("/dashboard");
        
      } catch (error: any) {
        // ⚠️ Si el backend devuelve 401 (no autorizado)
        if (error.response?.status === 401) {
        setErrorMessage("Email o clave incorrectos");
        } else if (error.response?.status === 403) {
          setErrorMessage("No tenes permiso para acceder o el usuario fue dado de baja");
        } else {
        // Cualquier otro tipo de error
        setErrorMessage(
            error.response?.data?.message || "Ocurrió un error. Comuniquese con Sistemas"
        );
        }
    }
    }
  };

  // Función para manejar el clic en "¿Olvidaste tu contraseña?"
  const handleForgotPasswordClick = () => {
    navigate("/forgot-clave");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
        <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
    >
      <Container
      maxWidth="xs"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 4,
        boxShadow: 3,
        borderRadius: 2,
        backgroundColor: "white",
      }}
    >
        <Box
        component="img"
        src="src/assets/logo_unev.png"
        alt="Logo Unev"
        sx={{ width: 150, mb: 2 }}
        />
        <Typography variant="subtitle1" gutterBottom>
          Bienvenido, por favor inicia sesión para continuar.
        </Typography>

        {redirectMessage && (
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            {redirectMessage} {/* Muestra el mensaje de redirección si está presente */}
          </Typography>
        )}

        {errorMessage && (
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Typography>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%", mt: 3 }}>
          <TextField
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={errors.email}
            helperText={errors.email && "Este campo es obligatorio."}
          />

          <TextField
            label="Clave"
            name="clave"
            type={showClave ? "text" : "password"}
            value={form.clave}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={errors.clave}
            helperText={errors.clave && "Este campo es obligatorio."}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowClave(!showClave)}
                    edge="end"
                    tabIndex={-1}
                  >
                    {showClave ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            Iniciar Sesión
          </Button>

          <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
            <Link href="#" underline="hover" onClick={handleForgotPasswordClick}>
              ¿Olvidaste tu contraseña?
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
    </ThemeProvider>
  );
};

export default Login;
