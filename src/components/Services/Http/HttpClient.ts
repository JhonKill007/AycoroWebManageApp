import axios from "axios";
import {
  endManageSession,
  isManageSessionEnding,
} from "../../auth/manageSession";

const API_URL = process.env.REACT_APP_MANAGE_API_URL || "https://manage.api.aycoro.com";

const Http = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const excludedRoutes = ["/auth/login", "/auth/register", "/api/auth"];
const sessionExemptPaths = ["/api/auth/logout", "/api/auth/heartbeat"];

const isExcludedAuthRoute = (url?: string) => {
  const value = String(url || "");
  if (value.endsWith("/api/auth") || value.endsWith("/api/auth/")) {
    return true;
  }
  return excludedRoutes.some((route) => value.includes(route) && !value.includes("/api/auth/"));
};

const isSessionExempt = (url?: string) =>
  sessionExemptPaths.some((path) => String(url || "").includes(path));

Http.interceptors.request.use(
  async (config) => {
    if (isExcludedAuthRoute(config.url)) {
      return config;
    }

    const token = localStorage.getItem("internalToken");
    if (token) {
      config.headers!.Authorization = `Bearer ${token}`;
    }

    const aycoroToken = localStorage.getItem("aycoroAuthToken");
    if (aycoroToken && !config.headers?.["X-Aycoro-Token"]) {
      config.headers!["X-Aycoro-Token"] = aycoroToken;
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
    const status = error.response?.status;
    const url = error.config?.url;

    if (
      status === 401 &&
      !isSessionExempt(url) &&
      !isExcludedAuthRoute(url) &&
      !isManageSessionEnding()
    ) {
      endManageSession();
    }

    return Promise.reject(error);
  },
);

export default Http;
