"use client";

import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Plus, Settings, Lock} from 'lucide-react'
import { Button } from "@/components/ui/button"
import ChartCardComponent from '@/components/ChartCardComponent'
import { useRouter } from "next/navigation"
import nextConfig from '@/next.config.mjs';
import { useUser } from '@/lib/UserContext';


export function ProjectView({ project, token, userRole, hasAccess, }) {
    const [projectName, setProjectName] = useState(project.name)
    const [projectDescription, setProjectDescription] = useState(project.description)
    const [graphs, setGraphs] = useState([])
    const [role, setRole] = useState(userRole.role);

    const router = useRouter()
    
    const { user } = useUser();

    if (user.role === "admin") {
        hasAccess = true;
    }


    return (
        <>
            {!hasAccess ? (
                <>
                <div className="flex flex-col items-center justify-center h-screen">
                    <div className="flex items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                            {projectName}
                        </h1>
                        <Lock className="h-12 w-12 ml-4 text-red-500" />
                    </div>
                    <p className="text-2xl text-gray-500 dark:text-gray-400 mb-4">
                        You do not have access to view this project.
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/')}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition duration-300">
                        Back to projects
                    </Button>
                </div>
                </>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-6 overflow-auto w-full">
                        <div className="flex-1 mr-4">
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{projectName}</h1>
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
            )}

        </>
    )
}