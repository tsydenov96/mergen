import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar, Notify } from 'quasar'

import App from './App.vue'
import router from './router'
import i18n from './i18n.js'

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'

// Import Quasar css
// import 'quasar/src/css/index.sass'
import 'quasar/dist/quasar.css'

import './assets/main.css'

const pinia = createPinia()

const app = createApp(App)
console.log(i18n.global);
app
    .use(Quasar, {
        plugins: {
            Notify,
        }, // import Quasar plugins and add here
        config: {
            notify:{},
        },
    })
    .use(pinia)
    .use(router)
    .use(i18n)
    .mount('#app')
