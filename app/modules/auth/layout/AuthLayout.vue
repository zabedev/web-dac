<script setup>

const appName = import.meta.env.VITE_APP_NAME || 'My App';

</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-surface-100 dark:bg-surface-950">
        <!-- Card central -->
        <div class="w-full max-w-md bg-white dark:bg-surface-900 rounded-lg shadow-lg p-8">
            <!-- Título / Descrição -->
            <div class="text-center mb-6">
                <h1 class="text-2xl font-bold text-gray-800 dark:text-white">
                    {{ appName }}
                </h1>
                <p class="text-gray-500 dark:text-gray-400 mt-2">Painel Administrador</p>
            </div>

            <!-- Onde vai carregar as views (Login, Registro, etc.) -->
            <router-view />

            <!-- Separador -->
            <!-- <div class="flex items-center my-6">
                <hr class="flex-grow border-gray-300 dark:border-gray-600" />
                <span class="px-2 text-gray-400 text-sm">ou entre com</span>
                <hr class="flex-grow border-gray-300 dark:border-gray-600" />
            </div> -->

            <!-- Social Login -->
            <!-- <div class="flex justify-center gap-4">
                <Button disabled size="large" outlined icon="pi pi-facebook" />
                <Button disabled size="large" outlined icon="pi pi-twitter" />
                <Button disabled size="large" outlined icon="pi pi-google" label="Entrar com Google"
                    severity="danger" />
                <Button disabled size="large" outlined icon="pi pi-github" />
            </div> -->
        </div>
    </div>
    <Messages />
</template>
