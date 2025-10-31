<script setup lang="js">
import { MessageError, MessageSuccess } from '@/service/message_custom';
import { computed, onMounted, ref } from 'vue';
import { addressLimits, intervalLimits, measurementUnits, modbusFormatOptions, modbusFunctions, modbusLimits, slaveLimits, sourceTypes } from '../options';
import { useGatewayStore } from '../stores';

const { api } = useGatewayStore();
const emit = defineEmits(['close-modal']);
const props = defineProps(['source', 'servers']);
const { source, servers } = props;
const visibleServer = ref(false);
const activeTab = ref('0');

const serverSelectd = ref(null);

const optionsServers = computed(() => {
    if (!source?.meta?.kind) return [];

    return servers.filter((s) => source.meta.kind.includes(s.meta?.kind)).map((s) => ({ label: s.name, value: s.code }));
});

function newServer() {
    visibleServer.value = true;
    serverSelectd.value = null;
}

function openServer({ serverCode }) {
    visibleServer.value = true;
    serverSelectd.value = serverCode;
}

async function deleteSource() {
    try {
        await api.source.delete({ id: source.id });
        MessageSuccess('Fonte deletada com sucesso', 'Deletar');
        notifyClose();
    } catch (error) {
        MessageError(error.message, 'Falha ao deletar fonte');
    } finally {
        notifyClose();
    }
}

function notifyClose() {
    emit('close-modal');
}

function handleSourceClose() {
    visibleServer.value = false;
    serverSelectd.value = null;
}

function importSource() {
    try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const text = await file.text();
            try {
                const data = JSON.parse(text);
                Object.assign(source, data);
                MessageSuccess('Fonte importada com sucesso', 'Importar');
            } catch (err) {
                MessageError('Arquivo inválido: não é um JSON válido', 'Importar');
            }
        };

        input.click();
    } catch (error) {
        MessageError(error.message, 'Falha ao importar fonte');
    }
}
function exportSource() {
    try {
        // clona o objeto e remove os campos que não devem ir para exportação
        const { createdAt, updatedAt, id, code, serverCode, ...cleanSource } = source;

        const json = JSON.stringify(cleanSource, null, 2); // bem formatado
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `source_${source.code || 'new'}.json`;
        link.click();

        URL.revokeObjectURL(url);
        MessageSuccess('Fonte exportada com sucesso', 'Exportar');
    } catch (error) {
        MessageError(error.message, 'Falha ao exportar fonte');
    }
}
async function saveSource() {
    try {
        if (!source.id) {
            const { status, data } = await api.source.store({ data: source });
            if (status === 201) {
                MessageSuccess('Fonte salva com sucesso', 'Salvar');
                notifyClose();
            }
        } else {
            const { status, data } = await api.source.update({ id: source.id, data: source });
            if (status === 200) {
                MessageSuccess('Fonte alterada com sucesso', 'Salvar');
                notifyClose();
            }
        }
    } catch (error) {
        MessageError(error.message, 'Falha ao salvar fonte');
    }
}

onMounted(() => {
    if (!source.meta.convert) {
        source.meta.convert = {
            isActive: false,
            type: 'automatic',
            input_min: 0,
            input_max: 0,
            output_min: 0,
            output_max: 0
        };
    }
});
</script>

