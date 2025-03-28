import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from 'lucide-react'
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import TimePicker from 'react-time-picker'
import 'react-time-picker/dist/TimePicker.css'

const chartTypes = ["Line", "Bar", "Area", "Scatter", "Pie", "Info", "Map", "Map Trajectory"];

export function ChartOptions({ chartType, setChartType, options, handleOptionChange, elements }) {
    return (
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
                                        <SelectValue placeholder="Select chart type"/>
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
            {chartType !== "Info" && (
                <>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="showGrid"
                            checked={options.showGrid}
                            onCheckedChange={(checked) => handleOptionChange("showGrid", checked)}
                        />
                        <Label htmlFor="showGrid">Show Grid</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="dynamicTime"
                            checked={options.dynamicTime}
                            onCheckedChange={(checked) => handleOptionChange("dynamicTime", checked)}
                        />
                        <Label htmlFor="dynamicTime">Dynamic Time</Label>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                            <span className="cursor-pointer">
                                <Info className="h-4 w-4 text-gray-500 dark:text-gray-400"/>
                            </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Enable dynamic time to show a timepicker (1D, 7D, ...) to choose the range of
                                        data
                                        you want to display.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </>
            )}
            {chartType === "Bar" && (
                <div className="flex items-center space-x-2">
                    <Switch
                        id="stacked"
                        checked={options.stacked}
                        onCheckedChange={(checked) => handleOptionChange("stacked", checked)}/>
                    <Label htmlFor="stacked">Stacked Bars</Label>
                </div>
            )}
            {!options.dynamicTime && (
                <div>
                    <Label>X Range</Label>
                    <div className="flex items-center space-x-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "justify-start text-left font-normal",
                                        !options.xRange && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4"/>
                                    {options.xRange?.from ? (
                                        options.xRange?.to ? (
                                            <>
                                                {format(options.xRange.from, "LLL dd, y HH:mm")} -{" "}
                                                {format(options.xRange.to, "LLL dd, y HH:mm")}
                                            </>
                                        ) : (
                                            format(options.xRange.from, "LLL dd, y HH:mm")
                                        )
                                    ) : (
                                        <span>Pick a date range</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="range"
                                    selected={options.xRange}
                                    onSelect={(range) => handleOptionChange("xRange", range)}
                                    initialFocus
                                />
                                <div className="flex justify-between p-3">
                                    <div>
                                        <Label>From</Label>
                                        <TimePicker
                                            value={options.xRange?.from}
                                            onChange={(time) => {
                                                const newDate = new Date(options.xRange.from);
                                                const [hours, minutes] = time.split(':');
                                                newDate.setHours(parseInt(hours, 10));
                                                newDate.setMinutes(parseInt(minutes, 10));
                                                handleOptionChange("xRange", { ...options.xRange, from: newDate });
                                            }}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        />
                                    </div>
                                    <div>
                                        <Label>To</Label>
                                        <TimePicker
                                            value={options.xRange?.from?.toISOString().substring(11, 16) || ""}
                                            onChange={(time) => {
                                                if (time) {
                                                    const newDate = new Date(options.xRange.from || Date.now());
                                                    const [hours, minutes] = time.split(':');
                                                    newDate.setHours(parseInt(hours, 10));
                                                    newDate.setMinutes(parseInt(minutes, 10));
                                                    handleOptionChange("xRange", { ...options.xRange, from: newDate });
                                                }
                                            }}
                                            clockClassName="react-time-picker__clock" // Applies dropdown styles
                                            className="w-full rounded-md border dark:bg-gray-700 px-3 py-2"
                                        />

                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            )}
            {chartType !== "Info" && (
                <>
                <div>
                    <Label>Y-Axis Range</Label>
                    <div className="flex items-center space-x-2">
                        <Input
                            type="number"
                            value={options.yRange.min}
                            onChange={(e) => handleOptionChange("yRange", {...options.yRange, min: e.target.value})}
                            placeholder="Min"
                            className="w-20 dark:bg-gray-700"/>
                        <span>to</span>
                        <Input
                            type="number"
                            value={options.yRange.max}
                            onChange={(e) => handleOptionChange("yRange", {...options.yRange, max: e.target.value})}
                            placeholder="Max"
                            className="w-20 dark:bg-gray-700"/>
                    </div>
                </div>
                </>
                )}
            {chartType === "Map Trajectory" && (
                <>
                    {/* ask the user for a timeout (how often data should be received, and if there is a delay longer then timeout ignore the data point and know we have invalid data) also add a tooltip to explain it */}
                    <div>
                        <label htmlFor="timeout">Timeout (seconds)</label>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="cursor-pointer">
                                        <Info className="h-4 w-4 text-gray-500 dark:text-gray-400"/>
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Timeout in seconds to ignore data points if the delay is longer than the timeout.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <Input
                            id="timeout"
                            type="number"
                            value={options.timeout}
                            onChange={(e) => handleOptionChange("timeout", e.target.value)}
                            className="w-20 dark:bg-gray-700"
                        />
                    </div>
                </>
            )}
        </div>
    );
}