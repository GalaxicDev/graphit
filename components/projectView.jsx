'use client'

import { useState } from 'react'
import { Edit } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from 'next/navigation'
import ChartCardComponent from './chartCardComponent'

export function ProjectView({ project }) {
    const [editMode, setEditMode] = useState(false)
    const [projectName, setProjectName] = useState(project.name)
    const [projectDescription, setProjectDescription] = useState(project.description)

    const router = useRouter()

    // Function to handle saving the edited project details
    const handleSave = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/projects/${project._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ name: projectName, description: projectDescription })
            })
            const result = await res.json()
            if (res.ok) {
                setProjectName(result.name)
                setProjectDescription(result.description)
                setEditMode(false)
            } else {
                console.error('Failed to update project:', result.message)
            }
        } catch (error) {
            console.error('Failed to update project:', error)
        }
    }

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                {editMode ? (
                    <div className="flex-1 mr-4">
                        <Input
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className="text-3xl font-semibold mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                        />
                        <Textarea
                            value={projectDescription}
                            onChange={(e) => setProjectDescription(e.target.value)}
                            className="w-full dark:bg-gray-800 dark:text-white dark:border-gray-700"
                        />
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
                                className="dark:border-gray-600 dark:text-gray-300"
                            >
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button onClick={() => setEditMode(true)} className="mr-2">
                                <Edit className="h-4 w-4 mr-2" /> Edit Project
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => router.push('/')}
                                className="dark:border-gray-600 dark:text-gray-300">
                                Back to projects
                            </Button>
                </>
                    )}
                </div>
            </div>

            <ChartCardComponent />
        </>
    )
}