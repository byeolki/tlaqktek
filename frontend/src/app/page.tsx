"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, TrendingUp, Package } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import Header from "../components/Header";
import LoadingSpinner from "../components/LoadingSpinner";

export default function HomePage() {
    const router = useRouter();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

    // Fallback suggestions when API fails
    const getFallbackSuggestions = (query: string) => {
        const commonSearches = [
            "아이폰",
            "갤럭시",
            "에어팟",
            "맥북",
            "아이패드",
            "닌텐도",
            "플레이스테이션",
            "애플워치",
            "노트북",
            "카메라",
            "태블릿",
            "이어폰",
            "키보드",
            "마우스",
            "모니터",
            "스피커",
            "헤드폰",
            "충전기",
            "케이스",
            "가방",
        ];

        const filtered = commonSearches.filter(
            (item) =>
                item.toLowerCase().includes(query.toLowerCase()) ||
                query.toLowerCase().includes(item.toLowerCase()),
        );

        return filtered.slice(0, 5);
    };

    // Get autocomplete suggestions
    useEffect(() => {
        if (searchQuery.length > 1) {
            const timeoutId = setTimeout(async () => {
                try {
                    setIsLoadingSuggestions(true);
                    const response = await api.items.autocomplete(searchQuery, 5);
                    setSuggestions(response.keywords || []);
                    if (response.keywords && response.keywords.length > 0) {
                        setShowSuggestions(true);
                    }
                } catch (error) {
                    console.error("오토컴플리트 API 호출 실패:", error);
                    // Fallback: 기본 검색어 제안
                    const fallbackSuggestions = getFallbackSuggestions(searchQuery);
                    setSuggestions(fallbackSuggestions);
                    if (fallbackSuggestions.length > 0) {
                        setShowSuggestions(true);
                    }
                } finally {
                    setIsLoadingSuggestions(false);
                }
            }, 300);

            return () => clearTimeout(timeoutId);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
            setSelectedSuggestionIndex(-1);
        }
    }, [searchQuery]);

    const handleSearch = (query: string) => {
        if (query.trim()) {
            // 검색 시 검색 탭으로 이동
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch(searchQuery);
    };

    const handleSuggestionClick = (suggestion: string) => {
        setSearchQuery(suggestion);
        setShowSuggestions(false);
        handleSearch(suggestion);
    };

    const handleInputBlur = () => {
        // Delay hiding suggestions to allow clicking
        setTimeout(() => {
            setShowSuggestions(false);
            setSelectedSuggestionIndex(-1);
        }, 200);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSuggestions || suggestions.length === 0) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedSuggestionIndex((prev) =>
                    prev < suggestions.length - 1 ? prev + 1 : 0,
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedSuggestionIndex((prev) =>
                    prev > 0 ? prev - 1 : suggestions.length - 1,
                );
                break;
            case "Enter":
                e.preventDefault();
                if (selectedSuggestionIndex >= 0) {
                    handleSuggestionClick(suggestions[selectedSuggestionIndex]);
                } else {
                    handleSearch(searchQuery);
                }
                break;
            case "Escape":
                setShowSuggestions(false);
                setSelectedSuggestionIndex(-1);
                break;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* Hero Section */}
            <section className="bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
                            중고거래 통합 검색
                            <span className="block text-blue-600 mt-2">심밧다</span>
                        </h1>
                        <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
                            번개장터, 중고나라 등 여러 플랫폼의 중고거래 상품을 한번에 검색하고
                            비교하세요. 시간을 절약하고 최적의 가격으로 원하는 상품을 찾아보세요.
                        </p>

                        {/* Search Bar */}
                        <div className="mt-10 max-w-2xl mx-auto">
                            <form onSubmit={handleSubmit} className="relative">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setSelectedSuggestionIndex(-1);
                                        }}
                                        onFocus={() =>
                                            suggestions.length > 0 && setShowSuggestions(true)
                                        }
                                        onBlur={handleInputBlur}
                                        onKeyDown={handleKeyDown}
                                        placeholder="찾고 있는 상품을 검색해보세요..."
                                        className="w-full px-6 py-4 text-lg border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-gray-900"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors"
                                    >
                                        {isLoadingSuggestions ? (
                                            <LoadingSpinner size="sm" color="white" />
                                        ) : (
                                            <Search className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>

                                {/* Suggestions Dropdown */}
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                연관 검색어
                                            </span>
                                        </div>
                                        {suggestions.map((suggestion, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                className={`w-full px-6 py-3 text-left transition-colors first:rounded-t-none last:rounded-b-lg group ${
                                                    selectedSuggestionIndex === index
                                                        ? "bg-blue-100"
                                                        : "hover:bg-blue-50"
                                                }`}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <Search
                                                        className={`w-4 h-4 transition-colors ${
                                                            selectedSuggestionIndex === index
                                                                ? "text-blue-600"
                                                                : "text-gray-400 group-hover:text-blue-600"
                                                        }`}
                                                    />
                                                    <span
                                                        className={`font-medium ${
                                                            selectedSuggestionIndex === index
                                                                ? "text-blue-900"
                                                                : "text-gray-900 group-hover:text-blue-900"
                                                        }`}
                                                    >
                                                        {suggestion}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </form>

                            {/* Search Tips */}
                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-500">
                                    💡 팁: 브랜드명이나 상품명으로 검색하면 더 정확한 결과를 얻을 수
                                    있어요
                                </p>
                            </div>

                            {/* Quick Actions */}
                            {!user && (
                                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                                    <button
                                        onClick={() => router.push("/register")}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                    >
                                        무료로 시작하기
                                    </button>
                                    <button
                                        onClick={() => router.push("/login")}
                                        className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
                                    >
                                        로그인
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900">주요 기능</h2>
                        <p className="mt-4 text-lg text-gray-600">
                            효율적인 중고거래를 위한 다양한 기능을 제공합니다
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">통합 검색</h3>
                            <p className="text-gray-600">
                                여러 플랫폼의 상품을 한 번에 검색하고 비교할 수 있습니다.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <TrendingUp className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">가격 비교</h3>
                            <p className="text-gray-600">
                                동일한 상품의 다양한 가격을 비교하여 최적의 선택을 하세요.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <Package className="w-8 h-8 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                실시간 업데이트
                            </h3>
                            <p className="text-gray-600">
                                최신 상품 정보와 가격을 실시간으로 확인할 수 있습니다.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h3 className="text-2xl font-bold mb-4">심밧다</h3>
                        <p className="text-gray-400 mb-6">중고거래의 새로운 경험을 시작하세요</p>
                        <div className="text-sm text-gray-500">
                            © 2024 심밧다. All rights reserved.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
