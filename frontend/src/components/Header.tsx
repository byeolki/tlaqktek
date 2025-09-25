"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { Search, User, LogOut, Settings } from "lucide-react";

const Header: React.FC = () => {
    const { user, logout, isLoading } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <span className="text-xl font-bold text-gray-900">심밧다</span>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {/* 검색 기능은 랜딩 페이지에서 제공 */}
                    </nav>

                    {/* User menu */}
                    <div className="flex items-center space-x-4">
                        {isLoading ? (
                            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                        ) : user ? (
                            <div className="flex items-center space-x-3">
                                <span className="text-sm text-gray-700">
                                    안녕하세요, {user.user_id}님
                                </span>
                                <div className="flex items-center space-x-2">
                                    <Link
                                        href="/profile"
                                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                                        title="프로필"
                                    >
                                        <User className="w-5 h-5" />
                                    </Link>
                                    <Link
                                        href="/settings"
                                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                                        title="설정"
                                    >
                                        <Settings className="w-5 h-5" />
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                        title="로그아웃"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link
                                    href="/login"
                                    className="text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    로그인
                                </Link>
                                <Link
                                    href="/register"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    회원가입
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            type="button"
                            className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900"
                        >
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
