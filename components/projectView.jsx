'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { ChartArea } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import ChartCardComponent from './chartCardComponent'
import { CreateGraphForm } from "@/components/createGraphForm"

export function ProjectView({ project }) {
    const [projectName, setProjectName] = useState(project.name)
    const [projectDescription, setProjectDescription] = useState(project.description)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        projectId: project._id,
        name: "",
        type: "",
        collection: "",
        xField: "",
        yField: "",
    })
    const [graphs, setGraphs] = useState([])

    const router = useRouter()

    useEffect(() => {
        const fetchGraphs = async () => {
            try {
                const res = await axios.get(process.env.API_URL + `/graphs/project/${project._id}`, {
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

    const handleClose = () => {
        setIsModalOpen(false)
        setFormData({
            projectId: project._id,
            name: "",
            type: "",
            collection: "",
            xField: "",
            yField: "",
        })
        console.log("Form closed")
    }

    return (
        <>
            <div className="flex justify-between items-center mb-6 overflow-auto w-full">
                <div className="flex-1 mr-4">
                    <h1 className="text-3xl font-semibold text-gray-800 dark:text-white">{projectName}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{projectDescription}</p>
                </div>
                <div className="flex items-center">
                    <Button className="mr-2" onClick={() => setIsModalOpen(true)}>
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

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <CreateGraphForm
                        onClose={handleClose}
                        formData={formData}
                        setFormData={setFormData}
                    />
                </div>
            )}
        </>
    )
}