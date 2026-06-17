import axios from "axios";

// const API_URL = "https://api.aycoro.com";
const API_URL = "http://localhost:4000";

const Http = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const excludedRoutes = ["/auth/login", "/auth/register"];
// Interceptor para agregar el token de autenticación
Http.interceptors.request.use(
  async (config) => {
    if (excludedRoutes.some((route) => config.url?.includes(route))) {
      return config;
    }
    
    const token = localStorage.getItem("internalToken");
    
    if (token) {
      config.headers!.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

Http.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      console.log("Error en el interceptor: ", error.response?.status);
      const token = localStorage.getItem("refreshToken");
      localStorage.removeItem("Us-Ac");
      // window.location.href = "/login";
    }
    if (error.response?.status === 500) {
      console.log(error.response);
    }
    return Promise.reject(error);
  },
);

export default Http;
