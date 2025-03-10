import { cookies } from 'next/headers';
import { ProjectView } from '@/components/projectView';
import { fetchProject, fetchUserRole } from '@/lib/api';

export default async function ProjectPage(props) {
    const params = await props.params;
    const { project } = params;

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const userCookie = cookieStore.get('user')?.value;
    const user = userCookie ? JSON.parse(userCookie) : null;

    const projectData = await fetchProject(token, project);
    const userRole = await fetchUserRole(project, token);
    
    let hasAccess = false;

    if (projectData) {
        const isOwner = projectData.userId === user?._id;
        const isAuthorizedRole = ['viewer', 'editor', 'admin'].includes(userRole.role);
        const isPublicProject = projectData.isPublic;
        hasAccess = isOwner || isAuthorizedRole || isPublicProject;
    }

    if (!projectData) {
        return <div>Loading...</div>;
    }

    console.log("rendering projectview with ", hasAccess);

    return <ProjectView project={projectData} token={token} userRole={userRole} hasAccess={hasAccess} />;
}