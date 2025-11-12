// src/pages/CelulasPage.tsx
import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import 'leaflet/dist/leaflet.css';
import Button from '@mui/material/Button';
import { CelulaContext, type Celula, type CelulaCreateDTO, type Dias, type Generos } from '../context/CelulaContext';
import { CelulasMap } from '../components/CelulasMap';
import Dialog from '@mui/material/Dialog';
import { CrearCelulaFormPage } from './CrearCelulaFormPage';
import UsuarioSelect from '../components/UsuarioSelect';
import { TextField, Paper, Grid, FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, OutlinedInput } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import AddIcon from '@mui/icons-material/Add';
import { CelulaPanel } from '../components/CelulaPanel';
import Swal from 'sweetalert2';

export const CelulasPage: React.FC = () => {
  const celulaContext = React.useContext(CelulaContext);
  const [celulas, setCelulas] = React.useState<Celula[]>([]);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [dias,setDias] = React.useState<Dias[]>([]);
  const [generos,setGeneros] = React.useState<Generos[]>([]);
  const [filtros, setFiltros] = React.useState({ dias: [] as string[], genero: '', horaDesde: '', horaHasta: '', liderId: ''});
  const [selectedCelula, setSelectedCelula] = React.useState<Celula | null>(null);

  // reiniciar filtros
  const reiniciarFiltros = () => {
    setFiltros({
      dias: [] as string[],
      genero: '',
      horaDesde: '',
      horaHasta: '',
      liderId: '',
    });
  };

  // Funcion para verificar si el usuario logueado tiene permisos para Eliminar la celula
  const puedeAgregar = () => {
    const usuarioRol = localStorage.getItem("usuarioRol") || "";
     if (!usuarioRol) return false;
    // Solo admin puede agregar
    return usuarioRol === 'ADMIN';
  };

  // filtrar
  const filtrarCelulas = React.useMemo(() => {
    return celulas.filter(c => {
      const horaCelula = c.horaInicio ? c.horaInicio.slice(0, 5) : '';

      const cumpleHora =
        (!filtros.horaDesde && !filtros.horaHasta) ||
        (filtros.horaDesde && !filtros.horaHasta && horaCelula >= filtros.horaDesde) ||
        (!filtros.horaDesde && filtros.horaHasta && horaCelula <= filtros.horaHasta) ||
        (filtros.horaDesde && filtros.horaHasta && horaCelula >= filtros.horaDesde && horaCelula <= filtros.horaHasta);

      return (
        (filtros.dias.length === 0 || filtros.dias.some(dia => c.dia.toLowerCase() === dia.toLowerCase())) &&
        (!filtros.genero || c.genero.toLowerCase() === filtros.genero.toLowerCase()) &&
        cumpleHora &&
        (!filtros.liderId || c.lider.id === Number(filtros.liderId))
      );
    });
  }, [celulas, filtros]);

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

  const refreshCelulas = React.useCallback(async () => {
    if (!celulaContext) return;
    const data = await celulaContext.getCelulas();
    setCelulas(data);
  }, [celulaContext]);

  React.useEffect(() => {
    refreshCelulas();
  }, [refreshCelulas]);

  const handleAddCelula = async (celulaCreateDTO: CelulaCreateDTO) => {
    if (!celulaContext) return;
    try {
      await celulaContext.crearCelula(celulaCreateDTO);
      await refreshCelulas();
      setOpenDialog(false);
      Swal.fire({ title: "¡Creada!", text: "La celula fue creada exitosamente.", icon: "success", confirmButtonText: "Aceptar" });
    } catch (error:any) {
      if (error.response?.status == 400) {
        Swal.fire({ title: "¡Datos invalidos!", text: "Revisa los datos ingresados y vuelve a intentarlo!", icon: "warning", confirmButtonText: "Aceptar" });
      } else if (error.response?.status == 500) {
        Swal.fire({ title: "¡Error!", text: "Ocurrió un error en el servidor. Por favor, comuniquese con Sistemas.", icon: "error", confirmButtonText: "Aceptar" });
      } else {
        Swal.fire({ title: "¡Error!", text: "Ocurrió un error al crear la celula. Por favor, comuniquese con Sistemas.", icon: "error", confirmButtonText: "Aceptar" });
      }  
    }
    
  };

  const handleDiasChange = (event: any) => {
    const value = event.target.value;
    setFiltros({
      ...filtros,
      dias: typeof value === 'string' ? value.split(',') : value
    });
  };

  return (
    <Box
       sx={{
        width: '100%',
        height: {
          xs: '90vh', // móvil
          sm: '95vh', // tablet
          md: '100vh', // escritorio pequeño
          lg: '105vh', // escritorio grande
        },
        p: 4,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" fontWeight="bold">Gestión de Células</Typography>
      </Box>

      {/* Btn agregar */}
      { puedeAgregar() && (<Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ boxShadow: 2 }}
        >
          Agregar Nueva Célula
        </Button>
      </Box>)}

      {/* Filtros (arriba) */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterListIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" fontWeight="medium">Filtros de Búsqueda</Typography>
        </Box>

        <Grid container spacing={1} alignItems="left">
          <Grid size={{xs:12,sm:6,md:2.4}}>
            <TextField
              fullWidth
              label="Género"
              select
              value={filtros.genero}
              onChange={e => setFiltros({ ...filtros, genero: e.target.value })}
              SelectProps={{ native: true }}
              InputLabelProps={{ shrink: true }}
            >
              <option value="">Todos</option>
              {generos.map((g,i) => (
                <option key={i} value={g.nombre}>{g.nombre}</option>
              ))}
            </TextField>
          </Grid>

          <Grid size={{xs:12,sm:6,md:2.4}}>
            <FormControl sx={{ width: '100%' }}>
              <InputLabel shrink id="dias-multiple-checkbox-label">Días</InputLabel>
              <Select
                labelId="dias-multiple-checkbox-label"
                multiple
                value={filtros.dias}
                onChange={handleDiasChange}
                input={<OutlinedInput label="Días" />}
                renderValue={(selected) =>
                  (selected as string[]).length === 0 ? 'Todos' : (selected as string[]).join(', ')
                }
                displayEmpty
              >
                {dias.map((d) => (
                  <MenuItem key={d.nombre} value={d.nombre}>
                    <Checkbox checked={filtros.dias.indexOf(d.nombre) > -1} />
                    <ListItemText primary={d.nombre} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{xs:6,sm:3,md:1.8}}>
            <TextField
              fullWidth
              label="Desde"
              type="time"
              value={filtros.horaDesde}
              onChange={e => setFiltros({ ...filtros, horaDesde: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{xs:6,sm:3,md:1.8}}>
            <TextField
              fullWidth
              label="Hasta"
              type="time"
              value={filtros.horaHasta}
              onChange={e => setFiltros({ ...filtros, horaHasta: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{xs:12,sm:6,md:2.4}}>
            <UsuarioSelect
              celula={{ liderId: filtros.liderId }}
              handleChange={(e) => setFiltros({ ...filtros, liderId: e.target.value })}
              usuarios={[ ...new Map(celulas.map(c => [c.lider.id, c.lider])).values() ]}
              tipo="Líder"
              required={false}
            />
          </Grid>

          <Grid size={{xs:12,sm:6,md:1.2}}>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              startIcon={<RestartAltIcon />}
              onClick={reiniciarFiltros}
              sx={{ height: '56px' }}
            >
              Limpiar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* AREA: MAPA + PANEL (misma altura) */}
      <Box sx={{ display: 'flex', flexGrow: 1, gap: 2, overflow: 'hidden', minHeight: 500 }}>
        {/* Mapa: ocupa todo el espacio disponible */}
        <Box sx={{ flexGrow: 1, minWidth: 0 /* importante para overflow children */ }}>
          <CelulasMap
            celulas={filtrarCelulas}
            onSelectCelula={(c) => setSelectedCelula(c)}
            selectedCelula={selectedCelula}
          />
        </Box>

        {/* Panel: solo si hay seleccion, tiene la misma altura que el mapa */}
        {selectedCelula && (
          <Box sx={{ width: { xs: '70%', md: 380 }, maxWidth: 380, height: '100%' }}>
            <CelulaPanel
              celula={selectedCelula}
              onClose={() => setSelectedCelula(null)}
              refreshCelulas={refreshCelulas}
            />
          </Box>
        )}
      </Box>

      {/* Dialog crear */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <CrearCelulaFormPage
          onClose={() => setOpenDialog(false)}
          onSubmit={handleAddCelula}
        />
      </Dialog>
    </Box>
  );
};
