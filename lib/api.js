import nextConfig from '@/next.config.mjs';
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
        const res = await axios.get(`${nextConfig.env.API_URL}/mqtt/data`, {
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
        const res = await axios.get(`${nextConfig.env.API_URL}/projects/${projectId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        })
        return res.data
    } catch (error) {
        console.error('Failed to fetch project:', error)
    }
}


export const fetchAllProjects = async (token) => {
    try {
        
        const res = await axios.get(`${nextConfig.env.API_URL}/projects`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return res.data;
    } catch (error) {
        console.error('Failed to fetch projects:', error);
        throw error;
    }
};

