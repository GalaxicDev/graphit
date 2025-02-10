import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion, useAnimation } from "framer-motion";
import { Button } from "@/components/ui/button";

// Fix Leaflet Marker Icon
const defaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });


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
  const controls = useAnimation();

  useEffect(() => {
    console.log("TrajectoryPlayback component rendered");

    const parseTimestamp = (timestamp) => {
      if (!timestamp) return 0;
      const unixDate = new Date(timestamp).getTime();
      if (!isNaN(unixDate)) return unixDate;

      const [hours, minutes, seconds] = timestamp.split(":").map(Number);
      const today = new Date();
      today.setHours(hours, minutes, seconds, 0);
      return today.getTime();
    };

    const newPoints = elements.flatMap((element) =>
      element.manualEntry
        ? (element.pinpoints || []).map((point) => ({
            lat: parseFloat(point.latitude) || 0,
            lng: parseFloat(point.longitude) || 0,
            timestamp: parseTimestamp(point.timestamp),
          }))
        : graphData.map((data) => ({
            lat: parseFloat(data[element.latitudeKey]) || 0,
            lng: parseFloat(data[element.longitudeKey]) || 0,
            timestamp: parseTimestamp(data[element.timestampKey]),
          }))
    )
    .filter((point) => point.lat && point.lng && point.timestamp)
    .sort((a, b) => a.timestamp - b.timestamp); // Ensure correct ordering

    setTrajectoryPoints(newPoints);
    setPlaybackIndex(0);
  }, [elements, graphData]);

  useEffect(() => {
    let interval;
    if (isPlaying && playbackIndex < trajectoryPoints.length - 1) {
      const nextIndex = playbackIndex + 1;
      const timeDiff = trajectoryPoints[nextIndex]?.timestamp - trajectoryPoints[playbackIndex]?.timestamp;
      interval = setTimeout(() => {
        setPlaybackIndex(nextIndex);
      }, timeDiff / speed);

      // Animate marker smoothly
      controls.start({
        x: trajectoryPoints[nextIndex].lng,
        y: trajectoryPoints[nextIndex].lat,
        transition: { duration: timeDiff / (1000 * speed), ease: "linear" },
      });
    }

    return () => clearTimeout(interval);
  }, [isPlaying, playbackIndex, trajectoryPoints, speed, controls]);

  const remainingTime =
    trajectoryPoints.length > 1
      ? Math.max(
          0,
          trajectoryPoints[trajectoryPoints.length - 1].timestamp -
            trajectoryPoints[playbackIndex].timestamp
        )
      : 0;

  return (
    <div>
      <div id={`map-container-${Date.now()}`} style={{ height: 400, width: "100%" }}>
        <MapContainer center={[50.85, 4.35]} zoom={10} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Draw trajectory */}
          <Polyline positions={trajectoryPoints.map((p) => [p.lat, p.lng])} color="blue" />

          {/* Moving Marker with Animation */}
          {trajectoryPoints.length > 0 && (
            <motion.div animate={controls}>
              <Marker position={[trajectoryPoints[playbackIndex].lat, trajectoryPoints[playbackIndex].lng]} icon={defaultIcon}>
                <Popup>{new Date(trajectoryPoints[playbackIndex].timestamp).toLocaleString()}</Popup>
              </Marker>
            </motion.div>
          )}
        </MapContainer>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center space-x-4 mt-2">
        <Button onClick={() => setIsPlaying(!isPlaying)}>{isPlaying ? "Pause" : "Play"}</Button>
        <Button onClick={() => setSpeed((prev) => Math.min(prev * 2, 10))}>Fast Forward</Button>
        <input
          type="range"
          min="0"
          max={trajectoryPoints.length - 1}
          value={playbackIndex}
          onChange={(e) => setPlaybackIndex(parseInt(e.target.value))}
          className="w-full"
        />
        <p>
          ⏳ {new Date(remainingTime).toISOString().substr(11, 8)} remaining
        </p>
      </div>
    </div>
  );
};

export default TrajectoryPlayback;

