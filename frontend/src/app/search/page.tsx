"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
    Search,
    Filter,
    Grid,
    List,
    SortAsc,
    SortDesc,
    Loader2,
    Home,
    ArrowLeft,
    Image as ImageIcon,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../lib/api";
import { ItemDetail, SearchParams } from "../../lib/types";
import Header from "../../components/Header";
import LoadingSpinner from "../../components/LoadingSpinner";

interface SearchFilters {
    platform: "all" | "bunjang" | "joonggonara";
    minPrice: string;
    maxPrice: string;
    sortBy: "price_asc" | "price_desc" | "name_asc" | "name_desc";
}

function SearchPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<ItemDetail[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [totalCount, setTotalCount] = useState(0);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<SearchFilters>({
        platform: "all",
        minPrice: "",
        maxPrice: "",
        sortBy: "price_asc",
    });

    // Initialize search query from URL params
    useEffect(() => {
        const query = searchParams.get("q");
        if (query) {
            setSearchQuery(query);
            performSearch(query, filters);
        }
    }, [searchParams]);

    const performSearch = async (query: string, searchFilters: SearchFilters) => {
        if (!query.trim()) return;

        setIsLoading(true);
        setError("");

        try {
            const params: SearchParams = {
                query: query.trim(),
                platform: searchFilters.platform,
            };

            if (searchFilters.minPrice) {
                params.min_price = parseInt(searchFilters.minPrice);
            }
            if (searchFilters.maxPrice) {
                params.max_price = parseInt(searchFilters.maxPrice);
            }

            const response = await api.items.search(params);

            let sortedResults = [...response.items];

            // Sort results
            switch (searchFilters.sortBy) {
                case "price_asc":
                    sortedResults.sort((a, b) => a.price - b.price);
                    break;
                case "price_desc":
                    sortedResults.sort((a, b) => b.price - a.price);
                    break;
                case "name_asc":
                    sortedResults.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case "name_desc":
                    sortedResults.sort((a, b) => b.name.localeCompare(a.name));
                    break;
            }

            setResults(sortedResults);
            setTotalCount(response.item_count);
        } catch (err: any) {
            setError(err.response?.data?.detail || "검색 중 오류가 발생했습니다");
            setResults([]);
            setTotalCount(0);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        performSearch(searchQuery, filters);
        // Update URL with search query
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    };

    const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
        const updatedFilters = { ...filters, ...newFilters };
        setFilters(updatedFilters);
        if (searchQuery) {
            performSearch(searchQuery, updatedFilters);
        }
    };

    const getPlatformBadge = (platform: string) => {
        const badges = {
            bunjang: {
                name: "번개장터",
                logo: "/images/bunjang-logo.png",
                fallbackIcon: "⚡",
                color: "bg-yellow-100 text-yellow-800",
            },
            joongna: {
                name: "중고나라",
                logo: "/images/joongna-logo.png",
                fallbackIcon: "🏠",
                color: "bg-green-100 text-green-800",
            },
            joonggonara: {
                name: "중고나라",
                logo: "/images/joongna-logo.png",
                fallbackIcon: "🏠",
                color: "bg-green-100 text-green-800",
            },
        };

        return (
            badges[platform as keyof typeof badges] || {
                name: platform,
                color: "bg-gray-100 text-gray-800",
                logo: undefined,
                fallbackIcon: "📦",
            }
        );
    };

    const handleItemClick = (item: ItemDetail) => {
        const platformUrls = {
            bunjang: `https://m.bunjang.co.kr/products/${item.item_id}`,
            joonggonara: `https://web.joongna.com/product/${item.item_id}`,
        };

        const url = platformUrls[item.platform as keyof typeof platformUrls];
        if (url) {
            window.open(url, "_blank");
        }
    };

    const formatPrice = (price: number) => {
        return price.toLocaleString() + "원";
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back to Home Button */}
                <div className="mb-4">
                    <button
                        onClick={() => router.push("/")}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>홈으로 돌아가기</span>
                    </button>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="상품을 검색하세요..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isLoading ? (
                                <LoadingSpinner size="sm" color="white" />
                            ) : (
                                <Search className="w-5 h-5" />
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            className="border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-3 rounded-lg transition-colors"
                        >
                            <Filter className="w-5 h-5" />
                        </button>
                    </form>

                    {/* Filters */}
                    {showFilters && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* Platform Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        플랫폼
                                    </label>
                                    <select
                                        value={filters.platform}
                                        onChange={(e) =>
                                            handleFilterChange({
                                                platform: e.target
                                                    .value as SearchFilters["platform"],
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">전체</option>
                                        <option value="bunjang">번개장터</option>
                                        <option value="joonggonara">중고나라</option>
                                    </select>
                                </div>

                                {/* Min Price */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        최소 가격
                                    </label>
                                    <input
                                        type="number"
                                        value={filters.minPrice}
                                        onChange={(e) =>
                                            handleFilterChange({ minPrice: e.target.value })
                                        }
                                        placeholder="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Max Price */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        최대 가격
                                    </label>
                                    <input
                                        type="number"
                                        value={filters.maxPrice}
                                        onChange={(e) =>
                                            handleFilterChange({ maxPrice: e.target.value })
                                        }
                                        placeholder="무제한"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Sort By */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        정렬
                                    </label>
                                    <select
                                        value={filters.sortBy}
                                        onChange={(e) =>
                                            handleFilterChange({
                                                sortBy: e.target.value as SearchFilters["sortBy"],
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="price_asc">가격 낮은순</option>
                                        <option value="price_desc">가격 높은순</option>
                                        <option value="name_asc">이름순 (가나다)</option>
                                        <option value="name_desc">이름순 (역순)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Header */}
                {results.length > 0 && (
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                            검색 결과 ({totalCount.toLocaleString()}개)
                        </h2>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 rounded-md transition-colors ${
                                    viewMode === "grid"
                                        ? "bg-blue-100 text-blue-600"
                                        : "text-gray-400 hover:text-gray-600"
                                }`}
                            >
                                <Grid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-2 rounded-md transition-colors ${
                                    viewMode === "list"
                                        ? "bg-blue-100 text-blue-600"
                                        : "text-gray-400 hover:text-gray-600"
                                }`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Results */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : results.length > 0 ? (
                    <div
                        className={
                            viewMode === "grid"
                                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                                : "space-y-4"
                        }
                    >
                        {results.map((item) => {
                            const badge = getPlatformBadge(item.platform);

                            if (viewMode === "list") {
                                return (
                                    <div
                                        key={item.item_id}
                                        onClick={() => handleItemClick(item)}
                                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                                    >
                                        <div className="flex gap-4">
                                            {/* Thumbnail */}
                                            <div className="flex-shrink-0 relative">
                                                {item.thumbnail ? (
                                                    <div className="relative w-24 h-24">
                                                        <img
                                                            src={item.thumbnail}
                                                            alt={item.name}
                                                            className="w-24 h-24 object-cover rounded-lg"
                                                            onError={(e) => {
                                                                const target =
                                                                    e.target as HTMLImageElement;
                                                                target.style.display = "none";
                                                                const fallback =
                                                                    target.nextElementSibling as HTMLElement;
                                                                if (fallback)
                                                                    fallback.classList.remove(
                                                                        "hidden",
                                                                    );
                                                            }}
                                                        />
                                                        <div className="hidden w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center absolute inset-0">
                                                            <ImageIcon className="w-6 h-6 text-gray-400" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                                                        <ImageIcon className="w-6 h-6 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}
                                                    >
                                                        {badge.logo ? (
                                                            <>
                                                                <img
                                                                    src={badge.logo}
                                                                    alt={badge.name}
                                                                    className="w-4 h-4 mr-1 object-contain"
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
                                                                                "inline";
                                                                    }}
                                                                />
                                                                <span
                                                                    className="mr-1 fallback-icon"
                                                                    style={{ display: "none" }}
                                                                >
                                                                    {badge.fallbackIcon}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="mr-1">
                                                                {badge.fallbackIcon}
                                                            </span>
                                                        )}
                                                        {badge.name}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
                                                    {item.name}
                                                </h3>
                                                <p className="text-xl font-bold text-gray-900">
                                                    {formatPrice(item.price)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            // Grid view
                            return (
                                <div
                                    key={item.item_id}
                                    onClick={() => handleItemClick(item)}
                                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                                >
                                    {/* Thumbnail */}
                                    <div className="aspect-square relative">
                                        {item.thumbnail ? (
                                            <>
                                                <img
                                                    src={item.thumbnail}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = "none";
                                                        const fallback =
                                                            target.nextElementSibling as HTMLElement;
                                                        if (fallback)
                                                            fallback.classList.remove("hidden");
                                                    }}
                                                />
                                                <div className="hidden w-full h-full bg-gray-200 flex items-center justify-center absolute inset-0">
                                                    <ImageIcon className="w-12 h-12 text-gray-400" />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                <ImageIcon className="w-12 h-12 text-gray-400" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <span
                                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}
                                            >
                                                {badge.logo ? (
                                                    <>
                                                        <img
                                                            src={badge.logo}
                                                            alt={badge.name}
                                                            className="w-3 h-3 mr-1 object-contain"
                                                            onError={(e) => {
                                                                const target =
                                                                    e.target as HTMLImageElement;
                                                                target.style.display = "none";
                                                                const fallback =
                                                                    target.parentElement?.querySelector(
                                                                        ".fallback-icon",
                                                                    ) as HTMLElement;
                                                                if (fallback)
                                                                    fallback.style.display =
                                                                        "inline";
                                                            }}
                                                        />
                                                        <span
                                                            className="mr-1 fallback-icon"
                                                            style={{ display: "none" }}
                                                        >
                                                            {badge.fallbackIcon}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="mr-1">
                                                        {badge.fallbackIcon}
                                                    </span>
                                                )}
                                                {badge.name}
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                                            {item.name}
                                        </h3>
                                        <p className="text-lg font-bold text-gray-900">
                                            {formatPrice(item.price)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : searchQuery && !isLoading ? (
                    <div className="text-center py-20">
                        <div className="max-w-md mx-auto">
                            <div className="mb-4">
                                <Search className="w-16 h-16 text-gray-400 mx-auto" />
                            </div>
                            <h3 className="text-xl font-medium text-gray-900 mb-2">
                                검색 결과가 없습니다
                            </h3>
                            <p className="text-gray-600">
                                다른 키워드로 검색해보거나 필터를 조정해보세요.
                            </p>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<LoadingSpinner size="lg" />}>
            <SearchPageContent />
        </Suspense>
    );
}
