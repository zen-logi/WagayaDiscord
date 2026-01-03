import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // Use relative path to go through Caddy
    withCredentials: true, // Send cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
