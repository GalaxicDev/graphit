import { cookies } from 'next/headers';
import { fetchAllProjects } from '@/lib/api';
import { ProjectSelection } from '@/components/projectSelection';

export default async function DashboardComponent() {
    const token = cookies().get('token')?.value;
    console.log('Token:', token);
    const initialProjects = await fetchAllProjects(token);

    return (
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900">
            <ProjectSelection projects={initialProjects} />
        </main>
    );
}