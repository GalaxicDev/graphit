'use client'

import { Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import axios from 'axios'

export function ProjectCard({ project, onViewProject, setProjects }) {
    const handleDeleteProject = async (projectId) => {
        try {
            const res = await axios.delete(`${process.env.API_URL}/projects/${projectId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (res.status === 200) {
                setProjects(prevProjects => prevProjects.filter(p => p._id !== projectId));
            } else {
                console.error('Failed to delete project:', res.data);
            }
        } catch (error) {
            console.error('Failed to delete project:', error);
        }
    }

    return (
        <Card className="hover:shadow-lg transition-shadow duration-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-750 p-4">
            <CardHeader className="p-2">
                <CardTitle className="flex justify-between items-center text-lg">
                    <span className="dark:text-white">{project.name}</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-gray-200 dark:hover:bg-gray-700 p-1"
                        onClick={() => handleDeleteProject(project._id)}>
                        <Trash2 className="h-4 w-4 dark:text-gray-400" />
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{project.description}</p>
                <Button className="w-full mt-2 text-sm" onClick={() => onViewProject(project._id)}>
                    View Project
                </Button>
            </CardContent>
        </Card>
    )
}