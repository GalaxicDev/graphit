"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import debounce from "lodash.debounce";
import axios from 'axios';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PacmanLoader } from 'react-spinners';
import { CircleAlert } from 'lucide-react';
import { ResponsiveContainer } from 'recharts';
import { ChartOptions } from "@/components/chartCreator/chartOptions";
import { ElementConfig } from "@/components/chartCreator/elementConfig";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MoreHorizontal, Edit, Trash2, Maximize2, Minimize2, Move, Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import nextConfig from '@/next.config.mjs';

import { renderChart } from "@/lib/renderChart";
import { renderOther } from "@/lib/renderOther";

const generalChartTypes = ["Line", "Bar", "Area", "Scatter", "Pie"];

export function ChartCreator({ token, projectData, chartData }) {
  const [chartType, setChartType] = useState("Line");
  const [options, setOptions] = useState({
    title: "Chart Title",
    cardColor: "#4C51BF",
    showGrid: true,
    dynamicTime: true,
    stacked: false,
    yRange: { min: "", max: "" },
    xRange: { from: new Date(), to: new Date() },
  });
  const [elements, setElements] = useState([]);
  const [graphData, setGraphData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [error, setError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchInitialGraphData = async () => {
      if (!chartData?.elements || chartData.elements.length === 0) return;
  
      try {
        setIsLoading(true);
        const params = {
          collections: chartData.elements.map(el => el.collection).join(','),
          ...(chartData.chartType === "Info"
              ? {
                fields: chartData.elements.map(el => el.dataKey).join(','),
                fetchMethods: chartData.elements.map(el => el.fetchMethod).join(','),
              }
              : {
                fields: chartData.elements.map(el => `${el.xAxisKey},${el.yAxisKey}`).join(','),
              }),
          ...(chartData.chartType === "Map" || chartData.chartType === "Map Trajectory"
              && {
                  fields: chartData.elements.map(el => `${el.longitudeKey},${el.latitudeKey},${el.timestampKey}`).join(','),
              }),
        };
  
        if (chartData.options?.dynamicTime) {
          params.timeframe = selectedTimeframe;
        } else {
          params.from = new Date(chartData.options?.xRange?.from).toISOString();
          params.to = new Date(chartData.options?.xRange?.to).toISOString();
        }
  
        chartData.elements.forEach((el, index) => {
          el.conditionalParams?.forEach((param, paramIndex) => {
            params[`conditionalParams[${index}][${paramIndex}][field]`] = param.field;
            params[`conditionalParams[${index}][${paramIndex}][operator]`] = param.operator;
            params[`conditionalParams[${index}][${paramIndex}][value]`] = param.value;
          });
        });
  
        const response = await axios.get(`${nextConfig.env.API_URL}/mqtt/data`, {
          params,
          headers: { Authorization: `Bearer ${token}` },
        });
  
        setGraphData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch initial graph data:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    if (chartData) {
      setChartType(chartData.chartType || "Line");
      setOptions(chartData.options || {
        title: "Chart Title",
        cardColor: "#4C51BF",
        showGrid: true,
        dynamicTime: true,
        stacked: false,
        yRange: { min: "", max: "" },
        xRange: { from: new Date(), to: new Date() },
      });
      setElements(chartData.elements || []);
      setIsEditing(true);
      fetchInitialGraphData();
    }
  }, [chartData, token, selectedTimeframe]);

  useEffect(() => {
    const fetchGraphData = async () => {
      if (elements.length === 0) return;

      try {
        setIsLoading(true);
        const params = {
          collections: elements.map(el => el.collection).join(','),
          ...(chartType === "Info"
              ? { fields: elements.map(el => el.dataKey).join(','), fetchMethods: elements.map(el => el.fetchMethod).join(',') }
              : { fields: elements.map(el => `${el.xAxisKey},${el.yAxisKey}`).join(',') }),
          ...(chartType === "Map" || chartType === "Map Trajectory" && {
            fields: elements.map(el => `${el.longitudeKey},${el.latitudeKey},${el.timestampKey}`).join(','),
          })
        };

        if (options.dynamicTime) {
          params.timeframe = selectedTimeframe;
        } else {
          params.from = new Date(options.xRange.from).toISOString();
          params.to = new Date(options.xRange.to).toISOString();
        }

        elements.forEach((el, index) => {
          el.conditionalParams.forEach((param, paramIndex) => {
            params[`conditionalParams[${index}][${paramIndex}][field]`] = param.field;
            params[`conditionalParams[${index}][${paramIndex}][operator]`] = param.operator;
            params[`conditionalParams[${index}][${paramIndex}][value]`] = param.value;
          });
        });

        const dataResponse = await axios.get(`${nextConfig.env.API_URL}/mqtt/data`, {
          params,
          headers: { Authorization: `Bearer ${token}` },
        });

        setGraphData(dataResponse.data.data);
      } catch (error) {
        console.error('Failed to fetch graph data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimeout = setTimeout(fetchGraphData, 500);
    return () => clearTimeout(debounceTimeout);
  }, [elements, selectedTimeframe, options.dynamicTime, options.xRange, options.yRange, token, chartType]);

  const handleOptionChange = (key, value) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleElementChange = useCallback(
    debounce((id, key, value) => {
      setElements((prev) => {
        const updatedElements = prev.map((el) =>
            el.id === id ? { ...el, [key]: value } : el
        );
        return updatedElements;
      });
    }, 50),
    [setElements]
  );

  const addElement = () => {
    if (["Map", "Map Trajectory"].includes(chartType) && elements.some(el => ["Map", "Map Trajectory"].includes(el.chartType))) {
      alert("You can only create one Map or Map Trajectory.");
      return;
    }

    const newId = (elements.length + 1).toString();
    setElements(prev => [...prev, {
      id: newId,
      collection: "",
      xAxisKey: "",
      yAxisKey: "",
      name: `${chartType} ${newId}`,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      thickness: 2,
      curved: false,
      dotted: false,
      showDots: true,
      dotSize: 5,
      conditionalParams: [],
      chartType: chartType
    }]);
  };

  const removeElement = (id) => {
    setElements(prev => prev.filter(el => el.id !== id));
  };

  const createGraph = async () => {
    const newGraph = {
      projectId: projectData._id,
      chartType,
      options,
      elements,
    };

    for (let i = 0; i < elements.length; i++) {
      if (chartType === "Info") {
        if (!elements[i].collection || !elements[i].dataKey) {
          setError(true);
          return;
        }
      } else if (chartType === "Map Trajectory") {
        if (!elements[i].collection || !elements[i].latitudeKey || !elements[i].longitudeKey || !elements[i].timestampKey) {
          setError(true);
          return;
        }
      } else if (chartType === "Map") {
        if (!elements[i].collection || !elements[i].latitudeKey || !elements[i].longitudeKey) {
          setError(true);
          return;
        }
      } else {
        if (!elements[i].collection || !elements[i].xAxisKey || !elements[i].yAxisKey) {
          setError(true);
          return;
        }
      }
    }

    try {
      const res = await axios.post(`${nextConfig.env.API_URL}/graphs`, newGraph, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      router.push(`/projects/${projectData._id}`);
    } catch (error) {
      console.error('Failed to create graph:', error);
    }
  };

  const handleEditGraph = async () => {
    const updatedGraph = {
      projectId: projectData._id,
      chartType,
      options,
      elements,
    };

    for (let i = 0; i < elements.length; i++) {
      if (chartType === "Info") {
        if (!elements[i].collection || !elements[i].dataKey) {
          setError(true);
          return;
        }
      } else if (chartType === "Map Trajectory") {
        if (!elements[i].collection || !elements[i].latitudeKey || !elements[i].longitudeKey || !elements[i].timestampKey) {
          setError(true);
          return;
        }
      } else if (chartType === "Map") {
        if (!elements[i].collection || !elements[i].latitudeKey || !elements[i].longitudeKey) {
          setError(true);
          return;
        }
      } else {
        if (!elements[i].collection || !elements[i].xAxisKey || !elements[i].yAxisKey) {
          setError(true);
          return;
        }
      }
    }

    try {
      const res = await axios.put(`${nextConfig.env.API_URL}/graphs/${chartData._id}`, updatedGraph, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      router.push(`/projects/${projectData._id}`);
    } catch (error) {
      console.error('Failed to update graph:', error);
    }
  };

  const memoizedGraphData = useMemo(() => graphData, [graphData]);

  return (
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8 text-black dark:text-white">Chart Creator</h1>
        { /* Error Message */ }
        {error &&
            <div className="rounded-lg border border-red-500/50 px-4 py-3 text-red-600">
              <div className="flex gap-3">
                <CircleAlert
                    className="mt-0.5 shrink-0 opacity-60 font-bold"
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                />
                <div className="grow space-y-1">
                  <p className="text-sm font-bold">Error, not all required fields are filled in!</p>
                  <ul className="list-inside list-disc text-sm opacity-80 font-medium">
                    <li>make sure you have chosen a collection, X Axis Key and a Y Axis Key for each line, bar, ...</li>
                  </ul>
                </div>
              </div>
            </div>
        }
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4">
          {/* preview chart*/}
          <Card className="col-span-1 md:col-span-2 bg-white dark:bg-gray-800 h-[calc(100vh-500px)]">
            <CardHeader
                className="flex flex-row items-center justify-between space-y-0 py-2"
                style={{backgroundColor: options.cardColor}}
            >
              <h3 className="font-semibold text-white">{options.title}</h3>
              <div className="flex items-center space-x-2 justify-center mx-5 my-5">
                <Button variant="ghost" size="icon" className="drag-handle">
                  <Move className="h-4 w-4 text-white"/>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4 text-white"/>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => console.log('Edit')}>
                      <Edit className="mr-2 h-4 w-4"/>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => console.log('Delete')}>
                      <Trash2 className="mr-2 h-4 w-4"/>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="flex-grow p-4 no-drag">
              {generalChartTypes.includes(chartType)  ? (
                  <>
                    {options.dynamicTime && (
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
                          <PacmanLoader color={options.cardColor}/>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                          {renderChart({ chartType, elements, graphData: memoizedGraphData, options })}
                        </ResponsiveContainer>
                    )}
                  </>
              ):( 
                  <>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full pt-2">
                          <PacmanLoader color={options.cardColor}/>
                        </div>
                    ) : (
                        <div className="p-4">
                          {renderOther({ chartType, elements, graphData: memoizedGraphData, options })}
                        </div>
                    )} 
                  </>
              )}
            </CardContent>
          </Card>

          { /* Chart Options */}
          <Card className={"bg-white dark:bg-gray-800 h-[calc(100vh-330px)] flex flex-col"}>
            <CardHeader>
              <h3 className="font-semibold text-black dark:text-white">Chart Options</h3>
            </CardHeader>
            <CardContent className="flex flex-col h-[calc(100vh-400px)]">
              <ScrollArea className="flex-grow pr-4">
                <ChartOptions
                    chartType={chartType}
                    setChartType={setChartType}
                    options={options}
                    handleOptionChange={handleOptionChange}
                    elements={elements}
                />
                <Separator className="my-4 dark:bg-gray-700"/>
                {chartType === "Info" ? (
                    <h3 className="text-sm font-medium text-black mb-2 dark:text-white">Fields</h3>
                ): (
                    <h3 className="text-sm font-medium text-black mb-2 dark:text-white">{chartType}s</h3>
                )}

                <Accordion type="single" collapsible className="w-full">
                  {elements.map((el) => (
                      <AccordionItem value={el.id} key={el.id}>
                        <AccordionTrigger>{el.name}</AccordionTrigger>
                        <AccordionContent>
                          <ElementConfig
                              el={el}
                              collections={projectData.collections}
                              handleElementChange={handleElementChange}
                              removeElement={removeElement}
                              chartType={chartType}
                          />
                        </AccordionContent>
                      </AccordionItem>
                  ))}
                </Accordion>
                {!["Map", "Map Trajectory"].includes(chartType) || !elements.some(el => ["Map", "Map Trajectory"].includes(el.chartType)) ? (
                    <Button onClick={addElement}>
                      <Plus className="mr-2 h-4 w-4"/> Add {chartType}
                    </Button>
                ) : null}
                <Separator className="my-4 dark:bg-gray-700"/>
              </ScrollArea>
              <Button className="w-full" onClick={() => isEditing ? handleEditGraph() : createGraph()}>
                {isEditing ? "Update Graph" : "Create Graph"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}