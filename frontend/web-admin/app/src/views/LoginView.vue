<template>
    <q-page class="bg-gray-14 ">
        <div class=" full-width row justify-center items-center" style="min-height: inherit;">
            <template v-if="(logged = useAuthStore().user)">
                <h4>{{$t('login.errors.logged-in')}}</h4>
            </template>
            <template v-else>
                <form  class="login-form" style="width: 400px" @submit.prevent="onSubmit">
                    <q-card class="bg-gray-14 q-pa-lg q-mt-lg " style="background: #424242; max-width: 480px; padding:0%" >
                        <q-card-section class="text-white relative-position">
                            <q-img src="../assets/imgs/banner.png" />
                            <q-item-label class="text-center">
                                <a class="text-h5">Mergen Sawdag</a>
                            </q-item-label>
                            <q-item-label captoin class="text-center" style="color: gray;">IoT powered smart gate system</q-item-label>
                        </q-card-section>
                        <q-card-section style="padding-top: 0;">
                            <div class="input">
                                <q-card-section class="q-gutter-md column">
                                    <q-form @submit="onSubmit" >
                                        <q-input
                                            dense
                                            dark
                                            outlined
                                            color="blue-5"
                                            label-color="blue-5"
                                            v-model="email"
                                            type="email"
                                            label="Email"
                                            :hint="emailError"
                                            no-error-icon   
                                            lazy-rules
                                            :rules="[
                                                val => val && val.length > 0 || $t('login.errors.empty-field'),
                                                val => emailPattern.test(val) || $t('login.errors.invalid-email'),                                    
                                            ]"
                                        />
                                        <q-input
                                            dense
                                            dark
                                            outlined
                                            color="blue-5"
                                            label-color="blue-5"
                                            v-model="password"
                                            :type="isPwd ? 'password' : 'text'"
                                            label="Password"
                                            :hint="passError"
                                            no-error-icon   
                                            lazy-rules
                                            :rules="[
                                                val => val && val.length > 0 || $t('login.errors.empty-field'),
                                                val => val.length > 5 || $t('login.errors.less-chars'),
                                            ]"
                                            @keydown.enter.prevent="onSubmit"
                                            >
                                            <template v-slot:append>
                                                <q-icon
                                                    :name="isPwd ? 'visibility_off' : 'visibility'"
                                                    class="cursor-pointer"
                                                    @click="isPwd = !isPwd"
                                                />
                                            </template>
                                        </q-input>
                                    </q-form>
                                </q-card-section>
                                <q-card-actions class="q-px-md" style="padding-bottom: 0; padding-top: 0;">
                                    <q-btn uneleaved color="blue-6" size="md" style="width: 100%;" :label="$t('login.signin')" type="submit" />
                                </q-card-actions>
                            </div>
                        </q-card-section>
                        <q-card-section  class="text-center text-white relative-position" style="padding-top: 0">
                            <q-item-label  style="color: gray; ">
                                "SEM LLC" {{Date().split(' ')[3]}}. © All right reserved.
                            </q-item-label>
                        </q-card-section>
                    </q-card>
                </form>
            </template>
        </div>
    </q-page>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "../stores";
import { useQuasar } from 'quasar'
import i18n from '../i18n'
import { setCssVar } from 'quasar'

const emailPattern = /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/
let logged = false;

const email = ref("");
const password = ref("");
const error = ref("");
const emailError = ref("");
const passError = ref("");
const errorMessage = ref("");
const isPwd = ref(true);

let dismiss = () => {}//To close notification
const $q = useQuasar()
function notify(ntfyType = "negative"){
    if (dismiss) dismiss()
    dismiss = $q.notify({
        type: ntfyType,
        message: errorMessage,
        position: "bottom-right",
        // classes: false
    }) 
}

function onSubmit() {    
    if(email.value.length === 0 || password.value.length === 0){
        errorMessage.value = i18n.global.t("login.errors.empty-field")
        return notify("warning")//Out from auth
    }
    
    const authStore = useAuthStore();
    return authStore.login(email.value, password.value)
        .then(() => {
            dismiss()
        })
        .catch((error) => {
            console.log(error);
            if (error.response?.data?.message) {
                errorMessage.value = i18n.global.t(`login.errors.${error.response.data.message}`)
            }
            else {
                errorMessage.value = error.response?.data;
            }
            notify("negative")
        })
}


setCssVar('negative', '#b93232')

</script>

<style scoped>
@media (max-width: 720px){
}
/* .login-form{
    padding-bottom: 10%;
} */
</style>
