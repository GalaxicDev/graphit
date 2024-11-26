import { BarChart, Users, Database, Settings, HelpCircle, FileText, Activity } from 'lucide-react';

export const sidebarUtils = [
    {
        name: 'Projects',
        icon: BarChart,
        href: '/',
    },
    {
        name: 'Collections',
        icon: Database,
        href: '/collection-viewer',
    },
    {
        name: 'Settings',
        icon: Settings,
        href: '/settings',
    },
    {
        name: 'Help',
        icon: HelpCircle,
        href: '/help',
    },
];

export const projectSidebarUtils = (projectId) => [
    {
        name: 'Overview',
        icon: FileText,
        href: `/projects/${projectId}`,
    },
    {
        name: 'Collections',
        icon: Database,
        href: `/projects/${projectId}/collection-viewer`,
    },
    {
        name: 'Settings',
        icon: Settings,
        href: `/projects/${projectId}/settings`,
    },
];
