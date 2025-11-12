// src/components/CelulaPanel.tsx
import * as React from "react";
import { type Celula, type CelulaCreateDTO } from "../context/CelulaContext";
import { Calendar, Clock, MapPin, ChevronRight } from "lucide-react";
import { WhatsApp } from "@mui/icons-material";
import { Box, Button, Dialog } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { EditarCelulaFormPage } from "../pages/EditarCelulaFormPage";
import { CelulaContext } from "../context/CelulaContext";
import Swal  from "sweetalert2";

interface Props {
  celula: Celula;
  onClose: () => void;
  refreshCelulas: () => Promise<void>; 
}



export const CelulaPanel: React.FC<Props> = ({ celula, onClose, refreshCelulas }) => {
  
  const usuarioRol = localStorage.getItem("usuarioRol");
  const usuarioId = localStorage.getItem("usuarioId");
  const [openEditar, setOpenEditar] = React.useState(false);
  const celulaContext = React.useContext(CelulaContext);

  // Funcion para verificar si el usaurio logeado tiene permisos para Editar la celula
  const puedeEditar = () => {
    if (!usuarioRol || !usuarioId) return false;
   
    // Admin puede editar todo
    if (usuarioRol === 'ADMIN') {
      return true;
    }
    

    // Líder o Timoteo solo su propia célula
    if ((usuarioRol === 'LIDER' || usuarioRol === 'TIMOTEO') && (celula.lider?.id === Number(usuarioId)) || celula.timoteo?.id === Number(usuarioId)) {
      return true;
    }

    return false;
  };

  // Funcion para verificar si el usuario logueado tiene permisos para Eliminar la celula
  const puedeEliminar = () => {
     if (!usuarioRol) return false;

    // Solo admin puede eliminar
    return usuarioRol === 'ADMIN';
  };

  // Mofifica celula
  const handleEditCelula = async (celulaUpdateDTO: CelulaCreateDTO) => {
  if (!celulaContext) return;

  try {
    const celulaEditada = await celulaContext.actualizarCelula(celula.id, celulaUpdateDTO);
    if (celulaEditada && celulaEditada.id === celula.id) {
      // Actualiza el estado local
      Object.assign(celula, celulaEditada);
      await refreshCelulas(); // Refresca la lista
      setOpenEditar(false);
      Swal.fire({
        title: "¡Modificada!",
        text: "La célula fue modificada exitosamente.",
        icon: "success",
        confirmButtonText: "Aceptar"
      });
  } 
  } catch (error: any) {
    setOpenEditar(false);
     if (error.response?.status === 400) {
        Swal.fire("Datos inválidos", "Revisá los campos ingresados.", "warning");
      } else if (error.response?.status === 500) {
        Swal.fire("Error del servidor", "Ocurrió un problema interno. Por favor, comuniquese con Sistemas", "error");
      } else {
        Swal.fire("Error", "No se pudo modificar la célula. Por favor, comuniquese con Sistemas", "error");
      }
  }
};

  
  const colors = {
    mujer: {
      primary: "#ff2949",
      light: "#fff5f7",
      medium: "#ffeef0",
    },
    hombre: {
      primary: "#23abf5",
      light: "#f5fbff",
      medium: "#e8f6ff",
    },
  };

  const currentColors = celula.genero === "MUJER" ? colors.mujer : colors.hombre;

  return (
    
    <div
      className="h-full w-full bg-white shadow-lg rounded-lg flex flex-col overflow-hidden"
      style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)" }}
    >
      {/* Header */}
      <div
        className="p-5 text-white"
        style={{
          background: `linear-gradient(135deg, ${currentColors.primary} 0%, ${currentColors.primary}dd 100%)`,
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">{celula.nombre}</h2>
            <p className="text-white/90 text-sm mt-1">Célula de {celula.genero.toLowerCase()}</p>
          </div>

          <button
            onClick={onClose}
            title="Contraer panel"
            className="
                ml-4
                rounded-full
                p-2
                text-white
                flex items-center justify-center
                transition-all duration-300 ease-in-out
                shadow-lg hover:shadow-xl
            "
            style={{
                backgroundColor: 'rgba(48, 48, 48, 0.7)', 
                backdropFilter: 'blur(4px)', 
            }}
            >
            <ChevronRight size={20} />
            </button>
        </div>

         <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          {puedeEditar() && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setOpenEditar(true)}
              sx={{
                textTransform: 'none',
                fontWeight: 'bold',
                color: '#333', // texto oscuro para contraste
                background: 'rgba(255,255,255,0.7)', // semi-transparente
                backdropFilter: 'blur(6px)', // efecto glass
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                borderRadius: 2,
                '&:hover': {
                  background: 'rgba(255,255,255,0.85)',
                  boxShadow: '0 6px 10px rgba(0,0,0,0.15)',
                },
              }}
            >
              Editar
            </Button>
          )}

          {puedeEliminar() && (
            <Button
              variant="contained"
              startIcon={<DeleteIcon />}
              onClick={async () => {
                const result = await Swal.fire({
                    title: "¿Dar de baja celula?",
                    text: "Estás por dar de baja esta celula. ¿Deseas continuar?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Dar de baja",
                    cancelButtonText: "Cancelar",
                    confirmButtonColor: "#d33",
                    cancelButtonColor: "#3085d6",
                  });
                  if (result.isConfirmed) {
                    if (!celulaContext) return;   
                    try {
                      const mensaje = await celulaContext.eliminarCelula(celula.id);
                      await refreshCelulas();
                      onClose();
                      Swal.fire({ title: "Baja", text: mensaje, icon: "success", confirmButtonText: "Aceptar"});
                    } catch (error: any) {
                      if (error.response?.status == 500) {
                        Swal.fire({title:"Error en el servidor", text:error.response.data, icon:"error", confirmButtonText:"Aceptar"});
                      } else {
                        Swal.fire("Error", "No se pudo eliminar la célula. Por favor, comuniquese con Sistemas", "error");
                      }
                    }
                  }
              }}
              sx={{
                textTransform: 'none',
                fontWeight: 'bold',
                color: '#333', 
                background: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(6px)',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                borderRadius: 2,
                '&:hover': {
                  background: 'rgba(255,255,255,0.85)',
                  boxShadow: '0 6px 10px rgba(0,0,0,0.15)',
                },
              }}
            >
              Eliminar
            </Button>
          )}

              {/* Dialogo para editar celula */}
              <Dialog open={openEditar} onClose={() => setOpenEditar(false)}>
                <EditarCelulaFormPage
                  onClose={() => setOpenEditar(false)} 
                  onSubmit={handleEditCelula} 
                  celulaData={celula}
                />
              </Dialog>

        </Box>


      </div>
      

      {/* Body (scrollable) */}
      <div className="p-6 space-y-6 overflow-y-auto flex-1">
        <div
          className="rounded-2xl p-4 border transition-all duration-200 hover:shadow-md flex items-center gap-4"
          style={{
            backgroundColor: currentColors.light,
            borderColor: currentColors.medium,
          }}
        >
          {celula.lider.fotoPerfil ? (
            <img
              src={celula.lider.fotoPerfil}
              alt="Foto del líder"
              className="w-16 h-16 rounded-full object-cover border-2 shadow-sm"
              style={{ borderColor: currentColors.primary }}
            />
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-sm"
              style={{ backgroundColor: currentColors.primary }}
            >
              {celula.lider.nombre.charAt(0)}
            </div>
          )}

          <div>
            <p className="text-xs font-medium uppercase tracking-wide opacity-70 mb-1">Líder</p>
            <p className="font-semibold text-gray-900">{celula.lider.nombre} {celula.lider.apellido}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: currentColors.primary }} />
            Información de la célula
          </h3>

          {[
            { Icon: Calendar, label: "Día", value: celula.dia },
            { Icon: Clock, label: "Hora", value: celula.horaInicio },
            { Icon: MapPin, label: "Ubicación", value: celula.direccion },
          ].map((info, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
              <div className="p-2 rounded-lg" style={{ backgroundColor: currentColors.light }}>
                <info.Icon size={18} style={{ color: currentColors.primary }} />
              </div>
              <div>
                <p className="text-sm text-gray-600">{info.label}</p>
                <p className="font-semibold text-gray-900">{info.value}</p>
              </div>
            </div>
          ))}
        </div>

        {celula.qrWhatsapp && (
          <div className="text-center p-6 rounded-2xl border-2 border-dashed" style={{ borderColor: currentColors.medium }}>
            <p className="text-sm font-medium text-gray-700 mb-3">Escanea para chatear con el ldier</p>
            <div className="inline-block p-3 rounded-2xl" style={{ backgroundColor: currentColors.light }}>
              <img src={`data:image/png;base64,${celula.qrWhatsapp}`} alt="QR WhatsApp" className="w-32 h-32 mx-auto rounded-lg shadow-sm" />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-white">
        <a
          href={celula.enlaceWhatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-green-500 hover:bg-green-600 text-white !text-white py-3 px-4 rounded-2xl font-semibold transition flex items-center justify-center gap-3"
        >
          <WhatsApp style={{ fontSize: 20 }} />
          <span>Contactar al líder</span>
        </a>
      </div>
    </div>
  );
};
