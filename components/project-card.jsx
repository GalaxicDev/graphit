'use client'

import { Edit, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ProjectCard({ project, onViewProject }) {
  return (
      <Card className="hover:shadow-lg transition-shadow duration-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-750 p-4">
        <CardHeader className="p-2">
          <CardTitle className="flex justify-between items-center text-lg">
            <span className="dark:text-white">{project.name}</span>
            <div>
              <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-gray-200 dark:hover:bg-gray-700 p-1">
                <Edit className="h-4 w-4 dark:text-gray-400" />
              </Button>
              <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-gray-200 dark:hover:bg-gray-700 p-1">
                <Trash2 className="h-4 w-4 dark:text-gray-400" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{project.description}</p>
          <div className="flex justify-between items-center text-xs">
            <span className="dark:text-gray-300">{project.collections} collections</span>
            <span className="dark:text-gray-300">Last updated: {project.lastUpdated}</span>
          </div>
          <Button className="w-full mt-2 text-sm" onClick={() => onViewProject(project._id)}>
            View Project
          </Button>
        </CardContent>
      </Card>
  )
}