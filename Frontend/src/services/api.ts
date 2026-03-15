import axios from 'axios';

const api = axios.create({
  // Default to local backend if VITE_BACKEND_URL is not set
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api',
});

// Add token to requests (skip for unauthenticated auth login routes)
api.interceptors.request.use((config) => {
  const url = config.url ?? '';
  const isAuthLogin = url === '/auth/send-otp' || url === '/auth/verify-otp' || url === '/auth/register';
  if (isAuthLogin) {
    return config; // no Bearer for login/register
  }
  const isParentRoute = url.startsWith('/parent');
  const token = isParentRoute
    ? localStorage.getItem('parent_token')
    : localStorage.getItem('school_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 (school API): clear token and redirect to login so session expiry is handled
// Skip for auth login endpoints so user sees "Invalid email/password" or "Invalid OTP" on the form
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url ?? '';
    const isAuthLogin = url === '/auth/send-otp' || url === '/auth/verify-otp';
    if (err.response?.status === 401 && !err.config?.url?.startsWith('/parent') && !isAuthLogin) {
      localStorage.removeItem('school_token');
      localStorage.removeItem('school_user');
      if (window.location.pathname !== '/' && !window.location.pathname.startsWith('/parent')) {
        window.location.href = '/';
      }
    }
    return Promise.reject(err);
  }
);

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
  /** Step 1: verify email+password and trigger OTP email */
  sendLoginOtp: async (email: string, password: string) => {
    const response = await api.post('/auth/send-otp', { email, password });
    return response.data; // { sent: true, devOtp?: string }
  },
  /** Step 2: verify OTP and receive JWT */
  verifyLoginOtp: async (email: string, code: string) => {
    const response = await api.post('/auth/verify-otp', { email, code });
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
  },
  exportReport: async (params: { format: 'csv' | 'pdf'; academicYear?: string; class?: number; section?: string; domain?: string }) => {
    const token = localStorage.getItem('school_token');
    const base = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';
    const qs = new URLSearchParams({ format: params.format, ...(params.academicYear && { academicYear: params.academicYear }), ...(params.class != null && { class: String(params.class) }), ...(params.section && { section: params.section }), ...(params.domain && { domain: params.domain }) });
    const url = `${base}/dashboard/export?${qs}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(await res.text());
    const blob = await res.blob();
    const ext = params.format === 'pdf' ? 'pdf' : 'csv';
    const filename = `health-report-${params.academicYear || 'all'}.${ext}`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
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

export const parentService = {
  sendOtp: async (phone: string) => {
    const response = await api.post('/parent/send-otp', { phone });
    return response.data;
  },
  verifyOtp: async (phone: string, code: string) => {
    const response = await api.post('/parent/verify-otp', { phone, code });
    if (response.data.token) {
      localStorage.setItem('parent_token', response.data.token);
      localStorage.setItem('parent_info', JSON.stringify(response.data.parent));
    }
    return response.data;
  },
  login: async (phone: string) => {
    const response = await api.post('/parent/login', { phone });
    if (response.data.token) {
      localStorage.setItem('parent_token', response.data.token);
      localStorage.setItem('parent_info', JSON.stringify(response.data.parent));
    }
    return response.data;
  },
  getChildren: async () => {
    const response = await api.get('/parent/children');
    return response.data;
  },
  getChildDashboard: async (id: number) => {
    const response = await api.get(`/parent/children/${id}`);
    return response.data;
  },
  getCardToken: async (childId: number) => {
    const response = await api.post(`/parent/card-token/${childId}`);
    return response.data.token as string;
  },
  getAccessHistory: async (childId: number) => {
    const response = await api.get(`/parent/children/${childId}/access-history`);
    return response.data.entries as { id: number; action: string; actorType: string; description: string; createdAt: string }[];
  },
  logout: () => {
    localStorage.removeItem('parent_token');
    localStorage.removeItem('parent_info');
  }
};

export const cardService = {
  ensureToken: async (childId: number) => {
    const response = await api.post(`/card/ensure/${childId}`);
    return response.data.token as string;
  },
  getByToken: async (token: string) => {
    const response = await api.get(`/card/${token}`);
    return response.data;
  },
  exportBulk: async (params?: { class?: number; section?: string }) => {
    const token = localStorage.getItem('school_token');
    const base = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';
    const origin = window.location.origin;
    const qs = new URLSearchParams({ baseUrl: origin });
    if (params?.class != null) qs.set('class', String(params.class));
    if (params?.section) qs.set('section', params.section);
    const res = await fetch(`${base}/card/bulk?${qs}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(await res.text());
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'id-cards-bulk.pdf';
    a.click();
    URL.revokeObjectURL(a.href);
  }
};

export const partnerService = {
  getDonations: async () => {
    const response = await api.get('/partner/donations');
    return response.data;
  },
  sponsor: async (data: any) => {
    const response = await api.post('/partner/sponsor', data);
    return response.data;
  },
  getSchools: async () => {
    const response = await api.get('/partner/schools');
    return response.data;
  },
  getSchoolStats: async (schoolId: number) => {
    const response = await api.get(`/partner/schools/${schoolId}/stats`);
    return response.data;
  },
  createOrder: async (amount: number) => {
    const response = await api.post('/partner/create-order', { amount });
    return response.data;
  }
};

export const staffService = {
  list: async () => {
    const response = await api.get('/staff');
    return response.data;
  },
  add: async (data: any) => {
    const response = await api.post('/staff', data);
    return response.data;
  },
  update: async (id: number, data: { name?: string; phone?: string; role?: string; assignedClass?: string; assignedSection?: string }) => {
    const response = await api.patch(`/staff/${id}`, data);
    return response.data;
  },
  remove: async (id: number) => {
    await api.delete(`/staff/${id}`);
  }
};
