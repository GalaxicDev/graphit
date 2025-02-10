
import { cookies } from 'next/headers';
import { fetchAllProjects } from '@/lib/api';
import { ProjectSelection } from '@/components/projectSelection';

export default async function Home() {
    const token = (await cookies()).get('token')?.value;
    let initialProjects = await fetchAllProjects(token);

    return (
        <ProjectSelection initialProjects={initialProjects}/>
    );
}