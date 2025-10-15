import axios from 'axios';
import { Transmit } from '@adonisjs/transmit-client';

export class ApiCustomService {
    constructor() {
        this.client = axios.create()
        this.setupInterceptors()
    }

    setupInterceptors() {
        this.client.interceptors.request.use((config) => {
            config.headers = {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                ...config.headers,
            }
            return config
        })
    }

    async get(url, params = {}, headers = {}) {
        return this.client.get(url, { params, headers })
    }

    async post(url, data = {}, headers = {}) {
        return this.client.post(url, data, { headers })
    }

    async put(url, data = {}, headers = {}) {
        return this.client.put(url, data, { headers })
    }

    async delete(url, headers = {}) {
        return this.client.delete(url, { headers })
    }

    async patch(url, data = {}, headers = {}) {
        return this.client.patch(url, data, { headers })
    }
}

export class ApiService {
    constructor({ apiHost = '', apiPrefix = '', timeout = 10000 }) {
        this.client = axios.create({
            baseURL: this.buildUrl({ apiHost: apiHost, apiPrefix: apiPrefix }),
            timeout: timeout ? timeout : import.meta.env.VITE_API_TIMEOUT
        });
        this.setupInterceptors();
    }

    buildUrl({ apiHost = '', apiPrefix = '' }) {
        const host = apiHost ? apiHost : import.meta.env.VITE_API_HOST;
        const prefix = apiPrefix ? apiPrefix : import.meta.env.VITE_API_PREFIX;
        const isProd = import.meta.env.VITE_MODE_ENV === 'production';

        if (!host) throw new Error('PI_HOST obrigatório');

        const baseUrl = host.startsWith('http') ? host : `${isProd ? 'https' : 'http'}://${host}`;
        const parts = [baseUrl.replace(/\/+$/, ''), prefix.replace(/^\/+/, '')].filter(Boolean);

        return parts.join('/');
    }

    setupInterceptors() {
        this.client.interceptors.request.use((config) => {
            if (config.headers) {
                config.headers['anon-api-key'] = import.meta.env.VITE_API_ANON_KEY;
                config.headers['Accept'] = 'application/json';
                config.headers['Content-Type'] = 'application/json';
            }
            const token = localStorage.getItem('sessionToken');
            if (token && config.headers) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            return config;
        });
    }

    async get(url, params) {
        return this.client.get(url, { params });
    }

    async post(url, data) {
        return this.client.post(url, data);
    }

    async put(url, data) {
        return this.client.put(url, data);
    }

    async delete(url) {
        return this.client.delete(url);
    }

    async patch(url, data) {
        return this.client.patch(url, data);
    }
}

export
    const apiService = new ApiService({});
export
    const apiCustom = new ApiCustomService();
