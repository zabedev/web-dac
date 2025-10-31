import AppLayout from '@/layout/AppLayout.vue'
import AuthLayout from '@/modules/auth/layout/AuthLayout.vue'
import { useAuthStore } from '@/modules/auth/stores'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '',
                    name: 'dashboard',
                    component: () => import('@/modules/dash/sources.vue'),
                    meta: { title: 'Dashboard' },
                },
                {
                    path: 'sources',
                    name: 'sources',
                    component: () => import('@/modules/dash/sources.vue'),
                    meta: { title: 'Fontes de dados' },
                },
                {
                    path: 'settings',
                    name: 'settings',
                    component: () => import('@/modules/dash/Settings.vue'),
                    meta: { title: 'Configurações' },
                },
            ],
        },
        {
            path: '/auth',
            component: AuthLayout,
            children: [
                {
                    path: 'login',
                    name: 'auth-login',
                    component: () => import('@/modules/auth/views/AuthLogin.vue'),
                    meta: { title: 'Login' },
                },
                {
                    path: 'forgot-password',
                    name: 'auth-forgot-password',
                    component: () => import('@/modules/auth/views/ForgotPassword.vue'),
                    meta: { title: 'Esqueci a Senha' },
                },
                {
                    path: 'register',
                    name: 'auth-register',
                    component: () => import('@/modules/auth/views/AuthRegister.vue'),
                    meta: { title: 'Registrar' },
                },
            ],
        },
    ],
})

// --- Guard de autenticação ---
router.beforeEach(async (to) => {
    const publicRoutes = import.meta.env.VITE_APP_PUBLIC_ROTES || ['auth-login', 'auth-forgot-password', 'auth-register']
    const isPublic = publicRoutes.includes(to.name)
    const authStore = useAuthStore()

    try {
        if (isPublic) return true
        if (authStore.isAuthenticated) return true

        const token = localStorage.getItem('sessionToken')
        if (token) {
            const ok = await authStore.getSession()
            if (ok) return true
        }

        return { name: 'auth-login' }
    } catch (err) {
        console.error('Erro no beforeEach:', err)
        return { name: 'auth-login' }
    }
})

// --- Atualiza título da página ---
router.afterEach((to) => {
    const defaultTitle = import.meta.env.VITE_APP_TITLE || 'Minha Aplicação'
    document.title = to.meta.title
        ? `${to.meta.title} | ${defaultTitle}`
        : defaultTitle
})

export default router
