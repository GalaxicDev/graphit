'use client';

import React, { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import { Button } from "@/components/ui/button";
import "leaflet/dist/leaflet.css";

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
            console.log('Rendering Map', graphData);

            const mapMarkers = elements.flatMap((element) =>
                element.manualEntry
                    ? (element.pinpoints?.length
                            ? element.pinpoints
                            : [{ latitude: "0", longitude: "0", label: "Default Point" }]
                    ).map((point) => ({
                        latitude: parseFloat(point.latitude) || 0,
                        longitude: parseFloat(point.longitude) || 0,
                        label: point.label || "Unnamed Point"
                    }))
                    : graphData.map((data) => ({
                        latitude: parseFloat(data[element.latitudeKey]) || 0,
                        longitude: parseFloat(data[element.longitudeKey]) || 0,
                        label: data[element.name] || "Point"
                    }))
            );

            return (
                <MapContainer center={[0, 0]} zoom={2} style={{ height: 400, width: "100%" }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {mapMarkers.map((point, index) => (
                        <Marker key={index} position={[point.latitude, point.longitude]}>
                            <Popup>{point.label}</Popup>
                        </Marker>
                    ))}
                </MapContainer>
            );

        case "Map Trajectory":
            return <TrajectoryPlayback elements={elements} graphData={graphData} />;

        default:
            return <p>Error rendering visualization</p>;
    }
};

const TrajectoryPlayback = ({ elements, graphData }) => {
    const [playbackIndex, setPlaybackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [trajectoryPoints, setTrajectoryPoints] = useState([]);
    const [timestamps, setTimestamps] = useState([]);

    useEffect(() => {
        const newPoints = elements.flatMap((element) =>
            element.manualEntry
                ? (element.pinpoints?.length
                        ? element.pinpoints
                        : [{ latitude: "0", longitude: "0", timestamp: Date.now() }]
                ).map((point) => ({
                    lat: parseFloat(point.latitude) || 0,
                    lng: parseFloat(point.longitude) || 0,
                    timestamp: point.timestamp || Date.now()
                }))
                : graphData.map((data) => ({
                    lat: parseFloat(data[element.latitudeKey]) || 0,
                    lng: parseFloat(data[element.longitudeKey]) || 0,
                    timestamp: new Date(data[element.timestampKey]).getTime() || Date.now()
                }))
        );

        // Sort points by timestamp to ensure correct playback order
        newPoints.sort((a, b) => a.timestamp - b.timestamp);

        setTrajectoryPoints(newPoints);
        setTimestamps(newPoints.map(point => point.timestamp));
        setPlaybackIndex(0);
    }, [elements, graphData]);

    useEffect(() => {
        let interval;
        if (isPlaying && playbackIndex < trajectoryPoints.length - 1) {
            interval = setInterval(() => {
                setPlaybackIndex(prevIndex => Math.min(prevIndex + 1, trajectoryPoints.length - 1));
            }, 1000); // Adjust playback speed here
        }
        return () => clearInterval(interval);
    }, [isPlaying, playbackIndex, trajectoryPoints.length]);

    return (
        <div>
            <MapContainer center={[0, 0]} zoom={2} style={{ height: 400, width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Polyline positions={trajectoryPoints.map(p => [p.lat, p.lng])} color="blue" />
                {trajectoryPoints.length > 0 && (
                    <Marker position={[trajectoryPoints[playbackIndex].lat, trajectoryPoints[playbackIndex].lng]}>
                        <Popup>
                            {new Date(trajectoryPoints[playbackIndex].timestamp).toLocaleString()}
                        </Popup>
                    </Marker>
                )}
            </MapContainer>

            {/* Playback Controls */}
            <div className="flex items-center space-x-4 mt-2">
                <Button onClick={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? "Pause" : "Play"}
                </Button>
                <input
                    type="range"
                    min="0"
                    max={trajectoryPoints.length - 1}
                    value={playbackIndex}
                    onChange={(e) => setPlaybackIndex(parseInt(e.target.value))}
                    className="w-full"
                />
            </div>
        </div>
    );
};
