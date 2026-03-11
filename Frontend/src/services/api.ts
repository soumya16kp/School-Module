import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
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
  }
};
