import React from 'react'
import { AdminUserList } from "@/components/AdminUserList"
import { fetchUsers } from "@/lib/user"
import { cookies } from 'next/headers'

const page = async () => {

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const allUsers = await fetchUsers(token);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Admin Panel</h1>
      <AdminUserList token={token} users={allUsers} />
    </div>
  )
}

export default page