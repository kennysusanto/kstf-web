const API_URL = (import.meta.env.API_URL || import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export function getApiUrl(path) {
    return `${API_URL}${path}`;
}

export { API_URL };
