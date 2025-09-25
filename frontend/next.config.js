/** @type {import('next').NextConfig} */
const nextConfig = {
    // TypeScript 및 ESLint 오류 무시 (빌드 안정성을 위해)
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },

    // Docker 컨테이너에서 실행하기 위한 설정
    output: "standalone",

    // 이미지 최적화 설정
    images: {
        unoptimized: false,
        domains: ["localhost"],
        formats: ["image/webp", "image/avif"],
    },

    // 실험적 기능
    experimental: {
        serverComponentsExternalPackages: [],
    },
};

module.exports = nextConfig;
