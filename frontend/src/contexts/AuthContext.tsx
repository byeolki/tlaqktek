"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "../lib/api";
import {
    User,
    LoginRequest,
    RegisterRequest,
    ChangePasswordRequest,
    AuthContextType,
} from "../lib/types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initialize auth state on component mount
    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem("access_token");
            if (storedToken) {
                setToken(storedToken);
                try {
                    const userData = await api.users.getMe();
                    setUser(userData);
                } catch (error) {
                    // Token might be expired or invalid
                    localStorage.removeItem("access_token");
                    setToken(null);
                    console.error("Failed to get user data:", error);
                }
            }
            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    const login = async (credentials: LoginRequest) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await api.auth.login(credentials);
            const { access_token } = response;

            // Store token
            localStorage.setItem("access_token", access_token);
            setToken(access_token);

            // Get user data
            const userData = await api.users.getMe();
            setUser(userData);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Login failed";
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: RegisterRequest) => {
        try {
            setIsLoading(true);
            setError(null);

            await api.auth.register(data);

            // Automatically log in after successful registration
            await login({ username: data.user_id, password: data.password });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Registration failed";
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            if (token) {
                await api.auth.logout();
            }
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            // Clear local state regardless of API call success
            localStorage.removeItem("access_token");
            setToken(null);
            setUser(null);
            setError(null);
        }
    };

    const changePassword = async (data: ChangePasswordRequest) => {
        try {
            setIsLoading(true);
            setError(null);

            await api.auth.changePassword(data);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Password change failed";
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const contextValue: AuthContextType = {
        user,
        token,
        login,
        register,
        logout,
        changePassword,
        isLoading,
        error,
    };

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export default AuthContext;
