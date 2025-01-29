"use client";

import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export const renderOther = ({ chartType, elements, graphData }) => {
    if (!elements?.length) {
        return <p>No data available for rendering the information.</p>;
    }

    if (!["Info", "Map", "Map Trajectory"].includes(chartType)) {
        return <p>Invalid chart type.</p>;
    }

    console.log('renderOther', chartType, elements, graphData);

    switch (chartType) {
        case "Info":
            return (
                <ScrollArea className="h-64">
                    <div className="space-y-4">
                        {elements.map((element) => {
                            const dataValue = graphData[0]?.[element.dataKey];
                            const displayValue = typeof dataValue === "object" ? JSON.stringify(dataValue) : dataValue;

                            return (
                                <div key={element.id} className="p-1">
                                    <h3 className="text-lg font-semibold text-black dark:text-white">
                                        {element.name}: {displayValue !== undefined ? displayValue : "N/A"}
                                    </h3>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            );
        case "Map":
            console.log('Graph type is Map', graphData);
            return (
                <MapContainer center={[0, 0]} zoom={2} style={{ height: 400, width: "100%" }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                </MapContainer>
            );
        case "Map Trajectory":
            const trajectoryPoints = elements.flatMap((element) =>
                element.manualEntry
                    ? element.pinpoints.map((point) => [point.latitude, point.longitude])
                    : graphData.map((data) => [data[element.latitudeKey], data[element.longitudeKey]])
            );

            return (
                <MapContainer center={[0, 0]} zoom={2} style={{ height: 400, width: "100%" }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Polyline positions={trajectoryPoints} color="blue" />
                </MapContainer>
            );
        default:
            return (
                <p>Error rendering visualisation</p>
            );
    }
};
