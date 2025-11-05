import * as React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { CelulaMarker } from "./CelulaMarker";
import { type Celula } from "../context/CelulaContext";
import L from "leaflet";

interface Props {
  celulas: Celula[];
  center?: [number, number];
  onSelectCelula?: (celula: Celula) => void;
}

const createCustomClusterIcon = (cluster: any) => {
  const markers = cluster.getAllChildMarkers();
  const count = markers.length;

  const hombres = markers.filter((m: any) => m.options.icon.options.genero === 'HOMBRE').length;
  const mujeres = markers.filter((m: any) => m.options.icon.options.genero === 'MUJER').length;

  let backgroundColor = '#9ca3af'; // gris neutro para mixto
  if (hombres && !mujeres) backgroundColor = '#23abf5';
  else if (mujeres && !hombres) backgroundColor = '#ff2949';

  const style = `
    background-color: ${backgroundColor};
    color: white;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid white;
    box-shadow: 0 0 10px rgba(0,0,0,0.3);
    font-size: 14px;
    font-weight: bold;
  `;

  return L.divIcon({
    html: `<div style="${style}">${count}</div>`,
    className: 'custom-cluster-icon',
    iconSize: L.point(40, 40, true),
  });
};

export const CelulasMap: React.FC<Props> = ({
  celulas,
  center = [-34.951586, -57.89118],
  onSelectCelula,
}) => {
  return (
    <div className="h-full w-full">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={true}
        className="h-full w-full rounded-2xl"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/*Marker Clusters agrupa marcadores cercanos automáticamente */}
        <MarkerClusterGroup chunkedLoading iconCreateFunction={createCustomClusterIcon} maxClusterRadius={20} >
          {celulas.map((celula) => (
            <CelulaMarker
              key={celula.id}
              celula={celula}
              onSelect={() => onSelectCelula?.(celula)}
            />
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
};
