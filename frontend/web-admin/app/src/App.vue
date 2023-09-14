<template>
  <q-layout view="LHh lpR fFf" style="background: #303030">
    <Layout />
    <div class="app" >
      <q-page-container >
        <RouterView/>
      </q-page-container>
    </div>
  </q-layout>
</template>

<script setup>
import { RouterView } from 'vue-router'
import Layout from './components/Layout.vue'
</script>

<style scoped>
/* * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
} */
/* @media (min-width: 720px) {
  .app  {
    padding: 20px;
  }
} */
</style>
