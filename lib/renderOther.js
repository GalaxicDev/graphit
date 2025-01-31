import React, { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import { Button } from "@/components/ui/button";
import "leaflet/dist/leaflet.css";

export const renderOther = ({ chartType, elements, graphData }) => {
    if (!elements?.length) {
        return <p>No data available for rendering the information.</p>;
    }

    if (!["Info", "Map", "Map Trajectory"].includes(chartType)) {
        return <p>Invalid chart type.</p>;
    }

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
            const mapMarkers = elements.flatMap((element) =>
                element.manualEntry
                    ? (element.pinpoints || []).map((point) => ({
                        latitude: parseFloat(point.latitude) || 0,
                        longitude: parseFloat(point.longitude) || 0
                    }))
                    : graphData.map((data) => ({
                        latitude: parseFloat(data[element.latitudeKey]) || 0,
                        longitude: parseFloat(data[element.longitudeKey]) || 0
                    }))
            );

            return (
                <MapContainer center={[0, 0]} zoom={2} style={{ height: 400, width: "100%" }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {mapMarkers.map((point, index) => (
                        <Marker key={index} position={[point.latitude, point.longitude]}>
                            <Popup>Point {index + 1}</Popup>
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
    const [speed, setSpeed] = useState(1);
    const [trajectoryPoints, setTrajectoryPoints] = useState([]);

    useEffect(() => {
        const newPoints = elements.flatMap((element) =>
            element.manualEntry
                ? (element.pinpoints || []).map((point) => ({
                    lat: parseFloat(point.latitude) || 0,
                    lng: parseFloat(point.longitude) || 0,
                    timestamp: new Date(point.timestamp).getTime()
                }))
                : graphData.map((data) => ({
                    lat: parseFloat(data[element.latitudeKey]) || 0,
                    lng: parseFloat(data[element.longitudeKey]) || 0,
                    timestamp: new Date(data[element.timestampKey]).getTime()
                }))
        );

        newPoints.sort((a, b) => a.timestamp - b.timestamp);
        setTrajectoryPoints(newPoints);
        setPlaybackIndex(0);
    }, [elements, graphData]);

    useEffect(() => {
        let interval;
        if (isPlaying && playbackIndex < trajectoryPoints.length - 1) {
            const timeDiff = trajectoryPoints[playbackIndex + 1]?.timestamp - trajectoryPoints[playbackIndex]?.timestamp;
            interval = setTimeout(() => {
                setPlaybackIndex(prevIndex => Math.min(prevIndex + 1, trajectoryPoints.length - 1));
            }, timeDiff / speed);
        }
        return () => clearTimeout(interval);
    }, [isPlaying, playbackIndex, trajectoryPoints.length, speed]);

    return (
        <div>
            <MapContainer center={[0, 0]} zoom={2} style={{ height: 400, width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Polyline positions={trajectoryPoints.map(p => [p.lat, p.lng])} color="blue" />
                {trajectoryPoints.length > 0 && (
                    <Marker position={[trajectoryPoints[playbackIndex].lat, trajectoryPoints[playbackIndex].lng]}>
                        <Popup>{new Date(trajectoryPoints[playbackIndex].timestamp).toLocaleString()}</Popup>
                    </Marker>
                )}
            </MapContainer>

            <div className="flex items-center space-x-4 mt-2">
                <Button onClick={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? "Pause" : "Play"}
                </Button>
                <Button onClick={() => setSpeed(prev => prev * 2)}>Fast Forward</Button>
                <input
                    type="range"
                    min="0"
                    max={trajectoryPoints.length - 1}
                    value={playbackIndex}
                    onChange={(e) => setPlaybackIndex(parseInt(e.target.value))}
                    className="w-full"
                />
                <p>{trajectoryPoints.length > 0 && new Date(trajectoryPoints[playbackIndex].timestamp).toLocaleTimeString()}</p>
            </div>
        </div>
    );
};
