<script setup>
    import { ref } from 'vue';
    import { useAuthStore } from '../stores';

    const authStore = useAuthStore();

    const loading = ref(false);
    const email = ref('');
    const password = ref('');
    const password_confirmation = ref('');
    const name = ref('');

    async function submitRegister() {
        try {
            loading.value = true;
            const data = {
                email: email.value,
                password: password.value,
                password_confirmation: password_confirmation.value,
                name: name.value
            };
            const res = await authStore.register(data);
            console.log(res);
        } catch (error) {
            console.log(error);
        } finally {
            loading.value = false;
        }
    }
</script>

<template>
    <form @submit.prevent="submitRegister" class="flex flex-col gap-4">
        <div>
            <label for="x-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300"> Nome completo
            </label>
            <input-text v-model="name" size="small" id="x-name" placeholder="Digite seu nome"
                class="mt-1 w-full px-3 py-2" />
        </div>

        <div>
            <label for="x-email" class="block text-sm font-medium text-gray-700 dark:text-gray-300"> Email </label>
            <input-text v-model="email" size="small" id="x-email" placeholder="Digite seu email"
                class="mt-1 w-full px-3 py-2" />
        </div>

        <div>
            <label for="x-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300"> Senha </label>
            <input-text v-model="password" size="small" id="x-password" type="password" placeholder="Digite sua senha"
                class="mt-1 w-full px-3 py-2" />
        </div>

        <div>
            <label for="x-password_confirmation" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirmar senha </label>
            <input-text v-model="password_confirmation" size="small" id="x-password_confirmation" type="password"
                placeholder="Repita sua senha" class="mt-1 w-full px-3 py-2" />
        </div>

        <Button label="Criar Conta" class="w-full py-2 transition mt-5" :loading="loading" type="submit" />

        <p class="text-sm text-center mt-4">
            Já tem uma conta?
            <router-link to="/auth/login" class="text-primary-500 hover:underline">Entrar</router-link>
        </p>
    </form>
</template>
