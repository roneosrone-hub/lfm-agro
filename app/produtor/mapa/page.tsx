// @ts-nocheck
"use client";

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

import dynamic from "next/dynamic";
import React from "react";

const MapaClient = dynamic(() => Promise.resolve(MapaInner), { ssr: false });

export default function Page() {
  return <MapaClient />;
}

function MapaInner() {
  const React = require("react");
  const { useEffect, useMemo, useState } = React;

  const L = require("leaflet");
  require("leaflet-draw");
  const turf = require("@turf/turf");

  const {
    MapContainer,
    TileLayer,
    FeatureGroup,
    Marker,
    Popup,
  } = require("react-leaflet");

  const { EditControl } = require("react-leaflet-draw");

  const center = useMemo(() => [-15.60, -56.10], []);
  const [area, setArea] = useState(null);
  const [grids, setGrids] = useState([]);

  useEffect(() => {
    const icon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });

    L.Marker.prototype.options.icon = icon;
  }, []);

  function onCreated(e: any) {
    const layer = e.layer;
    const geo = layer.toGeoJSON();

    const areaHa = turf.area(geo) / 10000;
    setArea(areaHa.toFixed(2));

    gerarGrid(geo);
  }

  function gerarGrid(geojson: any) {
    const bbox = turf.bbox(geojson);
    const cell = 0.002; // tamanho do grid
    const grid = turf.squareGrid(bbox, cell, { units: "degrees" });

    const dentro = grid.features.filter((f: any) =>
      turf.booleanIntersects(f, geojson)
    );

    setGrids(dentro);
  }

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapContainer
        center={center}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap"
        />

        <FeatureGroup>
          <EditControl
            position="topright"
            onCreated={onCreated}
            draw={{
              rectangle: true,
              polygon: true,
              circle: false,
              polyline: false,
              marker: false,
              circlemarker: false,
            }}
          />
        </FeatureGroup>

        {grids.map((g: any, i: number) => (
          <GeoJSON key={i} data={g} style={{ color: "#00ff88", weight: 1 }} />
        ))}

        <Marker position={center}>
          <Popup>
            {area ? (
              <>
                <b>Área:</b> {area} ha
              </>
            ) : (
              "Desenhe o talhão"
            )}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
