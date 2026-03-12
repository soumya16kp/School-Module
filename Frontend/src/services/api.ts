import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api',
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('school_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const schoolService = {
  register: async (data: any) => {
    const response = await api.post('/schools/register', data);
    return response.data;
  },
  getMySchool: async () => {
    const response = await api.get('/schools/my-school');
    return response.data;
  },
  getAll: async () => {
    const response = await api.get('/schools/all');
    return response.data;
  }
};

export const authService = {
  login: async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('school_token', response.data.token);
      localStorage.setItem('school_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  register: async (data: any) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('school_token');
    localStorage.removeItem('school_user');
  }
};

export const childService = {
  create: async (data: any) => {
    const response = await api.post('/children', data);
    return response.data;
  },
  getAll: async (search?: string) => {
    const response = await api.get('/children', { params: { search } });
    return response.data;
  },
  updateStatus: async (id: number, status: string) => {
    const response = await api.patch(`/children/${id}/status`, { status });
    return response.data;
  },
  getById: async (id: number) => {
    // Assuming backend returns child details, let's create a getById in childRoutes too if not exists. Wait, child details can just be passed via state or fetched.
    const response = await api.get(`/children/${id}`); // We will make sure this exists in backend
    return response.data;
  }
};

export const healthService = {
  getRecords: async (childId: number) => {
    const response = await api.get(`/health/${childId}`);
    return response.data;
  },
  addRecord: async (childId: number, data: any) => {
    // If data is FormData, headers will be handled by axios automatically
    const response = await api.post(`/health/${childId}`, data);
    return response.data;
  }
};
