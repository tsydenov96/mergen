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
        row-key="_id"
        v-model:pagination="pagination"
        :rows-per-page-options="[5, 10, 15, 20, 25, 50]"
        :loading="isLoading"
        :no-data-label="tableMessage"
        @request="onRequest"
        >
        <template #body-cell-network="props">
            <q-td key="network" :props="props">
                <q-icon
                    v-if="props.row.network === true"
                    class="material-icons absolute-center"
                    color="positive" 
                    size="sm"
                    name="sensors" 
                >
                    <q-tooltip anchor="center right" self="center left" :delay="200" transition-show="scale">
                        Open
                    </q-tooltip>
                </q-icon>
                <q-icon
                    v-else
                    class="material-icons  absolute-center" 
                    color="negative"
                    size="sm"
                    name="sensors_off" 
                    >
                    <q-tooltip anchor="center right" self="center left" :delay="200" transition-show="scale">
                        Close
                    </q-tooltip>
                </q-icon>
            </q-td>    
        </template>
    </q-table>
  </div>
</template>

<script setup>

import { onMounted, ref } from 'vue'
import { useDevicesStore } from '../stores/devices'
import i18n from '../i18n'

const tableMessage = ref("No data")
const devicesList = ref("")
const rows = ref([])
const pagination = ref({
    rowsPerPage: 10
})

const columns = [
    { name: 'name', align:'left', label: 'Name', field: 'name', sortable: false, sort: (a, b) => {parseInt(a) - parseInt(b)}, },
    { name: 'topic', align:'center', label: 'Topic', field: 'topic', sortable: false },
    // { name: 'state', align:'center', label: i18n.global.t('table.state'), headerStyle: 'width: 0', field: 'state', sortable: false },
    { name: 'status', align: 'center', label: 'Status', field: 'status', sortable: false },
    // { name: 'online', align: 'center', label: 'Online', field: 'online', sortable: false}, 
    { name: 'network', align: 'center', label: 'Network', field: 'network' },
    { name: 'ping', align: 'center', label: 'Ping', field: 'ping', sortable: false},
]
const setTableData = () => {
    rows.value = []
    devicesList.value?.data.forEach(e => {
        rows.value.push({ _id: e._id, name: e.name, topic: e.topic, status: e.status, network: e.online, ping: e.ping})
        // console.log(e);
    })
    // console.log(rows);
}

const isLoading = ref(false)

const getDevicesListInfo = async(page = pagination.value.page, limit = pagination.value.rowsPerPage) => {
    isLoading.value = true
    try {
        devicesList.value = await useDevicesStore().getDevicesList(page, limit)
    } catch (error) {
        console.log(error);
    }
    console.log(devicesList);
    if(devicesList.value === "") {
        tableMessage.value = "No data"   
        isLoading.value = false
        return
    }
    setTableData()
    
    // pagination.value.page = devicesList.value.data.page
    // pagination.value.rowsNumber = devicesList.value.data.total
    // pagination.value.rowsPerPage = pagination.value.rowsPerPage !== limit ? limit : pagination.value.rowsPerPage
    // pagination.value.lastPage = devicesList.value.data.lastPage// ?? true
    // // console.log(userList.value.data.users);
    console.log(pagination.value);
    isLoading.value = false
}
onMounted( () => {
    getDevicesListInfo()
})

const onRequest = (props) => {
    // console.log(`Rows per page ${props.pagination.rowsPerPage}`);
    getDevicesListInfo(props.pagination.page, props.pagination.rowsPerPage)

}

</script>

<style lang="scss" scoped>

</style>