<template>
    <div style="height: 460px; width: 100%">
      <l-map
        ref="map"
        no-blocking-animations
        :zoom="zoom"
        :center="center"
        :options="mapOptions"
        style="height: 100%"
        :useGlobalLeaflet="false" 
      >
      <l-feature-group ref="featureGroup">
      </l-feature-group>
      </l-map>
    </div>
</template>

<script>
import "leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-toolbar/dist/leaflet.toolbar.css";

import { LFeatureGroup, LMap, LGeoJson, LTileLayer } from "@vue-leaflet/vue-leaflet";

import "leaflet-draw/dist/leaflet.draw-src.js";
import "leaflet-toolbar";
// import "leaflet-draw-toolbar/dist/leaflet.draw-toolbar.js";

export default {
    components: {
        LMap,
        LTileLayer,
        LGeoJson,
    },

    data() {
        return {
            url: "https://{s}.tile.osm.org/{z}/{x}/{y}.png",
            zoom: 1,

            leafletReady: false,
            leafletObject: null,

            visible: false,

            center: [47.918495, 106.917438],
            mapOptions: "",


        };
    },
    mounted(){
        this.map = this.$refs.map;
        this.featureGroup = this.$refs.featureGroup;
        mapInit(this.map.mapObject, this.featureGroup.mapObject);

        // draw saved map elements
        if (!isEmpty(this.boardMarkers)) {
          this.boardMarkers.forEach((savedMarker) => {
            const marker = L.marker(this.markerLatLong(savedMarker));
            this.addLayerToMapWithBindings(marker, savedMarker, mapboardResourceTypes.MARKERS);
          });
        }

        // Handle Leaflet Draw events
        // On adding a new map element with Leaflet Draw, add a linked resource in mapboard for title and description
        this.map.mapObject.on(L.Draw.Event.CREATED, (e) => {
          // do some app-specific actions
          if (e.layerType === 'marker') {
            this.addItem(mapboardResourceTypes.MARKERS, e);
          } else if (Object.values(leafletDrawRegionTypes).findIndex((type) => type === e.layerType) > -1) {
            this.addItem(mapboardResourceTypes.REGIONS, e);
          }
        });
    },

    methods: {
        async onLeafletReady() {
            await this.$nextTick();
            this.leafletObject = this.$refs.map.leafletObject;
            this.leafletReady = true;

            new L.Toolbar2.DrawToolbar({
                position: "topleft",
            }).addTo(this.leafletObject);
        },
        addLayerToMapWithBindings: function(layer, linkedResource, resourceType) {
            layer.mapboardId = linkedResource.id;
            layer.resourceType = resourceType;
            layer.addTo(this.featureGroup.mapObject);
            this.bindTooltipAndEvents(layer, linkedResource, resourceType);
        },
    },
};
</script>

<style></style>
