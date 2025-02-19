import nextConfig from '@/next.config.mjs';
import axios from 'axios'

// used to fetch the data of a single collection (used in chartcreator)
export const fetchGraphData = async (chartType, elements, options, selectedTimeframe, token) => {
    if (!elements || elements.length === 0) {
        return;
    }
    try {
        
        const params = {
            collections: elements.map(el => el.collection).join(','),
            ...(chartType === "Info"
                ? { fields: elements.map(el => el.dataKey).join(','), fetchMethods: elements.map(el => el.fetchMethod).join(',') }
                : { fields: elements.map(el => `${el.xAxisKey},${el.yAxisKey}`).join(',') }),
            ...(chartType === "Map" || chartType === "Map Trajectory" && {
            fields: elements.map(el => `${el.longitudeKey},${el.latitudeKey},${el.timestampKey}`).join(','),
            })
        };
  
        if (options.dynamicTime) {
            params.timeframe = selectedTimeframe;
        } else {
            params.from = new Date(options.xRange.from).toISOString();
            params.to = new Date(options.xRange.to).toISOString();
        }
  
        elements.forEach((el, index) => {
            el.conditionalParams.forEach((param) => {
                params[`conditionalParams[${index}][field]`] = param.field;
                params[`conditionalParams[${index}][operator]`] = param.operator;
                params[`conditionalParams[${index}][value]`] = param.value;
            });
        });
  
        const dataResponse = await axios.get(`${nextConfig.env.API_URL}/mqtt/data`, {
            params,
            headers: { Authorization: `Bearer ${token}` },
        });
  
        return dataResponse.data.data;
    } catch (error) {
        console.error('Failed to fetch graph data:', error);
    }
};

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

export const fetchAllCollections = async (token) => {
    try {
        const res = await axios.get(`${nextConfig.env.API_URL}/collections`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        });
        return res.data;
    } catch (error) {
        console.error('Failed to fetch collections:', error);
        throw error;
    }
}

export const fetchCollection = async (collection, token) => {
    try {
        const res = await axios.get(`${nextConfig.env.API_URL}/collections/${collection}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch collection: ${collection}`);
        }

        return res.data;
    } catch (error) {
        console.error('Failed to fetch collection:', error);
        throw error;
    }
}

export const verifyToken = async (token) => {
    try {
        const res = await axios.get(`${nextConfig.env.API_URL}/auth/verify`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        });
        return res.data;
    }
    catch (error) {
        console.error('Failed to verify token:', error);
        throw error;
    }
}

export const fetchUserRole = async (projectId, token) => {
    try {
        const res = await axios.get(`${nextConfig.env.API_URL}/projects/${projectId}/role`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        return res.data;
    }
    catch (error) {
        console.error('Failed to fetch role:', error);
        throw error;
    }
}

export const fetchGraphs = async (projectId, token) => {
    try {
        const res = await axios.get(`${nextConfig.env.API_URL}/graphs/project/${projectId}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        return res.data;
    }
    catch (error) {
        console.error('Failed to fetch graphs:', error);
        throw error;
    }
}


