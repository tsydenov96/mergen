<template>
  <div class="q-pa-auto">
    <q-table
        square
        flat
        dark
        class="text-white"
        style="background: rgba(0,0,0,0);"
        :rows="rows"
        :columns="columns"
        row-key="index"
        :pagination="initialPagination"
        :loading="isLoading"
        no-data-label="No data"
        >
        <template #body-cell-selector="props">
            <q-td :auto-width="true" key="checkbox" :props="props">
                <q-checkbox 
                    :disable="!allowControlSelections"
                    v-if="!allowIsLoading.find(elem => elem === props.row._id)"
                    v-model="props.row.selector" 
                    v-on:click="addToAccess(props.row)"
                    dense 
                    />
                <q-spinner
                    v-else
                    color="primary"
                    size="1.5em"
                    />
            </q-td>
        </template>
    </q-table>
    <div class="row justify-end q-mr-lg q-glutter-md" v-if="selected && allowControlSelections" style="flex: auto;" >
        <q-btn @click="updateSelected()" label="Update" style="margin-right: 6px;" color="primary"/>
        <q-btn @click="clearSelected()" label="Cancel" color="primary" />
    </div>
  </div>
</template>

<script setup>

import { onMounted, ref, computed } from 'vue'
import { useUserlistStore } from '../stores/userlist'
import { useAuthStore } from '../stores/auth'
import i18n from '../i18n'

const allowControlSelections = ref(false)
const userList = ref("")
const rows = ref([])
const selected = ref(false)
const selectedUsers = ref([])
const selectedStates = ref([])
const initialPagination = ref({
    rowsPerPage: 10,
    sortBy: 'desc',
    descending: false,
    page: 1,
})
const pagesNumber = computed(() => {
      return Math.ceil(rows.length / initialPagination.rowsPerPage)
})

const columns = [
    { name: 'index', align: 'left', label: '#', field: 'index', style: 'width: 0', sortable: true },
    { name: 'name', align:'left', label: i18n.global.t('table.name'), field: 'name', sortable: true },
    { name: 'email', align:'left', label: 'Email', field: 'email', sortable: true },
    { name: 'selector', align: 'center', label: i18n.global.t('table.controls'), field: 'selector'},
]
const setTableData = () => {
    userList.value?.data.forEach(e => {
        rows.value.push({ _id: e._id, index: e.index, name: e.name, email: e.email, selector: e.hasAccess, lastMsgTime: e.lastMsgTime })
    });
    // console.log(rows);
}

const isLoading = ref(false)

const getUserListInfo = async() => {
    if(useAuthStore().userRole.rules.USER[0]?.actions.find(elem => elem === 'PERMIT') !== undefined
        // && useAuthStore().user.data.user.addressId 
    ) 
        allowControlSelections.value = true
    console.log(useAuthStore().userRole.rules.USER[0].actions.find(elem => elem === 'PERMIT'));

    isLoading.value = true
    try {
        userList.value = await useUserlistStore().getUserlist()
        console.log(userList.value);
    } catch (error) {
    }
    setTableData()
    // console.log(userList.value.data.users);
    isLoading.value = false
}
onMounted(()=>{
    getUserListInfo()

})


const allowIsLoading = ref([])

const addToAccess = async(rowUser) => {
    const selectedUser = userList.value?.data.find(elem => elem._id === rowUser._id)
    if(selectedUsers.value.find(item => item._id === selectedUser._id) === undefined)
        selectedUsers.value.push(selectedUser);
    selectedStates.value.forEach(elem => {
        if(elem.name === rowUser.name) 
            elem.selector = rowUser.selector
    })
    if(selectedStates.value.find(item => item._id === rowUser._id) === undefined)
        selectedStates.value.push(rowUser)
    if(!selected.value) 
        selected.value = true
    console.log('selected user');
    console.log(selectedUser);
    console.log(rowUser);
}

const updateSelected = async() => {
    try {
        selectedStates.value.forEach(async user => {
            // allowIsLoading.value.push(user._id)
            const response = await useUserlistStore().setAccess(user._id, user.selector)
        })
        clearSelected()
    } catch (error) {
        console.log("Selection error");
        // rowUser.selector = !rowUser.selector
    }
    // allowIsLoading.value = allowIsLoading.value.filter(item => item !== .index)
}


const clearSelected = () => {
    selectedUsers.value.forEach(user => { 
        selectedStates.value.find(elem => elem._id === user._id).selector = user.hasAccess ?? null
    })
    console.log(selectedStates.value);
    console.log(selectedUsers.value);
    selectedStates.value = []
    selectedUsers.value = []
    selected.value = false
}

</script>
<style scoped></style>