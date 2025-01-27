'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChartCard from './chartCard';
import axios from 'axios';
import { PacmanLoader } from 'react-spinners';

const FullScreenChart = ({ graphId }) => {
    const router = useRouter();
    const [graph, setGraph] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchGraph = async () => {
            console.log('Fetching graph with ID:', graphId);
            if (!graphId) return;

            try {
                console.log('API URL:', process.env.API_URL);
                const res = await axios.get(`${process.env.API_URL}/graphs/${graphId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setGraph(res.data);
                console.log('Graph:', res.data);
            } catch (error) {
                console.error('Failed to fetch graph:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGraph();
    }, [graphId]);

    const handleDelete = (id) => {
        console.log(`Delete item ${id}`);
    };

    const handleEdit = (id) => {
        console.log(`Edit item ${id}`);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-white dark:bg-gray-800">
            <button
                onClick={() => router.back()}
                className="absolute top-4 right-4 bg-gray-800 text-white p-2 rounded"
            >
                Close
            </button>
            {isLoading ? (
                <div className="flex items-center justify-center h-full">
                    <PacmanLoader color="#8884d8" />
                </div>
            ) : (
                <div className="w-full h-full">
                    {graph && (
                        <ChartCard
                            graph={graph}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default FullScreenChart;