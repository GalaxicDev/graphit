'use client'

import { Trash2, CircleAlert } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import axios from 'axios'
import { useState, useId } from 'react'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import nextConfig from '@/next.config.mjs';

export function ProjectCard({ project, onViewProject, setProjects }) {
    const [inputValue, setInputValue] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const id = useId();

    const handleDeleteProject = async (projectId) => {
        try {
            const res = await axios.delete(`${nextConfig.env.API_URL}/projects/${projectId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (res.status === 200) {
                setProjects(prevProjects => prevProjects.filter(p => p._id !== projectId));
                setDialogOpen(false);
            } else {
                console.error('Failed to delete project:', res.data);
            }
        } catch (error) {
            console.error('Failed to delete project:', error);
        }
    }

    return (
        <Card className="hover:shadow-lg transition-shadow duration-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-750 p-4">
            <CardHeader className="p-2">
                <CardTitle className="flex justify-between items-center text-lg">
                    <span className="dark:text-white">{project.name}</span>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-gray-200 dark:hover:bg-gray-700 p-1"
                            >
                                <Trash2 className="h-4 w-4 dark:text-gray-400" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <div className="flex flex-col items-center gap-2">
                                <div
                                    className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border"
                                    aria-hidden="true"
                                >
                                    <CircleAlert className="opacity-80" size={16} strokeWidth={2} />
                                </div>
                                <DialogHeader>
                                    <DialogTitle className="sm:text-center">Final confirmation</DialogTitle>
                                    <DialogDescription className="sm:text-center">
                                        This action cannot be undone.
                                    </DialogDescription>
                                </DialogHeader>
                            </div>

                            <form className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor={id} className="font-bold">To confirm, type &quot;<span className="text-foreground font-bold">{project.name}</span>&quot;</Label>
                                    <Input
                                        id={id}
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                    />
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="outline" className="flex-1">
                                            Cancel
                                        </Button>
                                    </DialogClose>
                                    <Button
                                        type="button"
                                        className="flex-1"
                                        disabled={inputValue !== project.name}
                                        onClick={() => handleDeleteProject(project._id)}
                                    >
                                        Delete
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{project.description}</p>
                <Button className="w-full mt-2 text-sm" onClick={() => onViewProject(project._id)}>
                    View Project
                </Button>
            </CardContent>
        </Card>
    )
}