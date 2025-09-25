"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PlatformsPage() {
    const router = useRouter();

    useEffect(() => {
        // 플랫폼 관리 기능이 프로필 페이지로 이동됨
        router.replace("/profile");
    }, [router]);

    return null;
}
