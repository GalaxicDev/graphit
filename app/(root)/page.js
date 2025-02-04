import DashboardComponent from "@/components/dashboard";
import { cookies } from 'next/headers';
import nextConfig from '@/next.config.mjs';
import { fetchAllProjects } from '@/lib/api';
import { ProjectSelection } from '@/components/projectSelection';

export default async function Home() {
    const token = (await cookies()).get('token')?.value;
    let initialProjects = await fetchAllProjects(token);

    console.log(initialProjects);

    return (
        <ProjectSelection initialProjects={initialProjects}/>
    );
}