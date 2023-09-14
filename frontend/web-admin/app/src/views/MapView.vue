<template>

  <div style="height:600px; width:800px;">
      <!-- v-if="!loading && geojson" -->
    <l-map 
      :ref="map" 
      v-model:zoom="zoom"
      :center="center"
      :maxZoom="18"
      :minZoom="3"
      :zoomSnap="0.25"
      :useGlobalLeaflet="false" 
      >
      <l-tile-layer 
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
      layer-type="base"
      name="OpenStreetMap"
      ></l-tile-layer>
      <l-polygon 
        v-for="(item, _id) in addresses.data"
        :key="_id"
        :lat-lngs="item.polygon"
        color="#060606"
        :fill="true"
        :fillOpacity="0.5"
        fillColor="#030303"
      ></l-polygon> 
      <l-control-scale position="bottomleft" />
    </l-map>
  </div><br/>
  <div>
    <q-btn label="Add address" color="blue-6" @click="addressModal = true"/>
    <q-dialog v-model="addressModal">
      <q-card class="bg-gray-14 q-pa-lg q-mt-lg q-glutter-sm" style="background: #424242; padding:0%" >
        <q-card-section  style="height: 480px; width: 560px;">
            <add-on-map/>
          <!-- <l-map
          :ref="map" 
          v-model:zoom="zoom"
          :center="center"
          :maxZoom="18"
          :minZoom="6"
          :zoomSnap="0.25"
          :useGlobalLeaflet="false" 
          >
          <l-tile-layer 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
            layer-type="base"
            name="OpenStreetMap"
          />
          </l-map> -->
        </q-card-section>
        <q-card-section class="q-gutter-md column">
            <!-- <q-form > -->
              <q-input
                dense dark outlined
                color="blue-5"
                label-color="blue-5"
                type="text"
                label="Name"                
                />
              <q-input
                dense dark outlined
                color="blue-5"
                label-color="blue-5"
                type="text"
                label="City"                
                />
              <q-input
                dense dark outlined
                color="blue-5"
                label-color="blue-5"
                type="text"
                label="District"                
                />
              <q-select 
                dense dark outlined
                v-model="device"
                :options="devices.data"
                :option-label="'name'"
                :option-value="'_id'"
                label="Devices"
                multiple
                emit-value
                map-options
              />
                <q-btn label="SAVE" color="blue-6" />
        </q-card-section>

          <!-- </q-form> -->
      </q-card>
    </q-dialog>
  </div>

</template>
  
  <script setup>
  import { ref, onBeforeMount, onMounted } from "vue";
  import L from "leaflet";
  import 'leaflet/dist/leaflet.css';
  // import 'leaflet-draw/dist/leaflet.draw.css';
  import { LMap, LTileLayer, LMarker, LPolygon, LGeoJson, LControlScale } from "@vue-leaflet/vue-leaflet";
  import { useAddressesStore } from '../stores/addresses'
  import { useDevicesStore } from '../stores/devices'
  import AddOnMap from '../components/AddOnMap.vue'
  
  const device = ref([])
  const addresses = ref("")
  const addressModal = ref(false)
  const map = ref()
  const loading = ref(false)
  const zoom = ref(14);
  const geojson = ref()
  const center = ref([47.918495, 106.917438])
  const devices = ref()
  
  const asd = async () => {
    loading.value = true

    addresses.value = await useAddressesStore().getAddresses()
    console.log(addresses.value.data);
    // const resp = await fetch("https://rawgit.com/gregoiredavid/france-geojson/master/regions/pays-de-la-loire/communes-pays-de-la-loire.geojson") 
    // geojson.value = await resp.json()
    // console.log(geojson.value);
    // center.value = Array(geojson.value.features[0].geometry.coordinates[0][0][1], geojson.value.features[0].geometry.coordinates[0][0][0])
    loading.value = false
    // console.log(center.value);
  }
  
  onBeforeMount( async () => {
    asd()
    devices.value = await useDevicesStore().getDevicesList()
    console.log(devices.value);
    // console.log(useAddressesStore().getAdressesList());
  })
  // var map = Lmap('map').setView([51, -9], 12)

  onMounted(()=>{
    
  })
  
  </script>
    
  <style>
  
  </style>