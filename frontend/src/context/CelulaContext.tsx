import * as React from 'react'; /* eslint-disable react-refresh/only-export-components */
import { celulaApi } from '../api/celulaApi';

// Representa un usuario relacionado a la célula (líder o timoteo)
export interface UsuarioRelacionado {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  clave: string;
  telefono: string | null;
  fotoPerfil: string | null;
  rol: "LIDER" | "TIMOTEO" | "ADMIN" | "USUARIO"; // podés ajustar según tus roles reales
}

// Representa una célula completa (respuesta del backend)
export interface Celula {
  id: number;
  nombre: string;
  dia: string;
  genero: string;
  horaInicio: string;
  direccion: string;
  latitud: number;
  longitud: number;
  descripcion: string;
  telefono: string;
  enlaceWhatsapp: string;
  qrWhatsapp: string;
  lider: UsuarioRelacionado;
  timoteo: UsuarioRelacionado;
}

// Representa los datos que se envían para crear o modificar una célula
export interface CelulaCreateDTO {
  nombre: string;
  dia: string;
  genero: string;
  horaInicio: string;
  direccion: string;
  latitud: number;
  longitud: number;
  descripcion: string;
  telefono: string;
  liderId: number;
  timoteoId: number;
}

export interface Dias {
  nombre:string
}
export interface Generos {
  nombre:string
}

interface UsuarioProviderProps {
  children: React.ReactNode;
}

interface CelulaContextValue {
  getCelulas: () => Promise<Celula[]>;                              // GET /celulas
  getCelulaById: (id: number) => Promise<Celula | null>;             // GET /celulas/:id
  crearCelula: (data: CelulaCreateDTO) => Promise<Celula | null>; // POST /celulas/create
  actualizarCelula: (id: number, data: Partial<CelulaCreateDTO>) => Promise<Celula | null>; // PATCH /celulas/update/:id
  eliminarCelula: (id: number) => Promise<string>; // DELETE /celulas/delete/:id
  getDias:() => Promise<Dias[]>;
  getGeneros:() =>Promise<Generos[]>  
  usuarioLibre:(id:number) => Promise<string | null>;          
}

export const CelulaContext = React.createContext<CelulaContextValue | undefined>(undefined);

export const CelulaProvider: React.FC<UsuarioProviderProps> = ({ children }) => {
  
  // -------------------------------------------------------
  // 🔹 Obtener todos las celulas
  // -------------------------------------------------------
  const getCelulas = async (): Promise<Celula[]> => {
    try {
      const res = await celulaApi.getAll(); // Llamamos al endpoint
      return res.data;                       // Devolvemos la lista
    } catch (error) {
      console.error('Error obteniendo celulas:', error);
      return []; // Devolvemos un array vacío si hay error
    }
  };
  // -------------------------------------------------------
  // 🔹 Obtener una celula por ID
  // -------------------------------------------------------
  const getCelulaById = async (id: number): Promise<Celula | null> => {
    try {
      const res = await celulaApi.getById(id);
      return res.data;
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      return null;
    }
  };

  // -------------------------------------------------------
  // 🔹 Crear una nueva celula
  // -------------------------------------------------------
  const crearCelula = async (data: Omit<CelulaCreateDTO, 'id'>): Promise<Celula | null> => {
    try {
      const res = await celulaApi.create(data);
      return res.data;
    } catch (error) {
      console.error('Error creando celula:', error);
      throw error; // Permite que  el erro viaje hacia arriba para mostarlo en la vista
    }
  };

  // -------------------------------------------------------
  // 🔹 Actualizar una celula existente
  // -------------------------------------------------------
  const actualizarCelula = async (id: number, data: Partial<CelulaCreateDTO>): Promise<Celula | null> => {
    try {
      const res = await celulaApi.update(id, data);
      return res.data;
    } catch (error) {
      console.error('Error actualizando celula:', error);
      throw error; // Permite que el error viaje hacia arriba
    }
  };

  // -------------------------------------------------------
  // 🔹 Eliminar una celula
  // -------------------------------------------------------
  const eliminarCelula = async (id: number): Promise<string> => {
    try {
      const res = await celulaApi.delete(id);
      return res.data; // Si no hay error, devolvemos true
    } catch (error) {
      console.error('Error eliminando celula:', error);
      throw error;
    }
  };
    // -------------------------------------------------------
  // 🔹 Obtener los dias de la semana disponibles desde el back
  // -------------------------------------------------------
  const getDias = async (): Promise<Dias[]> => {
    try {
      const res= await celulaApi.getDias();
      return res.data; // Si no hay error, devolvemos el 
    } catch (error) {
      console.error('Error obteniendo los dias:', error);
      return [];
    }
  };  
  // -------------------------------------------------------
  // 🔹 Obtener los generos disponibles desde el back
  // -------------------------------------------------------
 const getGeneros = async (): Promise<Generos[]> => {
    try {
      const res= await celulaApi.getGeneros();
      return res.data; // Si no hay error, devolvemos el 
    } catch (error) {
      console.error('Error obteniendo generos:', error);
      return [];
    }
  }; 

    const usuarioLibre = async (id: number): Promise<string | null> => {
      try {
        const res = await celulaApi.usuarioLibre(id); // Llamamos al endpoint
        return res.data;
      } catch (error) {
        console.error('Error verificar disponibilidad del usuario:', error);
        return null; // Devolvemos null si hay error;
      }
    };

  // -------------------------------------------------------
  // 🚀 Retornamos el Provider
  // -------------------------------------------------------
  // Aquí "inyectamos" todas las funciones dentro del Context.
  // Así, cualquier componente hijo podrá usarlas llamando al Context.
  return (
    <CelulaContext.Provider
      value={{ getCelulas, getCelulaById, crearCelula, actualizarCelula, eliminarCelula, getGeneros, getDias, usuarioLibre }}
    >
      {children}
    </CelulaContext.Provider>
  );
};
