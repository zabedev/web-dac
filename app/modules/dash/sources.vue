<script setup>
import { MessageError } from '@/service/message_custom';
import { Transmit } from '@adonisjs/transmit-client';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useGatewayStore } from './stores';

const { api } = useGatewayStore();

// State management
const sources = ref([]);
const servers = ref([]);
const sourceSelected = ref({});
const visibleSource = ref(false);
const isLoading = ref(false);
const lastUpdate = ref(null);
const viewMode = ref('grid');
let sourceChannelInstance = null;

// Search and filter state
const searchState = ref({
    query: '',
    kind: '',
    status: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
});

// Available filter options
const filterOptions = ref({
    kinds: [],
    statuses: [
        { label: 'Todas', value: 'all' },
        { label: 'Habilitadas', value: 'active' },
        { label: 'Desabilitadas', value: 'inactive' }
    ],
    sortOptions: [
        { label: 'Nome', value: 'name' },
        { label: 'Código', value: 'code' },
        { label: 'Tipo', value: 'kind' },
        { label: 'Status', value: 'status' }
    ]
});

// Computed for filtering and sorting
const filteredAndSortedSources = computed(() => {
    let filtered = sources.value.filter((source) => {
        const searchTerm = searchState.value.query.toLowerCase().trim();
        const matchesSearch = !searchTerm || [source.name, source.description, source.code, source.meta?.kind].some((field) => field && typeof field === 'string' && field.toLowerCase().includes(searchTerm));

        const matchesKind = !searchState.value.kind || source.meta?.kind === searchState.value.kind;
        const matchesStatus = searchState.value.status === 'all' || (searchState.value.status === 'active' && source.isActive) || (searchState.value.status === 'inactive' && !source.isActive);

        return matchesSearch && matchesKind && matchesStatus;
    });

    filtered.sort((a, b) => {
        const { sortBy, sortOrder } = searchState.value;
        let comparison = 0;

        switch (sortBy) {
            case 'name':
                comparison = a.name.localeCompare(b.name);
                break;
            case 'code':
                comparison = a.code.localeCompare(b.code);
                break;
            case 'kind':
                comparison = (a.meta?.kind || '').localeCompare(b.meta?.kind || '');
                break;
            case 'status':
                comparison = a.isActive === b.isActive ? 0 : a.isActive ? -1 : 1;
                break;
        }

        return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
});

// Stats computed
const sourceStats = computed(() => ({
    total: sources.value.length,
    active: sources.value.filter((s) => s.isActive).length,
    inactive: sources.value.filter((s) => !s.isActive).length,
    filtered: filteredAndSortedSources.value.length
}));

// Update filter options when sources change
watch(
    sources,
    (newSources) => {
        const kinds = [...new Set(newSources.map((s) => s.meta?.kind).filter(Boolean))];
        filterOptions.value.kinds = [{ label: 'Todos os tipos', value: '' }, ...kinds.map((kind) => ({ label: kind.toUpperCase(), value: kind }))];
    },
    { immediate: true }
);

async function connectSourceChannel() {
    try {
        const transmit = new Transmit({
            baseUrl: `http://${import.meta.env.VITE_API_HOST}` || window.location.origin,
            beforeSubscribe: (request) => {
                const token = localStorage.getItem('sessionToken');
                if (token) {
                    request.headers.set('Authorization', `Bearer ${token}`);
                }
            },
            beforeUnsubscribe: (request) => {
                const token = localStorage.getItem('sessionToken');
                if (token) {
                    request.headers.set('Authorization', `Bearer ${token}`);
                }
            },
            onSubscribeFailed: (response) => {
                if (response.status === 401) {
                    console.error('Falha na autenticação para o canal:', response);
                    // Redirecionar para a página de login ou mostrar mensagem de erro
                } else {
                    console.error('Falha na inscrição do canal:', response);
                }
            },
            onReconnectFailed: () => {
                console.error('Falha na reconexão com o servidor Transmit.');
                // Notificar o usuário ou tentar novamente
            }
        });

        const subscription = transmit.subscription('sources');
        await subscription.create();

        subscription.onMessage((data) => {
            sources.value = data;
        });
    } catch (error) {
        console.log(error.message);
    }
}

// API functions
async function fetchSources() {
    try {
        isLoading.value = true;
        const { status, data } = await api.source.index();
        if (status === 200) {
            sources.value = data;
            lastUpdate.value = new Date().toLocaleTimeString();
        }
    } catch (error) {
        console.error('Error fetching sources:', error);
        MessageError(error.message, 'Erro ao carregar fontes');
    } finally {
        isLoading.value = false;
    }
}

async function fetchServers() {
    try {
        const { data, status } = await api.server.index();
        if (status === 200) servers.value = data;
    } catch (error) {
        console.error('Error fetching servers:', error);
    }
}

// Source management
function openSourceModal(source = null) {
    try {
        visibleSource.value = true;
        sourceSelected.value = source
            ? { ...source }
            : {
                meta: {
                    convert: { isActive: false },
                    kind: 'modbus-tcp',
                    unitId: 1,
                    modbusFunction: 'readHoldingRegisters',
                    dataAddress: 0,
                    lengthAddress: 1,
                    format: 'float32',
                    swapBytes: false,
                    swapWords: false,
                }
            };
    } catch (error) {
        MessageError(error.message, 'Erro ao abrir configuração da fonte');
    }
}

async function handleSourceClose() {
    visibleSource.value = false;
    sourceSelected.value = {};
    await performAutoUpdate();
}

// Auto-update mechanism
async function performAutoUpdate() {
    await Promise.all([fetchServers(), fetchSources()]);
}

function clearFilters() {
    searchState.value = {
        query: '',
        kind: '',
        status: 'all',
        sortBy: 'name',
        sortOrder: 'asc'
    };
}

// function toggleSortOrder() {
//     searchState.value.sortOrder = searchState.value.sortOrder === 'asc' ? 'desc' : 'asc';
// }

// Helper functions
function getKindIcon(kind) {
    const icons = {
        modbus: 'pi-sitemap',
        'modbus-tcp': 'pi-globe',
        opcua: 'pi-share-alt',
        mqtt: 'pi-wifi',
        http: 'pi-cloud',
        database: 'pi-database'
    };
    return icons[kind] || 'pi-cog';
}

function getKindColor(kind) {
    const colors = {
        modbus: 'text-blue-500',
        'modbus-tcp': 'text-emerald-500',
        opcua: 'text-purple-500',
        mqtt: 'text-orange-500',
        http: 'text-cyan-500',
        database: 'text-indigo-500'
    };
    return colors[kind] || 'text-gray-500';
}

function getKindBgColor(kind) {
    const colors = {
        modbus: 'bg-blue-50 dark:bg-blue-500/10',
        'modbus-tcp': 'bg-emerald-50 dark:bg-emerald-500/10',
        opcua: 'bg-purple-50 dark:bg-purple-500/10',
        mqtt: 'bg-orange-50 dark:bg-orange-500/10',
        http: 'bg-cyan-50 dark:bg-cyan-500/10',
        database: 'bg-indigo-50 dark:bg-indigo-500/10'
    };
    return colors[kind] || 'bg-surface-50 dark:bg-surface-500/10';
}

// Lifecycle
let updateInterval;
onMounted(async () => {
    await performAutoUpdate();
    await connectSourceChannel();
    // updateInterval = setInterval(performAutoUpdate, 10000);
});

onUnmounted(() => {
    if (updateInterval) clearInterval(updateInterval);
});
</script>

<template>
    <div class="flex flex-col h-full bg-surface-50 dark:bg-surface-950 p-3 sm:p-6">
        <!-- Header Section -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
            <div>
                <h1 class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">Gerenciamento de Fontes.
                </h1>
                <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {{ sourceStats.filtered }} de {{ sourceStats.total }} fontes
                    <span v-if="lastUpdate" class="hidden sm:inline ml-2">• Atualizado às {{ lastUpdate }}</span>
                </p>
            </div>

            <!-- Quick Stats -->
            <div class="flex gap-6 sm:gap-4">
                <div class="text-center">
                    <div class="text-lg sm:text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                        {{ sourceStats.active }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">Ativas</div>
                </div>
                <div class="text-center">
                    <div class="text-lg sm:text-lg font-semibold text-red-500 dark:text-red-400">
                        {{ sourceStats.inactive }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">Inativas</div>
                </div>
            </div>
        </div>

        <!-- Search & Filter Toolbar -->
        <div class="bg-white dark:bg-surface-900 p-3 sm:p-4 mb-4">
            <!-- Mobile: Stack everything -->
            <div class="space-y-3 sm:space-y-0 sm:flex sm:flex-col lg:flex-row gap-4">
                <!-- Search Input -->
                <div class="flex justify-between w-full">
                    <input-text v-model="searchState.query" placeholder="Pesquisar..." class="w-96 text-sm" />
                    <!-- View toggle - hidden on mobile, show on tablet+ -->
                    <div class="flex gap-2">
                        <Button @click="viewMode = 'grid'" icon="pi pi-th-large" :text="viewMode === 'list'" rounded />
                        <Button @click="viewMode = 'list'" icon="pi pi-list" :text="viewMode == 'grid'" rounded />
                    </div>
                </div>

                <!-- Filters Row -->
                <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <!-- Mobile filters row -->
                    <div class="flex gap-2 sm:gap-3 flex-1 sm:flex-initial">
                        <Select v-model="searchState.kind" :options="filterOptions.kinds" option-label="label"
                            option-value="value" placeholder="Tipo" class="flex-1 sm:w-32 text-sm" show-clear />

                        <Select v-model="searchState.status" :options="filterOptions.statuses" option-label="label"
                            option-value="value" class="flex-1 sm:w-28 text-sm" />
                    </div>

                    <!-- Action buttons -->
                    <div class="flex gap-2">
                        <Button severity="info" label="Atualizar" @click="performAutoUpdate" :disabled="isLoading"
                            icon="pi pi-refresh" />
                        <Button severity="secondary" label="Nova" @click="openSourceModal()" icon="pi pi-plus" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Content Area -->
        <div class="flex-1 overflow-hidden">
            <!-- Grid View - Force grid on mobile, respect choice on desktop -->
            <div v-if="viewMode === 'grid'" class="h-full overflow-auto">
                <div
                    class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                    <div v-for="source in filteredAndSortedSources" :key="source.id"
                        v-on:dblclick="openSourceModal(source)"
                        class="bg-white dark:bg-surface-900/40 border border-surface-200 dark:border-surface-700 rounded-lg p-3 sm:p-4 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-sm transition-all cursor-pointer min-h-[120px] flex flex-col">
                        <div class="flex items-center justify-between">
                            <h3 class="font-medium text-surface-900 dark:text-surface-100 text-xs sm:text-sm mb-1 truncate flex-1"
                                :title="source.name">
                                {{ source.name }}
                            </h3>
                            <div
                                :class="`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${source.isActive ? 'bg-emerald-500' : 'bg-red-500'}`">
                            </div>
                        </div>

                        <p class="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate" :title="source.description">
                            {{ source.description || 'Sem descrição' }}
                        </p>

                        <div class="flex items-center justify-between text-xs mt-auto">
                            <span class="font-mono text-gray-600 dark:text-gray-300 text-xs">{{ source.code }}</span>
                            <span
                                :class="`px-1.5 py-0.5 rounded text-xs ${source.status.isConnected ? 'text-emerald-500' : 'text-red-500'}`">
                                {{ source.status.isConnected ? 'Conectado' : 'Desconectado' }}
                            </span>
                        </div>

                        <div v-if="source.meta?.kind === 'modbus-tcp'"
                            class="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                            <div class="flex justify-between items-center">
                                <span class="text-gray-500 dark:text-gray-400">Leitura:</span>
                                <span class="font-mono text-xl text-blue-600 dark:text-blue-300">
                                    {{ source.status.meta.reading || 'Sem leitura' }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- List View - Hidden on mobile -->
            <div v-else class="h-full overflow-auto hidden sm:block">
                <div class="bg-white dark:bg-surface-900/30 overflow-hidden">
                    <!-- Table Header -->
                    <div
                        class="grid grid-cols-12 gap-4 px-4 py-3 bg-surface-50 dark:bg-surface-900 border-b border-surface-200 dark:border-surface-600 text-sm font-medium text-surface-600 dark:text-surface-300">
                        <div class="col-span-2">Código</div>
                        <div class="col-span-3">Nome</div>
                        <div class="col-span-2">Descrição</div>
                        <div class="col-span-2">Tipo</div>
                        <div class="col-span-1">Status</div>
                        <div class="col-span-1">Leitura</div>
                    </div>

                    <!-- Table Body -->
                    <div class="divide-y divide-surface-200 dark:divide-surface-700">
                        <div v-for="source in filteredAndSortedSources" :key="source.id"
                            v-on:dblclick="openSourceModal(source)"
                            class="grid grid-cols-12 gap-2 px-3 py-3 hover:bg-surface-50 dark:hover:bg-surface-700/50 cursor-pointer transition-colors items-center text-sm">
                            <!-- Code -->
                            <div class="col-span-2">
                                <span class="text-gray-700 dark:text-gray-300 text-xs">
                                    {{ source.code }}
                                </span>
                            </div>

                            <!-- Name -->
                            <div class="col-span-3">
                                <div class="font-medium text-gray-900 dark:text-gray-100 truncate" :title="source.name">
                                    {{ source.name }}
                                </div>
                            </div>

                            <!-- Description -->
                            <div class="col-span-2">
                                <div class="text-gray-600 dark:text-gray-400 truncate" :title="source.description">
                                    {{ source.description || 'Sem descrição' }}
                                </div>
                            </div>

                            <!-- Type -->
                            <div class="col-span-2">
                                <span
                                    :class="`inline-flex  rounded text-xs ${getKindColor(source.meta?.kind)} ${getKindBgColor(source.meta?.kind)}`">
                                    {{ source.meta?.kind?.toUpperCase() || 'N/A' }}
                                </span>
                            </div>

                            <!-- Status -->
                            <div class="col-span-1">
                                <div class="flex items-center gap-2">
                                    <div
                                        :class="`w-2 h-2 rounded-full ${source.isActive ? 'bg-emerald-500' : 'bg-red-500'}`">
                                    </div>
                                    <!-- <span
                                        :class="`text-xs ${source.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`">
                                        {{ source.isActive ? 'ON' : 'OFF' }}
                                    </span> -->
                                </div>
                            </div>

                            <!-- Reading -->
                            <div class="col-span-2">
                                <span v-if="source.meta?.kind === 'modbus-tcp' && source.meta?.reading !== undefined"
                                    class="font-mono text-blue-600 dark:text-blue-400 font-medium">
                                    {{ source.meta.reading }}
                                </span>
                                <span v-else class="text-gray-400 dark:text-gray-500 text-xs">-</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-if="filteredAndSortedSources.length === 0 && !isLoading"
                class="flex-1 flex items-center justify-center">
                <div class="text-center">
                    <div
                        class="mb-4 p-6 bg-surface-100 dark:bg-surface-700 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                        <i class="pi pi-search text-2xl text-gray-400 dark:text-gray-500"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">Nenhuma fonte encontrada</h3>
                    <p class="text-gray-500 dark:text-gray-500 mb-4">Tente ajustar os filtros ou criar uma nova fonte.
                    </p>
                    <button @click="clearFilters"
                        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm">Limpar
                        Filtros</button>
                </div>
            </div>
        </div>

        <!-- Source Configuration Drawer -->
        <Drawer v-model:visible="visibleSource" :header="sourceSelected.name || 'Nova Fonte'" position="right"
            class="!w-full sm:!w-[90vw] md:!w-[45rem] lg:!w-[50rem]" :show-close-icon="true">
            <template #container>
                <source-create :source="sourceSelected" :servers="servers" @close-modal="handleSourceClose" />
            </template>
        </Drawer>
    </div>
</template>
