import { cookies } from 'next/headers';
import { ProjectView } from '@/components/projectView';
import { fetchProject } from '@/lib/api';

export default async function ProjectPage({ params }) {
    const { project } = params;
    const token = cookies().get('token')?.value;
    const projectData = await fetchProject(token, project);

    if (!projectData) {
        return <div>Loading...</div>;
    }

    return <ProjectView project={projectData} />;
}