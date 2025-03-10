import React from 'react'
import { AccountView } from "@/components/AccountView"

const page = () => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4 dark:text-white">Account</h1>
            <AccountView/>
        </div>
  )
}

export default page