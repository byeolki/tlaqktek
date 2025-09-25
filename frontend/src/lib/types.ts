export interface User {
    id: number;
    user_id: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    user_id: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
}

export interface UserResponse {
    id: number;
    user_id: string;
}

export interface ChangePasswordRequest {
    current_password: string;
    new_password: string;
}

export interface ChangePasswordResponse {
    message: string;
}

export interface LogoutResponse {
    message: string;
}

export interface UserIdAvailabilityResponse {
    available: boolean;
    message: string;
}

export interface ConnectedPlatformCreate {
    platform_name: "bunjang" | "joongna";
    platform_user_id: string;
    password: string;
}

export interface ConnectedPlatformResponse {
    id: number;
    platform_name: string;
    platform_user_id: string;
}

export interface ItemDetail {
    item_id: string;
    platform: string;
    name: string;
    price: number;
    tags: string[];
    thumbnail?: string;
}

export interface ItemSearchResponse {
    items: ItemDetail[];
    item_count: number;
    query: string;
    platform: string;
}

export interface GetAutocompleteResponse {
    keywords: string[];
    keyword_count: number;
}

export interface SearchParams {
    query: string;
    platform?: "bunjang" | "joonggonara" | "all";
    min_price?: number;
    max_price?: number;
}

export interface ApiError {
    detail: string;
    status_code?: number;
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (credentials: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
    changePassword: (data: ChangePasswordRequest) => Promise<void>;
    isLoading: boolean;
    error: string | null;
}
