"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ProjectCard } from './projectCard'
import { Plus } from 'lucide-react'

export function ProjectSelection({ projects, setProjects }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const router = useRouter()

  // Function to handle creating a new project
  const handleCreateProject = async () => {
    try {
      const res = await fetch(process.env.API_URL + '/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name, description })
      });
      const result = await res.json();
      console.log('API response:', result);
      if (result._id) {
        // Add the new project to the list of projects
        setProjects(prevProjects => [...prevProjects, result]);
        setName('');
        setDescription('');
      } else {
        console.error('Failed to create project:', result);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  }

  // Function to handle viewing a project
  const handleViewProject = (projectId) => {
    router.push(`/projects/${projectId}`)
  }

  return (
      <>
        {/* Header section with title and create project button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold text-gray-800 dark:text-white">Projects</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="dark:bg-gray-800">
              <DialogHeader>
                <DialogTitle className="dark:text-white">Create New Project</DialogTitle>
                <DialogDescription className="dark:text-gray-400">
                  Enter the details for your new project.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right dark:text-white">
                    Name
                  </Label>
                  <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="col-span-3 dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right dark:text-white">
                    Description
                  </Label>
                  <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="col-span-3 dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateProject}>Create Project</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Project cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
              <ProjectCard
                  key={project._id}
                  project={project}
                  onViewProject={handleViewProject}
              />
          ))}
        </div>
      </>
  )
}