import DashboardComponent from "@/components/dashboard";
import { cookies } from 'next/headers';
import nextConfig from '@/next.config.mjs';

export default async function Home() {
    const token = (await cookies()).get('token')?.value;
    let projects = [];
    const setProjects = (newProjects) => {
        projects = newProjects;
    };

    try {
        const res = await fetch(nextConfig.env.API_URL + '/projects', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        projects = await res.json();
    } catch (error) {
        console.error('Failed to fetch projects:', error);
    }

    console.log('Projects:', projects);

    return (
        <DashboardComponent initialProjects={projects}/>
    );
}