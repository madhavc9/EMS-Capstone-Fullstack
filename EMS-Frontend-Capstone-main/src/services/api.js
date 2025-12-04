import axios from "axios";

//const GATEWAY_URL = "http://localhost:9999";
//const GATEWAY_URL = "http://13.204.239.76:9999";
const GATEWAY_URL = "https://d6ibw3uir3ds9.cloudfront.net";

// EMS Backend Requests
const api = axios.create({
  baseURL: `${GATEWAY_URL}/ems`, 
});

// Experience Service Requests 
export const experienceApi = axios.create({
  baseURL: `${GATEWAY_URL}/experience`, 
});

// --- Interceptors ---
const attachToken = (config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};

api.interceptors.request.use(attachToken);
experienceApi.interceptors.request.use(attachToken);

// Handle 401 (Logout)
const handleAuthError = (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("employeeId");
    window.location.href = "/login"; 
  }
  return Promise.reject(error);
};

api.interceptors.response.use((r) => r, handleAuthError);
experienceApi.interceptors.response.use((r) => r, handleAuthError);

export default api;
