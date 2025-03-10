import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AccountView() {
    return (
        <div className="container mx-auto p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Account details</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Username: </p>
                    <p>Email:</p>
                    <p>Password:</p> <Button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition duration-300">Reset Password</Button>
                </CardContent>
            </Card>
        </div>
  )
}