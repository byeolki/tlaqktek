import { useState } from "react";

interface SearchAppProps {
    items: any[];
    loading: boolean;
    onSearch: (params: {
        query: string;
        platform: string;
        min_price?: string;
        max_price?: string;
    }) => void;
    isAuthenticated: boolean;
}

export default function SearchApp({ items, loading, onSearch, isAuthenticated }: SearchAppProps) {
    const [query, setQuery] = useState("");
    const [platform, setPlatform] = useState("all");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch({
            query,
            platform,
            min_price: minPrice,
            max_price: maxPrice,
        });
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">상품 검색</h1>

            {!isAuthenticated && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                    로그인이 필요합니다.
                </div>
            )}

            <form onSubmit={handleSubmit} className="mb-6 space-y-4">
                <div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="검색할 상품명을 입력하세요"
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div className="flex gap-4">
                    <select
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        className="p-2 border rounded"
                    >
                        <option value="all">모든 플랫폼</option>
                        <option value="coupang">쿠팡</option>
                        <option value="11st">11번가</option>
                    </select>

                    <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="최소 가격"
                        className="p-2 border rounded"
                    />

                    <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="최대 가격"
                        className="p-2 border rounded"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || !isAuthenticated}
                    className="bg-blue-500 text-white p-2 rounded disabled:bg-gray-400"
                >
                    {loading ? "검색 중..." : "검색"}
                </button>
            </form>

            {/* Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item, index) => (
                    <div key={index} className="border rounded p-4">
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-lg text-blue-600">{item.price}</p>
                        <p className="text-sm text-gray-500">{item.platform}</p>
                        {item.url && (
                            <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                            >
                                상품 보기
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
