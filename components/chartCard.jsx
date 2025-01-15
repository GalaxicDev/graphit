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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']; // Define the COLORS array

const ChartCard = ({ graph, onDelete, onEdit }) => {
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [graphData, setGraphData] = useState([]);
    const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
    const [isLoading, setIsLoading] = useState(false);

    const handleToggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    useEffect(() => {
        const fetchGraphData = async () => {
            if (!graph || !graph.elements || graph.elements.length === 0) return;

            try {
                setIsLoading(true);
                let params = {
                    collections: graph.elements.map(el => el.collection).join(','), // el staat voor element, dit is geen spaans
                    fields: graph.elements.map(el => `${el.xAxisKey},${el.yAxisKey}`).join(',')
                };

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

                const dataResponse = await axios.get(`${process.env.API_URL}/mqtt/data`, {
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


    // render the chart based on the chart type
      const renderChart = () => {
        if (!graph.chartType || !graph.elements?.length || !graphData?.length) {
          return <p>No data available for rendering the chart.</p>;
        }
    
        const yValues = graph.elements.flatMap(element => graphData.map(data => data[element.yAxisKey]));
      const yMin = graph.options.yRange.min;
      const yMax = graph.options.yRange.max;
    
      // we have 4 options, yMin can be defined, yMax can be defined or both can be defined or none
      // if none are defined we don't need to do anything, the chart will automatically adjust the y axis
      const yAxisDomain = (yMin !== undefined && yMin !== "" && yMax !== undefined && yMax !== "")
          ? [yMin, yMax]
          : (yMin !== undefined && yMin !== "")
              ? [yMin, "auto"]
              : (yMax !== undefined && yMax !== "")
                  ? [0, yMax]
                  : [0, "auto"];
    
      // Filter the graph data based on the yAxisDomain
      const filteredGraphData = graphData.filter(data => {
        return graph.elements.every(element => {
          const value = data[element.yAxisKey];
          return (yMin === undefined || yMin === "" || value >= yMin) &&
                 (yMax === undefined || yMax === "" || value <= yMax);
        });
      });
    
      switch (graph.chartType) {
        case 'Line':
          return (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={filteredGraphData}>
                  <XAxis dataKey={graph.elements[0]?.xAxisKey} />
                  <YAxis domain={yAxisDomain} />
                  { graph.options.showGrid && <CartesianGrid strokeDasharray="3 3" /> }
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {graph.elements.map(element => (
                      <Line
                          key={element.id}
                          type={element.curved ? "monotone" : "linear"}
                          dataKey={element.yAxisKey}
                          stroke={element.color}
                      />
                  ))}
                </LineChart>
              </ResponsiveContainer>
          );
          case 'Bar':
            return (
                <BarChart data={graphData} className="flex-grow">
                  <XAxis
                      dataKey={graph.elements[0]?.xAxisKey}
                      tickFormatter={(tick) => format(new Date(tick), 'dd/MM HH:mm')}
                  />
                  <YAxis domain={yAxisDomain} />
                  {options.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {graph.elements.map((element) => (
                      <Bar key={element.id} dataKey={element.yAxisKey} fill={element.color} />
                  ))}
                </BarChart>
            );
          case 'Area':
            return (
                <AreaChart data={graphData} className="flex-grow">
                  <XAxis
                      dataKey={graph.elements[0]?.xAxisKey}
                      tickFormatter={(tick) => format(new Date(tick), 'dd/MM HH:mm')}
                  />
                  <YAxis domain={yAxisDomain} />
                  {graph.options.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {graph.elements.map((element) => (
                      <Area
                          key={element.id}
                          type={element.curved ? "monotone" : "linear"}
                          dataKey={element.yAxisKey}
                          stroke={element.color}
                          fill={element.color}
                      />
                  ))}
                </AreaChart>
            );
          case 'Scatter':
            return (
                <ScatterChart className="flex-grow">
                  <XAxis
                      dataKey={graph.elements[0]?.xAxisKey}
                      tickFormatter={(tick) => format(new Date(tick), 'dd/MM HH:mm')}
                  />
                  <YAxis domain={yAxisDomain} />
                  {graph.options.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {graph.elements.map((element) => (
                      <Scatter key={element.id} dataKey={element.yAxisKey} fill={element.color} />
                  ))}
                </ScatterChart>
            );
            case 'Pie':
                return (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={filteredGraphData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey={graph.elements[0]?.yAxisKey}
                      >
                        {filteredGraphData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
            );
            case 'Radar':
                return (
                    <ResponsiveContainer width="100%" height={200}>
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={filteredGraphData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey={graph.elements[0]?.xAxisKey} />
                            <PolarRadiusAxis angle={30} domain={yAxisDomain} />
                            {graph.elements.map(element => (
                                <Radar
                                    key={element.id}
                                    name={element.name}
                                    dataKey={element.yAxisKey}
                                    stroke={element.color}
                                    fill={element.color}
                                    fillOpacity={0.6}
                                />
                            ))}
                            <Legend />
                        </RadarChart>
                    </ResponsiveContainer>
                );
          default:
            return null;
        }
      };

    // Define the renderCustomizedLabel function
    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
      return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      );
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
                    className="flex flex-row items-center justify-between space-y-0 py-2 rounded-t-lg"
                    style={{ backgroundColor: graph?.options?.cardColor }}
                >
                    <h3 className="font-semibold text-white">{graph?.options?.title}</h3>
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
                                    <PacmanLoader color={graph?.options?.cardColor} />
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