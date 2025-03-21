import React from 'react'
import { AdminUserList } from "@/components/AdminUserList"
import { fetchUsers, verifyToken } from "@/lib/api"
import { cookies } from 'next/headers'

const page = async () => {

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  // check if the user is admin
  const userData = await verifyToken(token);
  const userRole = userData.user.role;
  let allUsers = [];

  if (userRole === "admin") {
    allUsers = await fetchUsers(token);
  }


  return (
    <div className="container mx-auto">
      {userRole === "admin" ? (
        <>
          <h1 className="text-3xl font-bold mb-6 dark:text-white">Admin Panel</h1>
          <AdminUserList token={token} users={allUsers} />
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-6 dark:text-white">Admin Panel</h1>
          <p className="text-xl dark:text-white">You are not authorized to view this page</p>
        </>
      )}
    </div>
  )
}

export default page