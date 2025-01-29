"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProjectCard } from './projectCard';
import { Plus } from 'lucide-react';
import { Search } from 'lucide-react';

export function ProjectSelection({ projects }) {
  const [projectList, setProjectList] = useState(projects);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

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
      if (result._id) {
        // Add the new project to the list of projects
        setProjectList(prevProjects => [...prevProjects, result]);
        setName('');
        setDescription('');
      } else {
        console.error('Failed to create project:', result);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  // Function to handle viewing a project
  const handleViewProject = (projectId) => {
    router.push(`/projects/${projectId}`);
  };

  // Filter projects based on search term
  const filteredProjects = projectList.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
      <div className="p-4">
        {/* Header section with title and create project button */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold mb-4 dark:text-white">Projects</h1>
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
              <DialogFooter>
                <Button onClick={handleCreateProject}>Create Project</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search bar */}
          <div className="mb-4" >
            <div className="relative">
              <Input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 dark:bg-gray-700 dark:text-white focus:outline-none focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:bg-gray-700" />
            </div>
          </div>

          {/* Project cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
              <ProjectCard
                  key={project._id}
                  project={project}
                  onViewProject={handleViewProject}
              />
          ))}
        </div>
      </div>
  );
}