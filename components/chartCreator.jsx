"use client"

import axios from 'axios';
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PacmanLoader } from 'react-spinners';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { z } from "zod";
import { ChartOptions } from "@/components/chartCreator/chartOptions";
import { ConditionalParams } from "@/components/chartCreator/conditionalParams";
import { ElementConfig } from "@/components/chartCreator/elementConfig";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { MoreHorizontal, Edit, Trash2, Maximize2, Minimize2, Move } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const chartTypes = ["Line", "Bar", "Area", "Scatter"];

const chartSchema = z.object({
  projectId: z.string().nonempty("Project ID is required"),
  options: z.object({
    title: z.string().nonempty("Title is required"),
    cardColor: z.string().nonempty("Card color is required"),
    showGrid: z.boolean(),
    dynamicTime: z.boolean(),
    stacked: z.boolean(),
    yRange: z.object({
      min: z.string().optional(),
      max: z.string().optional(),
    }),
  }),
  elements: z.array(z.object({
    id: z.string(),
    collection: z.string().nonempty("Collection is required"),
    xAxisKey: z.string().nonempty("X Axis key is required"),
    yAxisKey: z.string().nonempty("Y Axis key is required"),
    name: z.string().nonempty("Name is required"),
    color: z.string().nonempty("Color is required"),
    thickness: z.number().min(1).max(10),
    curved: z.boolean(),
    dotted: z.boolean(),
    showDots: z.boolean(),
    dotSize: z.number().min(1).max(10),
  })),
  conditionalParams: z.object({
    collection: z.string().optional(),
    field: z.string().optional(),
    value: z.string().optional(),
  }).optional(),
});