<template>
    <div class="flex flex-col">
        <div class="flex w-full justify-between border-b dark:border-b-surface-700 p-3 mb-6 mt-3">
            <div class="flex gap-2">
                <Button icon="pi pi-times" label="Cancelar" severity="secondary" v-on:click="notifyClose" />
                <Button icon="pi pi-save" label="Salvar" severity="secondary" v-on:click="saveSource" />
            </div>
            <div class="flex gap-2">
                <Button icon="pi pi-file-export" v-if="source.id" label="Exportar" severity="secondary"
                    v-on:click="exportSource" />
                <Button icon="pi pi-file-import" v-if="!source.id" label="Importar" severity="secondary"
                    v-on:click="importSource" />
            </div>

            <Button icon="pi pi-trash" v-if="source.id" label="Deletar" severity="secondary"
                v-on:click="deleteSource" />
        </div>
        <Tabs v-model:value="activeTab">
            <TabList>
                <Tab value="0">Informações</Tab>
                <Tab value="1">Configurações de Leitura</Tab>
            </TabList>
            <TabPanels>
                <TabPanel value="0">
                    <div class="flex flex-col gap-4">
                        <div class="flex flex-col gap-4 border-b dark:border-b-surface-700 pb-4">
                            <div class="grid grid-cols-3">
                                <div class="col-span-1 items-center flex">
                                    <span class="text-left">Nome</span>
                                </div>
                                <div class="col-span-2 flex flex-col w-full">
                                    <input-text v-model="source.name" />
                                </div>
                            </div>
                            <!--  -->
                            <div class="grid grid-cols-3">
                                <div class="col-span-1 items-center flex">
                                    <span class="text-left">Descrição</span>
                                </div>
                                <div class="col-span-2 flex flex-col w-full">
                                    <input-text v-model="source.description" />
                                </div>
                            </div>
                            <!--  -->
                            <div class="grid grid-cols-3">
                                <div class="col-span-1 items-center flex">
                                    <span class="text-left">Tipo de Fonte</span>
                                </div>
                                <div class="col-span-2 flex flex-col w-full">
                                    <Select v-model="source.meta.kind" :options="sourceTypes" option-label="label"
                                        option-value="value" />
                                </div>
                            </div>
                            <!--  -->
                        </div>
                        <div v-if="source.meta.kind === 'modbus-tcp'"
                            class="flex flex-col gap-4 border-b dark:border-b-surface-700 pb-4">
                            <!--  -->
                            <div class="grid grid-cols-3">
                                <div class="col-span-1 items-center flex">
                                    <span class="text-left">Slave</span>
                                </div>
                                <div class="col-span-2 flex flex-col w-full">
                                    <input-number v-model="source.meta.unitId" :min="slaveLimits.min"
                                        :max="slaveLimits.max"
                                        v-tooltip.bottom="`Min: ${slaveLimits.min} | Max: ${slaveLimits.max}`" />
                                </div>
                            </div>
                            <!--  -->
                            <div class="grid grid-cols-3">
                                <div class="col-span-1 items-center flex">
                                    <span class="text-left">Função Modbus</span>
                                </div>
                                <div class="col-span-2 flex flex-col w-full">
                                    <Select v-model="source.meta.modbusFunction" :options="modbusFunctions"
                                        option-label="label" option-value="value" />
                                </div>
                            </div>
                            <!--  -->
                            <div class="grid grid-cols-3">
                                <div class="col-span-1 items-center flex">
                                    <span class="text-left">Endereço</span>
                                </div>
                                <div class="col-span-2 flex flex-col w-full">
                                    <input-number v-model="source.meta.dataAddress" :min="addressLimits.min"
                                        :max="addressLimits.max"
                                        v-tooltip.bottom="`Min: ${addressLimits.min} | Max: ${addressLimits.max}`" />
                                </div>
                            </div>
                            <!--  -->
                            <div class="grid grid-cols-3">
                                <div class="col-span-1 items-center flex">
                                    <span class="text-left">Quantidade</span>
                                </div>
                                <div class="col-span-2 flex flex-col w-full">
                                    <input-number v-model="source.meta.lengthAddress" :min="1"
                                        :max="modbusLimits[source.meta.modbusFunction] || 1"
                                        v-tooltip.bottom="`Min: 1 | Max: ${modbusLimits[source.meta.modbusFunction] || 1}`" />
                                </div>
                            </div>

                            <!--  -->
                            <div class="grid grid-cols-3">
                                <div class="col-span-1 items-center flex">
                                    <span class="text-left">Formato dos dados</span>
                                </div>
                                <div class="col-span-2 flex flex-col w-full">
                                    <Select v-model="source.meta.format" :options="modbusFormatOptions"
                                        option-label="label" option-value="value" />
                                </div>
                            </div>
                            <!--  -->
                            <div class="grid grid-cols-3 gap-2 items-center">
                                <!-- Swap Bytes -->
                                <div class="col-span-1 flex flex-col">
                                    <span class="font-semibold">Trocar bytes</span>
                                    <!-- Pequena descrição para explicar a função -->
                                </div>
                                <div class="col-span-2 flex gap-3 w-full">
                                    <toggle-switch v-model="source.meta.swapBytes" binary />
                                    <span class="text-sm text-gray-500 text-left"> Ex.: [0x12, 0x34] → [0x34, 0x12]
                                    </span>
                                </div>
                            </div>

                            <div class="grid grid-cols-3 gap-2 items-center mt-2">
                                <!-- Swap Words -->
                                <div class="col-span-1 flex flex-col">
                                    <span class="font-semibold">Trocar palavras</span>
                                    <!-- Pequena descrição para explicar a função -->
                                </div>
                                <div class="col-span-2 flex gap-3 w-full">
                                    <toggle-switch v-model="source.meta.swapWords" binary />
                                    <span class="text-sm text-gray-500 w-full"> Ex.: Para um valor float32, [reg1, reg2]
                                        → [reg2, reg1] </span>
                                </div>
                            </div>
                        </div>
                        <div v-if="source.meta.kind === 'http'"
                            class="flex flex-col gap-4 border-b dark:border-b-surface-700 pb-4"></div>
                        <div class="flex flex-col gap-4 border-b dark:border-b-surface-700 pb-4">
                            <!--  -->
                            <div class="grid grid-cols-3">
                                <div class="col-span-1 items-center flex">
                                    <span class="text-left">Intervalo(s)</span>
                                </div>
                                <div class="col-span-2 flex flex-col w-full">
                                    <input-number v-model="source.schedulerInterval" :min="intervalLimits.min"
                                        :max="intervalLimits.max"
                                        v-tooltip.bottom="`Min: ${intervalLimits.min} | Max: ${intervalLimits.max}`" />
                                    <Message severity="secondary" size="small" variant="simple"> Tempo (em segundos)
                                        entre cada leitura. </Message>
                                </div>
                            </div>
                            <!--  -->
                            <!-- <div class="grid grid-cols-3">
                                <div class="col-span-1 items-center flex">
                                    <span class="text-left">Tentativas</span>
                                </div>
                                <div class="col-span-2 flex flex-col w-full">
                                    <input-number v-model="source.attemptsRetry" />
                                </div>
                            </div> -->
                            <!--  -->
                            <div class="grid grid-cols-3">
                                <div class="col-span-1 items-center flex">
                                    <span class="text-left">Habilitado</span>
                                </div>
                                <div class="col-span-2 flex flex-col w-full">
                                    <toggle-switch v-model="source.isActive" />
                                </div>
                            </div>
                            <!--  -->
                            <div class="grid grid-cols-3">
                                <div class="col-span-1 items-center flex">
                                    <span class="text-left">Servidor</span>
                                </div>
                                <div class="col-span-2 flex w-full gap-3">
                                    <Select v-model="source.serverCode" :options="optionsServers" option-label="label"
                                        option-value="value" class="col-span-2 w-full" />
                                    <div class="flex col-span-1 gap-2">
                                        <Button icon="pi pi-plus" outlined v-on:click="newServer" />
                                        <Button :disabled="!source.serverCode" icon="pi pi-pencil" outlined
                                            v-on:click="openServer({ serverCode: source.serverCode })" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabPanel>
                <TabPanel value="1">
                    <div class="flex flex-col gap-4">
                        <div class="flex flex-col gap-4 border-b dark:border-b-surface-700 pb-4">
                            <div class="flex flex-col gap-3 mb-3">
                                <div class="grid grid-cols-3">
                                    <div class="col-span-1 items-center flex">
                                        <span class="text-left">Salvar leituras</span>
                                    </div>
                                    <div class="col-span-2 flex flex-col w-full">
                                        <toggle-switch v-model="source.meta.isReading" binary />
                                    </div>
                                </div>

                                <div class="grid grid-cols-3">
                                    <div class="col-span-1 items-center flex">
                                        <span class="text-left">Converter leitura</span>
                                    </div>
                                    <div class="col-span-2 flex flex-col w-full">
                                        <toggle-switch v-model="source.meta.convert.isActive" />
                                    </div>
                                </div>

                                <div v-if="source.meta.convert.isActive" class="flex flex-col gap-1 w-full mb-3">
                                    <div class="font-semibold text-muted-color text-md">Converter leitura</div>
                                    <div class="flex items-center justify-center gap-5 w-full">
                                        <div class="flex items-center gap-2">
                                            <RadioButton v-model="source.meta.convert.type" value="automatic" />
                                            <label>Automática</label>
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <RadioButton v-model="source.meta.convert.type" value="manually" />
                                            <label>Manual</label>
                                        </div>
                                    </div>
                                </div>

                                <div v-if="source.meta.convert && source.meta.convert.isActive && source.meta.convert.type === 'automatic'"
                                    class="flex flex-col gap-1 mb-3">
                                    <div class="font-semibold text-muted-color text-md">Converter Unidade medida</div>
                                    <div class="flex flex-col md:flex-row md:justify-between gap-2 p-4">
                                        <div class="font-semibold text-muted-color text-md">de</div>
                                        <Select filter :filter-fields="['label', 'value']" filter-icon="pi pi-filter"
                                            size="small" id="protocol.unit_input"
                                            v-model="source.meta.convert.unitInput" class="w-full mb-4"
                                            :options="measurementUnits" option-label="label" option-value="value" />
                                        <div class="font-semibold text-muted-color text-md">para</div>
                                        <Select filter :filter-fields="['label', 'value']" filter-icon="pi pi-filter"
                                            size="small" id="protocol.unit_output"
                                            v-model="source.meta.convert.unitOutput" class="w-full mb-4"
                                            :options="measurementUnits" option-label="label" option-value="value" />
                                    </div>
                                </div>

                                <div v-if="source.meta.convert && source.meta.convert.isActive && source.meta.convert.type === 'manually'"
                                    class="flex flex-col gap-1 mb-3">
                                    <div class="font-semibold text-muted-color text-md">Linearizador</div>

                                    <div class="grid grid-cols-2 gap-2">
                                        <div class="col-span-2 grid grid-cols-4 gap-2">
                                            <div class="flex flex-col gap-1 col-span-2">
                                                <label class="text-sm" for="protocol.initialReading">Leitura</label>
                                                <InputNumber size="small" v-model="source.meta.convert.inputMin"
                                                    class="w-full" placeholder="Valor inicial" mode="decimal"
                                                    :step="0.01" showButtons />
                                            </div>
                                            <div class="flex flex-col gap-1 col-span-2">
                                                <label class="text-sm" for="protocol.finalReading">Referência</label>
                                                <InputNumber size="small" v-model="source.meta.convert.outputMin"
                                                    class="w-full" placeholder="Valor final" mode="decimal" :step="0.01"
                                                    showButtons />
                                            </div>
                                        </div>
                                        <div class="col-span-2 grid grid-cols-4 gap-2">
                                            <div class="flex flex-col gap-1 col-span-2">
                                                <label class="text-sm" for="protocol.initialReference">Leitura
                                                    Máxima</label>
                                                <InputNumber size="small" v-model="source.meta.convert.inputMax"
                                                    class="w-full" placeholder="Valor inicial da referência"
                                                    mode="decimal" :step="0.01" showButtons />
                                            </div>
                                            <div class="flex flex-col gap-1 col-span-2">
                                                <label class="text-sm" for="protocol.finalReference">Referência
                                                    Máxima</label>
                                                <InputNumber size="small" v-model="source.meta.convert.outputMax"
                                                    class="w-full" placeholder="Valor final da referência"
                                                    mode="decimal" :step="0.01" showButtons />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabPanel>
            </TabPanels>
        </Tabs>
        <Drawer v-model:visible="visibleServer" header="Servidor" position="right"
            class="!w-full md:!w-[40rem] lg:!w-[45rem]">
            <template #container="{ closeCallback }">
                <server-create :code="serverSelectd" @close-modal-server="handleSourceClose" />
            </template>
        </Drawer>
    </div>
</template>
