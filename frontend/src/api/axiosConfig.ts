import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp?: number; // puede venir o no
}

const api = axios.create({
  baseURL: 'http://localhost:8080', // backend Spring Boot
  headers: {
    'Content-Type': 'application/json',
  },
});

// Con esto, cada vez que llames a celulaApi.getAll(), create(), etc., Axios incluirá automáticamente el token en los headers.
// Interceptor para agregar token y validar expiración
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    const decoded: DecodedToken = jwtDecode(token);
    // Verificar si el token tiene exp y si sigue siendo válido
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      console.warn("Token expirado, eliminando del almacenamiento.");
      localStorage.removeItem("token");
      // Opcionalmente podrías redirigir al login:
      // window.location.href = "/login";
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default api;
