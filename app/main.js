import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import '@/assets/styles.scss';
import { setTheme } from './config/theme';
import { useAuthStore } from './modules/auth/stores';

const app = createApp(App);
const pinia = createPinia();


app.use(pinia);
app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.app-dark'
        }
    }
});
app.use(ToastService);
app.use(ConfirmationService);

const authStore = useAuthStore();
(async function init() {
    try {
        await authStore.getSession();
    } catch (err) {
        console.error('Erro init getSession', err);
    }
    setTheme();
    app.mount('#app');
})();

