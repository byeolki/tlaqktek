"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
    User,
    Settings,
    Plus,
    Trash2,
    Eye,
    EyeOff,
    AlertCircle,
    CheckCircle,
    Link as LinkIcon,
    Activity,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../lib/api";
import { ConnectedPlatformResponse, ConnectedPlatformCreate } from "../../lib/types";
import Header from "../../components/Header";
import LoadingSpinner from "../../components/LoadingSpinner";

interface PlatformFormData {
    platform_name: "bunjang" | "joongna";
    platform_user_id: string;
    password: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const { user } = useAuth();
    const [platforms, setPlatforms] = useState<ConnectedPlatformResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);
    const [showConnectForm, setShowConnectForm] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState<PlatformFormData>({
        platform_name: "bunjang",
        platform_user_id: "",
        password: "",
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [submitError, setSubmitError] = useState("");

    // Platform information
    const platformInfo = {
        bunjang: {
            name: "번개장터",
            logo: "/images/bunjang-logo.png",
            icon: "⚡",
            description: "번개장터 계정을 연결하여 상품을 통합 검색하세요",
        },
        joongna: {
            name: "중고나라",
            logo: "/images/joongna-logo.png",
            icon: "🏠",
            description: "중고나라 계정을 연결하여 상품을 통합 검색하세요",
        },
    };

    useEffect(() => {
        if (!user) {
            router.replace("/login");
            return;
        }
        fetchUserData();
    }, [user, router]);

    const fetchUserData = async () => {
        try {
            setIsLoading(true);
            console.log("연결된 플랫폼 목록 조회 시도");
            const response = await api.platforms.getConnected();
            console.log("연결된 플랫폼 목록:", response);
            setPlatforms(response);
        } catch (error: any) {
            console.error("연결된 플랫폼 조회 실패:", error);
            console.error("에러 응답:", error.response);

            if (error.response?.status === 401) {
                console.log("인증 토큰이 만료되었습니다. 로그인 페이지로 이동합니다.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.platform_user_id.trim()) {
            newErrors.platform_user_id = "플랫폼 아이디를 입력해주세요";
        }

        if (!formData.password) {
            newErrors.password = "비밀번호를 입력해주세요";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleConnect = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError("");

        if (!validateForm()) {
            return;
        }

        // Check if platform is already connected
        const isAlreadyConnected = platforms.some(
            (p) => p.platform_name === formData.platform_name,
        );
        if (isAlreadyConnected) {
            setSubmitError("이미 연결된 플랫폼입니다");
            return;
        }

        setIsConnecting(true);

        try {
            console.log("플랫폼 연결 시도:", {
                platform_name: formData.platform_name,
                platform_user_id: formData.platform_user_id,
            });

            const response = await api.platforms.connect(formData);
            console.log("플랫폼 연결 성공:", response);

            setShowConnectForm(false);
            setFormData({
                platform_name: "bunjang",
                platform_user_id: "",
                password: "",
            });
            setErrors({});
            await fetchUserData();
        } catch (error: any) {
            console.error("플랫폼 연결 에러:", error);
            console.error("에러 응답:", error.response);

            let errorMessage = "플랫폼 연결에 실패했습니다";

            if (error.response) {
                const status = error.response.status;
                const detail = error.response.data?.detail;

                console.log("HTTP 상태 코드:", status);
                console.log("에러 상세:", detail);

                if (status === 400) {
                    if (detail === "platform already connected") {
                        errorMessage = "이미 연결된 플랫폼입니다";
                    } else {
                        errorMessage = detail || "잘못된 요청입니다";
                    }
                } else if (status === 401) {
                    errorMessage = "인증이 필요합니다. 다시 로그인해주세요";
                } else if (status === 422) {
                    errorMessage = "입력한 정보를 확인해주세요";
                } else if (status >= 500) {
                    errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요";
                } else {
                    errorMessage = detail || errorMessage;
                }
            } else if (error.request) {
                console.error("네트워크 에러:", error.request);
                errorMessage = "네트워크 연결을 확인해주세요";
            } else {
                console.error("기타 에러:", error.message);
                errorMessage = "알 수 없는 오류가 발생했습니다";
            }

            setSubmitError(errorMessage);
        } finally {
            setIsConnecting(false);
        }
    };

    const handleDisconnect = async (platformName: string) => {
        if (!window.confirm("정말로 이 플랫폼 연결을 해제하시겠습니까?")) {
            return;
        }

        try {
            console.log("플랫폼 연결 해제 시도:", platformName);
            await api.platforms.disconnect(platformName);
            console.log("플랫폼 연결 해제 성공:", platformName);
            await fetchUserData();
        } catch (error: any) {
            console.error("플랫폼 연결 해제 실패:", error);
            console.error("에러 응답:", error.response);

            let errorMessage = "플랫폼 연결 해제에 실패했습니다";

            if (error.response) {
                const status = error.response.status;
                const detail = error.response.data?.detail;

                if (status === 404) {
                    errorMessage = "연결된 플랫폼을 찾을 수 없습니다";
                } else if (status === 401) {
                    errorMessage = "인증이 필요합니다. 다시 로그인해주세요";
                } else if (status >= 500) {
                    errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요";
                } else {
                    errorMessage = detail || errorMessage;
                }
            } else if (error.request) {
                errorMessage = "네트워크 연결을 확인해주세요";
            }

            alert(errorMessage);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    const getConnectedPlatformNames = () => {
        return platforms.map((p) => p.platform_name);
    };

    const getAvailablePlatforms = () => {
        const connectedNames = getConnectedPlatformNames();
        return Object.entries(platformInfo).filter(([key]) => !connectedNames.includes(key));
    };

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : (
                    <>
                        {/* Profile Header */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                                        <User className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">
                                            {user.user_id}
                                        </h1>
                                        <p className="text-gray-600">계정 ID: #{user.id}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => router.push("/settings")}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                                    >
                                        <Settings className="w-4 h-4" />
                                        <span>설정</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Connected Platforms */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        연결된 플랫폼
                                    </h2>
                                    {getAvailablePlatforms().length > 0 && (
                                        <button
                                            onClick={() => setShowConnectForm(true)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span>플랫폼 연결</span>
                                        </button>
                                    )}
                                </div>

                                {platforms.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {platforms.map((platform) => {
                                            const info =
                                                platformInfo[
                                                    platform.platform_name as keyof typeof platformInfo
                                                ];
                                            return (
                                                <div
                                                    key={platform.id}
                                                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                                                >
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-8 h-8 flex items-center justify-center">
                                                                {info?.logo ? (
                                                                    <>
                                                                        <img
                                                                            src={info.logo}
                                                                            alt={
                                                                                info.name ||
                                                                                "Platform logo"
                                                                            }
                                                                            className="w-6 h-6 object-contain"
                                                                            onError={(e) => {
                                                                                const target =
                                                                                    e.target as HTMLImageElement;
                                                                                target.style.display =
                                                                                    "none";
                                                                                const fallback =
                                                                                    target.parentElement?.querySelector(
                                                                                        ".fallback-icon",
                                                                                    ) as HTMLElement;
                                                                                if (fallback)
                                                                                    fallback.style.display =
                                                                                        "block";
                                                                            }}
                                                                        />
                                                                        <div
                                                                            className="text-2xl fallback-icon"
                                                                            style={{
                                                                                display: "none",
                                                                            }}
                                                                        >
                                                                            {info?.icon}
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <div className="text-2xl">
                                                                        {info?.icon}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h3 className="text-lg font-semibold text-gray-900">
                                                                    {info?.name ||
                                                                        platform.platform_name}
                                                                </h3>
                                                                <p className="text-sm text-gray-600">
                                                                    {platform.platform_user_id}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <span
                                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800`}
                                                            >
                                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                                연결됨
                                                            </span>
                                                            <button
                                                                onClick={() =>
                                                                    handleDisconnect(
                                                                        platform.platform_name,
                                                                    )
                                                                }
                                                                className="text-red-600 hover:text-red-700 p-1 rounded"
                                                                title="연결 해제"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-500">
                                                        {info?.description}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                                        <LinkIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            연결된 플랫폼이 없습니다
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            플랫폼을 연결하여 통합 검색을 시작하세요.
                                        </p>
                                        {getAvailablePlatforms().length > 0 && (
                                            <button
                                                onClick={() => setShowConnectForm(true)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                                <span>플랫폼 연결</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Available Platforms */}
                            {getAvailablePlatforms().length > 0 && !showConnectForm && (
                                <div className="border-t border-gray-200 p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                        연결 가능한 플랫폼
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {getAvailablePlatforms().map(([key, info]) => (
                                            <div
                                                key={key}
                                                className="bg-gray-50 rounded-lg border border-gray-200 p-6"
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 flex items-center justify-center">
                                                            {info.logo ? (
                                                                <>
                                                                    <img
                                                                        src={info.logo}
                                                                        alt={info.name}
                                                                        className="w-6 h-6 object-contain"
                                                                        onError={(e) => {
                                                                            const target =
                                                                                e.target as HTMLImageElement;
                                                                            target.style.display =
                                                                                "none";
                                                                            const fallback =
                                                                                target.parentElement?.querySelector(
                                                                                    ".fallback-icon",
                                                                                ) as HTMLElement;
                                                                            if (fallback)
                                                                                fallback.style.display =
                                                                                    "block";
                                                                        }}
                                                                    />
                                                                    <div
                                                                        className="text-2xl fallback-icon"
                                                                        style={{ display: "none" }}
                                                                    >
                                                                        {info.icon}
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="text-2xl">
                                                                    {info.icon}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-gray-900">
                                                                {info.name}
                                                            </h3>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                platform_name: key as
                                                                    | "bunjang"
                                                                    | "joongna",
                                                            }));
                                                            setShowConnectForm(true);
                                                        }}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                                    >
                                                        연결하기
                                                    </button>
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    {info.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Connect Form Modal */}
                        {showConnectForm && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                        플랫폼 연결
                                    </h2>

                                    <form onSubmit={handleConnect} className="space-y-4">
                                        {/* Submit Error */}
                                        {submitError && (
                                            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                                <div className="flex">
                                                    <AlertCircle className="h-5 w-5 text-red-400" />
                                                    <div className="ml-3">
                                                        <h3 className="text-sm font-medium text-red-800">
                                                            연결 실패
                                                        </h3>
                                                        <div className="mt-1 text-sm text-red-700">
                                                            {submitError}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Platform Selection */}
                                        <div>
                                            <label
                                                htmlFor="platform_name"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                플랫폼
                                            </label>
                                            <select
                                                id="platform_name"
                                                name="platform_name"
                                                value={formData.platform_name}
                                                onChange={handleChange}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                            >
                                                {getAvailablePlatforms().map(([key, info]) => (
                                                    <option
                                                        key={key}
                                                        value={key}
                                                        className="text-gray-900"
                                                    >
                                                        {info.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Platform User ID */}
                                        <div>
                                            <label
                                                htmlFor="platform_user_id"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                플랫폼 아이디
                                            </label>
                                            <input
                                                id="platform_user_id"
                                                name="platform_user_id"
                                                type="text"
                                                value={formData.platform_user_id}
                                                onChange={handleChange}
                                                className={`mt-1 block w-full px-3 py-2 border ${
                                                    errors.platform_user_id
                                                        ? "border-red-300"
                                                        : "border-gray-300"
                                                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                                                placeholder="플랫폼 아이디를 입력하세요"
                                            />
                                            {errors.platform_user_id && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.platform_user_id}
                                                </p>
                                            )}
                                        </div>

                                        {/* Password */}
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
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    className={`block w-full px-3 py-2 pr-10 border ${
                                                        errors.password
                                                            ? "border-red-300"
                                                            : "border-gray-300"
                                                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                                                    placeholder="플랫폼 비밀번호를 입력하세요"
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
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.password}
                                                </p>
                                            )}
                                        </div>

                                        {/* Security Notice */}
                                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                            <div className="flex">
                                                <AlertCircle className="h-5 w-5 text-blue-400" />
                                                <div className="ml-3">
                                                    <h3 className="text-sm font-medium text-blue-800">
                                                        보안 안내
                                                    </h3>
                                                    <div className="mt-1 text-sm text-blue-700">
                                                        입력하신 계정 정보는 암호화되어 안전하게
                                                        저장됩니다.
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Form Actions */}
                                        <div className="flex space-x-3 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowConnectForm(false);
                                                    setFormData({
                                                        platform_name: "bunjang",
                                                        platform_user_id: "",
                                                        password: "",
                                                    });
                                                    setErrors({});
                                                    setSubmitError("");
                                                }}
                                                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                                            >
                                                취소
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isConnecting}
                                                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {isConnecting ? (
                                                    <div className="flex items-center justify-center">
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        <span>연결 중...</span>
                                                    </div>
                                                ) : (
                                                    "연결하기"
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
