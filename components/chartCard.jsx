"use client"

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, Maximize2, Minimize2, Move } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import { LineChart, BarChart, PieChart, ScatterChart, AreaChart, RadarChart, Line, Scatter, Area, Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PacmanLoader } from 'react-spinners'
import { ScrollArea } from "@/components/ui/scroll-area";
import nextConfig from '@/next.config.mjs';
import { renderOther } from '@/lib/renderOther';
import { renderChart } from '@/lib/renderChart';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']; // Define the COLORS array
const charts = ["Line", "Bar", "Area", "Scatter", "Pie", "Radar"];

const ChartCard = ({ graph, onDelete, onEdit }) => {
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
        const fetchGraphData = async () => {
            if (!graph || !graph.elements || graph.elements.length === 0) return;

            try {
                setIsLoading(true);
                let params = {
                    collections: graph.elements.map(el => el.collection).join(','),
                };

                if (graph.chartType === "Info") {
                    params.fields = graph.elements.map(el => el.dataKey).join(',');
                    params.fetchMethods = graph.elements.map(el => el.fetchMethod).join(',');
                } else {
                    params.fields = graph.elements.map(el => `${el.xAxisKey},${el.yAxisKey}`).join(',');
                }

                if (graph.options.dynamicTime) {
                    params.timeframe = selectedTimeframe;
                } else {
                    const fromDate = new Date(graph.options.xRange.from);
                    const toDate = new Date(graph.options.xRange.to);

                    if (graph.options.xRange.fromTime) {
                        const [fromHours, fromMinutes] = graph.options.xRange.fromTime.split(':');
                        fromDate.setHours(parseInt(fromHours, 10), parseInt(fromMinutes, 10));
                    }

                    if (graph.options.xRange.toTime) {
                        const [toHours, toMinutes] = graph.options.xRange.toTime.split(':');
                        toDate.setHours(parseInt(toHours, 10), parseInt(toMinutes, 10));
                    }

                    params.from = fromDate.toISOString();
                    params.to = toDate.toISOString();
                }

                // add conditionalParams to the params object
                graph.elements.forEach(element => {
                    if (Array.isArray(element.conditionalParams)) {
                        element.conditionalParams.forEach((param, index) => {
                            params[`conditionalParams[${index}][field]`] = param.field;
                            params[`conditionalParams[${index}][operator]`] = param.operator;
                            params[`conditionalParams[${index}][value]`] = param.value;
                        });
                    } else {
                        console.log("no conditional params");
                    }
                })

                const dataResponse = await axios.get(`${nextConfig.env.API_URL}/mqtt/data`, {
                    params,
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                });

                setGraphData(dataResponse.data.data);
            } catch (error) {
                console.error('Failed to fetch graph data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGraphData();

    }, [graph, selectedTimeframe]);

    console.log("graphData:", graph.chartType, graph.elements, graphData, graph.options);

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
                            <Maximize2 className="h-4 w-4 text-white"/>
                        </Button>

                        <Button variant="ghost" size="icon" className="drag-handle">
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
                    <Tabs defaultValue="1D" onValueChange={setSelectedTimeframe}>
                        <TabsList>
                            {['1D', '7D', '30D', '6M', '1Y', 'Max'].map((key) => (
                                <TabsTrigger key={key} value={key}>
                                    {key}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        <TabsContent value={selectedTimeframe}>
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full pt-2">
                                    <PacmanLoader color={graph.options.cardColor}/>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="50%">
                                        {charts.includes(graph.chartType)
                                        ? renderChart(graph.chartType, graph.elements, graphData, graph.options)
                                        : renderOther(graph.chartType, graph.elements, graphData)}
                                </ResponsiveContainer>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </>
    );
};

export default ChartCard;