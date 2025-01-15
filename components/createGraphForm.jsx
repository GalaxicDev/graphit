'use client';
import * as React from "react"
import { useState } from "react"
import axios from "axios"
import { ChevronRight, ChevronLeft, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const graphTypes = ["Bar", "Line", "Pie", "Scatter"]

export function CreateGraphForm({ onClose, formData, setFormData, collections }) {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const updateFormData = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleNext = () => {
        if (step < 2) setStep(step + 1)
    }

    const handlePrevious = () => {
        if (step > 1) setStep(step - 1)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const response = await axios.post(process.env.API_URL + '/graphs', formData, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            })
            console.log("Graph created:", response.data)
            setFormData({
                projectId: formData.projectId,
                name: "",
                type: "",
                collection: "",
                xField: "",
                yField: "",
            })
            onClose()
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-lg mx-auto relative">
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={onClose}>
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </Button>
            <CardHeader>
                <CardTitle>Create New Graph</CardTitle>
                <CardDescription>Step {step} of 2</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent>
                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Graph Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => updateFormData("name", e.target.value)}
                                    required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Graph Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => updateFormData("type", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select graph type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {graphTypes.map((type) => (
                                            <SelectItem key={type} value={type.toLowerCase()}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="collection">Collection</Label>
                                <Select
                                    value={formData.collection}
                                    onValueChange={(value) => updateFormData("collection", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select collection"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {collections.map((collection) => (
                                            <SelectItem key={collection.id} value={collection.name}>
                                                {collection.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="xField">X-Axis Field (Field in database)</Label>
                                <Input
                                    id="xField"
                                    value={formData.xField}
                                    onChange={(e) => updateFormData("xField", e.target.value)}
                                    required/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="yField">Y-Axis Field (Field in database)</Label>
                                <Input
                                    id="yField"
                                    value={formData.yField}
                                    onChange={(e) => updateFormData("yField", e.target.value)}
                                    required/>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between">
                    {step > 1 && (
                        <Button type="button" variant="outline" onClick={handlePrevious}>
                            <ChevronLeft className="w-4 h-4 mr-2"/> Previous
                        </Button>
                    )}
                    {step < 2 ? (
                        <Button
                            type="button"
                            onClick={handleNext}
                            className={step === 1 ? "ml-auto" : ""}>
                            Next <ChevronRight className="w-4 h-4 ml-2"/>
                        </Button>
                    ) : (
                        <Button type="submit" disabled={loading} onClick={handleSubmit}>
                            {loading ? "Creating..." : "Create Graph"}
                        </Button>
                    )}
                </CardFooter>
                {error && <p className="text-red-500 mt-4">{error}</p>}
            </form>
        </Card>
    );
}