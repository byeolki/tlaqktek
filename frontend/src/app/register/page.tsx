"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../lib/api";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function RegisterPage() {
    const router = useRouter();
    const { register, user, isLoading } = useAuth();
    const [formData, setFormData] = useState({
        user_id: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    // User ID availability check states
    const [userIdCheck, setUserIdCheck] = useState<{
        isChecking: boolean;
        isAvailable: boolean | null;
        message: string;
    }>({
        isChecking: false,
        isAvailable: null,
        message: "",
    });

    // Redirect if already logged in
    useEffect(() => {
        if (user && !isLoading) {
            router.replace("/");
        }
    }, [user, isLoading, router]);

    // Check user ID availability with debounce
    useEffect(() => {
        if (formData.user_id.length >= 3) {
            const timeoutId = setTimeout(async () => {
                await checkUserIdAvailability(formData.user_id);
            }, 500); // 500ms debounce

            return () => clearTimeout(timeoutId);
        } else {
            setUserIdCheck({
                isChecking: false,
                isAvailable: null,
                message: "",
            });
        }
    }, [formData.user_id]);

    const checkUserIdAvailability = async (userId: string) => {
        if (!validateUserId(userId)) return;

        setUserIdCheck((prev) => ({ ...prev, isChecking: true }));

        try {
            const response = await api.auth.checkUserId(userId);
            setUserIdCheck({
                isChecking: false,
                isAvailable: response.available,
                message: response.message,
            });
        } catch (error) {
            console.error("Failed to check user ID availability:", error);
            setUserIdCheck({
                isChecking: false,
                isAvailable: null,
                message: "아이디 확인 중 오류가 발생했습니다",
            });
        }
    };

    const validateUserId = (userId: string) => {
        const userIdRegex = /^[a-zA-Z0-9._]+$/;
        if (!userId.trim()) {
            return false;
        }
        if (userId.length < 3 || userId.length > 20) {
            return false;
        }
        if (!userIdRegex.test(userId)) {
            return false;
        }
        return true;
    };

    const validatePassword = (password: string) => {
        if (!password) {
            return "비밀번호를 입력해주세요";
        }
        if (password.length < 8) {
            return "비밀번호는 8자 이상이어야 합니다";
        }
        return "";
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.user_id.trim()) {
            newErrors.user_id = "아이디를 입력해주세요";
        } else if (!validateUserId(formData.user_id)) {
            newErrors.user_id = "아이디는 3-20자의 영문, 숫자, 점(.), 밑줄(_)만 사용 가능합니다";
        } else if (userIdCheck.isAvailable === false) {
            newErrors.user_id = "이미 사용 중인 아이디입니다";
        }

        const passwordError = validatePassword(formData.password);
        if (passwordError) {
            newErrors.password = passwordError;
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "비밀번호 확인을 입력해주세요";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "비밀번호가 일치하지 않습니다";
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

        if (userIdCheck.isAvailable !== true) {
            setSubmitError("아이디 사용 가능 여부를 확인해주세요");
            return;
        }

        setIsSubmitting(true);

        try {
            await register({
                user_id: formData.user_id,
                password: formData.password,
            });
            router.push("/");
        } catch (error: any) {
            setSubmitError(error.message || "회원가입에 실패했습니다");
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

    const getPasswordStrength = (password: string) => {
        if (!password) return { strength: 0, label: "", color: "" };

        let strength = 0;
        if (password.length >= 8) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;

        const levels = [
            { strength: 0, label: "", color: "" },
            { strength: 1, label: "매우 약함", color: "bg-red-500" },
            { strength: 2, label: "약함", color: "bg-orange-500" },
            { strength: 3, label: "보통", color: "bg-yellow-500" },
            { strength: 4, label: "강함", color: "bg-green-500" },
            { strength: 5, label: "매우 강함", color: "bg-green-600" },
        ];

        return levels[strength];
    };

    const passwordStrength = getPasswordStrength(formData.password);

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
                            <UserPlus className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">심밧다</span>
                    </Link>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    새 계정 만들기
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    이미 계정이 있으신가요?{" "}
                    <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                        로그인
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
                                            회원가입 실패
                                        </h3>
                                        <div className="mt-1 text-sm text-red-700">
                                            {submitError}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* User ID Field */}
                        <div>
                            <label
                                htmlFor="user_id"
                                className="block text-sm font-medium text-gray-700"
                            >
                                아이디
                            </label>
                            <div className="mt-1">
                                <div className="relative">
                                    <input
                                        id="user_id"
                                        name="user_id"
                                        type="text"
                                        autoComplete="username"
                                        value={formData.user_id}
                                        onChange={handleChange}
                                        className={`appearance-none block w-full px-3 py-2 pr-10 border ${
                                            errors.user_id
                                                ? "border-red-300"
                                                : userIdCheck.isAvailable === true
                                                  ? "border-green-300"
                                                  : userIdCheck.isAvailable === false
                                                    ? "border-red-300"
                                                    : "border-gray-300"
                                        } rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                        placeholder="3-20자의 영문, 숫자, 점, 밑줄"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        {userIdCheck.isChecking && (
                                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                        )}
                                        {!userIdCheck.isChecking &&
                                            userIdCheck.isAvailable === true && (
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                            )}
                                        {!userIdCheck.isChecking &&
                                            userIdCheck.isAvailable === false && (
                                                <AlertCircle className="h-4 w-4 text-red-500" />
                                            )}
                                    </div>
                                </div>

                                {errors.user_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.user_id}</p>
                                )}

                                {!errors.user_id && userIdCheck.message && (
                                    <p
                                        className={`mt-1 text-sm ${
                                            userIdCheck.isAvailable
                                                ? "text-green-600"
                                                : "text-red-600"
                                        }`}
                                    >
                                        {userIdCheck.message}
                                    </p>
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
                                    autoComplete="new-password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`appearance-none block w-full px-3 py-2 pr-10 border ${
                                        errors.password ? "border-red-300" : "border-gray-300"
                                    } rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                    placeholder="8자 이상의 비밀번호"
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
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}

                            {/* Password Strength Indicator */}
                            {formData.password && !errors.password && (
                                <div className="mt-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-gray-500">비밀번호 강도</span>
                                        <span
                                            className={`text-xs font-medium ${
                                                passwordStrength.strength >= 3
                                                    ? "text-green-600"
                                                    : passwordStrength.strength >= 2
                                                      ? "text-yellow-600"
                                                      : "text-red-600"
                                            }`}
                                        >
                                            {passwordStrength.label}
                                        </span>
                                    </div>
                                    <div className="flex space-x-1">
                                        {[1, 2, 3, 4, 5].map((level) => (
                                            <div
                                                key={level}
                                                className={`h-2 w-full rounded ${
                                                    level <= passwordStrength.strength
                                                        ? passwordStrength.color
                                                        : "bg-gray-200"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium text-gray-700"
                            >
                                비밀번호 확인
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`appearance-none block w-full px-3 py-2 pr-10 border ${
                                        errors.confirmPassword
                                            ? "border-red-300"
                                            : "border-gray-300"
                                    } rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                    placeholder="비밀번호를 다시 입력하세요"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.confirmPassword}
                                </p>
                            )}
                            {formData.confirmPassword &&
                                formData.password === formData.confirmPassword &&
                                !errors.confirmPassword && (
                                    <div className="mt-1 flex items-center">
                                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                        <span className="text-sm text-green-600">
                                            비밀번호가 일치합니다
                                        </span>
                                    </div>
                                )}
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting || userIdCheck.isAvailable !== true}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center space-x-2">
                                        <LoadingSpinner size="sm" color="white" />
                                        <span>계정 생성 중...</span>
                                    </div>
                                ) : (
                                    "계정 만들기"
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
                                href="/login"
                                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                기존 계정으로 로그인
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
