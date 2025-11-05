import * as React from 'react';
import Box from '@mui/material/Box';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/Edit';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';

// Defino una interfaz para tipar las props del componente Tabla y asegurar que reciba los datos y funciones esperadas.
interface TablaProps {
  data: any[];
  onRowDelete?: (id: string | number) => Promise<void> | void;
  onRowUpdate?: (id: string | number, updatedRow: any) => Promise<void> | void;
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
        width: 180,
      }));
  };

  // Columna de acciones (Editar y Eliminar)
  const actionsColumn: GridColDef = {
    field: 'actions',
    type: 'actions',
    headerName: 'Acciones',
    width: 120,
    getActions: ({ id }) => [
      <GridActionsCellItem
        key="edit"
        icon={<EditIcon />}
        label="Editar"
        onClick={() => {
          const row = rows.find((r) => r.id === id);
          if (onRowUpdate && row) onRowUpdate(id, row);
        }}
      />,
      <GridActionsCellItem
        key="delete"
        icon={<DeleteIcon />}
        label="Eliminar"
        onClick={() => onRowDelete && onRowDelete(id)}
      />,
    ],
  };

  const columns = [...generateColumns(), actionsColumn];

  return (
    <Box sx={{ height, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        disableRowSelectionOnClick
      />
    </Box>
  );
}
