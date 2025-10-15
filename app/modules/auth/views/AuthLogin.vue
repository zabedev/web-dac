<script setup>
import { MessageError } from '@/service/message_custom';
import { onBeforeMount, ref, watch } from 'vue';
import { useAuthStore } from '../stores';

const authStore = useAuthStore();
const { login } = authStore;
const loading = ref(false);

const email = ref('');
const password = ref('');

async function submitForm() {
    try {
        loading.value = true;
        const res = await login({ email: email.value, password: password.value });
    } catch (error) {
        MessageError(
            'Erro ao tentar fazer login',
            error.response?.data.message
        );

    } finally {
        loading.value = false;
    }
}

watch(
    () => authStore.isAuthenticated,
    (isAuthenticated) => {
        if (isAuthenticated) {
            window.location.href = '/';
        }
    }
);

onBeforeMount(() => {
    if (authStore.isAuthenticated) {
        window.location.href = '/'
    }
})

</script>

<template>
    <form @submit.prevent="submitForm" class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
            <label for="x-email" class="block  font-medium text-gray-700 dark:text-gray-300"> Usuário </label>
            <input-text id="x-email" v-model="email" size="small" class="w-full" />
        </div>

        <div class="flex flex-col gap-1">
            <label for="x-password" class="block font-medium text-gray-700 dark:text-gray-300"> Senha </label>
            <Password id="x-password" v-model="password" class="flex flex-col w-full" size="small" toggle-mask
                :feedback="false" />
        </div>

        <div class="flex justify-between items-center text-sm">
            <!-- <router-link to="/auth/forgot-password" class="text-primary-500 hover:underline"> Esqueceu a senha?</router-link> -->
            <!-- <router-link to="/auth/register" class="text-primary-500 hover:underline"> Criar conta </router-link> -->
        </div>

        <Button label="Entrar" class="w-full py-2 transition mt-5" :loading="loading" type="submit" />
    </form>
</template>
