import { useState, useEffect } from 'react';
import axios from 'axios';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from 'lucide-react';

const generalChartTypes = ["Line", "Bar", "Area", "Scatter", "Pie", "Radar"];

export function ElementConfig({ el, collections, handleElementChange, removeElement, chartType }) {
    const [availableKeys, setAvailableKeys] = useState([]);

    useEffect(() => {
        const fetchAvailableKeys = async () => {
            if (el.collection) {
                try {
                    const response = await axios.get(`${process.env.API_URL}/mqtt/availableKeys`, {
                        params: { collection: el.collection },
                        headers: {
                            "Authorization": `Bearer ${localStorage.getItem("token")}`
                        }
                    });
                    setAvailableKeys(response.data.availableKeys);
                } catch (error) {
                    console.error('Failed to fetch available keys:', error);
                }
            }
        };

        fetchAvailableKeys();
    }, [el.collection]);

    const addConditionalParam = () => {
        const newParam = { field: "", operator: "equals", value: "" };
        handleElementChange(el.id, "conditionalParams", [...(el.conditionalParams || []), newParam]);
    };

    const updateConditionalParam = (index, key, value) => {
        const updatedParams = el.conditionalParams.map((param, i) =>
            i === index ? { ...param, [key]: value } : param
        );
        handleElementChange(el.id, "conditionalParams", updatedParams);
    };

    const removeConditionalParam = (index) => {
        const updatedParams = el.conditionalParams.filter((_, i) => i !== index);
        handleElementChange(el.id, "conditionalParams", updatedParams);
    };

    const addField = () => {
        const newField = { collection: "", dataKey: "", name: "", fetchMethod: "latest entry" };
        handleElementChange(el.id, "fields", [...(el.fields || []), newField]);
    };

    const updateField = (index, key, value) => {
        const updatedFields = el.fields.map((field, i) =>
            i === index ? { ...field, [key]: value } : field
        );
        handleElementChange(el.id, "fields", updatedFields);
    };

    const removeField = (index) => {
        const updatedFields = el.fields.filter((_, i) => i !== index);
        handleElementChange(el.id, "fields", updatedFields);
    };

    const updatePinpoint = (index, key, value) => {
        const updatedPinpoints = el.pinpoints.map((point, i) =>
            i === index ? { ...point, [key]: value } : point
        );
        handleElementChange(el.id, "pinpoints", updatedPinpoints);
    };

    return (
        <div className="space-y-4">
            {chartType === "Info" && (
                <>
                    <div>
                        <Label htmlFor={`collection-${el.id}`}>Collection</Label>
                        <Select
                            value={el.collection}
                            onValueChange={(value) => handleElementChange(el.id, "collection", value)}
                            className="dark:bg-gray-700"
                        >
                            <SelectTrigger id={`collection-${el.id}`} className="dark:bg-gray-700">
                                <SelectValue placeholder="Select collection" />
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
                        <Label htmlFor={`dataKey-${el.id}`}>Data Key</Label>
                        <Select
                            value={el.dataKey}
                            onValueChange={(value) => handleElementChange(el.id, "dataKey", value)}
                            className="dark:bg-gray-700"
                        >
                            <SelectTrigger id={`dataKey-${el.id}`} className="dark:bg-gray-700">
                                <SelectValue placeholder="Select data key" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableKeys.map((key) => (
                                    <SelectItem key={key} value={key}>
                                        {key}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor={`name-${el.id}`}>Name</Label>
                        <Input
                            id={`name-${el.id}`}
                            value={el.name}
                            onChange={(e) => handleElementChange(el.id, "name", e.target.value)}
                            className="dark:bg-gray-700"
                        />
                    </div>
                    <div>
                        <Label htmlFor={`fetchMethod-${el.id}`}>Fetch Method</Label>
                        <Select
                            value={el.fetchMethod}
                            onValueChange={(value) => handleElementChange(el.id, "fetchMethod", value)}
                            className="dark:bg-gray-700"
                        >
                            <SelectTrigger id={`fetchMethod-${el.id}`} className="dark:bg-gray-700">
                                <SelectValue placeholder="Select fetch method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="latest entry">Latest Entry</SelectItem>
                                <SelectItem value="first entry">First Entry</SelectItem>
                                <SelectItem value="last known value">Last Known Value</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button variant="destructive" onClick={() => removeElement(el.id)} className="mt-4">
                        <Minus className="mr-2 h-4 w-4" /> Remove Field
                    </Button>
                </>
            )}

            {(chartType === "Map" || chartType === "Map Trajectory") && (
                <>
                    <div className="flex items-center space-x-4">
                        <Label htmlFor={`manual-entry-${el.id}`} className="font-bold">
                            Manual Entry
                        </Label>
                        <Switch
                            id={`manual-entry-${el.id}`}
                            checked={el.manualEntry}
                            onCheckedChange={(checked) => handleElementChange(el.id, "manualEntry", checked)}
                        />
                    </div>

                    {!el.manualEntry && (
                        <div>
                            <Label htmlFor={`collection-${el.id}`}>Collection</Label>
                            <Select
                                value={el.collection}
                                onValueChange={(value) => handleElementChange(el.id, "collection", value)}
                                className="dark:bg-gray-700"
                            >
                                <SelectTrigger id={`collection-${el.id}`} className="dark:bg-gray-700">
                                    <SelectValue placeholder="Select collection" />
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
                    )}

                    <div>
                        <Label className="font-bold">Pinpoints</Label>
                        <div className="space-y-4">
                            {(el.pinpoints || []).map((point, index) => (
                                <div key={index} className="space-y-2 border p-4 rounded-lg">
                                    <Label>Point {index + 1}</Label>
                                    {el.manualEntry ? (
                                        <>
                                            <Input
                                                placeholder="Latitude"
                                                value={point.latitude}
                                                onChange={(e) => updatePinpoint(index, "latitude", e.target.value)}
                                                className="dark:bg-gray-700"
                                            />
                                            <Input
                                                placeholder="Longitude"
                                                value={point.longitude}
                                                onChange={(e) => updatePinpoint(index, "longitude", e.target.value)}
                                                className="dark:bg-gray-700"
                                            />
                                            <Input
                                                placeholder="Label"
                                                value={point.label}
                                                onChange={(e) => updatePinpoint(index, "label", e.target.value)}
                                                className="dark:bg-gray-700"
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <Select
                                                value={point.latitude}
                                                onValueChange={(value) => updatePinpoint(index, "latitude", value)}
                                                className="dark:bg-gray-700"
                                            >
                                                <SelectTrigger className="dark:bg-gray-700">
                                                    <SelectValue placeholder="Select Latitude Key" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableKeys.map((key) => (
                                                        <SelectItem key={key} value={key}>
                                                            {key}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Select
                                                value={point.longitude}
                                                onValueChange={(value) => updatePinpoint(index, "longitude", value)}
                                                className="dark:bg-gray-700"
                                            >
                                                <SelectTrigger className="dark:bg-gray-700">
                                                    <SelectValue placeholder="Select Longitude Key" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableKeys.map((key) => (
                                                        <SelectItem key={key} value={key}>
                                                            {key}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                placeholder="Label"
                                                value={point.label}
                                                onChange={(e) => updatePinpoint(index, "label", e.target.value)}
                                                className="dark:bg-gray-700"
                                            />
                                        </>
                                    )}
                                    <Button
                                        variant="destructive"
                                        onClick={() =>
                                            handleElementChange(
                                                el.id,
                                                "pinpoints",
                                                el.pinpoints.filter((_, i) => i !== index)
                                            )
                                        }
                                        className="mt-2"
                                    >
                                        <Minus className="mr-2 h-4 w-4" /> Remove Point
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Button
                            onClick={() =>
                                handleElementChange(el.id, "pinpoints", [
                                    ...(el.pinpoints || []),
                                    { latitude: "", longitude: "", label: "" },
                                ])
                            }
                            className="mt-4"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Pinpoint
                        </Button>
                    </div>
                </>
            )}

            {generalChartTypes.includes(chartType) && (
                <>
                    <div>
                        <Label className="font-bold" htmlFor={`collection-${el.id}`}>Collection</Label>
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
                        <Label className="font-bold" htmlFor={`xAxisKey-${el.id}`}>X Axis Key</Label>
                        <Select
                            value={el.xAxisKey}
                            onValueChange={(value) => handleElementChange(el.id, "xAxisKey", value)}
                            className={"dark:bg-gray-700"}
                        >
                            <SelectTrigger id={`xAxisKey-${el.id}`} className={"dark:bg-gray-700"}>
                                <SelectValue placeholder="Select X Axis Key"/>
                            </SelectTrigger>
                            <SelectContent>
                                {availableKeys.map((key) => (
                                    <SelectItem key={key} value={key}>
                                        {key}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label className="font-bold" htmlFor={`yAxisKey-${el.id}`}>Y Axis Key</Label>
                        <Select
                            value={el.yAxisKey}
                            onValueChange={(value) => handleElementChange(el.id, "yAxisKey", value)}
                            className={"dark:bg-gray-700"}
                        >
                            <SelectTrigger id={`yAxisKey-${el.id}`} className={"dark:bg-gray-700"}>
                                <SelectValue placeholder="Select Y Axis Key"/>
                            </SelectTrigger>
                            <SelectContent>
                                {availableKeys.map((key) => (
                                    <SelectItem key={key} value={key}>
                                        {key}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label className="font-bold" htmlFor={`name-${el.id}`}>Name</Label>
                        <Input
                            id={`name-${el.id}`}
                            value={el.name}
                            onChange={(e) => handleElementChange(el.id, "name", e.target.value)}
                            className={"dark:bg-gray-700"}
                        />
                    </div>
                    <div>
                        <Label className="font-bold" htmlFor={`color-${el.id}`}>Color</Label>
                        <Input
                            id={`color-${el.id}`}
                            type="color"
                            value={el.color}
                            onChange={(e) => handleElementChange(el.id, "color", e.target.value)}
                            className={"py-3 dark:bg-gray-700"}
                        />
                    </div>
                    <div>
                        <Label className="font-bold" htmlFor={`thickness-${el.id}`}>Thickness</Label>
                        <Slider
                            id={`thickness-${el.id}`}
                            min={1}
                            max={10}
                            step={1}
                            value={[el.thickness]}
                            onValueChange={([value]) => handleElementChange(el.id, "thickness", value)}
                            className={"py-3"}
                        />
                    </div>
                    {chartType !== "Bar" && chartType !== "Pie" && (
                        <>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id={`curved-${el.id}`}
                                    checked={el.curved}
                                    onCheckedChange={(checked) => handleElementChange(el.id, "curved", checked)}
                                />
                                <Label className="font-bold" htmlFor={`curved-${el.id}`}>Curved Line</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id={`dotted-${el.id}`}
                                    checked={el.dotted}
                                    onCheckedChange={(checked) => handleElementChange(el.id, "dotted", checked)}
                                />
                                <Label className="font-bold" htmlFor={`dotted-${el.id}`}>Dotted Line</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id={`showDots-${el.id}`}
                                    checked={el.showDots}
                                    onCheckedChange={(checked) => handleElementChange(el.id, "showDots", checked)}
                                />
                                <Label className="font-bold" htmlFor={`showDots-${el.id}`}>Show Dots</Label>
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
                                        onValueChange={([value]) => handleElementChange(el.id, "dotSize", value)}
                                    />
                                </div>
                            )}
                        </>
                    )}
                    <div>
                        <Label className="font-bold">Conditional Parameters:</Label>
                        <div className="space-y-2">
                            {el.conditionalParams?.map((param, index) => (
                                <div key={index} className="flex space-x-2 items-center">
                                    <Select
                                        value={param.field}
                                        onValueChange={(value) => updateConditionalParam(index, "field", value)}
                                        className={"dark:bg-gray-700"}
                                    >
                                        <SelectTrigger className={"dark:bg-gray-700"}>
                                            <SelectValue placeholder="Field"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableKeys.map((key) => (
                                                <SelectItem key={key} value={key}>
                                                    {key}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        value={param.operator}
                                        onValueChange={(value) => updateConditionalParam(index, "operator", value)}
                                        className={"dark:bg-gray-700"}
                                    >
                                        <SelectTrigger className={"dark:bg-gray-700"}>
                                            <SelectValue placeholder="Operator"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {["equals", "not equals", "greater than", "less than", "greater than or equal to", "less than or equal to", "contains", "does not contain", "starts with", "ends with"].map((op) => (
                                                <SelectItem key={op} value={op}>
                                                    {op}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        value={param.value}
                                        onChange={(e) => updateConditionalParam(index, "value", e.target.value)}
                                        placeholder="Value"
                                        className={"dark:bg-gray-700"}
                                    />
                                    <Button variant="destructive" onClick={() => removeConditionalParam(index)}>
                                        <Minus className="h-4 w-4"/>
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Button onClick={addConditionalParam} className="mt-2">
                            <Plus className="mr-2 h-4 w-4"/> Add Conditional Param
                        </Button>
                    </div>
                    <Button variant="destructive" onClick={() => removeElement(el.id)} className="mt-4">
                        <Minus className="mr-2 h-4 w-4"/> Remove {chartType}
                    </Button>
                </>
            )}
        </div>
    );
}