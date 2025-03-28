"use client";

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, Maximize2, Move } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PacmanLoader } from 'react-spinners';
import { ResponsiveContainer } from 'recharts';
import axios from 'axios';
import nextConfig from '@/next.config.mjs';
import { renderChart } from "@/lib/renderChart";
import { renderOther } from "@/lib/renderOther";
import { fetchGraphData } from '@/lib/api';

const generalChartTypes = ["Line", "Bar", "Area", "Scatter", "Pie"];

const ChartCard = ({ graph, onDelete, onEdit, token }) => {
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [graphData, setGraphData] = useState([]);
    const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
    const [isLoading, setIsLoading] = useState(false);

    const handleToggleFullScreen = () => {
        const currentUrl = new URL(window.location.href);
        const graphIdPath = `/${graph._id}`;

        if (currentUrl.pathname.endsWith(graphIdPath)) {
            currentUrl.pathname = currentUrl.pathname.replace(graphIdPath, '');
        } else {
            currentUrl.pathname += graphIdPath;
        }

        window.history.pushState({}, '', currentUrl);
        setIsFullScreen(!isFullScreen);
        window.location.reload();
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const dataResponse = await fetchGraphData(graph.chartType, graph.elements, graph.options, selectedTimeframe, token);
                setGraphData(dataResponse);
            } catch (error) {
                console.error('Failed to fetch graph data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [graph, selectedTimeframe, token]);

    const renderedChart = useMemo(() => {
        return renderChart({ chartType: graph.chartType, elements: graph.elements, graphData, options: graph.options });
    }, [graph.chartType, graph.elements, graphData, graph.options]);

    const renderedOther = useMemo(() => {
        return renderOther({ chartType: graph.chartType, elements: graph.elements, graphData, options: graph.options });
    }, [graph.chartType, graph.elements, graphData, graph.options]);

    return (
        <>
            <Card className="shadow-lg h-full flex flex-col resizable-indicator">
                <CardHeader
                    className="flex flex-row items-center justify-between space-y-0 py-2 rounded-t-lg"
                    style={{ backgroundColor: graph?.options?.cardColor }}
                >
                    <h3 className="font-semibold text-white">{graph?.options?.title}</h3>
                    <div className="flex items-center space-x-2 justify-center mx-5 my-5">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleToggleFullScreen}
                        >
                            <Maximize2 className="h-4 w-4 text-white" />
                        </Button>

                        <Button variant="ghost" size="icon" className="drag-handle hidden">
                            <Move className="h-4 w-4 text-white" />
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4 text-white" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEdit(graph._id)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onDelete(graph._id)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow p-4 no-drag">
                    {generalChartTypes.includes(graph.chartType) ? (
                        <>
                            {graph.options.dynamicTime && (
                                <Tabs defaultValue="1D" onValueChange={setSelectedTimeframe}>
                                    <TabsList>
                                        {['1D', '7D', '30D', '6M', '1Y', 'Max'].map((key) => (
                                            <TabsTrigger key={key} value={key}>
                                                {key}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </Tabs>
                            )}
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full pt-2">
                                    <PacmanLoader color={graph.options.cardColor} />
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="80%">
                                    {renderedChart}
                                </ResponsiveContainer>
                            )}
                        </>
                    ) : (
                        <>
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full pt-2">
                                    <PacmanLoader color={graph.options.cardColor} />
                                </div>
                            ) : (
                                <div className="p-4">
                                    {renderedOther}
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </>
    );
};

export default ChartCard;