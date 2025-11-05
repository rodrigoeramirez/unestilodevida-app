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

type UsuarioVisible = Omit<Usuario, 'clave' | 'fotoPerfil'>; // Lo uso para mostrar en la tabla sin datos sensibles

export const UsuariosPage: React.FC = () => {
  const usuarioContext = React.useContext(UsuarioContext);
  const [usuarios, setUsuarios] = React.useState<UsuarioVisible[]>([]);
  const [openDialog, setOpenDialog] = React.useState(false); // Estado para el diálogo

  // Función reutilizable para refrescar
  const refreshUsuarios = React.useCallback(async () => {
    if (!usuarioContext) return;
    const data = await usuarioContext.getUsuarios();
    // Quita los campos sensibles antes de mostrar
    const usuariosFiltrados = data.map(usuario => {
    return {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        telefono: usuario.telefono,
        rol: usuario.rol
    };
    });

    setUsuarios(usuariosFiltrados);
  }, [usuarioContext]);

  // Refresca / llama al endpoint getUsuarios();
  React.useEffect(() => {
    refreshUsuarios();
  }, [refreshUsuarios]);

     // Crear usuario nuevo
  const handleAddUsuario = async (formData: FormData) => {
    if (!usuarioContext) return;
    await usuarioContext.crearUsuario(formData);
    await refreshUsuarios();
    setOpenDialog(false);
  };

  // Editar usuario
  const handleUpdateUsuario = async (updatedRow: any) => {
    if (!usuarioContext) return;
    const { id, ...datos } = updatedRow;
    await usuarioContext.actualizarUsuario(id, datos);
    await refreshUsuarios(); 
  };

  // Eliminar usuario
  const handleDeleteUsuario = async (id: string | number) => {
    if (!usuarioContext) return;
    await usuarioContext.eliminarUsuario(id);
    await refreshUsuarios(); 
  };

  return (
    <Box sx={{ width: '100%', p: 4 }}>
      {/* Header con título */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Gestión de Usuarios
        </Typography>
      </Box>
      <div className='mr-auto mb-5'>
        <Button size="large" startIcon={<AddIcon />} sx={{ boxShadow: 2 }} variant="contained" onClick={() => setOpenDialog(true)}> Agregar nuevo usuario</Button>
      </div>
      
      
      <Tabla 
        data={usuarios}
        onRowUpdate={handleUpdateUsuario}
        onRowDelete={handleDeleteUsuario}
      />
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <CrearUsuarioFormPage 
          onClose={() => setOpenDialog(false)} 
          onSubmit={handleAddUsuario} 
        />
      </Dialog>
    </Box>
  );
};