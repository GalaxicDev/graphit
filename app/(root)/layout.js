"use client";

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Navbar } from '@/components/navbar';
import { verifyToken } from '@/lib/api';
import { UserProvider, useUser } from '@/lib/UserContext';
import Cookies from 'js-cookie';
import { PacmanLoader } from 'react-spinners';

function RootLayoutContent({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const { setUser, setToken, user, token } = useUser();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const themePreference = Cookies.get('theme');
            if (themePreference) {
                setDarkMode(themePreference === 'dark');
            } else {
                const darkModePreference = window.matchMedia('(prefers-color-scheme: dark)').matches;
                setDarkMode(darkModePreference);
            }
        }
    }, []);

    useEffect(() => {
        const checkAuth = async () => {
            if (typeof window === 'undefined') return; // Ensure this runs only on the client

            const userToken = Cookies.get('token');
            console.log("layout token:", userToken)
            if (!userToken) {
                console.log("no token")
                setIsAuthenticated(false);
                return;
            }

            try {
                const verifiedToken = await verifyToken(userToken);
                if (verifiedToken.success) {
                    console.log("verifying token success")
                    setUser(verifiedToken.user);
                    setToken(userToken);
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error("Authentication Error: ", error);
                setIsAuthenticated(false);
            }
        };
        checkAuth();
    }, [setToken, setUser]);

    const toggleSidebar = () => setSidebarOpen((prev) => !prev);
    const toggleDarkMode = () => {
        setDarkMode((prev) => {
            const newDarkMode = !prev;
            Cookies.set('theme', newDarkMode ? 'dark' : 'light', { expires: 365 });
            return newDarkMode;
        });
    };

    if (isAuthenticated === null) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
                <PacmanLoader color="#8884d8" />
            </div>
        );
    }

    if (!isAuthenticated) {
        if (typeof window !== 'undefined') window.location.href = '/login';
        return null;
    }

    console.log("user:", user.role)

    return (
        <div className={`flex h-screen overflow-hidden ${darkMode ? 'dark' : ''}`}>
            <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} token={token} />
            <div className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-64' : ''} h-screen`}>
                <Navbar 
                    sidebarOpen={sidebarOpen}
                    toggleSidebar={toggleSidebar}
                    darkMode={darkMode}
                    toggleDarkMode={toggleDarkMode} 
                />
                <main className="flex-1 overflow-y-auto p-6 bg-gray-100 dark:bg-gray-900">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function RootLayout({ children }) {
    return (
        <UserProvider>
            <RootLayoutContent>{children}</RootLayoutContent>
        </UserProvider>
    );
}