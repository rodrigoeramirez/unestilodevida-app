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
import { CelulaContext, type CelulaCreateDTO, type Dias, type Generos } from "../context/CelulaContext";
import { UsuarioContext, type Usuario } from '../context/UsuarioContext';
import { MapaSelector } from '../components/MapaSelector';
import 'leaflet/dist/leaflet.css';
import Paper from '@mui/material/Paper';
import UsuarioSelect from '../components/UsuarioSelect';

interface CrearCelulaFormPageProps {
  onClose: () => void;
  onSubmit: (celulaCreateDTO: CelulaCreateDTO) => Promise<void>;
}

export const CrearCelulaFormPage: React.FC<CrearCelulaFormPageProps> = ({ onClose, onSubmit }) => {

  const [errores, setErrores] = React.useState<string[]>([]);
  const usuarioContext = React.useContext(UsuarioContext);
  const [lideres, setLideres] = React.useState<Usuario[]>([]);
  const [timoteos, setTimoteos] = React.useState<Usuario[]>([]);
  const celulaContext = React.useContext(CelulaContext);
  const [dias,setDias] = React.useState<Dias[]>([]);
  const [generos,setGeneros] = React.useState<Generos[]>([]);
  const [celula, setCelula] = React.useState<CelulaCreateDTO>({
    nombre: "",
    dia: "",
    genero: "",
    horaInicio: "",
    direccion: "",
    latitud: 0,
    longitud: 0,
    descripcion: "",
    telefono: "",
    liderId: 0,
    timoteoId: 0,
  });
  
  
  // Obtiene los lideres y timoteos desde el backend
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

  // Obtiene los dias y generos disponibles para usar en el fomrulario, desde el backend
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

    // Actualiza dinámicamente la celula, teniendo en cuenta el cambio del input y su valor actual
  const handleChange = (e) => {
  const campo = e.target.name;   // cuál campo cambió
  const valor = e.target.value;  // nuevo valor

  setCelula((prevCelula) => ({
    ...prevCelula,  // copia el anterior
    [campo]: valor   // actualiza solo ese campo
  }));
  };

  // Valida los campos basicos del formulario
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

  // Esta funcion valida que el usuario este disponible para asignar a la celula, en caso contrario añade un mensaje de error para mostrar en el front
  const validarUsuarioAsignado = async (usuarioId: number | undefined, rol: string, errores: string[]) => {
    if (!usuarioId || !celulaContext) return;

    const nombreCelula = await celulaContext.usuarioLibre(usuarioId);
    if (nombreCelula != null) {
      errores.push(`El ${rol.toLowerCase()} ya se encuentra asignado/a a la célula: ${nombreCelula}`);
    }
  };
  // Envia el objeto celula listo a CelulaPage.tsx para enviar al backend.
  const handleSubmit = async () => {
    // Valida los campos basicos
    const erroresValidacion = validarCelula();
    
    // Valida que el lider y el timoteo este disponible para ser asignado a la celula
    await validarUsuarioAsignado(celula.liderId, "Líder", erroresValidacion);
    await validarUsuarioAsignado(celula.timoteoId, "Timoteo", erroresValidacion);

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
        Agregar nueva célula
      </Typography>

      {/* Datos de Célula */}
      <Paper sx={{ p: 3, mb: 4 }} elevation={2}>
        <Typography variant="h6" gutterBottom>
          Datos de Célula
        </Typography>
        <div className='grid grid-cols-1 gap-4 mb-4'>
            <TextField required fullWidth label="Nombre de la célula" name="nombre" value={celula.nombre} onChange={handleChange} />
            <TextField fullWidth label="Descripción" name="descripcion" value={celula.descripcion} onChange={handleChange}  />
        </div>
        <div className='grid grid-cols-3 gap-4'>
              <FormControl fullWidth >
              <InputLabel required id="genero-label" >Género</InputLabel>
              <Select label="Género" id="genero "labelId="genero-label" name="genero" value={celula.genero} onChange={handleChange} >
                {generos.map((g, i) => <MenuItem key={i} value={g.nombre}>{g.nombre}</MenuItem>)}
              </Select>
            </FormControl>
          
            <FormControl fullWidth>
              <InputLabel required id="dia-label">Día</InputLabel>
              <Select label="Día" labelId="dia-label" name="dia" value={celula.dia} onChange={handleChange}>
                {dias.map((d, i) => <MenuItem key={i} value={d.nombre}>{d.nombre}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth variant="outlined">
              <TextField
                id="horaInicio"
                type="time"
                name="horaInicio"
                value={celula.horaInicio}
                onChange={handleChange}
                label="Hora de inicio"
                InputLabelProps={{ shrink: true }}
              />
            </FormControl>
            
        </div>
      </Paper>

      {/* Datos Encargados */}
      <Paper sx={{ p: 3, mb: 4 }} elevation={2}>
        <Typography variant="h6" gutterBottom>
          Datos Encargados
        </Typography>
        
            <div className='grid grid-cols-2 gap-4'>
              <UsuarioSelect 
                celula={celula} 
                handleChange={handleChange} 
                usuarios={lideres}
                tipo="Líder"
                required={true}
              />
            
              <TextField required fullWidth label="Teléfono" name="telefono" value={celula.telefono} onChange={handleChange} />
              
              <div>
                <p className='mb-2'>Opcional</p>
                <UsuarioSelect 
                celula={celula} 
                handleChange={handleChange} 
                usuarios={timoteos}
                tipo="Timoteo"
                required={false}
              />
              </div>
              
            </div>
      
      </Paper>

      {/* Ubicación */}
      <Paper sx={{ p: 3, mb: 4 }} elevation={2}>
        <Typography variant="h6" gutterBottom>
          Ubicación
        </Typography>
            <div className='grid grid-cols-1 gap-4'>
            <TextField required fullWidth label="Dirección" name="direccion" value={celula.direccion} onChange={handleChange}/>
          
            <Alert severity="warning" sx={{ mt: 2, alignItems: "center" }}>
            IMPORTANTE: Seleccionar ubicación en el mapa.
            </Alert>
            <MapaSelector
              latitud={celula.latitud}
              longitud={celula.longitud}
              onChange={(lat, lng) => setCelula(prev => ({ ...prev, latitud: lat, longitud: lng }))}
            />
            {/* Hidden inputs */}
            <TextField label="Latitud" name="latitud" type="number" value={celula.latitud} onChange={handleChange} sx={{ display: 'none' }} />
            <TextField label="Longitud" name="longitud" type="number" value={celula.longitud} onChange={handleChange} sx={{ display: 'none' }} />
            </div>  
      </Paper>

      {/* Errores */}
      {errores.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errores.map((err, i) => (<div key={i}>• {err}</div>))}
        </Alert>
      )}

      {/* Botones */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button variant="outlined" onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit}>Agregar</Button>
      </Box>
    </Box>

  );
};
