import axios, { AxiosResponse, AxiosError } from "axios";
import {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    UserResponse,
    ChangePasswordRequest,
    ChangePasswordResponse,
    LogoutResponse,
    ConnectedPlatformCreate,
    ConnectedPlatformResponse,
    ItemSearchResponse,
    GetAutocompleteResponse,
    SearchParams,
    UserIdAvailabilityResponse,
} from "./types";

const API_BASE_URL = "http://localhost:8000";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("access_token");
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Response interceptor to handle errors
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            if (typeof window !== "undefined") {
                localStorage.removeItem("access_token");
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    },
);

export const api = {
    // Auth endpoints
    auth: {
        checkUserId: async (userId: string): Promise<UserIdAvailabilityResponse> => {
            const response: AxiosResponse<UserIdAvailabilityResponse> = await apiClient.get(
                `/auth/check/${encodeURIComponent(userId)}`,
            );
            return response.data;
        },

        login: async (credentials: LoginRequest): Promise<LoginResponse> => {
            // FastAPI OAuth2PasswordRequestForm expects form data
            const formData = new FormData();
            formData.append("username", credentials.username);
            formData.append("password", credentials.password);

            const response: AxiosResponse<LoginResponse> = await apiClient.post(
                "/auth/login",
                formData,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                },
            );
            return response.data;
        },

        register: async (data: RegisterRequest): Promise<UserResponse> => {
            const response: AxiosResponse<UserResponse> = await apiClient.post(
                "/auth/register",
                data,
            );
            return response.data;
        },

        changePassword: async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
            const response: AxiosResponse<ChangePasswordResponse> = await apiClient.post(
                "/auth/change-password",
                data,
            );
            return response.data;
        },

        logout: async (): Promise<LogoutResponse> => {
            const response: AxiosResponse<LogoutResponse> = await apiClient.post("/auth/logout");
            return response.data;
        },
    },

    // Users endpoints
    users: {
        getMe: async (): Promise<UserResponse> => {
            const response: AxiosResponse<UserResponse> = await apiClient.get("/users/me");
            return response.data;
        },
    },

    // Platforms endpoints
    platforms: {
        connect: async (data: ConnectedPlatformCreate): Promise<ConnectedPlatformResponse> => {
            const response: AxiosResponse<ConnectedPlatformResponse> = await apiClient.post(
                "/platforms/connect",
                data,
            );
            return response.data;
        },

        getConnected: async (): Promise<ConnectedPlatformResponse[]> => {
            const response: AxiosResponse<ConnectedPlatformResponse[]> =
                await apiClient.get("/platforms/");
            return response.data;
        },

        disconnect: async (platformName: string): Promise<{ message: string }> => {
            const response: AxiosResponse<{ message: string }> = await apiClient.delete(
                `/platforms/${platformName}`,
            );
            return response.data;
        },
    },

    // Items endpoints
    items: {
        search: async (params: SearchParams): Promise<ItemSearchResponse> => {
            const response: AxiosResponse<ItemSearchResponse> = await apiClient.get(
                "/items/search",
                { params },
            );
            return response.data;
        },

        autocomplete: async (
            query: string,
            limit: number = 10,
        ): Promise<GetAutocompleteResponse> => {
            const response: AxiosResponse<GetAutocompleteResponse> = await apiClient.get(
                "/items/autocomplete",
                {
                    params: { query, limit },
                },
            );
            return response.data;
        },
    },

    // Health check
    health: async (): Promise<{ message: string }> => {
        const response: AxiosResponse<{ message: string }> = await apiClient.get("/");
        return response.data;
    },
};

export default api;
