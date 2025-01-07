'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ProjectView } from '@/components/projectView'

export default   function ProjectPage() {
    const { project } = useParams()
    const [projectData, setProjectData] = useState(null)

    useEffect(() => {
        if (project) {
            const fetchProject = async () => {
                try {
                    const res = await fetch(process.env.API_URL + `/projects/${project}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    })
                    const data = await res.json()
                    setProjectData(data)
                } catch (error) {
                    console.error('Failed to fetch project:', error)
                }
            }

            fetchProject()
        }
    }, [project])

    if (!projectData) {
        return <div>Loading...</div>
    }

    return <ProjectView project={projectData} />
}
