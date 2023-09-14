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
      v-model:pagination="initialPagination"
      :loading="isLoading"
      no-data-label="No data"
    >
      <template #body-cell-action="props">
          <q-td :props="props">
              <q-btn dense flat round color="blue" field="map" icon="map"></q-btn>
          </q-td>
      </template>
      <template v-slot:bottom="scope" >
        <div class="row justify-end items-center q-glutter-sm" style="padding-left: 0%; flex: auto;">
          <q-btn label="Add" no-caps color="primary" @click="addAddressModal = true"/>
          <a class="q-px-md">Records per page:</a>
          <q-select dense dark borderless :options="[5, 10, 15, 20]" v-model="initialPagination.rowsPerPage"/>
          <a class="q-px-md">{{ pagePagination }}</a>
          <q-btn
            icon="chevron_left"
            round
            dense
            flat
            :disable="scope.isFirstPage || selected"
            @click="scope.prevPage"
          />
          <!-- v-if="pagesCount > 2" -->
          <q-btn
            icon="chevron_right"
            round
            dense
            flat
            :disable="scope.isLastPage || selected"
            @click="scope.nextPage"
            />
          </div>

      </template>
      <template v-slot:no-data="{ icon, message }">
        <div class="row items-center q-gutter-sm" style="flex: auto;">
          <q-icon size="2em" :name="icon" />
          <span>
            {{ message }}
          </span>
          <q-space/>
          <q-btn label="Add" no-caps color="primary" @click="addAddressModal = true"/>
        </div>
      </template>
    </q-table>
  </div>
  <q-dialog 
    v-model="addAddressModal"
    >

    <q-card class="bg-gray-14 q-mt-lg q-glutter-sm" style="background: #424242; padding:0%;" >
      <q-card-section class="q-gutter-lg column">
        <div>
          <q-input
              dense dark outlined
              color="blue-5"
              type="text"
              label="Name"
              v-model="newAddress.name"
              no-error-icon
              lazy-rules
              :rules="[
                  val => val && val.length > 0 || 'Empty',                                  
              ]"
          />
          <q-input
              dense dark outlined
              color="blue-5"
              type="text"
              label="Admin email"
              v-model="newAddress.adminMail"
              no-error-icon
              lazy-rules
              :rules="[
                  val => val && val.length > 0 || 'Empty',                                  
              ]"
          />
          <q-input
              dense dark outlined
              color="blue-5"
              type="text"
              label="City"
              v-model="newAddress.city"
              no-error-icon
              lazy-rules
              :rules="[
                  val => val && val.length > 0 || 'Empty',                                  
              ]"
          />
          <q-input
              dense dark outlined
              color="blue-5"
              type="text"
              label="District"
              v-model="newAddress.district"
              no-error-icon
              lazy-rules
              :rules="[
                  val => val && val.length > 0 || 'Empty',                                  
              ]"
          />
          <q-input
              dense dark outlined
              color="blue-5"
              type="text"
              label="Subdistrict (optional)"
              v-model="newAddress.subdistrict"
          />
        </div>
        <q-input
            dense dark outlined
            color="blue-5"
            type="text"
            label="Street (optional)"
            v-model="newAddress.street"
        />
        <q-input
            dense dark outlined
            color="blue-5"
            type="text"
            label="Buildings (optional)"
            v-model="newAddress.buildings"
        />
      </q-card-section>

      <q-card-section style="height: 380px; width: 480px; max-width: 560px; max-height: 400px;">
        <q-card class="bg-gray-14 q-pa-xs" style="background: #303030; height: 320px;">
          <q-scroll-area dark style="height: 100%; max-width: 100%;">
            <q-card-section
              class="row q-mb-sm"
              style="background: #424242"
              v-for="item in devices"
              >
              <div>
                <div class style="color: white;">Name: {{ item.name }}</div>
                <div class style="color: white;">Topic: {{ item.topic }}</div>
              </div>
              <q-space/>
              <q-btn flat @click="deleteDevice(item._id)" icon="close" style="color: red; align-self: self-end;">
                <q-tooltip class=" text-body2" anchor="center right" self="center left" :delay="200" transition-show="scale">
                  Delete
                </q-tooltip>
              </q-btn>
            </q-card-section>
            <q-card-section class="column" style="background: #424242; padding: 0%;">
              <q-input
                class="q-ma-sm"
                style="padding-bottom: 0%;"
                dense dark outlined
                color="blue-5"
                type="text"
                label="Name"
                v-model="newDevice.name"
                lazy-rules
                :rules="[
                    val => val && val.length > 0 || 'Empty',                                  
                ]"
              />
              <q-input
                class="q-ma-sm"
                style="padding-bottom: 0%;"
                dense dark outlined
                color="blue-5"
                type="text"
                label="Topic"
                v-model="newDevice.topic"
                lazy-rules
                :rules="[
                    val => val && val.length > 0 || 'Empty',                                  
                ]"
              />
            </q-card-section>
          </q-scroll-area>
        </q-card>
        <q-btn class="q-mt-sm" label="Add Device" color="primary" no-caps @click="setDevice"/>
      </q-card-section>
      <q-btn 
        class="q-ma-md" 
        label="Submit" 
        color="primary" t
        ype="Submit" 
        no-caps 
        size="lg" 
        @click="setAddress" />
    </q-card>
  </q-dialog>
