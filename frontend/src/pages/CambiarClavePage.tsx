import * as React from "react"; 
import { Box, Button, TextField, Typography, Paper, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { UsuarioContext } from "../context/UsuarioContext";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

interface CambiarClavePageProps {
  id: number;
}

export const CambiarClavePage: React.FC<CambiarClavePageProps> = ({ id }) => {
  const usuarioContext = React.useContext(UsuarioContext);

  const [claveActual, setClaveActual] = React.useState("");
  const [nuevaClave, setNuevaClave] = React.useState("");
  const [confirmarClave, setConfirmarClave] = React.useState("");
  const [cargando, setCargando] = React.useState(false);
  const navigate = useNavigate();
  const [errores, setErrores] = React.useState<string[]>([]);
  const [showClaveActual, setShowClaveActual] = React.useState(false);
  const [showNuevaClave, setShowNuevaClave] = React.useState(false);
  const [showConfirmarClave, setShowConfirmarClave] = React.useState(false);

  const handleSubmit = async () => {
    if (!usuarioContext) return;

    const erroresTemp: string[] = [];

    if (!claveActual) erroresTemp.push("Ingrese la clave actual.");
    if (!nuevaClave) erroresTemp.push("Ingrese la nueva clave.");
    if (!confirmarClave) erroresTemp.push("Confirme la nueva clave.");

    if (nuevaClave && confirmarClave && nuevaClave !== confirmarClave) {
      erroresTemp.push("Las contraseñas no coinciden.");
    }

    if (nuevaClave && nuevaClave.length < 6) {
      erroresTemp.push("La nueva clave debe tener al menos 6 caracteres.");
    }

    if (erroresTemp.length > 0) {
      setErrores(erroresTemp);
      return;
    }

    try {
      setCargando(true);
      await usuarioContext.updateClave(id, { claveActual, nuevaClave });
      setClaveActual("");
      setNuevaClave("");
      setConfirmarClave("");
      setErrores([]);
      const result = Swal.fire({ title:"¡Modificada!", text:"Tu contraseña se actualizó correctamente. Serás redirigido para iniciar sesión nuevamente.", icon:"success", confirmButtonText:"Aceptar"});
      // Si presiona aceptar  se cierra sesion y se redirige al login 
      if ((await result).isConfirmed) {
        localStorage.clear();
        navigate('/');
      };
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 400) {
        setErrores(["La clave actual es incorrecta."]);
      } else {
        setErrores(["No se pudo actualizar la contraseña."]);
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh", // ocupa toda la altura de la pantalla
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        
      }}
    >
      <Paper sx={{ p: 4, width: 500, }}>
        <Typography variant="h5" gutterBottom align="center">
          Cambiar contraseña
        </Typography>

        <TextField
          label="Clave actual"
          type={showClaveActual ? "text" : "password"}
          fullWidth
          margin="normal"
          value={claveActual}
          onChange={(e) => setClaveActual(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowClaveActual(!showClaveActual)} edge="end">
                  {showClaveActual ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Nueva clave"
          type={showNuevaClave ? "text" : "password"}
          fullWidth
          margin="normal"
          value={nuevaClave}
          onChange={(e) => setNuevaClave(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowNuevaClave(!showNuevaClave)} edge="end">
                  {showNuevaClave ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Confirmar nueva clave"
          type={showConfirmarClave ? "text" : "password"}
          fullWidth
          margin="normal"
          value={confirmarClave}
          onChange={(e) => setConfirmarClave(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowConfirmarClave(!showConfirmarClave)} edge="end">
                  {showConfirmarClave ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {errores.map((err, i) => (
          <Typography key={i} color="error" variant="body2">{err}</Typography>
        ))}

        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={cargando}
          >
            {cargando ? "Actualizando..." : "Guardar cambios"}
          </Button>
        </Box>
        </Paper>
    </Box>
  );
};
