import * as React from 'react';
import Box from '@mui/material/Box';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/Edit';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';

interface TablaProps {
  data: any[];
  onRowDelete?: (id: number) => Promise<void> | void;
  onRowUpdate?: (id: number) => Promise<void> | void;
  height?: number;
}

export default function Tabla({ data, onRowDelete, onRowUpdate, height = 500 }: TablaProps) {
  const [rows, setRows] = React.useState(data);

  React.useEffect(() => {
    setRows(data);
  }, [data]);

  // Generar columnas automáticamente desde las keys del data
  const generateColumns = (): GridColDef[] => {
    if (!rows || rows.length === 0) return [];

    return Object.keys(rows[0])
      .filter((key) => key !== 'id')
      .map((key) => ({
        field: key,
        headerName: key.charAt(0).toUpperCase() + key.slice(1),
        flex: 1, // hace que se expanda automáticamente
        minWidth: 150, // evita que colapse en pantallas pequeñas
      }));
  };

  // Columna de acciones
  const actionsColumn: GridColDef = {
    field: 'actions',
    type: 'actions',
    headerName: 'Acciones',
    flex: 0.5,
    minWidth: 120,
    getActions: ({ id }) => [
      <GridActionsCellItem
        key="edit"
        icon={<EditIcon />}
        label="Editar"
        onClick={() => onRowUpdate && onRowUpdate(Number(id))}
      />,
      <GridActionsCellItem
        key="delete"
        icon={<DeleteIcon />}
        label="Eliminar"
        onClick={() => onRowDelete && onRowDelete(Number(id))}
      />,
    ],
  };

  const columns = [...generateColumns(), actionsColumn];

  return (
    <Box
      sx={{
        width: '100%',
        overflowX: 'auto', // permite scroll horizontal en móviles
        borderRadius: 2,
        boxShadow: 1,
        backgroundColor: 'background.paper',
        p: { xs: 1, sm: 2 },
        '& .MuiDataGrid-root': {
          border: 'none',
        },
        '& .MuiDataGrid-cell': {
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
        },
        '& .MuiDataGrid-columnHeaders': {
          backgroundColor: '#f5f5f5',
          fontWeight: 'bold',
        },
      }}
    >
      <Box
        sx={{
          width: '100%',
          minWidth: { xs: '600px', sm: 'auto' }, // evita que se rompa en pantallas muy chicas
          height,
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
          autoHeight={false}
          density="comfortable"
          sx={{
            width: '100%',
            fontSize: { xs: '0.8rem', sm: '0.9rem' }, // ajusta texto en móviles
          }}
        />
      </Box>
    </Box>
  );
}
