import type { Metadata } from "next";
import { AuthProvider } from "../contexts/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
    title: "심밧다 - 중고거래 통합 검색",
    description: "번개장터, 중고나라 등 여러 플랫폼의 중고거래 상품을 한번에 검색하세요",
    keywords: ["중고거래", "번개장터", "중고나라", "통합검색", "중고상품"],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko">
            <body className="antialiased">
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
}
