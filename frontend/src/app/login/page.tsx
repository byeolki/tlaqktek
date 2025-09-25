"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function LoginPage() {
    const router = useRouter();
    const { login, user, isLoading } = useAuth();
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    // Redirect if already logged in
    useEffect(() => {
        if (user && !isLoading) {
            router.replace("/");
        }
    }, [user, isLoading, router]);

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.username.trim()) {
            newErrors.username = "아이디를 입력해주세요";
        } else if (formData.username.length < 3) {
            newErrors.username = "아이디는 3자 이상이어야 합니다";
        }

        if (!formData.password) {
            newErrors.password = "비밀번호를 입력해주세요";
        } else if (formData.password.length < 8) {
            newErrors.password = "비밀번호는 8자 이상이어야 합니다";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError("");

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            await login(formData);
            router.push("/");
        } catch (error: any) {
            setSubmitError(error.message || "로그인에 실패했습니다");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }

        // Clear submit error
        if (submitError) {
            setSubmitError("");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // Don't render if user is already logged in
    if (user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <Link href="/" className="inline-flex items-center space-x-2">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <LogIn className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">심밧다</span>
                    </Link>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    계정에 로그인
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    아직 계정이 없으신가요?{" "}
                    <Link
                        href="/register"
                        className="font-medium text-blue-600 hover:text-blue-500"
                    >
                        회원가입
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Submit Error */}
                        {submitError && (
                            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                <div className="flex">
                                    <AlertCircle className="h-5 w-5 text-red-400" />
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">
                                            로그인 실패
                                        </h3>
                                        <div className="mt-1 text-sm text-red-700">
                                            {submitError}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Username Field */}
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-gray-700"
                            >
                                아이디
                            </label>
                            <div className="mt-1">
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    autoComplete="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className={`appearance-none block w-full px-3 py-2 border ${
                                        errors.username ? "border-red-300" : "border-gray-300"
                                    } rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                    placeholder="아이디를 입력하세요"
                                />
                                {errors.username && (
                                    <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                                )}
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                            >
                                비밀번호
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`appearance-none block w-full px-3 py-2 pr-10 border ${
                                        errors.password ? "border-red-300" : "border-gray-300"
                                    } rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                    placeholder="비밀번호를 입력하세요"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                                    )}
                                </button>
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>
                        </div>

                        {/* Remember me and forgot password */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label
                                    htmlFor="remember-me"
                                    className="ml-2 block text-sm text-gray-900"
                                >
                                    로그인 상태 유지
                                </label>
                            </div>

                            <div className="text-sm">
                                <a
                                    href="#"
                                    className="font-medium text-blue-600 hover:text-blue-500"
                                >
                                    비밀번호를 잊으셨나요?
                                </a>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center space-x-2">
                                        <LoadingSpinner size="sm" color="white" />
                                        <span>로그인 중...</span>
                                    </div>
                                ) : (
                                    "로그인"
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Divider */}
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">또는</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Link
                                href="/register"
                                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                새 계정 만들기
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
