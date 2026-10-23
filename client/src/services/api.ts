const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  '/api/v1'
).replace(/\/$/, '');

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('campusconnect_token');

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg) as any;
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get: <T = any>(endpoint: string) => apiRequest<T>(endpoint, { method: 'GET' }),
  post: <T = any>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: <T = any>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: <T = any>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: <T = any>(endpoint: string) => apiRequest<T>(endpoint, { method: 'DELETE' }),
};
