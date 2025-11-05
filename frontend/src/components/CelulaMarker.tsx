// src/components/CelulaMarker.tsx
import * as React from "react";
import { Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { type Celula } from "../context/CelulaContext";
import { useRef } from "react";

const iconoHombre = new L.Icon({
  iconUrl: "src/assets/logo_celula_hombre.png",
  iconSize: [50, 50],
  iconAnchor: [15, 30],
   genero: "HOMBRE"
});

const iconoMujer = new L.Icon({
  iconUrl: "src/assets/logo_celula_mujer.png",
  iconSize: [50, 50],
  iconAnchor: [15, 30],
   genero: "MUJER"

});

interface Props {
  celula: Celula;
  onSelect: () => void;
}

export const CelulaMarker: React.FC<Props> = ({ celula, onSelect }) => {
  const map = useMap();
  const icon = celula.genero === "MUJER" ? iconoMujer : iconoHombre;
  const markerRef = useRef<L.Marker>(null);

  const handleMarkerClick = () => {
    const marker = markerRef.current;
    if (!marker) return;

    onSelect(); // 👉 avisamos al padre
  };

  return (
    <Marker
      ref={markerRef}
      position={[celula.latitud, celula.longitud]}
      icon={icon}
      eventHandlers={{ click: handleMarkerClick }}
    />
  );
};
