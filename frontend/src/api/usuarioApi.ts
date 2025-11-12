import api from './axiosConfig';

export const usuarioApi = {
  getAll: () => api.get('/usuarios'),
  getById: (id: number) => api.get(`/usuarios/${id}`),
  create: (formData: FormData) =>api.post(`/usuarios/create`, formData, { headers: { "Content-Type": "multipart/form-data" },}),
  update: (id: number, formData: FormData) => api.put(`/usuarios/update/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" },}),
  delete: (id: number) => api.delete(`/usuarios/delete/${id}`),
  getRoles:() => api.get('usuarios/roles'),
  existByEmail: (email:string) => api.get(`/usuarios/existByEmail/${email}`),
  getLideres:() => api.get('/usuarios/lideres'),
  getTimoteos:() => api.get('/usuarios/timoteos'),
  updateClave: (id: number, data: { claveActual: string; nuevaClave: string }) =>
    api.post(`/usuarios/updateClave/${id}`, data)
};
