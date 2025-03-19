"use client"

import axios from "axios"
import { useState, useEffect } from "react"
import { Save, Trash2, Info, CheckCircle, X, Upload, Lock, Shield, CircleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import nextConfig from '@/next.config.mjs';
import { useUser } from "@/lib/UserContext"

import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function AccountView({ initialUserData }) {
    const [user, setUser] = useState(initialUserData)
    const [alert, setAlert] = useState(false)
    const [alertType, setAlertType] = useState("success")
    const [alertMessage, setAlertMessage] = useState("")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [confirmValue, setConfirmValue] = useState("")
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const { token } = useUser();

    const handleUserUpdate = async () => {
        try {
            await axios.put(
                `${nextConfig.env.API_URL}/users/${user._id}`,
                {
                    name: user.name,
                    bio: user.bio,
                    email: user.email,
                    publicProfile: user.publicProfile,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            )
            showAlert("success", "Your profile has been successfully updated.")
        } catch (error) {
            console.error("Failed to update user data:", error)
            showAlert("error", "Failed to update profile. Please try again.")
        }
    }

    const handlePasswordChange = async () => {
        if (newPassword !== confirmPassword) {
            showAlert("error", "New passwords don't match. Please try again.")
            return
        }
        

        try {
            await axios.put(
                `${nextConfig.env.API_URL}/users/change-password`,
                {
                    "password": newPassword,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            )
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
            showAlert("success", "Your password has been successfully updated.")
        } catch (error) {
            console.error("Failed to update password:", error)
            showAlert("error", "Failed to update password. Please check your current password and try again.")
        }
    }

    const handleDeleteAccount = async () => {
        try {
            await axios.delete(`${nextConfig.env.API_URL}/users/${user._id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            // Redirect to logout or home page after account deletion
            window.location.href = "/logout"
        } catch (error) {
            console.error("Failed to delete account:", error)
            showAlert("error", "Failed to delete account. Please try again.")
        }
    }

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        const formData = new FormData()
        formData.append("avatar", file)

        try {
            await axios.post(`${nextConfig.env.API_URL}/users/${user._id}/avatar`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            })
            // Refresh user data to get updated avatar
            const updatedUser = await axios.get(`${nextConfig.env.API_URL}/users/${user._id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            setUser(updatedUser.data)
            showAlert("success", "Your avatar has been successfully updated.")
        } catch (error) {
            console.error("Failed to upload avatar:", error)
            showAlert("error", "Failed to upload avatar. Please try again.")
        }
    }

    const showAlert = (type, message) => {
        setAlertType(type)
        setAlertMessage(message)
        setAlert(true)
    }

    const renderAlert = () => {
        return (
            <Alert variant={alertType} className="flex fixed top-8 left-1/2 transform -translate-x-1/2 mx-3 z-50 max-w-[50%]">
                {alertType === "success" ? <CheckCircle className="h-4 w-4" /> : <CircleAlert className="h-4 w-4" />}
                <AlertTitle>{alertType === "success" ? "Success!" : "Error"}</AlertTitle>
                <AlertDescription>{alertMessage}</AlertDescription>
                <button onClick={() => setAlert(false)} className="absolute top-1/2 right-4 transform -translate-y-1/2">
                    <X className="h-4 w-4" />
                </button>
            </Alert>
        )
    }

    useEffect(() => {
        if (alert) {
            const timer = setTimeout(() => setAlert(false), 5000)
            return () => clearTimeout(timer)
        }
    }, [alert])

    return (
        <div className="m-0 p-0">
            {alert && renderAlert()}
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6 dark:text-white">User Settings</h1>
                <Tabs defaultValue="profile" className="space-y-4">
                    <TabsList className="dark:bg-gray-800 dark:text-white">
                        <TabsTrigger
                            value="profile"
                            className="hover:bg-gray-200 dark:hover:bg-gray-700 dark:data-[state=active]:bg-blue-500"
                        >
                            Profile
                        </TabsTrigger>
                        <TabsTrigger
                            value="security"
                            className="hover:bg-gray-200 dark:hover:bg-gray-700 dark:data-[state=active]:bg-blue-500"
                        >
                            Security
                        </TabsTrigger>
                        {/* <TabsTrigger
                            value="preferences"
                            className="hover:bg-gray-200 dark:hover:bg-gray-700 dark:data-[state=active]:bg-blue-500"
                        >
                            Preferences
                        </TabsTrigger> */}
                    </TabsList>

                    <TabsContent value="profile">
                        <Card className="dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-750 p-2 mb-4">
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                                    <div className="relative">
                                        <Avatar className="w-24 h-24">
                                            <AvatarImage src={`${nextConfig.env.PFP_SRC}${user.name}`} />
                                            <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        {/* <label
                                            htmlFor="avatar-upload"
                                            className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer"
                                        >
                                            <Upload className="w-4 h-4" />
                                            <input
                                                id="avatar-upload"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleAvatarUpload}
                                            />
                                        </label> */}
                                    </div>
                                    <div className="space-y-1 text-center sm:text-left">
                                        <h3 className="text-xl font-medium dark:text-white">{user.name}</h3>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                </div>

                                {/* <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        value={user.name}
                                        onChange={(e) => setUser({ ...user, name: e.target.value })}
                                        className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={user.email}
                                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                                        className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                    />
                                </div> */}
                            </CardContent>
                            {/* <CardFooter>
                                <Button onClick={handleUserUpdate}>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </Button>
                            </CardFooter> */}
                        </Card>
                        <Card className="dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-750 p-2 mb-4">
                            <CardHeader>
                                <CardTitle>Security Settings</CardTitle>
                                <CardDescription>Manage your password and account security</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* <div className="space-y-2">
                                    <Label htmlFor="current-password">Current Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="current-password"
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                        />
                                        <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    </div>
                                </div> */}

                                <div className="space-y-2">
                                    <Label htmlFor="new-password">New Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="new-password"
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                        />
                                        <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="confirm-password"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                        />
                                        <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    </div>
                                </div>

                                <Button
                                    onClick={handlePasswordChange}
                                    disabled={!newPassword || !confirmPassword}
                                    className="mt-2"
                                >
                                    <Shield className="w-4 h-4 mr-2" />
                                    Update Password
                                </Button>

                                {/* <div className="pt-6 border-t mt-6 dark:border-gray-700">
                                    <h3 className="text-lg font-medium mb-4 dark:text-white">Danger Zone</h3>
                                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="destructive">
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete Account
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
                                                    <DialogTitle className="sm:text-center">Delete your account?</DialogTitle>
                                                    <DialogDescription className="sm:text-center">
                                                        This action cannot be undone. All your data will be permanently removed.
                                                    </DialogDescription>
                                                </DialogHeader>
                                            </div>

                                            <form className="space-y-5">
                                                <div className="space-y-2">
                                                    <Label htmlFor="confirm-delete" className="font-bold">
                                                        To confirm, type &quot;<span className="text-foreground font-bold">{user.name}</span>&quot;
                                                    </Label>
                                                    <Input
                                                        id="confirm-delete"
                                                        type="text"
                                                        value={confirmValue}
                                                        onChange={(e) => setConfirmValue(e.target.value)}
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
                                                        variant="destructive"
                                                        className="flex-1"
                                                        disabled={confirmValue !== user.name}
                                                        onClick={handleDeleteAccount}
                                                    >
                                                        Delete Account
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </div> */}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security">
                    <Card className="dark:bg-gray-800">
                            <CardHeader>
                                <CardTitle>Security Settings</CardTitle>
                                <CardDescription>Manage your password and account security</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="current-password">Current Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="current-password"
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                        />
                                        <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="new-password">New Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="new-password"
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                        />
                                        <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="confirm-password"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                        />
                                        <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    </div>
                                </div>

                                <Button
                                    onClick={handlePasswordChange}
                                    disabled={!currentPassword || !newPassword || !confirmPassword}
                                    className="mt-2"
                                >
                                    <Shield className="w-4 h-4 mr-2" />
                                    Update Password
                                </Button>

                                {/* <div className="pt-6 border-t mt-6 dark:border-gray-700">
                                    <h3 className="text-lg font-medium mb-4 dark:text-white">Danger Zone</h3>
                                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="destructive">
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete Account
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
                                                    <DialogTitle className="sm:text-center">Delete your account?</DialogTitle>
                                                    <DialogDescription className="sm:text-center">
                                                        This action cannot be undone. All your data will be permanently removed.
                                                    </DialogDescription>
                                                </DialogHeader>
                                            </div>

                                            <form className="space-y-5">
                                                <div className="space-y-2">
                                                    <Label htmlFor="confirm-delete" className="font-bold">
                                                        To confirm, type &quot;<span className="text-foreground font-bold">{user.name}</span>&quot;
                                                    </Label>
                                                    <Input
                                                        id="confirm-delete"
                                                        type="text"
                                                        value={confirmValue}
                                                        onChange={(e) => setConfirmValue(e.target.value)}
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
                                                        variant="destructive"
                                                        className="flex-1"
                                                        disabled={confirmValue !== user.name}
                                                        onClick={handleDeleteAccount}
                                                    >
                                                        Delete Account
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </div> */}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* <TabsContent value="preferences">
                        <Card className="dark:bg-gray-800">
                            <CardHeader>
                                <CardTitle>Notification Preferences</CardTitle>
                                <CardDescription>Manage how and when you receive notifications</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Email Notifications</Label>
                                            <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                                        </div>
                                        <Switch
                                            checked={user.emailNotifications}
                                            onCheckedChange={(checked) => setUser({ ...user, emailNotifications: checked })}
                                            className="data-[state=checked]:bg-blue-500 dark:data-[state=checked]:bg-blue-400 dark-data[state=no-checked]:bg-gray-600 dark:bg-gray-700"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Project Updates</Label>
                                            <p className="text-sm text-muted-foreground">Get notified about updates to your projects</p>
                                        </div>
                                        <Switch
                                            checked={user.projectUpdates}
                                            onCheckedChange={(checked) => setUser({ ...user, projectUpdates: checked })}
                                            className="data-[state=checked]:bg-blue-500 dark:data-[state=checked]:bg-blue-400 dark-data[state=no-checked]:bg-gray-600 dark:bg-gray-700"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Collaboration Invites</Label>
                                            <p className="text-sm text-muted-foreground">Get notified about new collaboration invites</p>
                                        </div>
                                        <Switch
                                            checked={user.collaborationInvites}
                                            onCheckedChange={(checked) => setUser({ ...user, collaborationInvites: checked })}
                                            className="data-[state=checked]:bg-blue-500 dark:data-[state=checked]:bg-blue-400 dark-data[state=no-checked]:bg-gray-600 dark:bg-gray-700"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Marketing Emails</Label>
                                            <p className="text-sm text-muted-foreground">Receive marketing and promotional emails</p>
                                        </div>
                                        <Switch
                                            checked={user.marketingEmails}
                                            onCheckedChange={(checked) => setUser({ ...user, marketingEmails: checked })}
                                            className="data-[state=checked]:bg-blue-500 dark:data-[state=checked]:bg-blue-400 dark-data[state=no-checked]:bg-gray-600 dark:bg-gray-700"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleUserUpdate}>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Preferences
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent> */}
                </Tabs>
            </div>
        </div>
    )
}

