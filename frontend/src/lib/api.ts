import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Mock interceptor to simulate backend responses
api.interceptors.request.use(async (config) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // For this mock implementation, we'll return mock data for certain endpoints
    if (config.url?.includes('/menus')) {
        // In a real scenario, we would throw an error to be caught by the response interceptor
        // or use a mock adapter. For simplicity, we'll just handle it here for now.
    }

    return config;
});

// Response interceptor for auth tokens (mock)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized (redirect to login or refresh token)
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth_user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
