import * as React from "react";
import { UsuarioContext, type Usuario } from "../context/UsuarioContext";
import { EditarUsuarioFormPage } from "./EditarUsuarioFormPage";
import Swal from "sweetalert2";
import Box from "@mui/system/Box";
import { Paper } from "@mui/material";

interface EditarMisDatosPageProps {
  id: number;
}

export const EditarMisDatosPage: React.FC<EditarMisDatosPageProps> = ({ id }) => {
  const usuarioContext = React.useContext(UsuarioContext);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = React.useState<Usuario | null>(null);
  const [cargando, setCargando] = React.useState(true);

  // 
  const obtenerUsuario = async (id: number) => {
    if (!usuarioContext) return;
    const usuarioRecuperado = await usuarioContext.getUsuarioById(id);
    setUsuarioSeleccionado(usuarioRecuperado);
    setCargando(false);
  };

  // 🔹 Se ejecuta al montar el componente
  React.useEffect(() => {
    obtenerUsuario(id);
  }, [id]);

  // Editar el usuario, llama al endpoint actualizarUsuario con el objeto ya modificado.
    const handleSubmitEditar = async (id: number, datosActualizados: FormData) => {
      if (!usuarioContext) return;
      try {
        await usuarioContext.actualizarUsuario(id, datosActualizados);
        Swal.fire({ title: "Actualizado", text: "Usuario actualizado correctamente", icon: "success", confirmButtonText: "Aceptar" });
      } catch (error: any) {
        if (error.response?.status == 400) {
          Swal.fire({ title: "Datos invalidos", text: "Por favor verifique los datos ingresados y vuelva a intentarlo.", icon: "error" });
        } else if (error.response?.status == 500) {
          Swal.fire({ title: "Error", text: "Hubo un error en el servidor. Por favor comuniquese con Sistemas.", icon: "error" });
        } else {
          Swal.fire({ title: "Error", text: "No se pudo actualizar el usuario. Por favor comuniquese con Sistemas.", icon: "error" });
        }
      }
    };

  if (cargando) {
    return <p style={{ textAlign: "center", marginTop: "2rem" }}>Cargando usuario...</p>;
  }

  if (!usuarioSeleccionado) {
    return <p style={{ textAlign: "center", marginTop: "2rem" }}>No se encontró el usuario.</p>;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2, sm: 4 }, // margen interno adaptable
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 4 },
          width: { xs: "100%", sm: "90%", md: "70%", lg: 560 },
          maxWidth: "100%",
          borderRadius: 3,
        }}
      >
        <EditarUsuarioFormPage
          usuarioInicial={usuarioSeleccionado}
          onSubmit={handleSubmitEditar}
        />
      </Paper>
    </Box>
  );
};