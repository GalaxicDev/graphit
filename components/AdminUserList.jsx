"use client";

import { useState, useId, useEffect } from "react";
import { Plus, X, RotateCcw, UserPlus, Users } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import nextConfig from "@/next.config.mjs";

export function AdminUserList({ token, users }) {
  const id = useId();
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "user" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) {
      setError("Name and email are required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(nextConfig.env.API_URL + "/users", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Failed to create user");
      } else {
        console.log("success creating user", data);
        setNewUser({ name: "", email: "", password: "", role: "user" });
        setCreateDialogOpen(false);
        if (data.password) {
          setSuccessMessage(`User created successfully with password: ${data.password}`);
        }
        router.refresh();
      }
    } catch (error) {
      setError("Failed to create user");
      console.error("Failed to create user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveUser = async (user) => {
    setSelectedUser(user);
    setResetDialogOpen(false);
  };

  const confirmRemoveUser = async () => {
    try {
      const res = await fetch(nextConfig.env.API_URL + `/users/${selectedUser._id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Failed to remove user");
      } else {
        router.refresh();
      }
    } catch (error) {
      setError("Failed to remove user");
      console.error("Failed to remove user:", error);
    } finally {
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleResetPassword = async (user) => {
    setSelectedUser(user);
    setResetDialogOpen(true);
  };

  const confirmResetPassword = async () => {
    try {
      const res = await fetch(nextConfig.env.API_URL + `/users/${selectedUser._id}`, {
        method: "POST",
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Failed to reset password");
      } else {
        setError("");
        if (data.password) {
          setSuccessMessage(`User created successfully with password: ${data.password}`);
        }
      }
    } catch (error) {
      setError("Failed to reset password");
      console.error("Failed to reset password:", error);
    } finally {
      setResetDialogOpen(false);
      setSelectedUser(null);
    }
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000); // Hide the alert after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <Card className="dark:bg-gray-800/40">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-primary/10 rounded-lg dark:bg-primary/20">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Add or remove users to the website</CardDescription>
          </div>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] dark:bg-gray-800/40">
            <div className="flex flex-col items-center gap-2">
              <div
                className="flex size-11 shrink-0 items-center justify-center rounded-full border dark:border-gray-700"
                aria-hidden="true"
              >
                <UserPlus className="w-6 h-6 text-primary dark:text-primary" />
              </div>
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-center">Add New User</DialogTitle>
                <DialogDescription className="text-center">
                  Enter the user details below. Password is optional.
                </DialogDescription>
              </DialogHeader>
            </div>

            <form onSubmit={handleAddUser} className="space-y-5 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`${id}-name`}>Username</Label>
                  <Input
                    id={`${id}-name`}
                    value={newUser.name}
                    onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
                    className="dark:bg-gray-700/50 dark:border-gray-600"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${id}-email`}>Email</Label>
                  <Input
                    id={`${id}-email`}
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                    className="dark:bg-gray-700/50 dark:border-gray-600"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${id}-password`}>Password (Optional)</Label>
                  <Input
                    id={`${id}-password`}
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
                    className="dark:bg-gray-700/50 dark:border-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${id}-role`}>User Type</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) => setNewUser((prev) => ({ ...prev, role: value }))}
                    required
                  >
                    <SelectTrigger id={`${id}-role`} className="w-full dark:bg-gray-700/50 dark:border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create User"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        {successMessage && (
          <Alert variant="success" className="mb-4 bg-green-500 text-white flex justify-between items-center">
            <div>
              <AlertTitle className="font-bold">Success</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSuccessMessage("")} className="text-white">
              <X className="h-5 w-5" />
            </Button>
          </Alert>
        )}
        <ScrollArea className="h-[400px] w-full rounded-md border p-4 dark:border-gray-700">
          {users?.length > 0 ? (
            users.map((user) => (
              <div key={user._id} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={nextConfig.env.PFP_SRC + user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="text-sm font-medium dark:text-gray-100">{user.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleResetPassword(user)}
                    className="dark:hover:bg-gray-700"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveUser(user)}
                    className="dark:hover:bg-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">No users found.</p>
          )}
        </ScrollArea>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="dark:bg-gray-800/40">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove {selectedUser?.name} from the website. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="dark:bg-gray-700">Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-red-500 text-white hover:bg-red-600" onClick={confirmRemoveUser}>
                Remove User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
          <AlertDialogContent className="dark:bg-gray-800/40">
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Password</AlertDialogTitle>
              <AlertDialogDescription>
                This will reset the password for {selectedUser?.name} and send them a new password via email. Continue?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="dark:bg-gray-700">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmResetPassword}>Reset Password</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}