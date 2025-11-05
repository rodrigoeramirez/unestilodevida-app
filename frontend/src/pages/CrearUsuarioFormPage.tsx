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
import { UsuarioContext, type Rol, type Usuario } from "../context/UsuarioContext";
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';
import Slider from '@mui/material/Slider';
import { Dialog } from '@mui/material';


interface CrearUsuarioFormPageProps {
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
}

export const CrearUsuarioFormPage: React.FC<CrearUsuarioFormPageProps> = ({ onClose, onSubmit }) => {
  
  const [usuario, setUsuario] = React.useState<Omit<Usuario, 'id'>>({ nombre: '', apellido: '', email: '', clave: '', fotoPerfil: '', telefono: '', rol: ''});
  const [repetirClave, setRepetirClave] = React.useState('');
  const [errores, setErrores] = React.useState<string[]>([]);
  const [roles, setRoles] = React.useState<Rol[]>([]);
  const usuarioContext = React.useContext(UsuarioContext);
  const [fotoPerfilFile, setFotoPerfilFile] = React.useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = React.useState<string | null>(null);
  const [openCropper, setOpenCropper] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  // Configuración del cropper
  const [crop, setCrop] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<any>(null);

  const onCropComplete = React.useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Abrir cropper al seleccionar imagen
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

  // Recortar y guardar la imagen
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

  // Llama al endpoint getRoles() y carga la variable roles para mostrarlo en el select del formulario
  React.useEffect(() => {
      if (!usuarioContext) return;
    const fetchRoles = async () => {
      const data = await usuarioContext.getRoles();
      setRoles(data);
    };
    fetchRoles();
    }, [usuarioContext]);
    
  // Funcion que hace la consulta al backend mediante existByEmail() devuelve true si ya existe en la DB y false en caso contario.
  async function existeEmail(email: string) {
      if (!usuarioContext) return null;
      return  await usuarioContext.existByEmail(email);
  }  

  //Validación de formulario
  const validarUsuario = async (): Promise<string[]> => {
    const errores: string[] = [];

    if (!usuario.nombre.trim()) errores.push('El nombre es obligatorio.');
    if (!usuario.apellido.trim()) errores.push('El apellido es obligatorio.');
    if (!usuario.email.trim()) errores.push('El email es obligatorio.');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usuario.email))
      errores.push('El formato del email no es válido.');
    else {
      const existe = await existeEmail(usuario.email);
      console.log("Este es el resultado: "+ existe)
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

  // Actualiza dinámicamente el usuario, teniendo en cuenta el cambio del input y su valor actual
  const handleChange = (e) => {
  const campo = e.target.name;   // cuál campo cambió
  const valor = e.target.value;  // nuevo valor

  setUsuario((prevUsuario) => ({
    ...prevUsuario,  // copia el anterior
    [campo]: valor   // actualiza solo ese campo
  }));
  };

  // Invoca la funcion para validar, muestra errores y si no hay, envia el objeto usuario mediante onSubmit a UsuarioPage para insertarlo
  const handleSubmit = async () => {
    const erroresValidacion = await validarUsuario();

    if (erroresValidacion.length > 0) {
      setErrores(erroresValidacion);
      return;
    }

    setErrores([]);
    
    // Creamos FormData para enviar usuario + foto
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

    if (fotoPerfilFile) {
      formData.append("foto", fotoPerfilFile);
    }

    // Llamamos al onSubmit que ahora debería enviar FormData al context
    await onSubmit(formData);
  };

  return (
    <Box sx={{ p: 4, width: 500, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h5" gutterBottom>
        Agregar nuevo usuario
      </Typography>

      {/* Vista previa de imagen recortada */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <img
          src={fotoPreview ?? "src/assets/placeholder.png"} // o null
          alt="Vista previa"
          style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid #ccc',
            backgroundColor: '#f0f0f0', // color de fondo cuando está vacío
            display: 'block',
          }}
        />
      </Box>
    
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Input para subir imagen */}
      <TextField
        type="file"
        inputProps={{ accept: "image/*" }}
        InputLabelProps={{ shrink: true }}
        label="Foto de perfil"
        onChange={handleImageChange}
      />

      
      {/* Modal de recorte */}
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
    </Box>
      <TextField label="Nombre" name="nombre" value={usuario.nombre} onChange={handleChange} />
      <TextField label="Apellido" name="apellido" value={usuario.apellido} onChange={handleChange} />
      <TextField label="Email" name="email" value={usuario.email} onChange={handleChange} />
      <TextField label="Clave" name="clave" type="password" value={usuario.clave} onChange={handleChange} />
      <TextField label="Repetir clave" type="password" value={repetirClave} onChange={(e) => setRepetirClave(e.target.value)} />
      <TextField label="Teléfono" name="telefono" value={usuario.telefono} onChange={handleChange} />
      <FormControl fullWidth>
        <InputLabel id="rol-label">Rol</InputLabel>
        <Select labelId="rol-label" name="rol" value={usuario.rol} label="Rol" onChange={handleChange} >
          {roles.map((rol, i) => (
            <MenuItem key={i} value={rol.nombre}>
              {rol.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

       {/* Mostrar errores si existen */}
      {errores.length > 0 ? (
      <Alert severity="error">
        {errores.map((err, i) => (
          <div key={i}>• {err}</div>
        ))}
      </Alert>
    ) : null}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
        <Button variant="outlined" onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit}>Agregar</Button>
      </Box>
    </Box>
  );
};
