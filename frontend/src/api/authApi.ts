import api from './axiosConfig';


export const authApi = {
  login: (credentials: { email: string; clave: string }) =>
    api.post('/auth/login', credentials),
};