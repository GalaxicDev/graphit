// components/dashboard.jsx
'use client'

import { useState } from 'react';
import { ProjectSelection } from './projectSelection';

export function DashboardComponent({ initialProjects }) {
    const [projects, setProjects] = useState(initialProjects);

    return (
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900">
            <ProjectSelection projects={projects} setProjects={setProjects} />
        </main>
    );
}