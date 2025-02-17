import { cookies } from 'next/headers';
import { ProjectView } from '@/components/projectView';
import { fetchProject } from '@/lib/api';

export default async function ProjectPage(props) {
    const params = await props.params;
    const { project } = params;
    const token = (await cookies()).get('token')?.value;
    const projectData = await fetchProject(token, project);

    if (!projectData) {
        return <div>Loading...</div>;
    }

    return <ProjectView project={projectData} token={token} />;
}