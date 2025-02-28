"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Cookies from 'js-cookie';
import nextConfig from '@/next.config.mjs';
import { verifyToken } from '@/lib/api';

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get('token');
      if (token) {
        const result = await verifyToken(token);
        if (result.success) {
          router.push('/'); // Redirect to the main page if already logged in
        }
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const res = await fetch(nextConfig.env.API_URL + '/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Ensure cookies are included in the request
      });
      const data = await res.json();
      console.log("login data:", data);
      if (!data.success) {
        setError(data.message);
      } else {
        setError("");
        Cookies.set('token', data.token, {
          expires: 31,
          secure: false, // Set secure to true only in production
          sameSite: 'Strict'
        });
        console.log("set cookie token to:", data.token);
        Cookies.set('user', JSON.stringify({ _id: data.user._id, name: data.user.name, email: data.user.email }), {
          expires: 31,
          secure: false, // Set secure to true only in production
          sameSite: 'Strict'
        });
        console.log("redirecting to /");
        console.log("Cookies.get('token'):", Cookies.get('token'));
        router.push('/'); // Redirect to the main page
      }
    } catch (error) {
      setError("Failed to login");
      console.error('Failed to login:', error);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-100 ${darkMode ? "dark" : ""}`}>
      <Card className="w-full max-w-md shadow-lg dark:bg-gray-800">
        <CardHeader className="space-y-1">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold dark:text-white">Login</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="dark:text-gray-400">
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
          <CardDescription className="dark:text-gray-400">
            Enter your email and password to login
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="dark:text-white">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="dark:text-white">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent dark:text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">Login</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default LoginForm;