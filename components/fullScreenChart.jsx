'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChartCard from './chartCard';
import axios from 'axios';
import { PacmanLoader } from 'react-spinners';
import nextConfig from '@/next.config.mjs';
import { useUser } from '@/lib/UserContext';

const FullScreenChart = ({ graphId }) => {
    const router = useRouter();
    const [graph, setGraph] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const { token } = useUser();

    useEffect(() => {
        const fetchGraph = async () => {
            if (!graphId) return;

            try {
                const res = await axios.get(`${nextConfig.env.API_URL}/graphs/${graphId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setGraph(res.data);
            } catch (error) {
                console.error('Failed to fetch graph:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGraph();
    }, [graphId, token]);

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
                            token={token}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default FullScreenChart;