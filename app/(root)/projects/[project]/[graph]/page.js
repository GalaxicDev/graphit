'use client';

import React, { useEffect } from 'react';
import FullScreenChart from '@/components/fullScreenChart';
import { useRouter, useParams } from 'next/navigation';


const GraphPage = () => {
    const { graph } = useParams(); // Ensure this matches the dynamic segment name
    const router = useRouter();

    useEffect(() => {
        // Hide the sidebar when on this page
        document.getElementById('sidebar')?.classList.add('hidden');
        return () => {
            // Show the sidebar when leaving this page
            document.getElementById('sidebar')?.classList.remove('hidden');
        };
    }, [router]);


    return (
        <FullScreenChart graphId={graph} />
    );
};

export default GraphPage;