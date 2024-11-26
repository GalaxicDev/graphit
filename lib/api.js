import axios from 'axios'

export const fetchProjectData = async (projectId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
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