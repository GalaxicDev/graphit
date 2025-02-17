import axios from 'axios';
import { ProjectSettings } from "@/components/projectSettings";
import { cookies } from "next/headers";
import nextConfig from '@/next.config.mjs';

export default async function SettingsPage(props) {
    const params = await props.params;
    const { project } = params;
    let projectData = null;
    const token = (await cookies()).get("token")?.value;
    console.log("token:", token);

    try {
        const response = await axios.get(nextConfig.env.API_URL + `/projects/${project}`, {
            headers: {
            "Authorization": `Bearer ${token}`
            }
        });

        projectData = response.data;

    } catch (error) {
        if (error.status === 403) {
            return (
                <div className="flex items-center justify-center h-full">
                    <h1 className="text-2xl font-bold mb-4 dark:text-white">403 | Access Denied</h1>
                </div>
            );
        }
        console.error("Failed to fetch project data:", error);
    }

    if (!projectData) {
        return <div>Loading...</div>;
    }


    return (
        <div>
            <ProjectSettings initialProjectData={projectData} />
        </div>
    );
}