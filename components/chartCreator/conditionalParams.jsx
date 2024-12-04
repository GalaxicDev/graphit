import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ConditionalParams({ collections, conditionalParams, handleConditionalParamChange }) {
    return (
        <div>
            <Label htmlFor="conditionalCollection">Collection</Label>
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
            <div>
                <Label htmlFor="conditionalField">Field</Label>
                <Input
                    id="conditionalField"
                    value={conditionalParams.field}
                    onChange={(e) => handleConditionalParamChange("field", e.target.value)}
                    className={"dark:bg-gray-700"}
                />
            </div>
            <div>
                <Label htmlFor="conditionalValue">Value</Label>
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
        </div>
    );
}