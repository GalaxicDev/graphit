"use client";

import { useState, useEffect, useRef } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Navbar } from '@/components/navbar';
import axios from "axios";
import Cookies from 'js-cookie';
import nextConfig from '@/next.config.mjs';

export default function RootLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const userRef = useRef(null);

    useEffect(() => {
        const darkModePreference = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(darkModePreference);
        setIsClient(true);
    }, []);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const toggleDarkMode = () => setDarkMode(!darkMode);

    let userToken = null;
    if(typeof window !== 'undefined'){
        userToken = localStorage.getItem('token').valueOf();
        if (!userToken) {
            window.location.href = '/login';
        }
    }   

    { /* // fetch user data
    useEffect(() => {
        axios.get(`${nextConfig.env.API_URL}/auth/verify`, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        }).then(response => {
            userRef.current = response.data.user;
            console.log("set useRef:", userRef.current);
        }
        ).catch(error => {
            console.log(error);
        })
    }, [userToken]); */} 

    if (!isClient) {
        return null;
    }

    return (
            <div className={`flex h-screen max-h-screen overflow-hidden ${darkMode ? 'dark' : ''}`}>
                {/* Sidebar with fixed height to screen and overflow auto */}
                <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}/>

                {/* Main content area */}
                <div className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-64' : ''} h-screen max-h-screen`}>
                    <Navbar
                        sidebarOpen={sidebarOpen}
                        toggleSidebar={toggleSidebar}
                        darkMode={darkMode}
                        toggleDarkMode={toggleDarkMode}
                    />

                    {/* Main section with scrollable content */}
                    <main className="flex-1 overflow-y-auto p-6 bg-gray-100 dark:bg-gray-900">
                        {children}
                    </main>
                </div>
            </div>
    );
}
