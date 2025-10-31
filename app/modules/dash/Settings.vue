<script setup lang="js">

</script>

<template>
    <div class="flex flex-col h-full bg-surface-50 dark:bg-surface-950 p-3 sm:p-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
            <div>
                <h1 class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">Configurações do sistema
                </h1>
                <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Ajuste do cliente e servidores
                </p>
            </div>
            <div class="flex gap-6 sm:gap-4">
                Cliente: 02326556526
            </div>

        </div>

        <div class="bg-white dark:bg-surface-900 p-3 sm:p-4 mb-4">
            <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-4 border-b dark:border-b-surface-700 pb-4">

                    <div class="grid grid-cols-3 gap-2">
                        <div class="col-span-3  items-center flex">
                            <span class="text-left">Servidor</span>
                        </div>
                        <div class="col-span-3 flex flex-col w-full">
                            <input-text />
                        </div>
                    </div>

                    <div class="grid grid-cols-3 gap-2">
                        <div class="col-span-3  items-center flex">
                            <span class="text-left">Chave de Ativação</span>
                        </div>
                        <div class="col-span-3 flex flex-col w-full">
                            <input-text />
                        </div>
                    </div>

                </div>
                <div class="flex flex-col gap-4 border-b dark:border-b-surface-700 pb-4">
                    <div class="grid grid-cols-3 gap-2">
                        <div class="col-span-3 flex items-center">
                            <span class="text-left">Auto Reiniciar</span>
                        </div>

                        <div class="col-span-3 grid grid-cols-2 gap-2 w-full">
                            <div class="col-span-1 flex flex-col w-full">
                                <toggle-switch v-model="autoReiniciar" />
                            </div>

                            <div class="col-span-1 flex flex-col w-full">
                                <date-picker showIcon fluid timeOnly />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>
