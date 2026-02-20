import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        const userData = localStorage.getItem('user_data');
        let isFacilityAdmin = false;
        if (userData) {
            try {
                const parsed = JSON.parse(userData);
                const role = (parsed?.role ?? '').toString().toUpperCase();
                isFacilityAdmin = role === 'FACILITY_ADMIN' || role === 'FACILITY ADMIN';
            } catch { }
        }
        const organizationId = localStorage.getItem('selected_organization_id');
        const facilityId = localStorage.getItem('selected_facility_id');
        if (organizationId) config.headers['x-organization-id'] = organizationId;
        if (facilityId) config.headers['x-facility-id'] = facilityId;

        return config;
    },
    (error) => Promise.reject(error),
);

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
                    localStorage.removeItem('user_data');
                    window.location.href = '/auth/login';
                    return Promise.reject(refreshError);
                }
            } else {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user_data');
                window.location.href = '/auth/login';
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    },
);

export default api;
