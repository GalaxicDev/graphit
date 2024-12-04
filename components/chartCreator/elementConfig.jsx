import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Minus, Info } from 'lucide-react';

export function ElementConfig({ el, collections, handleElementChange, removeElement, chartType }) {
    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor={`collection-${el.id}`}>Collection</Label>
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
                <Label htmlFor={`xAxisKey-${el.id}`}>X Axis Key</Label>
                <div className="flex items-center space-x-2">
                    <Input
                        id={`xAxisKey-${el.id}`}
                        value={el.xAxisKey}
                        onChange={(e) => handleElementChange(el.id, "xAxisKey", e.target.value)}
                        className={"dark:bg-gray-700"}
                    />
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-gray-500 cursor-pointer" />
                            </TooltipTrigger>
                            <TooltipContent>
                                The field in the database for the X axis key.
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
            <div>
                <Label htmlFor={`yAxisKey-${el.id}`}>Y Axis Key</Label>
                <div className="flex items-center space-x-2">
                    <Input
                        id={`yAxisKey-${el.id}`}
                        value={el.yAxisKey}
                        onChange={(e) => handleElementChange(el.id, "yAxisKey", e.target.value)}
                        className={"dark:bg-gray-700"}
                    />
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-gray-500 cursor-pointer" />
                            </TooltipTrigger>
                            <TooltipContent>
                                The field in the database for the Y axis key.
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
            <div>
                <Label htmlFor={`name-${el.id}`}>Name</Label>
                <Input
                    id={`name-${el.id}`}
                    value={el.name}
                    onChange={(e) => handleElementChange(el.id, "name", e.target.value)}
                    className={"dark:bg-gray-700"}
                />
            </div>
            <div>
                <Label htmlFor={`color-${el.id}`}>Color</Label>
                <Input
                    id={`color-${el.id}`}
                    type="color"
                    value={el.color}
                    onChange={(e) => handleElementChange(el.id, "color", e.target.value)} />
            </div>
            <div>
                <Label htmlFor={`thickness-${el.id}`}>Thickness</Label>
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
    );
}