'use client'

import { X, BarChart, Users, Database, Settings, HelpCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"

export function Sidebar({ sidebarOpen, toggleSidebar }) {
  return (
    (<aside
      className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
      <div
        className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
        <span className="text-2xl font-semibold text-gray-800 dark:text-white">Project Dashboard</span>
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden">
          <X className="h-6 w-6" />
        </Button>
      </div>
      <nav className="mt-6">
        <a
          className="flex items-center px-6 py-3 text-gray-700 bg-gray-100 dark:text-white dark:bg-gray-700"
          href="#">
          <BarChart className="h-5 w-5 mr-3" />
          Projects
        </a>
        <a
          className="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          href="#">
          <Users className="h-5 w-5 mr-3" />
          Team
        </a>
        <a
          className="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          href="#">
          <Database className="h-5 w-5 mr-3" />
          Collections
        </a>
        <a
          className="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          href="#">
          <Settings className="h-5 w-5 mr-3" />
          Settings
        </a>
        <a
          className="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          href="#">
          <HelpCircle className="h-5 w-5 mr-3" />
          Help
        </a>
      </nav>
    </aside>)
  );
}