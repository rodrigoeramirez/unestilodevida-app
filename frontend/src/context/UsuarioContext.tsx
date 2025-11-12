import * as React from 'react'; /* eslint-disable react-refresh/only-export-components */
import { usuarioApi } from '../api/usuarioApi';

// Definición del tipo de dato Usuario
export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  clave: string;
  telefono: string;
  fotoPerfil:string;
  rol: string;
  fechaBaja?: Date | null;
}

export interface Rol {
  nombre:string;
}

//💡 Ejemplo mental:s
// Context = Caja vacía (el lugar donde vamos a guardar datos)
// Provider = Persona que pone los datos dentro de la caja
// Componentes hijos = Personas que pueden abrir la caja y usar lo que hay adentro

// ---------------------------------------------------------
// 💡 Qué es un Provider
// ---------------------------------------------------------
// Un Provider (proveedor) es un componente especial que "comparte"
// datos o funciones globales con todo lo que esté dentro de él.
// 
// En lugar de tener que pasar props de componente en componente
// como una cadena (prop drilling), el Provider permite que cualquier
// componente "hijo" acceda directamente a esos datos desde el Context.
//
// Ejemplo: si envolvés tu App con este Provider, cualquier componente
// dentro podrá usar las funciones de usuarioApi sin volver a importarlas.
// ---------------------------------------------------------


// En este caso la prop que recibe el provider es solo "children", es decir, el contenido que estará dentro del provider (otros componentes, formularios, tablas, etc.)
interface UsuarioProviderProps {
  children: React.ReactNode;
}

// ---------------------------------------------------------
// 📦 Definición del Context
// ---------------------------------------------------------
// Este Contexto define QUÉ datos o funciones estarán disponibles para quienes lo consuman (en este caso, solo las funciones que llaman a los endpoints de usuarios).
interface UsuarioContextValue {
  getUsuarios: () => Promise<Usuario[]>;                              // GET /usuarios
  getLideres: () => Promise<Usuario[]>;                              // GET /usuarios/lideres
  getTimoteos: () => Promise<Usuario[]>;                              // GET /usuarios/timoteos
  getUsuarioById: (id: number) => Promise<Usuario | null>;             // GET /usuarios/:id
  crearUsuario: (formData: FormData) => Promise<Usuario | null>; // POST /usuarios/create
  actualizarUsuario: (id: number, formData: FormData) => Promise<Usuario | null>;
  eliminarUsuario: (id: number) => Promise<boolean>; // DELETE /usuarios/delete/:id
  getRoles: () => Promise<Rol[]>;
  existByEmail:(email: string) =>Promise<boolean | null>;
  updateClave: (id: number, data: { claveActual: string; nuevaClave: string }) => Promise<void>;               
}

// ---------------------------------------------------------
// 🧠 Creación del Context: El Context actúa como canal de comunicación entre el provider y los componentes que necesitan usar funciones del provider
// ---------------------------------------------------------
// Creamos el Context propiamente dicho. Inicialmente no tiene valor (undefined) hasta que lo envuelva el Provider.
export const UsuarioContext = React.createContext<UsuarioContextValue | undefined>(undefined);