</template>

<script setup>
  
import { onMounted, ref, computed } from 'vue'
import { useAddressesStore } from '../stores/addresses'
import { useAuthStore } from '../stores/auth'
import { useDevicesStore } from '../stores/devices'
import i18n from '../i18n'

const newAddress = ref({
  name: "",
  adminMail: "",
  city: "",
  district: "",
  subdistrict: "",
  street: "",
  buildings: "",
  devices: []
})
const newDevice = ref({
  name: "",
  topic: ""
})
const devices = ref([])
const allowControlSelections = ref(false)
const addressList = ref("")
const rows = ref([])
const addAddressModal = ref(false)
const selected = ref(false)
const initialPagination = ref({
  rowsPerPage: 10,
  sortBy: 'desc',
  descending: false,
  page: 1,
})
const pagesCount = computed(() => {
  return Math.ceil(rows.length / initialPagination.value.rowsPerPage)//maybe wrong
})
const pagePagination = computed(() => {
  pagesCount;
  var ceilPages = rows.value.length < initialPagination.value.rowsPerPage * initialPagination.value.page 
    ? rows.value.length : initialPagination.value.rowsPerPage * initialPagination.value.page;
  return (initialPagination.value.rowsPerPage * (initialPagination.value.page - 1) + 1) + '-' + ceilPages + " of " + rows.value.length;
})



const columns = [
  { name: 'name', align:'left', label: i18n.global.t('table.name'), field: 'name', sortable: true },
  { name: 'address', align: 'left', label: 'Address', field: 'address', style: 'width: 0', sortable: true },
  { name: 'buildings', align: 'center', label: 'Number of residents', field: 'buildings', sortable: true },
  // { name: 'map', align: 'center', label: 'Map', field: '', align:'center' },
]
const setTableData = () => {
    addressList.value?.data.forEach(e => {
        rows.value.push({ _id: e._id, name: e.name, address: `${e.city}, ${e.street}`, buildings: e.buildings })
    });
    // console.log(rows);
}

const isLoading = ref(false)

const getUserListInfo = async() => {
    if(useAuthStore().userRole.rules.USER[0]?.actions.find(elem => elem === 'UPDATE') !== undefined) 
        allowControlSelections.value = true
    console.log(useAuthStore().userRole.rules.USER[0].actions.find(elem => elem === 'PERMIT'));

    isLoading.value = true
    try {
        addressList.value = await useAddressesStore().getAddresses()
        console.log(addressList.value);
    } catch (error) {
    }
    setTableData()
    // console.log(userList.value.data.users);
    isLoading.value = false
}
onMounted(()=>{
    getUserListInfo()

})

function setAddress() {
  if(newAddress.value.name === "" || newAddress.value.adminMail === "" 
    || newAddress.value.city === "" || newAddress.value.district === "")
    console.log("empty fields");
  else{
    console.log(newAddress.value);
    return useAddressesStore().setAddress(newAddress.value)
    .then((data => {
      console.log(data);
      newAddress.value = { name: "", adminMail: "", city: "", district: "", subdistrict: "",
        street: "", buildings: "", devices: [] };
      newDevice.value = { name: "", topic: "" };
      devices.value = [];
      addAddressModal.value = false;
    }))
    .catch((error) => {
      console.log(error.message);
    })
  }
}

function setDevice() {
  if(newDevice.value.name === "" || newDevice.value.topic === "" )
    console.log("empty fields");
  else{
    console.log(newDevice.value);
    return useDevicesStore().setDevice(newDevice.value)
    .then(data => {
      console.log(data);
      if(data._id){
        newAddress.value.devices.push(data._id)
        devices.value.push(data)
      }
    })
    .catch((error) => {
      console.log(error.message);
    })
  }
}

function deleteDevice(deviceId){
  return useDevicesStore().deleteDevice(deviceId)
  .then((data) => {
    console.log(data, devices.value);
    var dev = devices.value.filter((val) => val._id !== data._id)
    devices.value = dev
    console.log(devices.value);
  })
}

</script>
<style scoped></style>