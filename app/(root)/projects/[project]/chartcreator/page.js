import axios from 'axios';
import { cookies } from "next/headers";
import { ChartCreator } from "@/components/chartCreator";
import { fetchProject } from "@/lib/api";
import nextConfig from '@/next.config.mjs';

export default async function SettingsPage(props) {
    const searchParams = await props.searchParams;
    const params = await props.params;
    const { project } = params;
    const { chartId } = searchParams;
    const token = (await cookies()).get("token")?.value;
    const projectData = await fetchProject(token, project);
    let chartData = null;

    if (chartId) {
        try {
            const res = await axios.get(`${nextConfig.env.API_URL}/graphs/${chartId}`, {
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