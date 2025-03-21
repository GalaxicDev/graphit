"use client";

import { useState, useEffect, useCallback, useRef, useMemo, Suspense } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import dynamic from "next/dynamic";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import axios from "axios";
import { useRouter } from "next/navigation";
import nextConfig from '@/next.config.mjs';
import { useUser } from '@/lib/UserContext';
import { fetchGraphData } from '@/lib/api';
import { PacmanLoader } from 'react-spinners';

const ResponsiveGridLayout = WidthProvider(Responsive);
const LOCAL_STORAGE_KEY = "dashboard-layouts";

// Dynamically import ChartCard to enable code splitting
const ChartCard = dynamic(() => import("./chartCard"), { ssr: false });

const ChartCardComponent = ({ projectId, token }) => {
    const [layouts, setLayouts] = useState({ lg: [], xs: [] });
    const [graphs, setGraphs] = useState([]);
    const isInitialRender = useRef(true);

    const router = useRouter();

    // Generate default layouts for graphs
    const generateDefaultLayouts = useCallback((data) => {
        return {
            lg: data.map((graph, index) => ({
                i: graph._id,
                x: (index % 2) * 6, // Place components in two columns
                y: Math.floor(index / 2) * 2,
                w: 6,
                h: 2,
            })),
            xs: data.map((graph, index) => ({
                i: graph._id,
                x: 0, // Single column layout for small screens
                y: index * 2,
                w: 4,
                h: 2,
            })),
        };
    }, []);

    // Load layout from localStorage
    useEffect(() => {
        const savedLayouts = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedLayouts) {
            const parsedLayouts = JSON.parse(savedLayouts);
            setLayouts(parsedLayouts);
        } else {
            setLayouts({ lg: [], xs: [] });
        }
    }, []);

    // Fetch graphs and initialize layouts
    useEffect(() => {
        const fetchGraphs = async () => {
            try {
                const response = await axios.get(
                    `${nextConfig.env.API_URL}/graphs/project/${projectId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                const data = response.data;
                setGraphs(data);

                if (isInitialRender.current && (!layouts.lg.length || !layouts.xs.length)) {
                    const defaultLayouts = generateDefaultLayouts(data);
                    setLayouts(defaultLayouts);
                    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultLayouts));
                    isInitialRender.current = false;
                }
            } catch (error) {
                console.error("Failed to fetch graphs:", error);
            }
        };

        fetchGraphs();
    }, [projectId, token, generateDefaultLayouts, layouts.lg.length, layouts.xs.length]);

    // Save layouts to localStorage whenever they change
    const onLayoutChange = useCallback((currentLayout, allLayouts) => {
        setLayouts(allLayouts); // Update layouts for all breakpoints
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allLayouts));
    }, []);

    // Ensure all graphs have a valid layout
    const getValidLayout = useCallback((graphId) => {
        const lgLayouts = layouts.lg || []; // Ensure layouts.lg is always an array
        const lgItem = lgLayouts.find((item) => item.i === graphId);
        return (
            lgItem || {
                i: graphId,
                x: 0,
                y: Infinity, // Place at the bottom if no layout exists
                w: 6,
                h: 2,
            }
        );
    }, [layouts]);

    const handleDelete = useCallback((id) => {
        // send api request to delete the graph id
        const deleteGraph = async () => {
            try {
                await axios.delete(
                    `${nextConfig.env.API_URL}/graphs/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                const updatedGraphs = graphs.filter((graph) => graph._id !== id);
                setGraphs(updatedGraphs);
            } catch (error) {
                console.error("Failed to delete graph:", error);
            }
        };

        deleteGraph();

        const updatedLayouts = { ...layouts };
        Object.keys(updatedLayouts).forEach((key) => {
            updatedLayouts[key] = updatedLayouts[key].filter(
                (item) => item.i !== id
            );
        });
        setLayouts(updatedLayouts);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedLayouts));
    }, [graphs, layouts, token]);

    const handleEdit = useCallback((id) => {
        const editGraph = graphs.find(graph => graph._id === id);
        if (editGraph) {
            router.push(`/projects/${projectId}/chartcreator?chartId=${id}`);
        }
    }, [graphs, projectId, router]);

    return (
        <ResponsiveGridLayout
            className="layout"
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={255}
            onLayoutChange={onLayoutChange} // Capture layout changes
            isDraggable={true}
            isResizable={true}
            draggableHandle=".drag-handle"
            compactType="vertical" // Force vertical alignment of items
        >
            {graphs.map((graph) => (
                <div
                    key={graph._id}
                    data-grid={getValidLayout(graph._id)}
                >
                    <Suspense fallback={<PacmanLoader color="#8884d8" />}>
                        <ChartCard
                            graph={graph}
                            onDelete={() => handleDelete(graph._id)}
                            onEdit={() => handleEdit(graph._id)}
                            token={token}
                        />
                    </Suspense>
                </div>
            ))}
        </ResponsiveGridLayout>
    );
};

export default ChartCardComponent;