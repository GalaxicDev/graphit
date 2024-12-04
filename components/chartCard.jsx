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
import { LineChart, BarChart, PieChart, ScatterChart, AreaChart, Line, Scatter, Area, Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PacmanLoader } from 'react-spinners'

const ChartCard = ({ id, graph, onDelete, onEdit }) => {
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
                const element = graph.elements[0];
                console.log('element:', element);
                console.log('graph:', graph);
                const dataResponse = await axios.get(process.env.API_URL + `/mqtt/data`, {
                    params: {
                        collection: element.collection,
                        fields: `${element.xAxisKey},${element.yAxisKey}`,
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
    }, [id, graph.elements, selectedTimeframe]);

    const renderChart = () => {
        const element = graph.elements[0];
        switch (graph.chartType) {
            case 'Line':
                return (
                    <LineChart data={graphData} className="flex-grow">
                        <XAxis
                            dataKey={element.xAxisKey}
                            tickFormatter={(tick) => format(new Date(tick), 'dd/MM')}
                        />
                        <YAxis />
                        {graph.options.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line type={element.curved ? "monotone" : "linear"} dataKey={element.yAxisKey} stroke={element.color} dot={element.showDots} />
                    </LineChart>
                )
            case 'Bar':
                return (
                    <BarChart data={graphData}>
                        <XAxis dataKey={element.xAxisKey} />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey={element.yAxisKey} fill={element.color} />
                    </BarChart>
                )
            case 'Pie':
                return (
                    <PieChart>
                        <Pie data={graphData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} fill={element.color} label />
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                )
            case 'Area':
                return (
                    <AreaChart data={graphData}>
                        <XAxis dataKey={element.xAxisKey} />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type={element.curved ? "monotone" : "linear"} dataKey={element.yAxisKey} stroke={element.color} fill={element.color} />
                    </AreaChart>
                )
            case 'Scatter':
                return (
                    <ScatterChart>
                        <XAxis type="number" dataKey={element.xAxisKey} name="stature" unit="cm" />
                        <YAxis type="number" dataKey={element.yAxisKey} name="weight" unit="kg" />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                        <Scatter name="A school" data={graphData} fill={element.color} />
                    </ScatterChart>
                )
            default:
                return null;
        }
    };

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
                    style={{ backgroundColor: graph.options.cardColor }}
                >
                    <h3 className="font-semibold text-white">{graph.options.title}</h3>
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
                                    <PacmanLoader color={graph.options.cardColor} />
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