import axios from 'axios';

const api = axios.create({
  // Default to local backend if VITE_BACKEND_URL is not set
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
    const response = await api.post(`/health/${childId}`, data);
    return response.data;
  }
};

export const eventService = {
  getAll: async (academicYear?: string) => {
    const response = await api.get('/events', { params: academicYear ? { academicYear } : {} });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/events', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.patch(`/events/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/events/${id}`);
  }
};

export const ambassadorService = {
  getAll: async (type?: string) => {
    const response = await api.get('/ambassadors', { params: type ? { type } : {} });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/ambassadors/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/ambassadors', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.patch(`/ambassadors/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/ambassadors/${id}`);
  }
};

export const dashboardService = {
  getOverview: async (academicYear?: string) => {
    const response = await api.get('/dashboard/overview', { params: academicYear ? { academicYear } : {} });
    return response.data;
  },
  getDistrictOverview: async (academicYear?: string) => {
    const response = await api.get('/dashboard/district-overview', { params: academicYear ? { academicYear } : {} });
    return response.data;
  }
};

export const certificationService = {
  getAll: async (academicYear?: string) => {
    const response = await api.get('/certifications', { params: academicYear ? { academicYear } : {} });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/certifications/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/certifications', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.patch(`/certifications/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/certifications/${id}`);
  }
};
