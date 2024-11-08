'use client'

import { useState, useEffect } from 'react'
import { ProjectSelection } from './projectSelection'

export function DashboardComponent() {
  const [projects, setProjects] = useState([])

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch(process.env.API_URL + '/projects', {
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

  return (
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900">
        <ProjectSelection projects={projects} setProjects={setProjects} />
      </main>
  )
}