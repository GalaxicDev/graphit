"use client";

import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { sidebarUtils } from "@/lib/sidebarUtils";

export function Sidebar({ sidebarOpen, toggleSidebar }) {
    return (
        <aside
            className={`${sidebarOpen ? 'translate-x-0' : 'transition-transform duration-500 ease-in-out -translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg`}>
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
                <span className="text-2xl font-semibold text-gray-800 dark:text-white">GraphIt</span>
                <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-gray-800 dark:text-white">
                    <X className="h-6 w-6" />
                </Button>
            </div>
            <nav className="mt-6">
                {sidebarUtils.map((item) => {
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