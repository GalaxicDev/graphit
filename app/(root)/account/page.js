import React from 'react';
import { AccountView } from "@/components/AccountView";
import axios from "axios";
import nextConfig from '@/next.config.mjs';
import { cookies } from "next/headers";

export default async function AccountPage() {
    const cookiesStore = await cookies(); 
    const token = cookiesStore.get('token')?.value;
    const user = JSON.parse(cookiesStore.get('user')?.value);

    let userData;
    try {
        const response = await axios.get(nextConfig.env.API_URL + `/users/${user._id}`, {
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
        <AccountView initialUserData={userData}/>
    )
}