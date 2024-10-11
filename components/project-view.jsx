'use client'

import { useState } from 'react'
import { Edit, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function ProjectView({ project, setSelectedProject }) {
  const [editMode, setEditMode] = useState(false)
  const [projectName, setProjectName] = useState(project.name)
  const [projectDescription, setProjectDescription] = useState(project.description)

  const collections = [
    { id: 1, name: "Users", documents: 1000 },
    { id: 2, name: "Products", documents: 500 },
    { id: 3, name: "Orders", documents: 2000 },
    { id: 4, name: "Categories", documents: 50 },
    { id: 5, name: "Reviews", documents: 3000 },
  ]

  const [graphs, setGraphs] = useState([
    { id: 1, name: "Monthly Sales", type: "bar", collection: "Orders" },
    { id: 2, name: "User Growth", type: "line", collection: "Users" },
    { id: 3, name: "Product Categories", type: "pie", collection: "Products" },
  ])

  const handleSave = () => {
    // Here you would typically update the project in your backend
    project.name = projectName
    project.description = projectDescription
    setEditMode(false)
  }

  return (<>
    <div className="flex justify-between items-center mb-6">
      
      {editMode ? (
        <div className="flex-1 mr-4">
          <Input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="text-3xl font-semibold mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-700" />
          <Textarea
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            className="w-full dark:bg-gray-800 dark:text-white dark:border-gray-700" />
        </div>
      ) : (
        <div>
          <h1 className="text-3xl font-semibold text-gray-800 dark:text-white">{projectName}</h1>
          <p className="text-gray-500 dark:text-gray-400">{projectDescription}</p>
        </div>
      )}
      <div className="flex items-center">
        {editMode ? (
          <>
            <Button onClick={handleSave} className="mr-2">Save</Button>
            <Button
              variant="outline"
              onClick={() => setEditMode(false)}
              className="dark:border-gray-600 dark:text-gray-300">Cancel</Button>
          </>
        ) : (
          <Button onClick={() => setEditMode(true)} className="mr-2">
            <Edit className="h-4 w-4 mr-2" /> Edit Project
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => setSelectedProject(null)}
          className="dark:border-gray-600 dark:text-gray-300">Back to Projects</Button>
      </div>
    </div>
    <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="dark:text-white">Collections</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {collections.map((collection) => (
            <AccordionItem
              value={`item-${collection.id}`}
              key={collection.id}
              className="border-b border-gray-200 dark:border-gray-700">
              <AccordionTrigger className="dark:text-white">{collection.name}</AccordionTrigger>
              <AccordionContent className="dark:text-gray-300">
                <p>Documents: {collection.documents}</p>
                <div className="mt-2">
                  <Button size="sm" className="mr-2">View Data</Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="dark:border-gray-600 dark:text-gray-300">Visualize</Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
    <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex justify-between items-center dark:text-white">
          <span>Visualizations</span>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" /> New Graph
              </Button>
            </DialogTrigger>
            <DialogContent className="dark:bg-gray-800">
              <DialogHeader>
                <DialogTitle className="dark:text-white">Create New Graph</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="graph-name" className="text-right dark:text-white">Name</Label>
                  <Input
                    id="graph-name"
                    className="col-span-3 dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="graph-type" className="text-right dark:text-white">Type</Label>
                  <Select>
                    <SelectTrigger
                      className="col-span-3 dark:bg-gray-700 dark:text-white dark:border-gray-600">
                      <SelectValue placeholder="Select graph type" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectItem value="bar" className="dark:text-white dark:focus:bg-gray-700">Bar Chart</SelectItem>
                      <SelectItem value="line" className="dark:text-white dark:focus:bg-gray-700">Line Chart</SelectItem>
                      <SelectItem value="pie" className="dark:text-white dark:focus:bg-gray-700">Pie Chart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="graph-collection" className="text-right dark:text-white">Collection</Label>
                  <Select>
                    <SelectTrigger
                      className="col-span-3 dark:bg-gray-700 dark:text-white dark:border-gray-600">
                      <SelectValue placeholder="Select collection" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      {collections.map((collection) => (
                        <SelectItem
                          key={collection.id}
                          value={collection.name}
                          className="dark:text-white dark:focus:bg-gray-700">
                          {collection.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Graph</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={graphs[0].id.toString()}>
          <TabsList className="dark:bg-gray-700">
            {graphs.map((graph) => (
              <TabsTrigger
                key={graph.id}
                value={graph.id.toString()}
                className="dark:text-gray-300 dark:data-[state=active]:bg-gray-600 dark:data-[state=active]:text-white">
                {graph.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {graphs.map((graph) => (
            <TabsContent key={graph.id} value={graph.id.toString()}>
              <Card className="dark:bg-gray-750 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">{graph.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="dark:text-gray-300">Graph Type: {graph.type}</p>
                  <p className="dark:text-gray-300">Collection: {graph.collection}</p>
                  {/* Here you would typically render the actual graph */}
                  <div
                    className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400">
                    Graph Placeholder
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  </>);
}