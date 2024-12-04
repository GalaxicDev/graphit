"use client"

import axios from 'axios';
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Minus, Info } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";
import { fetchGraphData, fetchProject } from "@/lib/api";
import { z } from "zod";

const chartTypes = ["Line", "Bar", "Area", "Scatter"];

const chartSchema = z.object({
  title: z.string().nonempty("Title is required"),
  cardColor: z.string().nonempty("Card color is required"),
  showGrid: z.boolean(),
  stacked: z.boolean(),
  yRange: z.object({
    min: z.string().optional(),
    max: z.string().optional(),
  }),
  elements: z.array(z.object({
    id: z.string(),
    collection: z.string().nonempty("Collection is required"),
    dataKey: z.string().nonempty("Data key is required"),
    yDataKey: z.string().nonempty("Y Data key is required"),
    xDataKey: z.string().nonempty("X Data key is required"),
    name: z.string().nonempty("Name is required"),
    color: z.string().nonempty("Color is required"),
    thickness: z.number().min(1).max(10),
    curved: z.boolean(),
    dotted: z.boolean(),
    showDots: z.boolean(),
    dotSize: z.number().min(1).max(10),
  })),
  conditionalParams: z.object({
    collection: z.string().nonempty("Collection is required"),
    field: z.string().nonempty("Field is required"),
    value: z.string().nonempty("Value is required"),
  }),
});

