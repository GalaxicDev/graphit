import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion, useAnimation } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, Maximize2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

// Fix Leaflet Marker Icon
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export const renderOther = ({ chartType, elements, graphData, options }) => {
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
              longitude: parseFloat(point.longitude) || 0,
            }))
          : graphData.map((data) => ({
              latitude: parseFloat(data[element.latitudeKey]) || 0,
              longitude: parseFloat(data[element.longitudeKey]) || 0,
            }))
      );

      return (
        <MapContainer center={[0, 0]} zoom={2} style={{ height: 300, width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {mapMarkers.map((point, index) => (
            <Marker key={index} position={[point.latitude, point.longitude]} icon={defaultIcon}>
              <Popup>Point {index + 1}</Popup>
            </Marker>
          ))}
        </MapContainer>
      );

    case "Map Trajectory":
      return <TrajectoryPlayback elements={elements} graphData={graphData} options={options} />;

    default:
      return <p>Error rendering visualization</p>;
  }
};

const TrajectoryPlayback = ({ elements, graphData, options }) => {
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [trajectoryPoints, setTrajectoryPoints] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const controls = useAnimation();

  useEffect(() => {
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
    .sort((a, b) => a.timestamp - b.timestamp);

    setTrajectoryPoints(newPoints);
    setPlaybackIndex(0);
    setCurrentTime(newPoints.length > 0 ? newPoints[0].timestamp : 0);
  }, [elements, graphData]);

  useEffect(() => {
    let interval;
    if (isPlaying && playbackIndex < trajectoryPoints.length - 1) {
      interval = setInterval(() => {
        setCurrentTime((prevTime) => {
          const nextTime = prevTime + (1000 / speed); // Adjust timing based on speed
          const nextIndex = trajectoryPoints.findIndex((point) => point.timestamp > nextTime);
          
          if (nextIndex !== -1 && nextIndex !== playbackIndex) {
            setPlaybackIndex(nextIndex - 1);
            controls.start({
              x: trajectoryPoints[nextIndex - 1].lng,
              y: trajectoryPoints[nextIndex - 1].lat,
              transition: { duration: (nextTime - prevTime) / (1000 * speed), ease: "linear" },
            });
          }
          
          return nextTime;
        });
      }, 1000 / speed); // Adjust interval timing dynamically based on speed
    }

    return () => clearInterval(interval);
  }, [isPlaying, playbackIndex, trajectoryPoints, speed, controls]);

  const handleFastForward = () => {
    if (playbackIndex < trajectoryPoints.length - 1) {
      const nextIndex = Math.min(playbackIndex + 1, trajectoryPoints.length - 1);
      setPlaybackIndex(nextIndex);
      setCurrentTime(trajectoryPoints[nextIndex].timestamp);
    }
  };

  const handleFastBackward = () => {
    if (playbackIndex > 0) {
      const prevIndex = Math.max(playbackIndex - 1, 0);
      setPlaybackIndex(prevIndex);
      setCurrentTime(trajectoryPoints[prevIndex].timestamp);
    }
  };

  const elapsedTime =
    trajectoryPoints.length > 1
      ? currentTime - trajectoryPoints[0].timestamp
      : 0;

  const remainingTime =
    trajectoryPoints.length > 1
      ? Math.max(
          0,
          trajectoryPoints[trajectoryPoints.length - 1].timestamp - currentTime
        )
      : 0;

  const getPolylineSegments = () => {
    const segments = [];
    const timeout = options.timeout ? options.timeout * 1000 : Infinity;
    for (let i = 0; i < trajectoryPoints.length - 1; i++) {
      const currentPoint = trajectoryPoints[i];
      const nextPoint = trajectoryPoints[i + 1];
      const timeDiff = nextPoint.timestamp - currentPoint.timestamp;
      if (timeDiff <= timeout) {
        segments.push([currentPoint, nextPoint]);
      }
    }
    return segments;
  };

  return (
    <div className="max-w-4xl mx-auto bg-gray-900 rounded-lg overflow-hidden shadow-xl">
      <div className="relative">
        <MapContainer center={[50.85, 4.35]} zoom={10} style={{ height: 300, width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {getPolylineSegments().map((segment, index) => (
            <Polyline key={index} positions={segment.map((p) => [p.lat, p.lng])} color="blue" />
          ))}
          {trajectoryPoints.length > 0 && (
            <motion.div
              animate={controls}
              transition={{ duration: 1 / speed, ease: "linear" }}
            >
             <Marker position={[trajectoryPoints[playbackIndex].lat, trajectoryPoints[playbackIndex].lng]} icon={defaultIcon}>
                <Popup>{new Date(trajectoryPoints[playbackIndex].timestamp).toLocaleString()}</Popup>
              </Marker>
            </motion.div>
          )}
        </MapContainer>
      </div>

      {/* Playback Controls */}
      <div className="bg-gray-800 p-4">
        <Slider
          value={[playbackIndex]}
          onValueChange={(value) => {
            setPlaybackIndex(value[0]);
            setCurrentTime(trajectoryPoints[value[0]].timestamp);
          }}
          max={trajectoryPoints.length - 1}
          step={1}
          className="w-full"
        />
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={handleFastBackward}>
              <SkipBack className="w-5 h-5 text-gray-300" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? <Pause className="w-5 h-5 text-gray-300" /> : <Play className="w-5 h-5 text-gray-300" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleFastForward}>
              <SkipForward className="w-5 h-5 text-gray-300" />
            </Button>
            <div className="text-gray-300 text-sm">
              {new Date(elapsedTime).toISOString().substr(11, 8)} / {new Date(remainingTime).toISOString().substr(11, 8)}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-300">
                  {speed}x
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {[0.25, 0.5, 1, 1.5, 2, 4].map((s) => (
                  <DropdownMenuItem key={s} onSelect={() => setSpeed(s)}>
                    {s}x
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon">
              <Maximize2 className="w-5 h-5 text-gray-300" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrajectoryPlayback;
