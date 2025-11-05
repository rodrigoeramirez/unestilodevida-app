// src/components/MapaSelector.tsx
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";

const icon = new L.Icon({
  iconUrl: 'src/assets/icono_selector.png',
  iconSize: [50, 50],
  iconAnchor: [15, 30],
});

interface MapaSelectorProps {
  latitud: number;
  longitud: number;
  onChange: (lat: number, lng: number) => void;
}

export const MapaSelector: React.FC<MapaSelectorProps> = ({ latitud, longitud, onChange }) => {
  // Si no hay coordenadas, usamos La Plata como punto inicial
  const posicionInicial: [number, number] = [-34.951586, -57.89118];
  const [posicion, setPosicion] = useState<[number, number]>(
    latitud && longitud ? [latitud, longitud] : posicionInicial
  );

  useEffect(() => {
    if (latitud && longitud) setPosicion([latitud, longitud]);
  }, [latitud, longitud]);

  // Captura el click en el mapa
  function MapClickHandler() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosicion([lat, lng]);
        onChange(lat, lng);
      },
    });
    return null;
  }


  return (
    <MapContainer
      center={posicion}
      zoom={13}
      style={{ height: "300px", width: "100%", borderRadius: "10px" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
      />
      <MapClickHandler />
      <Marker position={posicion} icon={icon}></Marker>
    </MapContainer>
  );
};
