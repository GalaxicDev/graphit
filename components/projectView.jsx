"use client";


import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { ChartArea } from 'lucide-react'
import { Button } from "@/components/ui/button"
import ChartCardComponent from './chartCardComponent'
import { useRouter } from "next/navigation"

export function ProjectView({ project }) {
    const [projectName, setProjectName] = useState(project.name)
    const [projectDescription, setProjectDescription] = useState(project.description)
    const [graphs, setGraphs] = useState([])
    const fetchRef = useRef(false)

    const router = useRouter()

    useEffect(() => {
        if (fetchRef.current) return;
        fetchRef.current = true;

        const fetchGraphs = async () => {
            try {
                const res = axios.get(process.env.API_URL + `/graphs/project/${project._id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                })
                setGraphs(res.data)
            } catch (error) {
                console.error('Failed to fetch graphs:', error)
            }
        }

        fetchGraphs()
    }, [project._id])



    return (
        <>
            <div className="flex justify-between items-center mb-6 overflow-auto w-full">
                <div className="flex-1 mr-4">
                    <h1 className="text-3xl font-semibold text-gray-800 dark:text-white">{projectName}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{projectDescription}</p>
                </div>
                <div className="flex items-center">
                    <Button className="mr-2" onClick={() => router.push(`/projects/${project._id}/chartcreator`)}> 
                        <ChartArea className="h-4 w-4 mr-2" /> Add Graph
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/')}
                        className="dark:border-gray-600 dark:text-gray-300">
                        Back to projects
                    </Button>
                </div>
            </div>

            <ChartCardComponent projectId={project._id}/>
        </>
    )
}