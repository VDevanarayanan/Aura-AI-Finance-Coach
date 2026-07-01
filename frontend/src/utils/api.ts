const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  // Add authentication token if available
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Set default Content-Type to JSON if sending a body
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Build URL with query parameters
  let url = `${API_BASE_URL}${endpoint}`;
  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, val);
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'An error occurred during request.';
    try {
      const errJson = await response.json();
      errorMsg = errJson.error || errorMsg;
    } catch (e) {
      // Response was not JSON
    }
    throw new Error(errorMsg);
  }

  // Return empty object for 204 or empty content
  if (response.status === 204) {
    return {} as T;
  }

  try {
    return await response.json();
  } catch (e) {
    return {} as T;
  }
};
