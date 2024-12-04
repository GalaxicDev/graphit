import axios from 'axios';
import { cookies } from "next/headers";
import {ChartCreator} from "@/components/chartCreator";
import {fetchProject} from "@/lib/api";

export default async function SettingsPage({ params }) {
    const { project } = params;
    const token = cookies().get("token")?.value;
    const projectData = await fetchProject(token, project);


    return (
        <div>
            <ChartCreator token={token} projectData={projectData} />
        </div>
    );
}