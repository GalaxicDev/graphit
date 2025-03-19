import { BarChart, Users, Database, Settings, HelpCircle, FileText, Activity, User } from 'lucide-react';

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
        name: 'Account',
        icon: User,
        href: '/account',
    },
    {
        name: 'Help',
        icon: HelpCircle,
        href: 'https://google.com',
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

export const adminSidebarUtils = [
    {
        name: 'Users',
        icon: Users,
        href: '/admin/',
    },
]
