import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api', // Pointing straight to our Laravel API
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

// Automatically add the token to requests if we have one saved
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('fuelease_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;