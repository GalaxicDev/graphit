"use client"

import axios from "axios";
import { useState, useEffect, useId } from "react";
import { Plus, X, Save, Trash2, Eye, EyeOff, Info, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CircleAlert } from "lucide-react";
import nextConfig from '@/next.config.mjs';
import { useUser } from '@/lib/UserContext';

export function ProjectSettings({ initialProjectData }) {
  const [project, setProject] = useState(initialProjectData);
  const [newUser, setNewUser] = useState({ email: "", role: "Viewer" });
  const [newCollection, setNewCollection] = useState("");
  const [alert, setAlert] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const id = useId();
  const { token } = useUser();
  

  const handleProjectUpdate = async () => {
    try {
      await axios.put(nextConfig.env.API_URL + `/projects/${project._id}`,
          project,
          {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          },
          project);
      setAlert(true);
    } catch (error) {
      console.error("Failed to update project data:", error);
    }
  };

  const handleAddUser = () => {
    if (newUser.email) {
      setProject(prev => ({
        ...prev,
        users: [...prev.users, { id: Date.now().toString(), name: newUser.email.split('@')[0], ...newUser }]
      }));
      setNewUser({ email: "", role: "Viewer" });
    }
  };

  const handleRemoveUser = (userId) => {
    setProject(prev => ({
      ...prev,
      users: prev.users.filter(user => user.id !== userId)
    }));
  };

  const handleAddCollection = async () => {
    if (newCollection) {
      try {
        const response = await axios.post(nextConfig.env.API_URL + `/projects/${project._id}/collections`,
            { name: newCollection },
            {
              headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
              }
            }
        );
        setProject(prev => ({
          ...prev,
          collections: [...prev.collections, response.data]
        }));
        setNewCollection("");
      } catch (error) {
        console.error("Failed to add collection:", error);
      }
    }
  };

  const handleRemoveCollection = (collectionId) => {
    setProject(prev => ({
      ...prev,
      collections: prev.collections.filter(collection => collection.id !== collectionId)
    }));
  };

  const handleToggleCollectionPublic = (collectionId) => {
    setProject(prev => ({
      ...prev,
      collections: prev.collections.map(collection =>
          collection.id === collectionId ? { ...collection, isPublic: !collection.isPublic } : collection
      )
    }));
  };

  const handleDeleteProject = async (projectId) => {
    if (!isMounted) return;
    try {
      const res = await axios.delete(`${nextConfig.env.API_URL}/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.status === 200) {
        setProject(prevProjects => prevProjects.filter(p => p._id !== projectId));
        setDialogOpen(false);
      } else {
        console.error('Failed to delete project:', res.data);
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  }

  const renderAlert = () => {
    return (
        <Alert variant={"success"} className="flex fixed top-8 left-1/2 transform -translate-x-1/2 mx-3 z-50 max-w-[50%]">
          <CheckCircle className="h-4 w-4"/>
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>
            Your project has successfully been updated.
          </AlertDescription>
          <button onClick={() => setAlert(false)} className="absolute top-1/2 right-4 transform -translate-y-1/2">
            <X className="h-4 w-4"/>
          </button>
        </Alert>
    );
  }

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  return (
      <div>
        {alert && (
            renderAlert()
        )}

        <div className="container mx-auto py-10">
          <h1 className="text-3xl font-bold mb-6 dark:text-white">Project Settings</h1>
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList className="dark:bg-gray-800 dark:text-white">
              <TabsTrigger value="general"
                           className="hover:bg-gray-200 dark:hover:bg-gray-700 dark:data-[state=active]:bg-blue-500">General</TabsTrigger>
              <TabsTrigger value="users"
                           className="hover:bg-gray-200 dark:hover:bg-gray-700 dark:data-[state=active]:bg-blue-500">Users</TabsTrigger>
              <TabsTrigger value="collections"
                           className="hover:bg-gray-200 dark:hover:bg-gray-700 dark:data-[state=active]:bg-blue-500">Collections</TabsTrigger>
            </TabsList>
            <TabsContent value="general">
              <Card className={"dark:bg-gray-800"}>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Update your project&apos;s name and description</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Project Name</Label>
                    <Input
                        id="projectName"
                        value={project.name}
                        onChange={(e) => setProject({...project, name: e.target.value})}
                        className={"dark:bg-gray-700 dark:text-white dark:border-gray-600"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="projectDescription">Project Description</Label>
                    <Textarea
                        id="projectDescription"
                        value={project.description}
                        onChange={(e) => setProject({...project, description: e.target.value})}
                        rows={4}
                        className={"dark:bg-gray-700 dark:text-white dark:border-gray-600"}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                        id="public-project"
                        checked={project.isPublic}
                        onCheckedChange={(checked) => setProject({...project, isPublic: checked})}
                        className={"data-[state=checked]:bg-blue-500 dark:data-[state=checked]:bg-blue-400 dark-data[state=no-checked]:bg-gray-600 dark:bg-gray-700"}
                    />
                    <Label htmlFor="public-project" className={"flex"}>
                      Make project public
                      <div className={"flex"}>
                    <span className="ml-2 relative group">
                      <Info className="w-4 h-4 text-gray-500 dark:text-gray-400"/>
                      <span
                          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100">
                        Making the project public will allow anyone to view it, if they have the link.
                     </span>
                    </span>
                      </div>
                    </Label>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button onClick={handleProjectUpdate}>
                    <Save className="w-4 h-4 mr-2"/>
                    Save Changes
                  </Button>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="w-4 h-4 mr-2"/>
                          Delete Project
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
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="users">
              <Card className={"dark:bg-gray-800"}>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Add or remove users from your project</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                        placeholder="Email address"
                        value={newUser.email}
                        onChange={(e) => setNewUser(prev => ({...prev, email: e.target.value}))}
                        className={"dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"}
                    />
                    <select
                        className="border rounded-md px-3 py-2 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        value={newUser.role}
                        onChange={(e) => setNewUser(prev => ({...prev, role: e.target.value}))}
                    >
                      <option value="Viewer">Viewer</option>
                      <option value="Editor">Editor</option>
                      <option value="Admin">Admin</option>
                    </select>
                    <Button onClick={handleAddUser} className={"bg-blue-500 text-white"}>
                      <Plus className="w-4 h-4 mr-2"/>
                      Add User
                    </Button>
                  </div>
                  <ScrollArea className="h-[200px] w-full rounded-md border p-4 dark:border-gray-700">
                    {project.users?.map(user => (
                        <div key={user.id} className="flex items-center justify-between py-2">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.name}`}/>
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge>{user.role}</Badge>
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveUser(user.id)}>
                              <X className="w-4 h-4"/>
                            </Button>
                          </div>
                        </div>
                    )) || <p>No users found.</p>}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="collections">
              <Card className={"dark:bg-gray-800"}>
                <CardHeader>
                  <CardTitle>Collections</CardTitle>
                  <CardDescription>Manage collections in your project</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                        placeholder="Collection name"
                        value={newCollection}
                        onChange={(e) => setNewCollection(e.target.value)}
                        className={"dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"}
                    />
                    <Button onClick={handleAddCollection} className={"bg-blue-500 text-white hover:bg-blue-700"}>
                      <Plus className="w-4 h-4 mr-2"/>
                      Add Collection
                    </Button>
                  </div>
                  <ScrollArea className="h-[200px] w-full rounded-md border p-4 border-gray-600">
                    {project.collections.length > 0 ? (
                        project.collections.map(collection => (
                            <div
                                key={collection.id}
                                className="flex items-center justify-between py-2 border-b last:border-b-0 border-gray-700">
                              <div className="flex items-center space-x-2">
                                <Badge variant={collection.isPublic ? "default" : "secondary"}>
                                  {collection.isPublic ? "Public" : "Private"}
                                </Badge>
                                <p className="text-sm font-medium">{collection.name}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleToggleCollectionPublic(collection.id)}>
                                  {collection.isPublic ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveCollection(collection.id)}>
                                  <X className="w-4 h-4"/>
                                </Button>
                              </div>
                            </div>
                        ))
                    ) : (
                        <p>No collections connected to this project.</p>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
  );
}