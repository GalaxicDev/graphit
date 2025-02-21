"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import nextConfig from '@/next.config.mjs';

export function RegisterForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [darkMode, setDarkMode] = useState(false)
  const router = useRouter()

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!name || !email || !password) {
      setError("Please fill in all fields")
      return
    }

    try {
      const res = await fetch(nextConfig.env.API_URL + '/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.message)
      } else {
        setError("")
        Cookies.set('token', data.token, {
                  expires: 31,
                  secure: true,
                  sameSite: 'Strict'
                });
        router.push('/') // Redirect to the main page
      }
    } catch (error) {
      setError("Failed to register")
      console.error('Failed to register:', error)
    }
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  return (
      <div className={`min-h-screen flex items-center justify-center bg-gray-100 ${darkMode ? "dark" : ""}`}>
        <Card className="w-full max-w-md shadow-lg dark:bg-gray-800">
          <CardHeader className="space-y-1">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold dark:text-white">Register</CardTitle>
              <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleDarkMode}
                  className="dark:text-gray-400">
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
            <CardDescription className="dark:text-gray-400">
              Enter your details to create an account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="dark:text-white">Name</Label>
              <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
            </div>
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
            <Button onClick={handleRegister} className="w-full">Register</Button>
          </CardFooter>
        </Card>
      </div>
  )
}