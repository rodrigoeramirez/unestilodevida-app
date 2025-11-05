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
import { CelulaContext, type CelulaCreateDTO, type Dias, type Celula,  type Generos } from "../context/CelulaContext";
import { UsuarioContext, type Usuario } from '../context/UsuarioContext';
import { MapaSelector } from '../components/MapaSelector';
import 'leaflet/dist/leaflet.css';
import Paper from '@mui/material/Paper';
import UsuarioSelect from '../components/UsuarioSelect';
import { type SelectChangeEvent } from '@mui/material/Select';

interface EditarCelulaFormPageProps {
  celulaData: Celula;
  onClose: () => void;
  onSubmit: (celulaUpdateDTO: CelulaCreateDTO) => Promise<void>;
}

export const EditarCelulaFormPage: React.FC<EditarCelulaFormPageProps> = ({ celulaData, onClose, onSubmit }) => {
  const [errores, setErrores] = React.useState<string[]>([]);
  const [celula, setCelula] = React.useState<CelulaCreateDTO>({
    nombre: celulaData.nombre,
    descripcion: celulaData.descripcion || "",
    dia: celulaData.dia,
    genero: celulaData.genero,
    horaInicio: celulaData.horaInicio,
    direccion: celulaData.direccion,
    latitud: celulaData.latitud,
    longitud: celulaData.longitud,
    telefono: celulaData.telefono || "",
    liderId: celulaData.lider.id,
    timoteoId: celulaData.timoteo?.id || 0,
  });
  const usuarioContext = React.useContext(UsuarioContext);
  const celulaContext = React.useContext(CelulaContext);

  const [lideres, setLideres] = React.useState<Usuario[]>([]);
  const [timoteos, setTimoteos] = React.useState<Usuario[]>([]);
  const [dias,setDias] = React.useState<Dias[]>([]);
  const [generos,setGeneros] = React.useState<Generos[]>([]);

  // Obtener líderes y timoteos
  React.useEffect(() => {
    if (!usuarioContext) return;
    const fetchUsuarios = async () => {
      const lideres = await usuarioContext.getLideres();
      const timoteos = await usuarioContext.getTimoteos();
      setLideres(lideres);
      setTimoteos(timoteos);
    };
    fetchUsuarios();
  }, [usuarioContext]);

  // Obtener días y géneros
  React.useEffect(() => {
    if (!celulaContext) return;
    const fetchDiasAndGeneros = async () => {
      const dias = await celulaContext.getDias();
      const generos = await celulaContext.getGeneros();
      setDias(dias);
      setGeneros(generos);
    }
    fetchDiasAndGeneros();
  }, [celulaContext]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>) => {
    const campo = e.target.name!;
    const valor = e.target.value;
    setCelula(prev => ({ ...prev, [campo]: valor }));
  };

  // Para el Select de día o género
const handleSelectChange = (e: SelectChangeEvent<string>) => {
  const campo = e.target.name;
  const valor = e.target.value;
  setCelula(prev => ({ ...prev, [campo]: valor }));
};

  const validarCelula = (): string[] => {
    const errores: string[] = [];
    if (!celula.nombre.trim()) errores.push('El nombre es obligatorio.');
    if (!celula.dia.trim()) errores.push('El día es obligatorio.');
    if (!celula.genero.trim()) errores.push('El género es obligatorio.');
    if (!celula.horaInicio.trim()) errores.push('La hora de inicio es obligatoria.');
    if (!celula.direccion.trim()) errores.push('La dirección es obligatoria.');
    if (!celula.telefono.trim()){
       errores.push('El teléfono es obligatorio.');
    } else if (!/^\d{10}$/.test(celula.telefono)) {
      errores.push('El teléfono debe tener 10 números. Ejemplo: 2216492314');
    }
    if (!celula.liderId) errores.push('Debe seleccionar un líder.');
    return errores;
  };

  const validarUsuarioAsignado = async (usuarioId: number | undefined, rol: string, errores: string[]) => {
    if (!usuarioId || !celulaContext) return;
    const nombreCelula = await celulaContext.usuarioLibre(usuarioId);
    if (nombreCelula != null && nombreCelula !== celula.nombre) {
      errores.push(`El ${rol.toLowerCase()} ya se encuentra asignado/a a la célula: ${nombreCelula}`);
    }
  };

  const handleSubmit = async () => {
    const erroresValidacion = validarCelula();

   if (celulaData.lider.id !== celula.liderId) {
    await validarUsuarioAsignado(celula.liderId, "Líder", erroresValidacion);
    }

    if (celulaData.timoteo?.id !== celula.timoteoId) {
    await validarUsuarioAsignado(celula.timoteoId, "Timoteo", erroresValidacion);
    }
    
    

    if (erroresValidacion.length > 0) {
      setErrores(erroresValidacion);
      return;
    }
    setErrores([]);
    await onSubmit(celula);
  };

  return (
    <Box sx={{ p: 4, maxWidth: 900, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Editar célula
      </Typography>

      {/* Datos de Célula */}
      <Paper sx={{ p: 3, mb: 4 }} elevation={2}>
        <Typography variant="h6" gutterBottom>
          Datos de Célula
        </Typography>
        <div className="grid grid-cols-1 gap-4 mb-4">
          <TextField required fullWidth label="Nombre de la célula" name="nombre" value={celula.nombre} onChange={handleChange} />
          <TextField fullWidth label="Descripción" name="descripcion" value={celula.descripcion} onChange={handleChange}  />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <FormControl fullWidth>
            <InputLabel required id="genero-label">Género</InputLabel>
            <Select label="Género" labelId="genero-label" name="genero" value={celula.genero} onChange={handleSelectChange}>
              {generos.map((g, i) => <MenuItem key={i} value={g.nombre}>{g.nombre}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel required id="dia-label">Día</InputLabel>
            <Select label="Día" labelId="dia-label" name="dia" value={celula.dia} onChange={handleSelectChange}>
              {dias.map((d, i) => <MenuItem key={i} value={d.nombre}>{d.nombre}</MenuItem>)}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Hora de inicio"
            name="horaInicio"
            type="time"
            value={celula.horaInicio}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
        </div>
      </Paper>

      {/* Datos Encargados */}
      <Paper sx={{ p: 3, mb: 4 }} elevation={2}>
        <Typography variant="h6" gutterBottom>Datos Encargados</Typography>
        <div className="grid grid-cols-2 gap-4">
          <UsuarioSelect celula={celula} handleChange={handleChange} usuarios={lideres} tipo="Líder" required={true} />
          <TextField required fullWidth label="Teléfono" name="telefono" value={celula.telefono} onChange={handleChange} />
          <div>
            <p className="mb-2">Opcional</p>
            <UsuarioSelect celula={celula} handleChange={handleChange} usuarios={timoteos} tipo="Timoteo" required={false} />
          </div>
        </div>
      </Paper>

      {/* Ubicación */}
      <Paper sx={{ p: 3, mb: 4 }} elevation={2}>
        <Typography variant="h6" gutterBottom>Ubicación</Typography>
        <TextField required fullWidth label="Dirección" name="direccion" value={celula.direccion} onChange={handleChange} sx={{ mb: 2 }} />
        <Alert severity="warning" sx={{ mb: 2 }}>IMPORTANTE: Seleccionar ubicación en el mapa.</Alert>
        <MapaSelector latitud={celula.latitud} longitud={celula.longitud} onChange={(lat, lng) => setCelula(prev => ({ ...prev, latitud: lat, longitud: lng }))} />
      </Paper>

      {/* Errores */}
      {errores.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errores.map((err, i) => (<div key={i}>• {err}</div>))}
        </Alert>
      )}

      {/* Botones */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button
          variant="outlined"
          onClick={onClose}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
        >
          Guardar cambios
        </Button>
      </Box>
    </Box>
  );
};
