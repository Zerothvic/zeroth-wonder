import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true, // send httpOnly auth cookies
});

// Silent refresh-on-401, once, then bubble up if it still fails.
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true;
      try {
        await api.post("/auth/refresh");
        return api(err.config);
      } catch {
        // fall through to reject
      }
    }
    return Promise.reject(err);
  }
);