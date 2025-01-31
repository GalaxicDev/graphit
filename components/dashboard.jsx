import { cookies } from 'next/headers';
import { fetchAllProjects } from '@/lib/api';
import { ProjectSelection } from '@/components/projectSelection';

export default async function DashboardComponent() {
    const token = (await cookies()).get('token')?.value;
    console.log('Token:', token);
    const initialProjects = await fetchAllProjects(token);

    return (
        <ProjectSelection projects={initialProjects} />
    );
}