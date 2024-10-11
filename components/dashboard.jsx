"use client"

import { useState, useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { ProjectSelection } from './project-selection'
import { ProjectView } from './project-view'

export function DashboardComponent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [isClient, setIsClient] = useState(false)

  // Ensure dark mode is set correctly on the client side
  useEffect(() => {
    const darkModePreference = window.matchMedia('(prefers-color-scheme: dark)').matches
    setDarkMode(darkModePreference)
    setIsClient(true)
  }, [])

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const toggleDarkMode = () => setDarkMode(!darkMode)

  const projects = [
    { id: 1, name: "E-commerce Platform", description: "Online shopping system", collections: 5, lastUpdated: "2023-04-15" },
    { id: 2, name: "Blog CMS", description: "Content management for blogs", collections: 3, lastUpdated: "2023-04-10" },
    { id: 3, name: "Task Manager", description: "Project and task tracking app", collections: 4, lastUpdated: "2023-04-05" },
  ]

  if (!isClient) {
    return null
  }

  return (
      <div className={`flex h-screen ${darkMode ? 'dark' : ''}`}>
        <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex-1 flex flex-col">
          <Navbar
              sidebarOpen={sidebarOpen}
              toggleSidebar={toggleSidebar}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 bg-gray-100 dark:bg-gray-900">
            {selectedProject ? (
                <ProjectView project={selectedProject} setSelectedProject={setSelectedProject} />
            ) : (
                <ProjectSelection projects={projects} setSelectedProject={setSelectedProject} />
            )}
          </main>
        </div>
      </div>
  );
}