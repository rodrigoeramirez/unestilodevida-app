import api from './axiosConfig';

export const celulaApi = {
  getAll: () => api.get('/celulas'), //// automáticamente envía el token en Authorization
  getById: (id: number) => api.get(`/celulas/${id}`),
  create: (data: any) => api.post('/celulas/create', data),
  update: ( id: number, data: any, ) => api.patch(`/celulas/update/${id}`, data),
  delete: (id: number) => api.delete(`/celulas/delete/${id}`),
  getDias:() =>api.get('celulas/dias'),
  getGeneros:() =>api.get('celulas/generos'),
  usuarioLibre:(id:number) => api.get(`celulas/usuarioLibre/${id}`),
};