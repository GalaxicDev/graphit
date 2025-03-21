import axios from 'axios';
import { ProjectSettings } from "@/components/projectSettings";
import { cookies } from "next/headers";
import nextConfig from '@/next.config.mjs';
import { Suspense } from 'react';
import { PacmanLoader } from 'react-spinners';

async function fetchProjectData(project, token) {
    try {
        const response = await axios.get(nextConfig.env.API_URL + `/projects/${project}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 403) {
            throw new Error('403 | Access Denied');
        }
        throw new Error('Failed to fetch project data');
    }
}

export default function SettingsPage(props) {
    const params = props.params;
    const { project } = params;
    const token = cookies().get("token")?.value;

    const projectDataPromise = fetchProjectData(project, token);

    return (
        <Suspense fallback={<div className="flex items-center justify-center h-full"><PacmanLoader color="#8884d8" /></div>}>
            <ProjectSettingsWrapper projectDataPromise={projectDataPromise} />
        </Suspense>
    );
}

function ProjectSettingsWrapper({ projectDataPromise }) {
    const projectData = use(projectDataPromise);

    if (!projectData) {
        return <div>Loading...</div>;
    }

    return <ProjectSettings initialProjectData={projectData} />;
}