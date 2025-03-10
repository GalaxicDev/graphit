"use client";

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { sidebarUtils, projectSidebarUtils, adminSidebarUtils } from "@/lib/sidebarUtils";
import Image from "next/image";
import logo from "@/images/logo.png";
import Link from 'next/link';
import { useUser } from '@/lib/UserContext';

export function Sidebar({ sidebarOpen, toggleSidebar, token }) {
    const pathname = usePathname();
    const { user } = useUser();

    // Check if in project mode and extract projectId if true
    const projectMode = pathname.startsWith('/projects/') && pathname.split('/').length > 2;
    const projectId = projectMode ? pathname.split('/')[2] : null;

    return (
        <aside
            id="sidebar"
            className={`${sidebarOpen ? 'translate-x-0' : 'transition-transform duration-500 ease-in-out -translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg`}>
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
                <Image
                    src={logo}
                    alt={"Graphity logo"}
                    height={100}
                    width={"100%"}
                    className={"flex justify-center content-center invert dark:invert-0"}
                    onClick={() => window.location.href = '/'}
                />
                <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-gray-800 dark:text-white">
                    <X className="h-6 w-6"/>
                </Button>
            </div>
            <nav className="mt-6">
                {/* Render general navigation items */}
                {sidebarUtils.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            prefetch={true}
                            className="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                            <Icon className="h-5 w-5 mr-3" />
                            {item.name}
                        </Link>
                    );
                })}

                {/* Divider between general and project-specific navigation */}
                {projectMode && <hr className="my-4 border-gray-300 dark:border-gray-700" />}
                {projectMode && <span className="block px-6 text-sm text-gray-500 dark:text-gray-400">Project Navigation</span> }
                {/* Render project-specific navigation items only if in project mode */}
                {projectMode && projectSidebarUtils(projectId).map((item) => {
                    const Icon = item.icon;
                    return (
                        <a
                            key={item.name}
                            href={item.href}
                            className="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                            <Icon className="h-5 w-5 mr-3" />
                            {item.name}
                        </a>
                    );
                })}
                {/* Divider between general and project-specific navigation */}
                {user.role === "admin" && <hr className="my-4 border-gray-300 dark:border-gray-700" />}
                {user.role === "admin" && <span className="block px-6 text-sm text-gray-500 dark:text-gray-400">Admin</span> }
                {user.role === "admin" && adminSidebarUtils.map((item) => {
                    const Icon = item.icon;
                    return (
                        <a
                            key={item.name}
                            href={item.href}
                            className="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                            <Icon className="h-5 w-5 mr-3" />
                            {item.name}
                        </a>
                    );
                })}
            </nav>
        </aside>
    );
}