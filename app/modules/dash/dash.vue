<script setup>
import { MessageError } from '@/service/message_custom';
import { onMounted, onUnmounted, ref } from 'vue';
import { useGatewayStore } from './stores';

const { api } = useGatewayStore();

const sources = ref([]);
const servers = ref([]);
const sourceSelected = ref({});
const visibleSource = ref(false);


async function getSources() {
    try {
        const { status, data } = await api.source.index()
        if (status === 200) {
            sources.value = data
        }
    } catch (error) {
        console.log(error.message)
    }
}

function openSource({ data }) {
    try {
        visibleSource.value = true;
        sourceSelected.value = { ...data }
    } catch (error) {
        MessageError(error.message, 'Não foi possivel abrir a source')
    }
}

function newSource() {
    visibleSource.value = true;
    sourceSelected.value = {
        meta: {
            kind: 'modbus',
            unitId: 1,
            modbusFunction: 'readHoldingRegisters',
            dataAddress: 0,
            lengthAddress: 1,
        }
    };
}

async function handleSourceClose() {
    visibleSource.value = false;
    sourceSelected.value = {}
    await autoUpdate()
}

async function autoUpdate() {
    try {
        const { data, status } = await api.server.index()
        if (status === 200) {
            servers.value = data;
        }

        await getSources()
    } catch (error) {
        console.log(error.message)
    }
}

let interval

onMounted(async () => {
    await autoUpdate()
    interval = setInterval(autoUpdate, 10000);
})

onUnmounted(() => {
    if (interval) {
        clearInterval(interval);
    }
})

</script>

<template>
    <div class="grid grid-cols-6 gap-3">
        <div v-for="source in sources" :key="source.id" v-on:dblclick="openSource({ data: source })"
            class="flex !w-full  flex-col p-2 col-span-6 md:col-span-1 gap-3 border dark:border-surface-700 cursor-pointer bg-surface-200 dark:bg-surface-900/80  rounded-md hover:bg-sky-50 dark:hover:bg-surface-900/30">
            <div class="flex justify-between">
                <span class="font-semibold dark:text-orange-600/80">{{ source.name }}</span>
                <span class="font-semibold dark:text-orange-700/70">{{ source.code }}</span>
            </div>
            <div class="flex">
                <span class="font-light text-sm dark:text-orange-400/80">{{ source.description }}</span>
            </div>
            <div class="flex justify-between">
                <div class="flex">
                    <div v-if="source.meta.kind === 'modbus-tcp'" class="flex">
                        <span class="font-mono">{{ source.meta.reading || 0 }}</span>
                    </div>
                </div>
                <div class="flex"><span class="  "
                        :class="source.isActive ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-500'">
                        {{ source.isActive ? 'Habilitada' : 'Desabilitada' }}
                    </span></div>
            </div>
        </div>
        <div class="flex !w-full  gap-3 col-span-6 md:col-span-1 bg-surface-100 dark:bg-surface-950/80 p-8 rounded-xl items-center justify-center cursor-pointer 
           border-2 border-surface-600 border-spacing-4  border-dashed hover:bg-sky-50 dark:hover:bg-surface-900/30"
            v-on:click="newSource">
            <i class="pi pi-plus" style="font-size: 1.5rem"></i>
            <span class="text-xl">Nova fonte</span>
        </div>
    </div>
    <Drawer v-model:visible="visibleSource" :header="sourceSelected.name || 'Nova Fonte'" position="right"
        class="!w-full md:!w-[40rem] lg:!w-[45rem]">
        <template #container="{ closeCallback }">
            <source-create :source="sourceSelected" :servers="servers" @close-modal="handleSourceClose" />
        </template>
    </Drawer>

</template>
