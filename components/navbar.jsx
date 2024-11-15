"use client"

import { Menu, Search, Bell, ChevronDown, Moon, Sun } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image";
import logo from "@/images/logo.png";

export function Navbar({ sidebarOpen, toggleSidebar, darkMode, toggleDarkMode }) {
  return (
      <header className={`flex items-center justify-between h-16 px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700`}>
        <div className="flex items-center">
          {!sidebarOpen && (
              <>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="mr-2 lg:block hidden text-gray-800 dark:text-white flex items-center justify-center">
                  <Menu className="h-6 w-6" />
                </Button>
                <Image
                    src={logo}
                    alt={"Graphity logo"}
                    height={80}
                    width={80}
                    className={"flex justify-center content-center mr-4"}
                    loading={"eager"}
                    onClick={() => window.location.href = "/"}
                />
              </>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
                type="search"
                placeholder="Search projects..."
                className="pl-10 pr-4 py-2 w-64 rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" />
          </div>
        </div>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-4 text-gray-800 dark:text-white">
            <Bell className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center text-gray-800 dark:text-white">
                <img
                    src="https://placeholder.pics/svg/300?height=32&width=32" // Placeholder image for user avatar
                    alt="User avatar"
                    className="w-8 h-8 rounded-full mr-2" />
                <span>John Doe</span>
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
              <DropdownMenuLabel className="dark:text-white">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="dark:border-gray-700" />
              <DropdownMenuItem className="dark:text-gray-300 dark:focus:bg-gray-700">Profile</DropdownMenuItem>
              <DropdownMenuItem className="dark:text-gray-300 dark:focus:bg-gray-700">Settings</DropdownMenuItem>
              <DropdownMenuItem className="dark:text-gray-300 dark:focus:bg-gray-700">Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="ml-4 text-gray-800 dark:text-white">
            {darkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </header>
  );
}