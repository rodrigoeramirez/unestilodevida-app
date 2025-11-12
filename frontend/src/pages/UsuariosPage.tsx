// src/pages/UsuariosPage.tsx
import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tabla from "../components/Tabla"
import Button from '@mui/material/Button';
import { UsuarioContext, type Usuario } from "../context/UsuarioContext";
import { CrearUsuarioFormPage } from './CrearUsuarioFormPage';
import Dialog from '@mui/material/Dialog';
import AddIcon from '@mui/icons-material/Add';
import Swal from 'sweetalert2';
import { EditarUsuarioFormPage } from './EditarUsuarioFormPage';
import { TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';

type UsuarioVisible = Omit<Usuario, 'clave' | 'fotoPerfil'>; // Lo uso para mostrar en la tabla sin datos sensibles

export const UsuariosPage: React.FC = () => {
  const usuarioContext = React.useContext(UsuarioContext);
  const [usuarios, setUsuarios] = React.useState<UsuarioVisible[]>([]);
  const [openDialog, setOpenDialog] = React.useState(false); // Estado para el diálogo
  const [openEditar, setOpenEditar] = React.useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = React.useState<Usuario | null>(null);
  const [busqueda, setBusqueda] = React.useState("");
  const [usuariosFiltrados, setUsuariosFiltrados] = React.useState<UsuarioVisible[]>([]);
  const navigate = useNavigate();

  // Filtrado de busqueda
React.useEffect(() => {
  const normalizar = (texto: string) =>
    texto
      .toLowerCase()
      .normalize("NFD") // quita acentos
      .replace(/[\u0300-\u036f]/g, ""); 

  const texto = normalizar(busqueda);

  const filtrados = usuarios.filter((u) => {
    const nombreCompleto = normalizar(`${u.nombre} ${u.apellido}`);
    return (
      nombreCompleto.includes(texto) ||
      normalizar(u.email).includes(texto)
    );
  });

  setUsuariosFiltrados(filtrados);
}, [busqueda, usuarios]);

  // Función reutilizable para refrescar
  const refreshUsuarios = React.useCallback(async () => {
  if (!usuarioContext) return;
  const data = await usuarioContext.getUsuarios();

  const usuariosMapeados = data.map(usuario => ({
    id: usuario.id,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    email: usuario.email,
    telefono: usuario.telefono,
    rol: usuario.rol,
    fechaBaja: usuario.fechaBaja ? new Date(usuario.fechaBaja).toLocaleDateString("es-AR"): null,
  }));

  setUsuarios(usuariosMapeados);
}, [usuarioContext]);
  // Refresca / llama al endpoint getUsuarios();
  React.useEffect(() => {
    refreshUsuarios();
  }, [refreshUsuarios]);

  // Crear usuario nuevo
  const handleAddUsuario = async (formData: FormData) => {
    if (!usuarioContext) return;
    try {
      await usuarioContext.crearUsuario(formData);
      await refreshUsuarios();
      setOpenDialog(false);
      Swal.fire ({title:"¡Creado!", text:"Usuario creado con exito", icon:"success", confirmButtonText:"Aceptar"});
    } catch (error:any) {
      if (error.respose?.status == 400){
        Swal.fire({title:"Datos invalidos", text:"Revisa los datos ingresados y vuelve a intentarlo.", icon:"warning", confirmButtonText:"Aceptar"});
      } else if (error.response?.status == 500) {
        Swal.fire({title:"¡Error!", text:"Ocurrió un error en el servidor. Por favor, comuniquese con Sistemas.", icon:"error", confirmButtonText:"Aceptar"});
      } else {
        Swal.fire({title:"¡Error!", text:"Ocurrió un error al crear el usuario. Por favor, comuniquese con Sistemas.", icon:"error", confirmButtonText:"Aceptar"});
      }
    }
  };

  // Editar el usuario, llama al endpoint actualizarUsuario con el objeto ya modificado.
  const handleSubmitEditar = async (id: number, datosActualizados: FormData) => {
    if (!usuarioContext) return;
    try {
      await usuarioContext.actualizarUsuario(id, datosActualizados);
      await refreshUsuarios();
      setOpenEditar(false);
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

  // Eliminar usuario con confirmación
  const handleDeleteUsuario = async (id: number) => {
    const usuarioSessionid : Number= Number(localStorage.getItem("usuarioId"));
  if (!usuarioContext) return;
  const result = await Swal.fire({
    title: "¿Dar de baja usuario?",
    text: "Estás por dar de baja este usuario. ¿Deseas continuar?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Dar de baja",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
  });

  if (result.isConfirmed) {
    try {
      await usuarioContext.eliminarUsuario(id);
      await refreshUsuarios();

      const result2= Swal.fire({
        title: "Baja",
        text: "El usuario fue dado de baja exitosamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
      });

      if ((await result2).isConfirmed && id == usuarioSessionid) {
        localStorage.clear();
        navigate('/');
      };
    } catch (error: any) {
      Swal.fire({
        title: "Error",
        text:
          error.response?.data ||
          "Ocurrió un error al eliminar el usuario. Por favor, comuníquese con Sistemas.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  }
  };

  // Abre el formulario para editar y setea la variable usuarioSeleccionado que voy a usarlo para modificar en EditarUsaurioFormPage.tsx
  const handleUpdateUsuario = async (id:number) => {
    if (!usuarioContext) return;
    const response = await usuarioContext.getUsuarioById(id);
    setUsuarioSeleccionado(response);
    setOpenEditar(true);
  };

  return (
    <Box sx={{ width: '100%', p: 4 }}>
      {/* Header con título */}
<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
  <Typography variant="h4" fontWeight="bold">
    Gestión de Usuarios
  </Typography>

  {/* Contenedor responsive para búsqueda + botón */}
  <Box
    sx={{
      display: 'flex',
      flexDirection: { xs: 'column', sm: 'row' }, // columna en móvil, fila en escritorio
      alignItems: { xs: 'stretch', sm: 'center' },
      justifyContent: 'space-between',
      gap: 2,
    }}
  >
    <TextField
      label="Buscar usuario por nombre, apellido o email..."
      variant="outlined"
      value={busqueda}
      onChange={(e) => setBusqueda(e.target.value)}
      sx={{
        flex: 1,
        minWidth: { xs: '100%', sm: '300px' },
      }}
    />

    <Button
      size="large"
      startIcon={<AddIcon />}
      variant="contained"
      sx={{
        whiteSpace: 'nowrap',
        boxShadow: 2,
        height: '56px',
        px: 3,
      }}
      onClick={() => setOpenDialog(true)}
    >
      Agregar usuario
    </Button>
  </Box>
</Box>
      
      
      <Box
        sx={{
          width: '100%',
          overflowX: 'auto',
          boxShadow: 2,
          borderRadius: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Tabla
          data={usuariosFiltrados}
          onRowUpdate={handleUpdateUsuario}
          onRowDelete={handleDeleteUsuario}
        />
      </Box>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <CrearUsuarioFormPage 
          onClose={() => setOpenDialog(false)} 
          onSubmit={handleAddUsuario} 
        />
      </Dialog>

      {/* Dialog para Editar usuario*/}
      <Dialog open={openEditar} onClose={() => setOpenEditar(false)}>
        {usuarioSeleccionado && (
          <EditarUsuarioFormPage
            usuarioInicial={usuarioSeleccionado} // usuarioSeleccionado se setea en la función handleUpdateUsuario
            onClose={() => setOpenEditar(false)}
            onSubmit={handleSubmitEditar} // utiliza la funcion handleSubmitEditar para enviar el objeto al backend
          />
        )}
      </Dialog>
    </Box>
  );
};