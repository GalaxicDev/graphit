import axios from 'axios';
import { cookies } from "next/headers";
import { ChartCreator } from "@/components/chartCreator";
import { fetchProject } from "@/lib/api";

export default async function SettingsPage({ params, searchParams }) {
    const { project } = params;
    const { chartId } = searchParams;
    const token = cookies().get("token")?.value;
    const projectData = await fetchProject(token, project);
    let chartData = null;

    if (chartId) {
        try {
            const res = await axios.get(`${process.env.API_URL}/graphs/${chartId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            chartData = res.data;
        } catch (error) {
            console.error('Failed to fetch chart data:', error);
        }
    }

    return (
        <div>
            <ChartCreator token={token} projectData={projectData} chartData={chartData} />
        </div>
    );
}