export function ChartCreator({ token, projectData }) {
  const [chartType, setChartType] = useState("Line");
  const [options, setOptions] = useState({
    title: "",
    cardColor: "#f0f0f0",
    showGrid: true,
    dynamicTime: true,
    stacked: false,
    yRange: { min: "", max: "" },
  });
  const [elements, setElements] = useState([]);
  const [collections, setCollections] = useState([]);
  const [graphData, setGraphData] = useState([]);
  const [conditionalParams, setConditionalParams] = useState({ collection: "", field: "", value: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    if (projectData) {
      setCollections(projectData.collections);
      console.log(projectData)
    }
  }, [projectData]);

  useEffect(() => {
    const fetchGraphData = async () => {
      if (elements.length === 0) return;
      const element = elements[0];
      if (!element.collection || !element.xAxisKey || !element.yAxisKey) return;

      try {
        setIsLoading(true);
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
  }, [elements, selectedTimeframe]);

  const saveChartData = async () => {
    const chartData = {
      projectId: projectData._id,
      chartType,
      options: {
        title: options.title,
        cardColor: options.cardColor,
        showGrid: options.showGrid,
        dynamicTime: options.dynamicTime,
        stacked: options.stacked,
        yRange: options.yRange,
      },
      elements,
      conditionalParams,
    };

    console.log("Validating chartData:", chartData);

    try {
      chartSchema.parse(chartData);

      const response = await axios.post(process.env.API_URL + "/graphs", chartData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Chart data saved successfully:", response.data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation failed:", error.errors);
      } else {
        console.error("Failed to save chart data:", error.response ? error.response.data : error.message);
      }
    }
  };

  const handleOptionChange = (key, value) => {
    console.log(`Updating option ${key} to ${value}`);
    setOptions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleElementChange = async (id, key, value) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, [key]: value } : el));
  };

  const handleConditionalParamChange = (key, value) => {
    setConditionalParams(prev => ({ ...prev, [key]: value }));
  };

  const addElement = async () => {
    if (collections.length === 0) {
      console.error('No collections available');
      return;
    }

    const newId = (elements.length + 1).toString();
    const firstCollection = collections[0].name;

    setElements(prev => [...prev, {
      id: newId,
      collection: firstCollection,
      xAxisKey: "",
      yAxisKey: "",
      name: `${chartType} ${newId}`,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      thickness: 2,
      curved: false,
      dotted: false,
      showDots: true,
      dotSize: 5
    }]);
  };

  const removeElement = (id) => {
    setElements(prev => prev.filter(el => el.id !== id));
  };

  const renderChart = () => {
    const element = elements[0];
    switch (chartType) {
      case 'Line':
        return (
            <LineChart data={graphData} className="flex-grow">
              <XAxis
                  dataKey={element?.xAxisKey}
                  tickFormatter={(tick) => format(new Date(tick), 'dd/MM')}
              />
              <YAxis />
              {options.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type={element?.curved ? "monotone" : "linear"} dataKey={element?.yAxisKey} stroke={element?.color} dot={element?.showDots} />
            </LineChart>
        )
      case 'Bar':
        return (
            <BarChart data={graphData}>
              <XAxis dataKey={element?.xAxisKey} />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey={element?.yAxisKey} fill={element?.color} />
            </BarChart>
        )
      case 'Pie':
        return (
            <PieChart>
              <Pie data={graphData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} fill={element?.color} label />
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
        )
      case 'Area':
        return (
            <AreaChart data={graphData}>
              <XAxis dataKey={element?.xAxisKey} />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip content={<CustomTooltip />} />
              <Area type={element?.curved ? "monotone" : "linear"} dataKey={element?.yAxisKey} stroke={element?.color} fill={element?.color} />
            </AreaChart>
        )
      case 'Scatter':
        return (
            <ScatterChart>
              <XAxis type="number" dataKey={element?.xAxisKey} name="stature" unit="cm" />
              <YAxis type="number" dataKey={element?.yAxisKey} name="weight" unit="kg" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
              <Scatter name="A school" data={graphData} fill={element?.color} />
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

  const handleToggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8 text-black dark:text-white">Chart Creator</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="col-span-1 md:col-span-2 bg-white dark:bg-gray-800">
            <CardHeader
                className="flex flex-row items-center justify-between space-y-0 py-2"
                style={{ backgroundColor: options.cardColor }}
            >
              <h3 className="font-semibold text-white">{options.title}</h3>
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
                    <DropdownMenuItem onClick={() => console.log('Edit')}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => console.log('Delete')}>
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
                        <PacmanLoader color={options.cardColor} />
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
          <Card className={"bg-white dark:bg-gray-800"}>
            <CardHeader>
              <h3 className="font-semibold text-black dark:text-white">Chart Options</h3>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-200px)] pr-4">
                <ChartOptions
                    chartType={chartType}
                    setChartType={setChartType}
                    options={options}
                    handleOptionChange={handleOptionChange}
                    elements={elements}
                />
                <Separator className="my-4 dark:bg-gray-700" />
                <h3 className="text-sm font-medium text-black mb-2 dark:text-white">{chartType}s</h3>
                <Accordion type="single" collapsible className="w-full">
                  {elements.map((el) => (
                      <AccordionItem value={el.id} key={el.id}>
                        <AccordionTrigger>{el.name}</AccordionTrigger>
                        <AccordionContent>
                          <ElementConfig
                              el={el}
                              collections={collections}
                              handleElementChange={handleElementChange}
                              removeElement={removeElement}
                              chartType={chartType}
                          />
                        </AccordionContent>
                      </AccordionItem>
                  ))}
                </Accordion>
                <Button onClick={addElement}>
                  <Plus className="mr-2 h-4 w-4" /> Add {chartType}
                </Button>
                <Separator className="my-4 dark:bg-gray-700" />
                <h3 className="text-sm font-medium text-black mb-2 dark:text-white">Conditional Parameters</h3>
                <ConditionalParams
                    collections={collections}
                    conditionalParams={conditionalParams}
                    handleConditionalParamChange={handleConditionalParamChange}
                />
                <Button onClick={saveChartData} className="w-full mt-4">
                  Save Chart Data
                </Button>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}