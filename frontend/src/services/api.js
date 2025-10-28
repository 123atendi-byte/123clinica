import axios from 'axios';

// Use caminho relativo '/api' para passar pelo proxy do Nginx do frontend
const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em todas as requisi��es
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Servi�o de autentica��o
export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => !!localStorage.getItem('token'),
};

// Servi�o de pacientes
export const pacientesService = {
  getAll: () => api.get('/pacientes'),
  getById: (id) => api.get(`/pacientes/${id}`),
  search: (query) => api.get('/pacientes/search', { params: { q: query } }),
  create: (data) => api.post('/pacientes', data),
  update: (id, data) => api.put(`/pacientes/${id}`, data),
  delete: (id) => api.delete(`/pacientes/${id}`),
};

// Servi�o de m�dicos
export const medicosService = {
  getAll: () => api.get('/medicos'),
  getById: (id) => api.get(`/medicos/${id}`),
  create: (data) => api.post('/medicos', data),
  update: (id, data) => api.put(`/medicos/${id}`, data),
  delete: (id) => api.delete(`/medicos/${id}`),
};

// Servi�o de agenda
export const agendaService = {
  getHorariosLivres: (medicoId, data) =>
    api.get('/agenda/horarios-livres', { params: { medico_id: medicoId, data } }),

  getDatasDisponiveis: (medicoId, dataInicio, dataFim) =>
    api.get('/agenda/datas-disponiveis', {
      params: { medico_id: medicoId, data_inicio: dataInicio, data_fim: dataFim }
    }),

  getConsultas: (filters = {}) => api.get('/agenda', { params: filters }),

  agendar: (data) => api.post('/agenda', data),

  updateStatus: (id, data) => api.put(`/agenda/${id}`, data),

  cancelar: (id) => api.patch(`/agenda/${id}/cancelar`),

  deletar: (id) => api.delete(`/agenda/${id}`),
};

// Servi�o de agenda dos m�dicos
export const agendaMedicosService = {
  getAll: () => api.get('/agenda-medicos'),
  getByMedico: (medicoId) => api.get(`/agenda-medicos/${medicoId}`),
  create: (data) => api.post('/agenda-medicos', data),
  update: (id, data) => api.put(`/agenda-medicos/${id}`, data),
  delete: (id) => api.delete(`/agenda-medicos/${id}`),
};

// Servi�o de bloqueios
export const bloqueiosService = {
  getAll: (filters = {}) => api.get('/bloqueios', { params: filters }),
  create: (data) => api.post('/bloqueios', data),
  update: (id, data) => api.put(`/bloqueios/${id}`, data),
  delete: (id) => api.delete(`/bloqueios/${id}`),
};

export default api;
