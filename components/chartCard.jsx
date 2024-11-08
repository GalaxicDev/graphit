"use client"

import {useEffect, useState} from 'react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Trash2, Maximize2, Minimize2, Move } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
import { LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import axios from 'axios';

const lineData = [
    { name: 'Jan', users: 4000, transactions: 2400 },
    { name: 'Feb', users: 3000, transactions: 1398 },
    { name: 'Mar', users: 2000, transactions: 9800 },
    { name: 'Apr', users: 2780, transactions: 3908 },
    { name: 'May', users: 1890, transactions: 4800 },
    { name: 'Jun', users: 2390, transactions: 3800 },
]

const barData = [
    { name: 'A', value: 4000 },
    { name: 'B', value: 3000 },
    { name: 'C', value: 2000 },
    { name: 'D', value: 2780 },
    { name: 'E', value: 1890 },
]

const pieData = [
    { name: 'Group A', value: 400 },
    { name: 'Group B', value: 300 },
    { name: 'Group C', value: 300 },
    { name: 'Group D', value: 200 },
]

const areaData = [
    { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
    { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
    { name: 'Page C', uv: 2000, pv: 9800, amt: 2290 },
    { name: 'Page D', uv: 2780, pv: 3908, amt: 2000 },
    { name: 'Page E', uv: 1890, pv: 4800, amt: 2181 },
]

const scatterData = [
    { x: 100, y: 200, z: 200 },
    { x: 120, y: 100, z: 260 },
    { x: 170, y: 300, z: 400 },
    { x: 140, y: 250, z: 280 },
    { x: 150, y: 400, z: 500 },
    { x: 110, y: 280, z: 200 },
]

const ChartCard = ({ id, graph, title, color, chartType, onDelete, onEdit }) => {
    const [isFullScreen, setIsFullScreen] = useState(false)
    const [graphData, setGraphData] = useState([])

    const handleToggleFullScreen = () => {
        setIsFullScreen(!isFullScreen)
    }

    useEffect(() => {
        const fetchGraphData = async () => {
            // Fetch data for the chart
            try {
                // Fetch data for the graph
                const dataResponse = await axios.get(process.env.API_URL + `/mqtt/data`, {
                    params: {
                        collection: graph.collection,
                        fields: `${graph.xField},${graph.yField}`,
                    }
                });

                return dataResponse.data;
            } catch (error) {
                console.error('Failed to fetch graph data:', error)
            }
        }

        setGraphData(fetchGraphData());
    }, [id]);

    console.log('graphData:', graphData.data);

    const renderChart = () => {
        switch (chartType) {
            case 'line':
                return (
                    <LineChart data={lineData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="users" stroke="#8884d8" />
                        <Line type="monotone" dataKey="transactions" stroke="#82ca9d" />
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
                return null
        }
    }

    return (
        <>
            <Card className="shadow-lg h-full flex flex-col resizable-indicator">
                <CardHeader
                    className="flex flex-row items-center justify-between space-y-0 py-2"
                    style={{backgroundColor: color}}
                >
                    <h3 className="font-semibold text-white">{title}</h3>
                    <div className="flex items-center space-x-2">
                        {/* Full Screen Button */}
                        <Dialog open={isFullScreen} onOpenChange={handleToggleFullScreen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                >
                                    {isFullScreen ? (
                                        <Minimize2 className="h-4 w-4 text-white"/>
                                    ) : (
                                        <Maximize2 className="h-4 w-4 text-white"/>
                                    )}
                                </Button>
                            </DialogTrigger>
                            <DialogContent
                                className="fixed inset-0 flex items-center justify-center p-4 bg-white dark:bg-gray-800">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleToggleFullScreen}
                                    className="absolute top-4 right-4"
                                >
                                    <Minimize2 className="h-6 w-6 text-gray-800 dark:text-white"/>
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
                            <Move className="h-4 w-4 text-white"/>
                        </Button>

                        {/* Dropdown Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4 text-white"/>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEdit(id)}>
                                    <Edit className="mr-2 h-4 w-4"/>
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onDelete(id)}>
                                    <Trash2 className="mr-2 h-4 w-4"/>
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>
                {/* Prevent dragging on chart content */}
                <CardContent className="flex-grow p-4 no-drag">
                    <ResponsiveContainer width="100%" height={200}>
                        {renderChart()}
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </>
    )
}

export default ChartCard