// ---------------------------------------------------------
// ⚙️ Implementación del Provider
// ---------------------------------------------------------
// Este componente centraliza todas las funciones de usuarioApi y las "distribuye" al resto de la aplicación mediante el Context.
export const UsuarioProvider: React.FC<UsuarioProviderProps> = ({ children }) => {
  const token = localStorage.getItem("token"); // Obtengo el token del localStorage.

  // -------------------------------------------------------
  // 🔹 Obtener todos los usuarios
  // -------------------------------------------------------
  const getUsuarios = async (): Promise<Usuario[]> => {
    try {
      const res = await usuarioApi.getAll(); // Llamamos al endpoint
      return res.data;                       // Devolvemos la lista
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      return []; // Devolvemos un array vacío si hay error
    }
  };
    // -------------------------------------------------------
  // 🔹 Obtener todos los usuarios lideres
  // -------------------------------------------------------
  const getLideres = async (): Promise<Usuario[]> => {
    try {
      const res = await usuarioApi.getLideres(); // Llamamos al endpoint
      return res.data;                       // Devolvemos la lista
    } catch (error) {
      console.error('Error obteniendo usuarios lideres:', error);
      return []; // Devolvemos un array vacío si hay error
    }
  };
    // -------------------------------------------------------
  // 🔹 Obtener todos los usuarios timoteos
  // -------------------------------------------------------
  const getTimoteos = async (): Promise<Usuario[]> => {
    try {
      const res = await usuarioApi.getTimoteos(); // Llamamos al endpoint
      return res.data;                       // Devolvemos la lista
    } catch (error) {
      console.error('Error obteniendo usuarios timoteos:', error);
      return []; // Devolvemos un array vacío si hay error
    }
  };

    // -------------------------------------------------------
  // 🔹 Verificar si el mail ya exixste en la BD
  // -------------------------------------------------------
  const existByEmail = async (email: string): Promise<boolean | null> => {
    try {
      const res = await usuarioApi.existByEmail(email); // Llamamos al endpoint
      return res.data;
    } catch (error) {
      console.error('Error verificar el email:', error);
      return null; // Devolvemos un false si hay error;
    }
  };

  // -------------------------------------------------------
  // 🔹 Obtener todos los roles
  // -------------------------------------------------------
  const getRoles = async (): Promise<Rol[]> => {
    try {
      const res = await usuarioApi.getRoles(); // Llamamos al endpoint
      return res.data;                       // Devolvemos la lista
    } catch (error) {
      console.error('Error obteniendo los roles:', error);
      return []; // Devolvemos un array vacío si hay error
    }
  };

  // -------------------------------------------------------
  // 🔹 Obtener un usuario por ID
  // -------------------------------------------------------
  const getUsuarioById = async (id: number): Promise<Usuario | null> => {
    try {
      const res = await usuarioApi.getById(id);
      return res.data;
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      throw error;
    }
  };

  // -------------------------------------------------------
  // 🔹 Crear un nuevo usuario
  // -------------------------------------------------------
  const crearUsuario = async (formData: FormData): Promise<Usuario | null> => {
  try {
    const res = await usuarioApi.create(formData);
    return res.data;
  } catch (error) {
    console.error('Error creando usuario:', error);
    throw error;
  }
};

  // -------------------------------------------------------
  // 🔹 Actualizar un usuario existente
  // -------------------------------------------------------
  const actualizarUsuario = async (id: number, formData: FormData): Promise<Usuario | null> => {
  try {
    const res = await usuarioApi.update(id, formData);
    return res.data;
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    throw error;
  }
};


  // -------------------------------------------------------
  // 🔹 Eliminar un usuario
  // -------------------------------------------------------
  const eliminarUsuario = async (id: number): Promise<boolean> => {
    try {
      await usuarioApi.delete(id);
      return true; // Si no hay error, devolvemos true
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      throw error;
    }
  };

   // -------------------------------------------------------
  // 🔐 Nueva función: Cambiar clave
  // -------------------------------------------------------
  const updateClave = async (id: number, data: { claveActual: string; nuevaClave: string }): Promise<void> => {
    try {
      await usuarioApi.updateClave(id, data);
    } catch (error) {
      console.error('Error actualizando la clave:', error);
      throw error;
    }
  };

  // -------------------------------------------------------
  // 🚀 Retornamos el Provider
  // -------------------------------------------------------
  // Aquí "inyectamos" todas las funciones dentro del Context.
  // Así, cualquier componente hijo podrá usarlas llamando al Context.
  return (
    <UsuarioContext.Provider
      value={{ getUsuarios, getUsuarioById, crearUsuario, actualizarUsuario, eliminarUsuario, getRoles, existByEmail, getLideres, getTimoteos, updateClave, }}
    >
      {children}
    </UsuarioContext.Provider>
  );
};
