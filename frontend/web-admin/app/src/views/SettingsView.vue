<template>
    <div class="q-pa-md" style="max-width: 300px">
        <div class="q-gutter-md">
            <q-select 
                dark
                v-model="currLang" 
                :options="langOptions" 
                @update:model-value="langUpdate"
                :label="i18n.global.t('settings.language')"
                :loading="isLoading"
            />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import i18n from '../i18n';
import { SUPPORTED_LOCALES, setI18nLanguage, loadLocaleMessages } from '../i18n';

const currLang = ref(i18n.global.t(`settings.locales.${i18n.global.locale.value}`))

console.log(i18n.global);
const langOptions = SUPPORTED_LOCALES.map(
    (val) => ({
            value: val, 
            label: i18n.global.t(`settings.locales.${val}`) 
    })
)

const isLoading = ref(false)

const langUpdate = async (locale) => {
    isLoading.value = true
    await loadLocaleMessages(i18n, locale.value)
    isLoading.value = false
    // console.log(locale);
    setI18nLanguage(i18n, locale.value)
}

</script>

<style lang="scss" scoped>
</style>