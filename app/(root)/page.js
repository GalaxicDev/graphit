import DashboardComponent from "@/components/dashboard";
import { cookies } from 'next/headers';

export default async function Home() {
    const token = cookies().get('token')?.value;
    let projects = [];
    const setProjects = (newProjects) => {
        projects = newProjects;
    };

    try {
        const res = await fetch(process.env.API_URL + '/projects', {
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