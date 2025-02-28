"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = Cookies.get('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [token, setToken] = useState(() => Cookies.get('token') || null);

    useEffect(() => {
        if (user) {
            const { _id, name, email } = user;
            Cookies.set('user', JSON.stringify({ _id, name, email }), { expires: 31, secure: true, sameSite: 'Strict' });
        }
    }, [user]);

    useEffect(() => {
        if (token) Cookies.set('token', token, { expires: 31, secure: true, sameSite: 'Strict' });
    }, [token]);

    return (
        <UserContext.Provider value={{ user, setUser, token, setToken }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);