import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Slider from '@mui/material/Slider';
import Dialog from '@mui/material/Dialog';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';
import { UsuarioContext, type Rol, type Usuario } from "../context/UsuarioContext";

interface CrearUsuarioFormPageProps {
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
}

export const CrearUsuarioFormPage: React.FC<CrearUsuarioFormPageProps> = ({ onClose, onSubmit }) => {
  const [usuario, setUsuario] = React.useState<Omit<Usuario, 'id'>>({
    nombre: '', apellido: '', email: '', clave: '', fotoPerfil: '', telefono: '', rol: ''
  });
  const [repetirClave, setRepetirClave] = React.useState('');
  const [errores, setErrores] = React.useState<string[]>([]);
  const [roles, setRoles] = React.useState<Rol[]>([]);
  const usuarioContext = React.useContext(UsuarioContext);
  const [fotoPerfilFile, setFotoPerfilFile] = React.useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = React.useState<string | null>(null);
  const [openCropper, setOpenCropper] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  const [crop, setCrop] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<any>(null);

  const onCropComplete = React.useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setOpenCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropSave = async () => {
    try {
      const croppedBlob = await getCroppedImg(selectedImage!, croppedAreaPixels);
      const croppedFile = new File([croppedBlob], 'fotoPerfil.jpg', { type: 'image/jpeg' });
      setFotoPerfilFile(croppedFile);
      setFotoPreview(URL.createObjectURL(croppedFile));
      setOpenCropper(false);
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    if (!usuarioContext) return;
    const fetchRoles = async () => {
      const data = await usuarioContext.getRoles();
      setRoles(data);
    };
    fetchRoles();
  }, [usuarioContext]);

  async function existeEmail(email: string) {
    if (!usuarioContext) return null;
    return await usuarioContext.existByEmail(email);
  }

  const validarUsuario = async (): Promise<string[]> => {
    const errores: string[] = [];

    if (!usuario.nombre.trim()) errores.push('El nombre es obligatorio.');
    if (!usuario.apellido.trim()) errores.push('El apellido es obligatorio.');
    if (!usuario.email.trim()) errores.push('El email es obligatorio.');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usuario.email))
      errores.push('El formato del email no es válido.');
    else {
      const existe = await existeEmail(usuario.email);
      if (existe) errores.push("El email ya está registrado");
      else if (existe === null) errores.push("No se pudo verificar el email");
    }

    if (!usuario.clave.trim()) errores.push('La clave es obligatoria.');
    else if (usuario.clave.length < 6)
      errores.push('La clave debe tener al menos 6 caracteres.');

    if (usuario.clave !== repetirClave)
      errores.push('Las contraseñas no coinciden.');

    if (!usuario.rol.trim()) errores.push('El rol es obligatorio.');

    return errores;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsuario((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const erroresValidacion = await validarUsuario();
    if (erroresValidacion.length > 0) {
      setErrores(erroresValidacion);
      return;
    }

    setErrores([]);
    const formData = new FormData();
    const usuarioDTO = {
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      clave: usuario.clave,
      telefono: usuario.telefono,
      rol: usuario.rol,
    };

    formData.append("usuarioDTO", new Blob([JSON.stringify(usuarioDTO)], { type: "application/json" }));
    if (fotoPerfilFile) formData.append("foto", fotoPerfilFile);
    await onSubmit(formData);
  };

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 4 },
        width: { xs: '100%', sm: 450 },
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Typography variant="h6" fontWeight="bold" textAlign="center">
        Agregar nuevo usuario
      </Typography>

      {/* Vista previa de imagen */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <img
          src={fotoPreview ?? "src/assets/placeholder.png"}
          alt="Vista previa"
          style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid #ccc',
            backgroundColor: '#f0f0f0',
          }}
        />
      </Box>

      <Button variant="outlined" component="label" sx={{ alignSelf: 'center' }}>
        Subir foto de perfil
        <input hidden type="file" accept="image/*" onChange={handleImageChange} />
      </Button>

      {/* Cropper modal */}
      <Dialog open={openCropper} onClose={() => setOpenCropper(false)} maxWidth="sm" fullWidth>
        <Box sx={{ position: 'relative', width: '100%', height: 400, background: '#333' }}>
          <Cropper
            image={selectedImage!}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </Box>

        <Box sx={{ p: 2 }}>
          <Typography gutterBottom>Zoom</Typography>
          <Slider value={zoom} min={1} max={3} step={0.1} onChange={(_, z) => setZoom(z as number)} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button onClick={() => setOpenCropper(false)}>Cancelar</Button>
            <Button variant="contained" onClick={handleCropSave}>Guardar recorte</Button>
          </Box>
        </Box>
      </Dialog>

      {/* Inputs */}
      <TextField label="Nombre" name="nombre" value={usuario.nombre} onChange={handleChange} fullWidth />
      <TextField label="Apellido" name="apellido" value={usuario.apellido} onChange={handleChange} fullWidth />
      <TextField label="Email" name="email" value={usuario.email} onChange={handleChange} fullWidth />
      <TextField label="Clave" name="clave" type="password" value={usuario.clave} onChange={handleChange} fullWidth />
      <TextField label="Repetir clave" type="password" value={repetirClave} onChange={(e) => setRepetirClave(e.target.value)} fullWidth />
      <TextField label="Teléfono" name="telefono" value={usuario.telefono} onChange={handleChange} fullWidth />

      <FormControl fullWidth>
        <InputLabel id="rol-label">Rol</InputLabel>
        <Select labelId="rol-label" name="rol" value={usuario.rol} label="Rol" onChange={handleChange}>
          {roles.map((rol, i) => (
            <MenuItem key={i} value={rol.nombre}>
              {rol.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {errores.length > 0 && (
        <Alert severity="error">
          {errores.map((err, i) => (
            <div key={i}>• {err}</div>
          ))}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2, flexWrap: 'wrap' }}>
        <Button variant="outlined" onClick={onClose} fullWidth={true} sx={{ flex: { xs: '1 1 100%', sm: '0 0 auto' } }}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSubmit} fullWidth={true} sx={{ flex: { xs: '1 1 100%', sm: '0 0 auto' } }}>
          Agregar
        </Button>
      </Box>
    </Box>
  );
};
