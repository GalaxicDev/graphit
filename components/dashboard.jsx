"use client"

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Navbar } from '@/components/navbar'
import { ProjectSelection } from './projectSelection'
import { ProjectView } from './project-view'
import ChartCardComponent from './chartCardComponent'

export function DashboardComponent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [isClient, setIsClient] = useState(false)
  const [projects, setProjects] = useState([])

  useEffect(() => {
    const darkModePreference = window.matchMedia('(prefers-color-scheme: dark)').matches
    setDarkMode(darkModePreference)
    setIsClient(true)
  }, [])

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch('http://localhost:5000/api/projects', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        const data = await res.json()
        setProjects(data)
      } catch (error) {
        console.error('Failed to fetch projects:', error)
      }
    }

    fetchProjects()
  }, [])

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const toggleDarkMode = () => setDarkMode(!darkMode)

  if (!isClient) {
    return null
  }

  return (
      <div className={`flex h-screen ${darkMode ? 'dark' : ''}`}>
        <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-64' : ''}`}>
          <Navbar
              sidebarOpen={sidebarOpen}
              toggleSidebar={toggleSidebar}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 bg-gray-100 dark:bg-gray-900">
            {selectedProject ? (
                <ProjectView project={selectedProject} setSelectedProject={setSelectedProject} />
            ) : (
                <>
                  <ProjectSelection projects={projects} setSelectedProject={setSelectedProject} />
                  <ChartCardComponent />
                </>
            )}
          </main>
        </div>
      </div>
  )
}