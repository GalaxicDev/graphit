import React from 'react';
import { AccountView } from "@/components/AccountView";
import axios from "axios";
import nextConfig from '@/next.config.mjs';
import { cookies } from "next/headers";

export default async function AccountPage() {
    const cookiesStore = await cookies(); 
    const token = cookiesStore.get('token')?.value;

    const user = "679389f3998912facf6c9824";
    let userData;
    try {
        const response = await axios.get(nextConfig.env.API_URL + `/users/${user}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        userData = response.data;

    } catch (error) {
        console.error("Failed to fetch user data:", error);
        return <div>Loading...</div>;
    }

    if (!userData) {
        console.error("Failed to fetch user data:", error);
        return <div>Loading...</div>;   
    }
    return (
        <div className="container mx-auto p-4">
            <AccountView initialUserData={userData}/>
        </div>
    )
}