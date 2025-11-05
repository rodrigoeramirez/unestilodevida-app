import api from './axiosConfig';

export const usuarioApi = {
  getAll: () => api.get('/usuarios'),
  getById: (id: number) => api.get(`/usuarios/${id}`),
  create: (formData: FormData) =>api.post(`/usuarios/create`, formData, { headers: { "Content-Type": "multipart/form-data" },}),
  update: (id: number, data: any) => api.put(`/usuarios/update/${id}`, data),
  delete: (id: number) => api.delete(`/usuarios/delete/${id}`),
  getRoles:() => api.get('usuarios/roles'),
  existByEmail: (email:string) => api.get(`/usuarios/existByEmail/${email}`),
  getLideres:() => api.get('/usuarios/lideres'),
  getTimoteos:() => api.get('/usuarios/timoteos')
};
