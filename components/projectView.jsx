"use client";


import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Plus, Settings} from 'lucide-react'
import { Button } from "@/components/ui/button"
import ChartCardComponent from '@/components/ChartCardComponent'
import { useRouter } from "next/navigation"
import nextConfig from '@/next.config.mjs';


export async function ProjectView({ project, token, userRole }) {
    const [projectName, setProjectName] = useState(project.name)
    const [projectDescription, setProjectDescription] = useState(project.description)
    const [graphs, setGraphs] = useState([])
    const [role, setRole] = useState(userRole);

    const router = useRouter()


    return (
        <>
            <div className="flex justify-between items-center mb-6 overflow-auto w-full">
                <div className="flex-1 mr-4">
                    <h1 className="text-3xl font-semibold text-gray-800 dark:text-white">{projectName}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{projectDescription}</p>
                </div>
                <div className="flex items-center">
                    {(role === 'admin' || role === 'editor') && (
                        <Button 
                            className="mr-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300" 
                            onClick={() => router.push(`/projects/${project._id}/chartcreator`)}> 
                            <Plus className="h-4 w-4 mr-2" /> Add Graph
                        </Button>
                    )}
                    {role === 'admin' && (
                        <Button 
                            className="mr-2 px-4 py-2 rounded  transition duration-300" 
                            onClick={() => router.push(`/projects/${project._id}/settings`)}>
                            <Settings className="h-4 w-4 mr-2" /> Settings
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        onClick={() => router.push('/')}
                        className="mr-2 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition duration-300">
                        Back to projects
                    </Button>
                </div>
            </div>

            <ChartCardComponent projectId={project._id} token={token} />
        </>
    )
}