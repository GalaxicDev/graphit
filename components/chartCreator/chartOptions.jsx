import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

const chartTypes = ["Line", "Bar", "Area", "Scatter"];

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
                            <p>Enable dynamic time to show a timepicker (1D, 7D, ...) to choose the range of data you want to display.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
            {chartType === "Bar" && (
                <div className="flex items-center space-x-2">
                    <Switch
                        id="stacked"
                        checked={options.stacked}
                        onCheckedChange={(checked) => handleOptionChange("stacked", checked)}/>
                    <Label htmlFor="stacked">Stacked Bars</Label>
                </div>
            )}
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
        </div>
    );
}
