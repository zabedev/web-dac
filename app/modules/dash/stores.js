import { apiService } from '@/service/api';
import { defineStore } from 'pinia';
import { computed, reactive } from 'vue';

export const useGatewayStore = defineStore('gateway', () => {
    const state = reactive({
        servers: [],
        sources: []
    })

    const source = {
        async index() {
            return await apiService.get(`sources`)
        },
        async show({ id }) {
            return await apiService.get(`sources/${id}`)
        },
        async store({ data }) {
            return await apiService.post(`sources`, data)
        },
        async update({ id, data }) {
            return await apiService.put(`sources/${id}`, data)
        },
        async delete({ id }) {
            return await apiService.delete(`sources/${id}`)
        },
    }

    const server = {
        async index() {
            return await apiService.get(`servers`)
        },
        async show({ id }) {
            return await apiService.get(`servers/${id}`)
        },
        async store({ data }) {
            return await apiService.post(`servers`, data)
        },
        async update({ id, data }) {
            return await apiService.put(`servers/${id}`, data)
        },
        async delete({ id }) {
            return await apiService.delete(`servers/${id}`)
        },
    }

    const api = {
        server,
        source,
    }

    return {
        servers: computed(() => state.servers),
        sources: computed(() => state.sources),
        api
    }
})