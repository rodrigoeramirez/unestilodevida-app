import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { UsuarioContext, type Rol, type Usuario } from "../context/UsuarioContext";
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/cropImage";
import Slider from "@mui/material/Slider";
import { Dialog, useMediaQuery, useTheme } from "@mui/material";

interface EditarUsuarioFormPageProps {
  usuarioInicial: Usuario;
  onClose?: () => void;
  onSubmit: (id: number, formData: FormData) => Promise<void>;
}

export const EditarUsuarioFormPage: React.FC<EditarUsuarioFormPageProps> = ({
  usuarioInicial,
  onClose,
  onSubmit,
}) => {
  const usuarioContext = React.useContext(UsuarioContext);
   const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const [usuario, setUsuario] = React.useState<Usuario>(usuarioInicial);
  const [errores, setErrores] = React.useState<string[]>([]);
  const [roles, setRoles] = React.useState<Rol[]>([]);
  const [mostrarMensajeAlta, setMostrarMensajeAlta] = React.useState(false);

  const [fotoPerfilFile, setFotoPerfilFile] = React.useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = React.useState<string | null>(
    usuarioInicial.fotoPerfil || null
  );
  const [openCropper, setOpenCropper] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  // Configuración del cropper
  const [crop, setCrop] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<any>(null);
  const onCropComplete = React.useCallback((_: any, area: any) => {
    setCroppedAreaPixels(area);
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
  console.log(usuarioInicial);
  // Guardar recorte
  const handleCropSave = async () => {
    try {
      const croppedBlob = await getCroppedImg(selectedImage!, croppedAreaPixels);
      const croppedFile = new File([croppedBlob], "fotoPerfil.jpg", {
        type: "image/jpeg",
      });
      setFotoPerfilFile(croppedFile);
      setFotoPreview(URL.createObjectURL(croppedFile));
      setOpenCropper(false);
    } catch (e) {
      console.error(e);
    }
  };

  // Cargar roles
  React.useEffect(() => {
    if (!usuarioContext) return;
    const fetchRoles = async () => {
      const data = await usuarioContext.getRoles();
      setRoles(data);
    };
    fetchRoles();
  }, [usuarioContext]);

  // Función que consulta al backend si un email ya existe
    async function existeEmail(email: string) {
    if (!usuarioContext) return null;
    return await usuarioContext.existByEmail(email);
    }


  // Validar datos mínimos
  const validarUsuario = async (): Promise<string[]> => {
    const errores: string[] = [];
    if (!usuario.nombre.trim()) errores.push("El nombre es obligatorio.");
    if (!usuario.apellido.trim()) errores.push("El apellido es obligatorio.");
    if (!usuario.email.trim()) {
        errores.push("El email es obligatorio.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usuario.email))
        errores.push("El formato del email no es válido.");
    else {
        // Si el usuario cambió el email, validamos contra la BD
        if (usuario.email !== usuarioInicial?.email) {
        const existe = await existeEmail(usuario.email);
        console.log("Resultado de existByEmail:", existe);

        if (existe === true)
            errores.push("El email ya está registrado por otro usuario.");
        else if (existe === null)
            errores.push("No se pudo verificar el email.");
        }
    }
    if (!usuario.rol.trim()) errores.push("El rol es obligatorio.");
    return errores;
  };

  // Cambiar campos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setUsuario((prev) => ({ ...prev, [name as string]: value as string }));
  };

  // Guardar cambios
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
      telefono: usuario.telefono,
      rol: usuario.rol,
      fechaBaja: usuario.fechaBaja,
    };

    formData.append("usuarioDTO", new Blob([JSON.stringify(usuarioDTO)], { type: "application/json" }));

    if (fotoPerfilFile) {
      formData.append("foto", fotoPerfilFile);
    }

    await onSubmit(usuario.id, formData);
  };

   return (
    <Box
      sx={{
        p: isMobile ? 2 : 4,
        width: isMobile ? "100%" : isTablet ? "80%" : 500,
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography
        variant={isMobile ? "h6" : "h5"}
        gutterBottom
        align="center"
        sx={{ fontWeight: "bold" }}
      >
        {onClose ? "Editar usuario" : "Modificar mis datos"}
      </Typography>

      {/* Imagen */}
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <img
          src={fotoPreview ?? "src/assets/placeholder.png"}
          alt="Vista previa"
          style={{
            width: isMobile ? 90 : 120,
            height: isMobile ? 90 : 120,
            borderRadius: "50%",
            objectFit: "cover",
            border: "2px solid #ccc",
            backgroundColor: "#f0f0f0",
          }}
        />
      </Box>

      <Button variant="outlined" component="label" fullWidth={isMobile}>
        Actualizar foto de perfil
        <input hidden type="file" accept="image/*" onChange={handleImageChange} />
      </Button>

      {/* Cropper */}
      <Dialog open={openCropper} onClose={() => setOpenCropper(false)} maxWidth="sm" fullWidth>
        <Box sx={{ position: "relative", width: "100%", height: 400, background: "#333" }}>
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
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
            <Button onClick={() => setOpenCropper(false)}>Cancelar</Button>
            <Button variant="contained" onClick={handleCropSave}>
              Guardar recorte
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Campos */}
      <TextField label="Nombre" name="nombre" value={usuario.nombre} onChange={handleChange} fullWidth />
      <TextField label="Apellido" name="apellido" value={usuario.apellido} onChange={handleChange} fullWidth />
      <TextField label="Email" name="email" value={usuario.email} onChange={handleChange} fullWidth />
      <TextField label="Teléfono" name="telefono" value={usuario.telefono} onChange={handleChange} fullWidth />
      
      {onClose && (<FormControl fullWidth>
        <InputLabel id="rol-label">Rol</InputLabel>
        <Select labelId="rol-label" name="rol" value={usuario.rol} label="Rol" onChange={handleChange}>
          {roles.map((rol, i) => (
            <MenuItem key={i} value={rol.nombre}>
              {rol.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>)
      }

      {usuario.fechaBaja && (
        <Box sx={{ mt: 2 }}>
          <Typography>
            <strong>Fecha de baja:</strong> {new Date(usuario.fechaBaja).toLocaleDateString("es-AR")}
          </Typography>
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              usuario.fechaBaja = null;
              setMostrarMensajeAlta(true);
            }}
            fullWidth={isMobile}
          >
            Dar de alta
          </Button>
        </Box>
      )}

      {mostrarMensajeAlta && (
        <Typography sx={{ color: "orange", mt: 1, fontSize: "0.9rem" }}>
          ⚠️ Debe guardar los cambios para confirmar el alta.
        </Typography>
      )}

      {errores.length > 0 && (
        <Alert severity="error">
          {errores.map((err, i) => (
            <div key={i}>• {err}</div>
          ))}
        </Alert>
      )}

      <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "flex-end", gap: 2, mt: 2 }}>
        {onClose && (
          <Button variant="outlined" onClick={onClose} fullWidth={isMobile}>
            Cancelar
          </Button>
        )}
        <Button variant="contained" onClick={handleSubmit} fullWidth={isMobile}>
          Guardar cambios
        </Button>
      </Box>
    </Box>
  );
};