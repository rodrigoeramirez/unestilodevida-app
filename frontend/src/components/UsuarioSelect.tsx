import React, { useState, useMemo } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  ListSubheader
} from '@mui/material';
import { AccountCircle, Search } from '@mui/icons-material';

// Componente reutilizable para Líder y Timoteo
function UsuarioSelect({ celula, handleChange, usuarios, tipo = 'Líder', required = false }) {
  const [searchText, setSearchText] = useState('');

  // Determinar el nombre del campo según el tipo
  const fieldName = tipo === 'Líder' ? 'liderId' : 'timoteoId';
  const fieldValue = celula[fieldName] || 0;

  // Ordenar alfabéticamente y filtrar usuarios
  const usuariosOrdenados = useMemo(() => {
    return usuarios
      .sort((a, b) => {
        const nombreA = `${a.nombre} ${a.apellido}`.toLowerCase();
        const nombreB = `${b.nombre} ${b.apellido}`.toLowerCase();
        return nombreA.localeCompare(nombreB);
      })
      .filter(u => {
        const nombreCompleto = `${u.nombre} ${u.apellido}`.toLowerCase();
        return nombreCompleto.includes(searchText.toLowerCase());
      });
  }, [usuarios, searchText]);

  return (
    <FormControl sx={{ width: '100%' }}>
      <InputLabel required={required} id={`${tipo.toLowerCase()}-label`}>
        {tipo}
      </InputLabel>
      <Select
        label={tipo}
        labelId={`${tipo.toLowerCase()}-label`}
        name={fieldName}
        value={fieldValue}
        onChange={handleChange}
        startAdornment={<AccountCircle style={{ marginRight: 8 }} />}
        // Prevenir que el Select se cierre al hacer clic en el buscador
        MenuProps={{
          autoFocus: false,
          PaperProps: {
            style: {
              maxHeight: 400
            }
          }
        }}
      >
        {/* Campo de búsqueda */}
        <ListSubheader>
          <TextField
            size="small"
            autoFocus
            placeholder={`Buscar ${tipo.toLowerCase()}...`}
            fullWidth
            InputProps={{
              startAdornment: <Search style={{ marginRight: 8, color: '#999' }} />
            }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              // Prevenir que el Select capture las teclas
              if (e.key !== 'Escape') {
                e.stopPropagation();
              }
            }}
            sx={{ mt: 1, mb: 1 }}
          />
        </ListSubheader>
            <MenuItem>Ninguno/a</MenuItem>
        {/* Lista de usuarios filtrados y ordenados */}
        {usuariosOrdenados.length > 0 ? (
          usuariosOrdenados.map(u => (
            <MenuItem key={u.id} value={u.id}>
              {u.nombre} {u.apellido}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>
            <Box sx={{ fontStyle: 'italic', color: '#999' }}>
              No se encontraron resultados
            </Box>
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
}

export default UsuarioSelect;