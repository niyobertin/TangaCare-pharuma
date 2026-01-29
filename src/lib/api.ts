import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add tokens and tenant context
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        const organizationId = localStorage.getItem('selected_organization_id');
        const facilityId = localStorage.getItem('selected_facility_id');
        if (organizationId) config.headers['x-organization-id'] = organizationId;
        if (facilityId) config.headers['x-tenant-id'] = facilityId;
        return config;
    },
    (error) => Promise.reject(error),
);

// Response interceptor for token refresh or error handling
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh_token');

            if (refreshToken) {
                try {
                    const response = await axios.post(
                        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/auth/refresh-token`,
                        {
                            refreshToken,
                        },
                    );

                    const { accessToken } = response.data.data.tokens;
                    localStorage.setItem('access_token', accessToken);

                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }
        }

        return Promise.reject(error);
    },
);

export default api;
