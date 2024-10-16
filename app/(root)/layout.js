"use client";

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Navbar } from '@/components/navbar';

export default function RootLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        const darkModePreference = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(darkModePreference);
        setIsClient(true);
    }, []);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const toggleDarkMode = () => setDarkMode(!darkMode);

    if (!isClient) {
        return null;
    }

    return (
        <div className={`flex h-screen max-h-screen overflow-hidden ${darkMode ? 'dark' : ''}`}>
            {/* Sidebar with fixed height to screen and overflow auto */}
            <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Main content area */}
            <div className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-64' : ''} h-screen max-h-screen`}>
                <Navbar
                    sidebarOpen={sidebarOpen}
                    toggleSidebar={toggleSidebar}
                    darkMode={darkMode}
                    toggleDarkMode={toggleDarkMode}
                />

                {/* Main section with scrollable content */}
                <main className="flex-1 overflow-y-auto p-6 bg-gray-100 dark:bg-gray-900 mr-2">
                    {children}
                </main>
            </div>
        </div>
    );
}
