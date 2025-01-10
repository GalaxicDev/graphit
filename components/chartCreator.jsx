// TODO: implement y ranges again

"use client"

import {useState, useEffect} from "react"
import axios from 'axios'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PacmanLoader } from 'react-spinners'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Calendar } from "@/components/ui/calendar"
import { CircleAlert } from 'lucide-react'
import { cn } from "@/lib/utils"
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie
} from "recharts"
import { ChartOptions } from "@/components/chartCreator/chartOptions"
import { ElementConfig } from "@/components/chartCreator/elementConfig"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { MoreHorizontal, Edit, Trash2, Maximize2, Minimize2, Move, Plus } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"


export function ChartCreator({ token, projectData }) {
  const [chartType, setChartType] = useState("Line")
  const [options, setOptions] = useState({
    title: "Chart Title",
    cardColor: "#4C51BF",
    showGrid: true,
    dynamicTime: true,
    stacked: false,
    yRange: { min: "", max: "" },
    xRange: { from: new Date(), to: new Date() },
  })
  const [elements, setElements] = useState([])
  const [graphData, setGraphData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D')
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [error, setError] = useState(false) // boolean to see if error message should be displayed, used for validation

  const router = useRouter()

  // fetch the data for the graph preview, runs everytime the elements or options change
  useEffect(() => {
    const fetchGraphData = async () => {
      if (elements.length === 0) return;

      try {
        setIsLoading(true);
        let params = {
          collections: elements.map(el => el.collection).join(','),
          fields: elements.map(el => `${el.xAxisKey},${el.yAxisKey}`).join(',')
        };

        if (options.dynamicTime) {
          params.timeframe = selectedTimeframe;
        } else {
          const fromDate = new Date(options.xRange.from);
          const toDate = new Date(options.xRange.to);

          if (options.xRange.fromTime) {
            const [fromHours, fromMinutes] = options.xRange.fromTime.split(':');
            fromDate.setHours(parseInt(fromHours, 10), parseInt(fromMinutes, 10));
          }

          if (options.xRange.toTime) {
            const [toHours, toMinutes] = options.xRange.toTime.split(':');
            toDate.setHours(parseInt(toHours, 10), parseInt(toMinutes, 10));
          }

          params.from = fromDate.toISOString();
          params.to = toDate.toISOString();
        }

        const dataResponse = await axios.get(`${process.env.API_URL}/mqtt/data`, {
          params,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setGraphData(dataResponse.data.data);
        processData(dataResponse.data.data);
      } catch (error) {
        console.error('Failed to fetch graph data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGraphData();
  }, [elements, selectedTimeframe, options.dynamicTime, options.xRange, options.yRange]);

  // process the data to fit the y range and set the graph data
  const processData = (data) => {
    // fetch the min and max y range and remove all the data that is not in the range
    const range = options.yRange; // object with min and max properties
    if (range.min !== "" && range.max !== "") {
      data = data.filter((item) => item[graph.elements[0].yAxisKey] >= range.min && item[graph.elements[0].yAxisKey] <= range.max);
      setGraphData(data);
    }
  }

  // handle the change of the options
  const handleOptionChange = (key, value) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  // handle the change of an element
  const handleElementChange = (id, key, value) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, [key]: value } : el))
  }

  // add a new element to the elements array (lines, bars, ...)
  const addElement = () => {
    const newId = (elements.length + 1).toString()
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
      dotSize: 5
    }])
  }

  const removeElement = (id) => {
    setElements(prev => prev.filter(el => el.id !== id))
  }

  // handle the creating of the chart
  const createGraph = async () => {
    const newGraph = {
      projectId: projectData._id,
      chartType,
      options,
      elements,
      conditionalParams: {}
    }

    // validate if every element has a collection, xAxisKey and yAxisKey. If they are missing return
    for (let i = 0; i < elements.length; i++) {
        if (!elements[i].collection || !elements[i].xAxisKey || !elements[i].yAxisKey) {
            setError(true)
            return
        }
    }

    try {
      const res = await axios.post(`${process.env.API_URL}/graphs`, newGraph, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      // navigate back to project view
        router.push(`/projects/${projectData._id}`)
    } catch (error) {
      console.error('Failed to create graph:', error)
  }
}

  // render the chart based on the chart type
  const renderChart = () => {
    if (!chartType || !elements || elements.length === 0 || graphData.length === 0) return null;

    // Calculate the min and max values for the Y-axis
    const yValues = elements.flatMap(element => graphData.map(data => data[element.yAxisKey]));
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);

    // Add a margin to the min and max values
    const margin = (yMax - yMin) * 0.1; // 10% margin
    const adjustedYMin = yMin - margin;
    const adjustedYMax = yMax + margin;

    switch (chartType) {
      case 'Line':
        return (
            <LineChart data={graphData} className="flex-grow">
              <XAxis
                  dataKey={elements[0]?.xAxisKey}
                  tickFormatter={(tick) => format(new Date(tick), 'dd/MM HH:mm')}
              />
              <YAxis domain={["auto", "auto"]} />
              {options.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              {elements.map((element) => (
                  <Line
                      key={element.id}
                      type={element.curved ? "monotone" : "linear"}
                      dataKey={element.yAxisKey}
                      stroke={element.color}
                      dot={element.showDots}
                  />
              ))}
            </LineChart>
        );
      case 'Bar':
        return (
            <BarChart data={graphData} className="flex-grow">
              <XAxis
                  dataKey={elements[0]?.xAxisKey}
                  tickFormatter={(tick) => format(new Date(tick), 'dd/MM HH:mm')}
              />
              <YAxis domain={[adjustedYMin, adjustedYMax]} />
              {options.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {elements.map((element) => (
                  <Bar key={element.id} dataKey={element.yAxisKey} fill={element.color} />
              ))}
            </BarChart>
        );
      case 'Area':
        return (
            <AreaChart data={graphData} className="flex-grow">
              <XAxis
                  dataKey={elements[0]?.xAxisKey}
                  tickFormatter={(tick) => format(new Date(tick), 'dd/MM HH:mm')}
              />
              <YAxis domain={[adjustedYMin, adjustedYMax]} />
              {options.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {elements.map((element) => (
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
                  dataKey={elements[0]?.xAxisKey}
                  tickFormatter={(tick) => format(new Date(tick), 'dd/MM HH:mm')}
              />
              <YAxis domain={[adjustedYMin, adjustedYMax]} />
              {options.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {elements.map((element) => (
                  <Scatter key={element.id} dataKey={element.yAxisKey} fill={element.color} />
              ))}
            </ScatterChart>
        );
      default:
        return null;
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-lg rounded-lg p-3">
            <p className="text-gray-700 dark:text-gray-200 font-semibold mb-1">{format(new Date(label), 'PPP HH:mm')}</p>
            {payload.map((item, index) => (
                <div key={index} className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                  <span>{item.name}</span>
                  <span style={{ color: item.color }} className="font-medium">
                {item.value}
              </span>
                </div>
            ))}
          </div>
      )
    }
    return null
  }

  return (
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8 text-black dark:text-white">Chart Creator</h1>
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
          {/* chart preview */}
          <Card className="col-span-1 md:col-span-2 bg-white dark:bg-gray-800">
            <CardHeader
                className="flex flex-row items-center justify-between space-y-0 py-2"
                style={{backgroundColor: options.cardColor}}
            >
              <h3 className="font-semibold text-white">{options.title}</h3>
              <div className="flex items-center space-x-2 justify-center mx-5 my-5">
                <Dialog open={isFullScreen} onOpenChange={setIsFullScreen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
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
                              onClick={() => setIsFullScreen(false)}
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
                          {renderChart()}
                        </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
                {/* chart options */}
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
                      {/* add lines/bars/.... */}
                      <Separator className="my-4 dark:bg-gray-700"/>
                      <h3 className="text-sm font-medium text-black mb-2 dark:text-white">{chartType}s</h3>
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
                      <Button onClick={addElement}>
                        <Plus className="mr-2 h-4 w-4"/> Add {chartType}
                      </Button>
                      {/* create graph button */}
                      <Separator className="my-4 dark:bg-gray-700"/>
                      <Button className="w-full" onClick={() => createGraph()}>
                        Create Graph
                      </Button>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          )
        }