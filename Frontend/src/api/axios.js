import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL 
});

API.interceptors.request.use((req) => {
    const tokenData = localStorage.getItem('token');
    
    if (tokenData) {
        try {
            const token = JSON.parse(tokenData); 
            req.headers.Authorization = `Bearer ${token}`;
        } catch (error) {
            req.headers.Authorization = `Bearer ${tokenData}`;
        }
    }
    return req;
});

export default API;