export function ChartCreator({ token, projectData }) {
  const [chartType, setChartType] = useState("Line");
  const [options, setOptions] = useState({
    title: "Chart Title",
    cardColor: "#f0f0f0",
    showGrid: true,
    stacked: false,
    yRange: { min: "", max: "" },
  });
  const [elements, setElements] = useState([]);
  const [collections, setCollections] = useState([]);
  const [graphData, setGraphData] = useState([]);
  const [conditionalParams, setConditionalParams] = useState({ collection: "", field: "", value: "" });

  useEffect(() => {
    if (projectData) {
      setCollections(projectData.collections);
    }
  }, [projectData]);

  const saveChartData = async () => {
    const chartData = {
      options,
      elements,
      conditionalParams,
    };

    try {
      chartSchema.parse(chartData);
      const response = await axios.post(process.env.API_URL + '/graphs', chartData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log('Chart data saved successfully:', response.data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation failed:', error.errors);
      } else {
        console.error('Failed to save chart data:', error);
      }
    }
  };

  const handleOptionChange = (key, value) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleElementChange = async (id, key, value) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, [key]: value } : el));
    if (key === "collection") {
      const data = await fetchGraphData(token, value, [], conditionalParams);
      setGraphData(data);
    }
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
      dataKey: "",
      yDataKey: "",
      xDataKey: "",
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
    const ChartComponent = chartType === "Bar" ? BarChart
        : chartType === "Area" ? AreaChart
            : chartType === "Scatter" ? ScatterChart
                : LineChart;

    const ElementComponent = chartType === "Bar" ? Bar
        : chartType === "Area" ? Area
            : chartType === "Scatter" ? Scatter
                : Line;

    return (
        <ChartComponent data={graphData}>
          {options.showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey={elements[0]?.xDataKey || "name"} />
          <YAxis domain={[options.yRange.min || 'auto', options.yRange.max || 'auto']} />
          <RechartsTooltip />
          <Legend />
          {elements.map((el) => (
              <ElementComponent
                  key={el.id}
                  type={el.curved ? "natural" : "linear"}
                  dataKey={el.dataKey}
                  name={el.name}
                  stroke={el.color}
                  fill={el.color}
                  strokeWidth={el.thickness}
                  strokeDasharray={el.dotted ? "5 5" : "0"}
                  dot={el.showDots ? { r: el.dotSize } : false}
                  stackId={options.stacked ? "stack" : undefined} />
          ))}
        </ChartComponent>
    );
  };

  return (
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8 text-black dark:text-white">Chart Creator</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="col-span-1 md:col-span-2 bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>{options.title}</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className={"bg-white dark:bg-gray-800"}>
            <CardHeader>
              <CardTitle>Chart Options</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-200px)] pr-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="chartType">Chart Type <span className="text-red-500">*</span></Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Select
                                value={chartType}
                                onValueChange={(value) => setChartType(value)}
                                disabled={elements.length > 0}
                            >
                              <SelectTrigger id="chartType" className={"dark:bg-gray-700"}>
                                <SelectValue placeholder="Select chart type" />
                              </SelectTrigger>
                              <SelectContent>
                                {chartTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {elements.length > 0
                              ? "Chart type cannot be changed after adding elements"
                              : "Select the type of chart you want to create"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div>
                    <Label htmlFor="title">Chart Title <span className="text-red-500">*</span></Label>
                    <Input
                        id="title"
                        value={options.title}
                        onChange={(e) => handleOptionChange("title", e.target.value)}
                        className={"dark:bg-gray-700"}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cardColor">Card Color <span className="text-red-500">*</span></Label>
                    <Input
                        id="cardColor"
                        type="color"
                        value={options.cardColor}
                        onChange={(e) => handleOptionChange("cardColor", e.target.value)}
                        className={"dark:bg-gray-700"}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                        id="showGrid"
                        checked={options.showGrid}
                        onCheckedChange={(checked) => handleOptionChange("showGrid", checked)}
                    />
                    <Label htmlFor="showGrid">Show Grid</Label>
                  </div>
                  {chartType === "Bar" && (
                      <div className="flex items-center space-x-2">
                        <Switch
                            id="stacked"
                            checked={options.stacked}
                            onCheckedChange={(checked) => handleOptionChange("stacked", checked)} />
                        <Label htmlFor="stacked">Stacked Bars</Label>
                      </div>
                  )}
                  <div>
                    <Label>Y-Axis Range</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                          type="number"
                          value={options.yRange.min}
                          onChange={(e) => handleOptionChange("yRange", { ...options.yRange, min: e.target.value })}
                          placeholder="Min"
                          className="w-20 dark:bg-gray-700" />
                      <span>to</span>
                      <Input
                          type="number"
                          value={options.yRange.max}
                          onChange={(e) => handleOptionChange("yRange", { ...options.yRange, max: e.target.value })}
                          placeholder="Max"
                          className="w-20 dark:bg-gray-700" />
                    </div>
                  </div>
                  <Separator className="my-4 dark:bg-gray-700" />
                  <h3 className="text-sm font-medium text-black mb-2 dark:text-white">{chartType}s</h3>
                  <Accordion type="single" collapsible className="w-full">
                    {elements.map((el) => (
                        <AccordionItem value={el.id} key={el.id}>
                          <AccordionTrigger>{el.name}</AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor={`collection-${el.id}`}>Collection <span className="text-red-500">*</span></Label>
                                <Select
                                    value={el.collection}
                                    onValueChange={(value) => handleElementChange(el.id, "collection", value)}
                                    className={"dark:bg-gray-700"}
                                >
                                  <SelectTrigger id={`collection-${el.id}`} className={"dark:bg-gray-700"}>
                                    <SelectValue placeholder="Select collection"/>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {collections.map((col) => (
                                        <SelectItem key={col.name} value={col.name}>
                                          {col.name}
                                        </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor={`dataKey-${el.id}`}>Data Key <span className="text-red-500">*</span></Label>
                                <div className="flex items-center space-x-2">
                                  <Input
                                      id={`dataKey-${el.id}`}
                                      value={el.dataKey}
                                      onChange={(e) => handleElementChange(el.id, "dataKey", e.target.value)}
                                      className={"dark:bg-gray-700"}
                                  />
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="h-4 w-4 text-gray-500 cursor-pointer" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        The field in the database for the data key.
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>
                              <div>
                                <Label htmlFor={`yDataKey-${el.id}`}>Y Data Key <span className="text-red-500">*</span></Label>
                                <div className="flex items-center space-x-2">
                                  <Input
                                      id={`yDataKey-${el.id}`}
                                      value={el.yDataKey}
                                      onChange={(e) => handleElementChange(el.id, "yDataKey", e.target.value)}
                                      className={"dark:bg-gray-700"}
                                  />
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="h-4 w-4 text-gray-500 cursor-pointer" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        The field in the database for the Y data key.
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>
                              <div>
                                <Label htmlFor={`xDataKey-${el.id}`}>X Data Key <span className="text-red-500">*</span></Label>
                                <div className="flex items-center space-x-2">
                                  <Input
                                      id={`xDataKey-${el.id}`}
                                      value={el.xDataKey}
                                      onChange={(e) => handleElementChange(el.id, "xDataKey", e.target.value)}
                                      className={"dark:bg-gray-700"}
                                  />
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="h-4 w-4 text-gray-500 cursor-pointer" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        The field in the database for the X data key.
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>
                              <div>
                                <Label htmlFor={`name-${el.id}`}>Name <span className="text-red-500">*</span></Label>
                                <Input
                                    id={`name-${el.id}`}
                                    value={el.name}
                                    onChange={(e) => handleElementChange(el.id, "name", e.target.value)}
                                    className={"dark:bg-gray-700"}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`color-${el.id}`}>Color <span className="text-red-500">*</span></Label>
                                <Input
                                    id={`color-${el.id}`}
                                    type="color"
                                    value={el.color}
                                    onChange={(e) => handleElementChange(el.id, "color", e.target.value)} />
                              </div>
                              <div>
                                <Label htmlFor={`thickness-${el.id}`}>Thickness <span className="text-red-500">*</span></Label>
                                <Slider
                                    id={`thickness-${el.id}`}
                                    min={1}
                                    max={10}
                                    step={1}
                                    value={[el.thickness]}
                                    onValueChange={([value]) => handleElementChange(el.id, "thickness", value)} />
                              </div>
                              {chartType !== "Bar" && (
                                  <>
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                          id={`curved-${el.id}`}
                                          checked={el.curved}
                                          onCheckedChange={(checked) => handleElementChange(el.id, "curved", checked)} />
                                      <Label htmlFor={`curved-${el.id}`}>Curved Line</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                          id={`dotted-${el.id}`}
                                          checked={el.dotted}
                                          onCheckedChange={(checked) => handleElementChange(el.id, "dotted", checked)} />
                                      <Label htmlFor={`dotted-${el.id}`}>Dotted Line</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                          id={`showDots-${el.id}`}
                                          checked={el.showDots}
                                          onCheckedChange={(checked) => handleElementChange(el.id, "showDots", checked)} />
                                      <Label htmlFor={`showDots-${el.id}`}>Show Dots</Label>
                                    </div>
                                    {el.showDots && (
                                        <div>
                                          <Label htmlFor={`dotSize-${el.id}`}>Dot Size</Label>
                                          <Slider
                                              id={`dotSize-${el.id}`}
                                              min={1}
                                              max={10}
                                              step={1}
                                              value={[el.dotSize]}
                                              onValueChange={([value]) => handleElementChange(el.id, "dotSize", value)} />
                                        </div>
                                    )}
                                  </>
                              )}
                              <Button variant="destructive" onClick={() => removeElement(el.id)}>
                                <Minus className="mr-2 h-4 w-4" /> Remove {chartType}
                              </Button>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                    ))}
                  </Accordion>
                  <Button onClick={addElement}>
                    <Plus className="mr-2 h-4 w-4" /> Add {chartType}
                  </Button>
                  <Separator className="my-4 dark:bg-gray-700" />
                  <h3 className="text-sm font-medium text-black mb-2 dark:text-white">Conditional Parameters</h3>
                  <div>
                    <Label htmlFor="conditionalCollection">Collection <span className="text-red-500">*</span></Label>
                    <Select
                        value={conditionalParams.collection}
                        onValueChange={(value) => handleConditionalParamChange("collection", value)}
                        className={"dark:bg-gray-700"}
                    >
                      <SelectTrigger id="conditionalCollection" className={"dark:bg-gray-700"}>
                        <SelectValue placeholder="Select collection"/>
                      </SelectTrigger>
                      <SelectContent>
                        {collections.map((col) => (
                            <SelectItem key={col.name} value={col.name}>
                              {col.name}
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="conditionalField">Field <span className="text-red-500">*</span></Label>
                    <Input
                        id="conditionalField"
                        value={conditionalParams.field}
                        onChange={(e) => handleConditionalParamChange("field", e.target.value)}
                        className={"dark:bg-gray-700"}
                    />
                  </div>
                  <div>
                    <Label htmlFor="conditionalValue">Value <span className="text-red-500">*</span></Label>
                    <Input
                        id="conditionalValue"
                        value={conditionalParams.value}
                        onChange={(e) => handleConditionalParamChange("value", e.target.value)}
                        className={"dark:bg-gray-700"}
                    />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    This will filter the data so it only shows the data that have this parameter and value.
                  </p>
                  <Separator className="my-4 dark:bg-gray-700" />
                  <Button onClick={saveChartData} className="w-full mt-4">
                    Save Chart Data
                  </Button>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}