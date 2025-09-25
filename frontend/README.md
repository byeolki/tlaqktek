# 심밧다 (Frontend)

중고거래 통합 검색 플랫폼 "심밧다"의 프론트엔드 애플리케이션입니다.

## 프로젝트 개요

심밧다는 번개장터, 중고나라 등 여러 중고거래 플랫폼의 상품을 한번에 검색하고 비교할 수 있는 통합 검색 서비스입니다.

## 주요 기능

- 🔍 **통합 검색**: 여러 플랫폼의 상품을 한번에 검색
- 🔐 **사용자 인증**: 회원가입, 로그인, 비밀번호 변경
- 🔗 **플랫폼 연결**: 번개장터, 중고나라 계정 연결 관리
- 💰 **가격 필터링**: 최소/최대 가격 범위로 검색 결과 필터링
- 📱 **반응형 디자인**: 모바일, 태블릿, 데스크톱 지원
- ⚡ **실시간 자동완성**: 검색어 입력 시 실시간 추천

## 기술 스택

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Context API

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── login/             # 로그인 페이지
│   ├── register/          # 회원가입 페이지
│   ├── search/            # 검색 결과 페이지
│   ├── platforms/         # 플랫폼 연결 관리 페이지
│   ├── profile/           # 프로필 페이지
│   ├── settings/          # 설정 페이지
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 홈페이지
├── components/            # 재사용 가능한 컴포넌트
│   ├── Header.tsx         # 네비게이션 헤더
│   └── LoadingSpinner.tsx # 로딩 스피너
├── contexts/              # React Context 프로바이더
│   └── AuthContext.tsx    # 인증 상태 관리
└── lib/                   # 유틸리티 및 타입
    ├── api.ts            # API 클라이언트
    └── types.ts          # TypeScript 타입 정의
```

## 시작하기

### 필수 요구사항

- Node.js 18+
- npm 또는 yarn
- 실행 중인 백엔드 서버 (포트 8000)

### 설치 및 실행

1. **의존성 설치**

    ```bash
    npm install
    ```

2. **환경 변수 설정**

    `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

    ```env
    NEXT_PUBLIC_API_URL=http://localhost:8000
    ```

3. **개발 서버 실행**

    ```bash
    npm run dev
    ```

    브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

### 빌드 및 배포

1. **프로덕션 빌드**

    ```bash
    npm run build
    ```

2. **프로덕션 서버 실행**
    ```bash
    npm start
    ```

## 주요 페이지

### 🏠 홈페이지 (`/`)

- 서비스 소개 및 주요 기능 안내
- 통합 검색 바 및 자동완성 기능
- 지원 플랫폼 소개

### 🔐 인증 페이지

- **로그인** (`/login`): 사용자 로그인
- **회원가입** (`/register`): 새 계정 생성 및 유효성 검사

### 🔍 검색 페이지 (`/search`)

- 통합 상품 검색 결과 표시
- 플랫폼별, 가격대별 필터링
- 그리드/리스트 뷰 전환

### 🔗 플랫폼 관리 (`/platforms`)

- 중고거래 플랫폼 계정 연결
- 연결된 플랫폼 관리 및 해제

### 👤 사용자 페이지

- **프로필** (`/profile`): 사용자 정보 및 통계
- **설정** (`/settings`): 비밀번호 변경 및 계정 설정

## API 통신

### 인증

- 로그인, 회원가입, 비밀번호 변경, 로그아웃
- JWT 토큰 기반 인증
- 자동 토큰 만료 처리

### 플랫폼 관리

- 플랫폼 계정 연결/해제
- 연결된 플랫폼 목록 조회

### 상품 검색

- 통합 검색 및 자동완성
- 플랫폼별, 가격대별 필터링

## 스타일링

Tailwind CSS를 사용하여 현대적이고 반응형 UI를 구현했습니다:

- **컬러 팔레트**: 블루 계열 주색상
- **컴포넌트**: 일관된 디자인 시스템
- **반응형**: 모바일 퍼스트 접근
- **다크 모드**: 지원 예정

## 상태 관리

React Context API를 사용한 간단하고 효율적인 상태 관리:

- **AuthContext**: 사용자 인증 상태
- **로컬 스토리지**: JWT 토큰 저장
- **에러 핸들링**: 전역 에러 처리

## 개발 가이드

### 코드 스타일

- TypeScript strict 모드
- ESLint 및 Prettier 설정
- 함수형 컴포넌트 및 React Hooks 사용

### 컴포넌트 작성

```tsx
"use client";

import React from "react";

interface ComponentProps {
    // 타입 정의
}

const Component: React.FC<ComponentProps> = ({ prop }) => {
    return <div className="tailwind-classes">{/* JSX */}</div>;
};

export default Component;
```

### API 호출

```tsx
import { api } from "../lib/api";

// 컴포넌트 내에서
const handleSubmit = async () => {
    try {
        const response = await api.items.search(params);
        // 성공 처리
    } catch (error) {
        // 에러 처리
    }
};
```

## 환경 변수

| 변수명                | 설명           | 기본값                  |
| --------------------- | -------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL` | 백엔드 API URL | `http://localhost:8000` |

## 브라우저 지원

- Chrome (최신)
- Firefox (최신)
- Safari (최신)
- Edge (최신)

## 성능 최적화

- Next.js App Router 사용
- 컴포넌트 지연 로딩
- 이미지 최적화
- 번들 사이즈 최적화

## 보안

- XSS 방지
- CSRF 보호
- 안전한 토큰 저장
- 민감한 데이터 암호화

## 향후 계획

- [ ] PWA 지원
- [ ] 다크 모드
- [ ] 알림 시스템
- [ ] 상품 즐겨찾기
- [ ] 검색 히스토리
- [ ] 소셜 로그인
- [ ] 모바일 앱

## 문의 및 지원

프로젝트에 대한 문의사항이나 버그 리포트는 GitHub Issues를 통해 제출해주세요.

---

© 2024 심밧다. All rights reserved.
