"use client"

import { useState, useEffect } from "react";
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import axios from "axios";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

export function ProjectSettings({ initialProjectData }) {
  const [projectData, setProjectData] = useState(initialProjectData);
  const [newUser, setNewUser] = useState({ email: "", role: "Viewer" });
  const [newCollection, setNewCollection] = useState("");
  const [alert, setAlert] = useState(false);

  const handleProjectUpdate = async () => {
    try {
      await axios.put(process.env.API_URL + `/projects/${projectData._id}`,
          projectData,
          {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
          },
          projectData);
        setAlert(true);
    } catch (error) {
      console.error("Failed to update project data:", error);
    }
  };

  const handleAddUser = () => {
    if (newUser.email) {
      setProjectData(prev => ({
        ...prev,
        users: [...prev.users, { id: Date.now().toString(), name: newUser.email.split('@')[0], ...newUser }]
      }));
      setNewUser({ email: "", role: "Viewer" });
    }
  };

  const handleRemoveUser = (userId) => {
    setProjectData(prev => ({
      ...prev,
      users: prev.users.filter(user => user.id !== userId)
    }));
  };

  const handleAddCollection = () => {
    if (newCollection) {
      setProjectData(prev => ({
        ...prev,
        collections: [...prev.collections, { id: Date.now().toString(), name: newCollection, isPublic: false }]
      }));
      setNewCollection("");
    }
  };

  const handleRemoveCollection = (collectionId) => {
    setProjectData(prev => ({
      ...prev,
      collections: prev.collections.filter(collection => collection.id !== collectionId)
    }));
  };

  const handleToggleCollectionPublic = (collectionId) => {
    setProjectData(prev => ({
      ...prev,
      collections: prev.collections.map(collection =>
          collection.id === collectionId ? { ...collection, isPublic: !collection.isPublic } : collection
      )
    }));
  };

  const handleDeleteProject = async () => {
    try {
      await axios.delete(`/api/projects/${projectData._id}`);
      console.log("Project deleted:", projectData.name);
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

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
                        value={projectData.name}
                        onChange={(e) => setProjectData({...projectData, name: e.target.value})}
                        className={"dark:bg-gray-700 dark:text-white dark:border-gray-600"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="projectDescription">Project Description</Label>
                    <Textarea
                        id="projectDescription"
                        value={projectData.description}
                        onChange={(e) => setProjectData({...projectData, description: e.target.value})}
                        rows={4}
                        className={"dark:bg-gray-700 dark:text-white dark:border-gray-600"}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                        id="public-project"
                        checked={projectData.isPublic}
                        onCheckedChange={(checked) => setProjectData({...projectData, isPublic: checked})}
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
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="w-4 h-4 mr-2"/>
                        Delete Project
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your project and remove all
                          associated data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteProject}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
                    {projectData.users?.map(user => (
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
                    {projectData.collections.map(collection => (
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
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
  );
}