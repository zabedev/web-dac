<script setup lang="js">
import { MessageError, MessageSuccess } from '@/service/message_custom';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { intervalLimits, serverProtocols } from '../options';
import { useGatewayStore } from '../stores';

const { api } = useGatewayStore();
const props = defineProps(['code'])
const emit = defineEmits(['close-modal'])
const code = computed(() => props.code)
const server = ref({
    meta: {
        kind: 'modbus-tcp'
    }
})
const activeTab = ref('0');

function notifyClose() {
    emit('close-modal-server')
}

function importServer() {
    try {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'application/json'

        input.onchange = async (e) => {
            const file = e.target.files[0]
            if (!file) return

            const text = await file.text()
            try {
                const data = JSON.parse(text)
                Object.assign(server.value, data) // substitui os campos no objeto source
                MessageSuccess('Servidor importado com sucesso', 'Importar')
            } catch (err) {
                MessageError('Arquivo inválido: não é um JSON válido', 'Importar')
            }
        }

        input.click()
    } catch (error) {
        MessageError(error.message, 'Falha ao importar servidor')
    }
}
function exportServer() {
    try {
        // clona o objeto e remove os campos que não devem ir para exportação
        const { createdAt, updatedAt, id, code, ...cleanServer } = server.value

        const json = JSON.stringify(cleanServer, null, 2) // bem formatado
        const blob = new Blob([json], { type: 'application/json' })
        const url = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = url
        link.download = `server_${server.value.code || 'new'}.json`
        link.click()

        URL.revokeObjectURL(url)
        MessageSuccess('Servidor exportado com sucesso', 'Exportar')
    } catch (error) {
        MessageError(error.message, 'Falha ao exportar servidor')
    }
}

async function saveServer() {
    try {
        if (!server.value.id) {
            const { status, data } = await api.server.store({ data: server.value });
            if (status === 201) {
                MessageSuccess('Salvo com sucesso', 'Salvar')
                notifyClose()
            }
        } else {
            const { status, data } = await api.server.update({ id: server.value.id, data: server.value });
            if (status === 200) {
                MessageSuccess('Alterado com sucesso', 'Salvar')
                notifyClose()
            }
        }

    } catch (error) {
        MessageError(error.message, 'Falha ao salvar')
    }

}
onMounted(async () => {
    if (code.value) {
        const { status, data } = await api.server.show({ id: code.value })
        if (status === 200) {
            server.value = data
        }
    }
})
onUnmounted(() => {

})
</script>

<template>
    <div class="flex flex-col">
        <div class="flex w-full justify-between border-b dark:border-b-surface-700 p-3 mb-6 mt-3">
            <div class="flex gap-2">
                <Button icon="pi pi-times" label="Cancelar" severity="secondary" v-on:click="notifyClose" />
                <Button icon="pi pi-save" label="Salvar" severity="secondary" v-on:click="saveServer" />
            </div>
            <div class="flex gap-2">
                <Button icon="pi pi-file-export" v-if="server.id" label="Exportar" severity="secondary"
                    v-on:click="exportServer" />
                <Button icon="pi pi-file-import" v-if="!server.id" label="Importar" severity="secondary"
                    v-on:click="importServer" />
            </div>

            <Button icon="pi pi-trash" v-if="server.id" label="Deletar" severity="secondary" />
        </div>
        <Tabs v-model:value="activeTab">
            <TabList>
                <Tab value="0">Configurações</Tab>
            </TabList>
            <TabPanels>
                <TabPanel value="0">
                    <div class="flex flex-col gap-4">
                        <div class="flex flex-col gap-4 border-b dark:border-b-surface-700 pb-4">
                            <div class="grid grid-cols-3">
                                <div class="col-span-1 items-center flex ">
                                    <span class="text-left">Nome</span>
                                </div>
                                <div class="col-span-2 flex flex-col w-full">
                                    <input-text v-model="server.name" />
                                </div>
                            </div>
                            <!--  -->
                            <div class="grid grid-cols-3">
                                <div class="col-span-1 items-center flex ">
                                    <span class="text-left">Descrição</span>
                                </div>
                                <div class="col-span-2 flex flex-col w-full">
                                    <input-text v-model="server.description" />
                                </div>
                            </div>
                            <!--  -->
                            <div class="grid grid-cols-3">
                                <div class="col-span-1 items-center flex ">
                                    <span class="text-left">Tipo de Servidor</span>
                                </div>
                                <div class="col-span-2 flex flex-col w-full">
                                    <Select v-model="server.meta.kind" :options="serverProtocols" option-label="label"
                                        option-value="value" />
                                </div>
                            </div>
                            <!--  -->
                        </div>
                        <div v-if="server.meta?.kind === 'modbus-tcp'"
                            class="flex flex-col gap-4 border-b dark:border-b-surface-700 pb-4">
                            <div class="grid grid-cols-3">
                                <div class="col-span-1 items-center flex ">
                                    <span class="text-left">Host</span>
                                </div>
                                <div class="col-span-2 flex flex-col w-full">
                                    <input-text v-model="server.meta.host" />
                                </div>
                            </div>
                            <!--  -->
                            <div class="grid grid-cols-3">
                                <div class="col-span-1 items-center flex ">
                                    <span class="text-left">Port</span>
                                </div>
                                <div class="col-span-2 flex flex-col w-full">
                                    <input-number v-model="server.meta.port" :min="0" :max="1023"
                                        v-tooltip.bottom="`Min: 0 | Max: 1023`" />
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col gap-4 border-b dark:border-b-surface-700 pb-4">
                            <!--  -->
                            <div class="grid grid-cols-3">
                                <div class="col-span-1 items-center flex ">
                                    <span class="text-left">Intervalo(s)</span>
                                </div>
                                <div class="col-span-2 flex flex-col w-full">
                                    <input-number v-model="server.schedulerInterval" :min="intervalLimits.min"
                                        :max="intervalLimits.max"
                                        v-tooltip.bottom="`Min: ${intervalLimits.min} | Max: ${intervalLimits.max}`" />
                                </div>
                            </div>
                            <!--  -->
                            <div class="grid grid-cols-3">
                                <div class="col-span-1 items-center flex ">
                                    <span class="text-left">Tentativas</span>
                                </div>
                                <div class="col-span-2 flex flex-col w-full">
                                    <input-number v-model="server.attemptsRetry" />
                                </div>
                            </div>
                            <!--  -->
                            <div class="grid grid-cols-3">
                                <div class="col-span-1 items-center flex ">
                                    <span class="text-left">Habilitado</span>
                                </div>
                                <div class="col-span-2 flex flex-col w-full">
                                    <checkbox v-model="server.isActive" binary />
                                </div>
                            </div>
                        </div>
                    </div>
                </TabPanel>
            </TabPanels>
        </Tabs>
    </div>
</template>