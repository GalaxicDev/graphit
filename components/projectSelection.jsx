'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
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
import { ProjectCard } from './project-card'

export function ProjectSelection({ setSelectedProject }) {
  const [projects, setProjects] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch('http://localhost:5000/api/projects', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        const data = await res.json()
        if (Array.isArray(data)) {
          setProjects(data)
        } else {
          console.error('Fetched data is not an array:', data)
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error)
      }
    }

    fetchProjects()
  }, [])

  const handleCreateProject = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/projects', {
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
        const newProject = result;
        setProjects(prevProjects => [...prevProjects, newProject]);
        setName('');
        setDescription('');
      } else {
        console.error('Failed to create project:', result);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  return (
      <>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold text-gray-800 dark:text-white">Projects</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Create New Project
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
              <ProjectCard
                  key={project._id}
                  project={project}
                  setSelectedProject={setSelectedProject}
              />
          ))}
        </div>
      </>
  );
}