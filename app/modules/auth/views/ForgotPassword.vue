<script setup></script>

<template>
    <form class="flex flex-col gap-4">
        <p class="text-gray-600 dark:text-gray-400 text-sm">Digite seu email e enviaremos instruções para redefinir sua
            senha.</p>

        <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300"> Email </label>
            <input id="email" type="email" placeholder="Digite seu email"
                class="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500" />
        </div>

        <button type="submit"
            class="w-full bg-primary-500 text-white py-2 rounded-md hover:bg-primary-600 transition">Enviar
            instruções</button>

        <p class="text-sm text-center mt-4">
            <router-link to="/auth/login" class="text-primary-500 hover:underline">Voltar ao login</router-link>
        </p>
    </form>
</template>
