import { apiService } from '@/service/api';
import { defineStore } from 'pinia';
import { computed, reactive } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    const state = reactive({
        user: {},
        isAuthenticated: false
    });

    function clearSession({ redirect = true } = {}) {
        localStorage.removeItem('sessionToken');
        state.user = {};
        state.isAuthenticated = false;

        if (!redirect) return;

        // redirecionamento sem import circular (import dinâmico)
        import('@/router')
            .then(m => {
                const router = m.default;
                if (router && router.currentRoute.value?.name !== 'auth-login') {
                    router.push({ name: 'auth-login' });
                }
            })
            .catch(() => {
                // fallback simples
                window.location.href = '/auth/login';
            });
    }

    async function getSession() {
        try {
            const sessionToken = localStorage.getItem('sessionToken');
            if (sessionToken) {
                const { data: { user, isAuthenticated }, status } = await apiService.get('auth/session/me');

                if (status !== 200) {
                    clearSession({ redirect: false });
                    return false;
                }

                state.user = user;
                state.isAuthenticated = !!isAuthenticated;
                return !!isAuthenticated;
            } else {
                clearSession({ redirect: false });
                return false;
            }
        } catch (error) {
            console.error('getSession error', error);
            clearSession({ redirect: false });
            return false;
        }
    }

    async function destroySession() {
        try {
            const sessionToken = localStorage.getItem('sessionToken');
            if (sessionToken && sessionToken.length > 0) {
                await apiService.delete('auth/session/token');
                localStorage.removeItem('sessionToken');
                window.location.href = '/'
            }
        } catch (error) {
            console.error()
        }
    }

    async function login({ email, password }) {
        if (!email || !password) throw new Error('The username and password fields are mandatory.');
        const res = await apiService.post('auth/session/token', { email, password });
        const { data: { user, session }, status } = res
        if (status === 200) {
            state.user = user;
            localStorage.setItem('sessionToken', session.token);
            window.location.href = '/';
        } else { return res }
    }

    async function register(data) {
        try {
            const res = await apiService.post('auth/session/auto-register', data);
            console.log(res);
        } catch (error) {
            console.log(error);
        }
    }

    return {
        user: computed(() => state.user),
        isAuthenticated: computed(() => state.isAuthenticated),
        getSession,
        destroySession,
        login,
        register,
    };
});
