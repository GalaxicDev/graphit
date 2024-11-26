"use client"

import { useEffect, useState } from 'react';
import { format, subDays, subMonths, subYears } from 'date-fns';
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
import { LineChart, BarChart, PieChart, ScatterChart, AreaChart, Line, Scatter, Area, Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PacmanLoader } from 'react-spinners'

const ChartCard = ({ id, graph, title, color, chartType, onDelete, onEdit }) => {
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [graphData, setGraphData] = useState([]);
    const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
    const [isLoading, setIsLoading] = useState(false);

    const handleToggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    useEffect(() => {
        const fetchGraphData = async () => {
            try {
                setIsLoading(true);
                console.log("Fetching graph data for:", graph.collection, graph.xField, graph.yField, selectedTimeframe);
                const dataResponse = await axios.get(process.env.API_URL + `/mqtt/data`, {
                    params: {
                        collection: graph.collection,
                        fields: `${graph.xField},${graph.yField}`,
                        timeframe: selectedTimeframe,
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
    }, [id, graph.collection, graph.xField, graph.yField, selectedTimeframe]);


    const renderChart = () => {
        switch (chartType) {
            case 'line':
                return (
                    <LineChart data={graphData} className="flex-grow">
                        <XAxis
                            dataKey="createdAt"
                            tickFormatter={(tick) => format(new Date(tick), 'dd/MM')}
                        />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line type="monotone" dataKey="temperature" stroke="#8884d8" />
                    </LineChart>
                )
            case 'bar':
                return (
                    <BarChart data={barData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                )
            case 'pie':
                return (
                    <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} fill="#8884d8" label />
                        <Tooltip />
                    </PieChart>
                )
            case 'area':
                return (
                    <AreaChart data={areaData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip />
                        <Area type="monotone" dataKey="uv" stroke="#8884d8" fill="#8884d8" />
                    </AreaChart>
                )
            case 'scatter':
                return (
                    <ScatterChart>
                        <XAxis type="number" dataKey="x" name="stature" unit="cm" />
                        <YAxis type="number" dataKey="y" name="weight" unit="kg" />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Scatter name="A school" data={scatterData} fill="#8884d8" />
                    </ScatterChart>
                )
            default:
                return null;
        }
    };

    // CustomTooltip component for better styling and readability
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-lg rounded-lg p-3">
                    <p className="text-gray-700 dark:text-gray-200 font-semibold mb-1">{format(new Date(label), 'PPP')}</p>
                    {payload.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                            <span>{item.name}</span>
                            <span style={{ color: item.color }} className="font-medium">
                            {item.value}
                        </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };


    return (
        <>
            <Card className="shadow-lg h-full flex flex-col resizable-indicator">
                <CardHeader
                    className="flex flex-row items-center justify-between space-y-0 py-2"
                    style={{ backgroundColor: color }}
                >
                    <h3 className="font-semibold text-white">{title}</h3>
                    <div className="flex items-center space-x-2 justify-center mx-5 my-5">
                        <Dialog open={isFullScreen} onOpenChange={handleToggleFullScreen}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    {isFullScreen ? (
                                        <Minimize2 className="h-4 w-4 text-white" />
                                    ) : (
                                        <Maximize2 className="h-4 w-4 text-white" />
                                    )}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="fixed inset-0 flex items-center justify-center p-4 bg-white dark:bg-gray-800">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleToggleFullScreen}
                                    className="absolute top-4 right-4"
                                >
                                    <Minimize2 className="h-6 w-6 text-gray-800 dark:text-white" />
                                </Button>
                                <div className="w-full h-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        {renderChart()}
                                    </ResponsiveContainer>
                                </div>
                            </DialogContent>
                        </Dialog>

                        {/* Move Button as Drag Handle */}
                        <Button variant="ghost" size="icon" className="drag-handle">
                            <Move className="h-4 w-4 text-white" />
                        </Button>

                        {/* Dropdown Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4 text-white" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEdit(id)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onDelete(id)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>
                {/* Prevent dragging on chart content */}
                <CardContent className="flex-grow p-4 no-drag">
                    <Tabs defaultValue="1D" onValueChange={setSelectedTimeframe}>
                    <TabsList>
                            {['1D', '7D', '30D', '6M', '1Y', 'Max'].map((key) => (
                                <TabsTrigger key={key} value={key}>
                                    {key}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {/* A single TabsContent to dynamically render content based on selectedTimeframe */}
                        <TabsContent value={selectedTimeframe}>
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full pt-2">
                                    <PacmanLoader color={color} />
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={200}>
                                    {renderChart()}
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