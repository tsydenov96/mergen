<template>
    <div class="q-pa-auto">
    <q-table
        square
        flat
        dark
        class="text-white"
        style="background: rgba(0,0,0,0)"
        :rows="rows"
        :columns="columns"
        row-key="index"
        v-model:pagination="pagination"
        :rows-per-page-options="[5, 10, 15, 20, 25, 50]"
        :loading="isLoading"
        no-data-label="Loading"
        @request="onRequest"
        >
        <template #body-cell-success="props">
            <q-td key="success" :props="props">
                <q-icon
                    v-if="props.row.success === 'ok'"
                    class="material-icons absolute-center"
                    color="positive" 
                    size="sm"
                    name="check_circle" 
                >
                    <q-tooltip anchor="center right" self="center left" :delay="200" transition-show="scale">
                        Success
                    </q-tooltip>
                </q-icon>
                <q-icon
                    v-else
                    class="material-icons  absolute-center" 
                    color="negative"
                    size="sm"
                    name="do_disturb_on" 
                    >
                    <q-tooltip anchor="center right" self="center left" :delay="200" transition-show="scale">
                        Fail
                    </q-tooltip>
                </q-icon>
            </q-td>    
        </template>
    </q-table>
  </div>
</template>

<script setup>

import { onMounted, ref } from 'vue'
import { useEventsStore } from '../stores/events'
import i18n from '../i18n'

const eventsList = ref("")
const rows = ref([])
const pagination = ref({
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0,
    lastPage: false
})

const columns = [
    { name: 'index', align:'left', label: '#', field: 'index', headerStyle: 'width: 0', sortable: true, sort: (a, b) => {parseInt(a) - parseInt(b)}, },
    { name: 'email', align:'left', label: 'Email', field: 'email', sortable: false },
    { name: 'state', align:'center', label: i18n.global.t('table.state'), field: 'state', sortable: false },
    { name: 'success', align:'center', label: 'Success', field: i18n.global.t('table.success'), sortable: false },
]
const setTableData = () => {
    rows.value = []
    eventsList.value?.data.events.forEach(e => {
        rows.value.push({index: e.index, email: "admin@admin.com", state: e.state, success: e.success})
    });
    // console.log(rows);
}

const isLoading = ref(false)

const getEventsListInfo = async(page = pagination.value.page, limit = pagination.value.rowsPerPage) => {
    isLoading.value = true
    try {
        eventsList.value = await useEventsStore().getEventsList(page, limit)
    } catch (error) {
        console.log(error);
    }
    console.log(eventsList);
    setTableData()
    
    pagination.value.page = eventsList.value.data.page
    pagination.value.rowsNumber = eventsList.value.data.total
    pagination.value.rowsPerPage = pagination.value.rowsPerPage !== limit ? limit : pagination.value.rowsPerPage
    pagination.value.lastPage = eventsList.value.data.lastPage
    // console.log(userList.value.data.users);
    isLoading.value = false
}
onMounted( () => {
    getEventsListInfo()
})

const onRequest = (props) => {
    // console.log(`Rows per page ${props.pagination.rowsPerPage}`);
    getEventsListInfo(props.pagination.page, props.pagination.rowsPerPage)

}

</script>

<style lang="scss" scoped>

</style>