import Image from "next/image";
import { DashboardComponent } from "@/components/dashboard";

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen w-screen">
            <DashboardComponent />
        </div>
    );
}