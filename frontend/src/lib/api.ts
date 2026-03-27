import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://hotel-menu-m7rd.onrender.com/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token && token !== 'undefined' && token !== 'null') {
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${token}`;

            // Helpful debug log for the user to see in browser console
            if (process.env.NODE_ENV === 'development') {
                console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
                    auth: 'Bearer ' + token.substring(0, 10) + '...'
                });
            }
        } else {
            console.warn('[API Request] No valid token found in localStorage');
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Response interceptor for auth tokens and errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login') && !originalRequest.url.includes('/auth/refresh')) {

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers['Authorization'] = 'Bearer ' + token;
                        return api(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                isRefreshing = false;
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                console.log('Refreshing token...');
                // Use a separate axios instance or a direct call to avoid interceptor loop if needed
                // But since originalRequest._retry is set, it might be fine
                const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refresh_token: refreshToken });
                const { token } = response.data.data;

                localStorage.setItem('token', token);
                api.defaults.headers.common['Authorization'] = 'Bearer ' + token;
                originalRequest.headers['Authorization'] = 'Bearer ' + token;

                processQueue(null, token);
                isRefreshing = false;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;
                console.error('Refresh token expired or invalid');
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        console.error('API Response Interceptor - Error:', {
            status: error.response?.status,
            url: error.config?.url,
            method: error.config?.method,
            data: error.response?.data
        });

        return Promise.reject(error);
    }
);

export default api;

export interface FetchSafeResult<T> {
    data: T | null;
    error: string | null;
    status: number;
}

/**
 * A wrapper for API calls that gracefully handles errors and returns a consistent result object.
 * Useful for preventing UI crashes and providing specific error feedback.
 */
export const fetchSafe = async <T>(fn: () => Promise<{ data: any }>): Promise<FetchSafeResult<T>> => {
    try {
        const response = await fn();
        // The API standard seems to be { status, message, data }
        return {
            data: response.data?.data ?? null,
            error: null,
            status: response.data?.status || 200
        };
    } catch (error: any) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || error.message || 'An unexpected error occurred';

        console.warn(`[API fetchSafe] Failed (${status}):`, message);

        return {
            data: null,
            error: message,
            status: status
        };
    }
};
