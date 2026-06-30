export class APIError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const getHeaders = () => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Handle token refresh
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      return null;
    }

    const data = await res.json();
    localStorage.setItem('token', data.token);
    return data.token;
  } catch (err) {
    return null;
  }
};

async function request(url: string, options: RequestInit = {}): Promise<any> {
  const headers = getHeaders();
  const config = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  };

  let response = await fetch(url, config);

  // If unauthorized, attempt refresh token flow
  if (response.status === 401 && localStorage.getItem('refreshToken')) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await refreshAccessToken();
      isRefreshing = false;
      if (newToken) {
        onRefreshed(newToken);
      } else {
        // Refresh token failed - logout user
        window.dispatchEvent(new Event('auth-logout'));
        throw new APIError('Session expired. Please log in again.', 401);
      }
    }

    // Wait for refreshing to complete and retry request
    const retryRequest = new Promise((resolve, reject) => {
      subscribeTokenRefresh((token) => {
        if (config.headers) {
          (config.headers as any)['Authorization'] = `Bearer ${token}`;
        }
        fetch(url, config)
          .then((res) => {
            if (!res.ok) {
              res.json().then(data => reject(new APIError(data.message || 'Request failed', res.status)));
            } else {
              resolve(res.json());
            }
          })
          .catch(reject);
      });
    });

    return retryRequest;
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new APIError(data.message || 'Something went wrong', response.status);
  }

  // Handle DELETE or empty body requests
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  get: (url: string) => request(url, { method: 'GET' }),
  post: (url: string, body?: any) => request(url, { method: 'POST', body: JSON.stringify(body) }),
  put: (url: string, body?: any) => request(url, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (url: string) => request(url, { method: 'DELETE' }),
};
