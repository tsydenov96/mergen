<template>    
    <q-header 
        elevated
        class="text-white"
        style="background: #424242"
        v-if="logged"
        >
        <q-toolbar>
            <q-btn flat round dense icon="menu" class="q-mr-sm" @click="drawer = !drawer" />
            <!-- <q-btn flat name="home" :label="$t('menu.home')" to="/" /> -->
            <q-toolbar-title>{{$t(`menu.${router.currentRoute.value.name || 'home'}`)}}</q-toolbar-title>
            <q-space></q-space>

            <q-btn v-if="!logged" flat name="login" :label="$t('menu.login')" to="/login" />
            <!-- <q-btn v-else flat name="user" label="User" to="/me" /> -->
            <!-- <q-btn v-if="!logged" flat name="signup" label="Signup" to="/signup" /> -->
            <!-- <q-btn v-if="logged" flat name="logout" icon="logout" @click="logout" /> -->
        </q-toolbar>
    </q-header>
    
    <q-drawer 
        v-model="drawer"
        v-if="logged"
        show-if-above 
        side="left"
        :width="270"
        :breakpoint="1100"
        class="bg-blue-grey-9 text-white shadow-4"
        @on-layout="menuLoad()"
        >
        <q-scroll-area class="fit">
            <q-list>
                <q-item style="margin: 0%; ">
                    <q-item-section avatars style="flex: none">
                        <q-avatar>
                            <q-img src="../assets/imgs/logoSq.png" style="" />
                        </q-avatar>
                    </q-item-section>
                    <q-item-section style="flex: none;">
                        <q-item-label>
                            <a class="text-h6">Mergen Sawdag</a>
                        </q-item-label>
                    </q-item-section>
                    <q-item-section style="flex: none;">
                        <q-btn padding="sm" round v-if="logged" flat name="logout" icon="logout" @click="logout" />
                    </q-item-section>
                </q-item>
                <q-separator dark inset/>

                <q-item style="margin: 0%; ">
                    <q-item-section avatars style="flex: none">
                        <q-avatar rounded>
                            <q-img src="../assets/imgs/blank.png" style="" />
                        </q-avatar>
                    </q-item-section>
                    <q-item-section>
                        <q-item-label>
                            {{useAuthStore().user.data.user.name}}
                        </q-item-label>
                    </q-item-section>
                    <q-item-section style="flex: none;">
                        <q-btn round flat padding="xs" name="settings" icon="settings" to="settings" />
                    </q-item-section>
                </q-item>
                <!-- <q-separator inset="item"/> -->

                <template v-for="(menuItem, index) in menuList" :key="index">
                    <q-separator :key="'sep' + index" v-if="menuItem.separator" />
                    <q-item clickable :to=menuItem.label.toLowerCase() >
                        <q-space v-if="menuItem.label === 'Settings'" />
                        <q-item-section avatar >
                            <q-icon :name="menuItem.icon" />
                        </q-item-section>
                        <q-item-section>
                            {{ menuItem.label }}
                        </q-item-section>
                    </q-item>
                </template>
            </q-list>
        </q-scroll-area>
    </q-drawer>
</template>

<script setup>
import router from '@/router';
import { ref } from 'vue';
import { computed } from '@vue/reactivity';
import { useAuthStore } from '../stores/auth';
import { RouterLink } from 'vue-router'
import i18n from '../i18n'

const drawer = ref(false)
const currentPage = ref("")

// function goTo(currLabel){
//     console.log(currentPage.value);
//     router.push(`/${currLabel}`)
// }

const logged = computed(() => { return useAuthStore().user ? true : false })
// console.log($t("menu.users"));

function logout(){
    const authStore = useAuthStore();
    authStore.logout()
    router.push('/login')
    router.go()
}

const iconsList = { 
    statistics: "insights",
    devices: "cell_tower",  
    users: "supervisor_account", 
    roles: "rule", 
    map: "map",
    purchases: "credit_card",
    control: "airplay",
    events: "hive",
    addresses: "location_city",
    about: "info"
}


var menuList = []
const menuLoad = (() => {
    if(!menuList[0]){
        // menuList.push({
        //     icon: 'home',
        //     label: i18n.global.t('menu.home'),
        //     // separator: true
        // })
        console.log(useAuthStore().userMenus);
        useAuthStore().userMenus.forEach(elem => {
            // console.log(iconsList[elem.toLowerCase()]);
            if(elem.name.toLowerCase() !== 'statistics' && elem.name.toLowerCase() !== 'control')//statistic & control in menu 
                menuList.push({
                    icon: iconsList[elem.name.toLowerCase()],
                    // label: elem[0] + elem.slice(1).toLowerCase(),
                    label: i18n.global.t(`menu.${elem.name.toLowerCase()}`),
                })
        })
    
        // menuList.push({
        //     icon: 'settings',
        //     label: i18n.global.t('menu.settings'),
        //     separator: true
        // })
    }
})


</script>

<style lang="scss" scoped>

</style>