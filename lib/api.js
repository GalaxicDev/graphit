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

// used to fetch the data of a single collection (used in chartcreator)
export const fetchGraphData = async (token, collection, fields, timeframe = "1D") => {
    try {
        const res = await axios.get(`http://localhost:5000/api/mqtt/data`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            params: {
                collection: collection,
                fields: fields,
                timeframe: timeframe
            }
        })
    } catch (error) {
        console.error('Failed to fetch data:', error)
    }
}

// fetch project details
export const fetchProject = async (token, projectId) => {
    try {
        const res = await axios.get(`http://localhost:5000/api/projects/${projectId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        return res.data
    } catch (error) {
        console.error('Failed to fetch project:', error)
    }
}


