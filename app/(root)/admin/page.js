"use client";

import React from 'react'
import { AdminUserList } from "@/components/AdminUserList"

const page = () => {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Admin Panel</h1>
      <AdminUserList />
    </div>
  )
}

export default page