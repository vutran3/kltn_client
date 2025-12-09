import axios from "axios";

const { VITE_APP_API_URI } = import.meta.env;

const instance = axios.create({
    baseURL: VITE_APP_API_URI,
    withCredentials: false
});

function getStoredAuth() {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const userId = localStorage.getItem("userId");
    return { accessToken, refreshToken, userId };
}

instance.interceptors.request.use(
    (config) => {
        const { accessToken, refreshToken, userId } = getStoredAuth();
        if (!config.headers) config.headers = {};

        if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
        if (userId) config.headers["x-client-id"] = userId;
        if (refreshToken) config.headers["x-refresh"] = refreshToken;

        return config;
    },
    (error) => Promise.reject(error)
);

instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error?.config;

        if (!error?.response) return Promise.reject(error);

        const { status, data } = error.response;

        // Tránh loop vô hạn
        if (status === 401 && !original?._retry) {
            original._retry = true;

            const newToken = data?.data?.accessToken;
            if (newToken) {
                localStorage.setItem("accessToken", newToken);
                original.headers = {
                    ...(original.headers || {}),
                    Authorization: `Bearer ${newToken}`
                };
                return instance(original);
            }
        }

        // Nếu vẫn 401 mà không có token mới -> coi như hết phiên, logout
        if (status === 401) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("userId");

            window.location.href = "/";
        }

        return Promise.reject(error);
    }
);

export default instance;
