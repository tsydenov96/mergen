import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n';
import axios from 'axios'
import en from './locales/en';
import mn from './locales/mn';


export const SUPPORTED_LOCALES = ['en', 'mn']

export function setupI18n(options = { locale: window.localStorage('locale') }) {
    if(!SUPPORTED_LOCALES.includes(locale)){
        locale = SUPPORTED_LOCALES[0]
    }
    const i18n = createI18n(options)
    setI18nLanguage(i18n, options.locale)
    return i18n
}

export function setI18nLanguage(i18n, locale) {
    if (i18n.mode === 'legacy') {
        i18n.global.locale = locale
    } else {
        i18n.global.locale.value = locale
    }
    /**
     * NOTE:
     * If you need to specify the language setting for headers, such as the `fetch` API, set it here.
     * The following is an example for axios.
     *
     * axios.defaults.headers.common['Accept-Language'] = locale
     */
    document.querySelector('html').setAttribute('lang', locale)
}

export async function loadLocaleMessages(i18n, locale) {
    // load locale messages with dynamic import
    const messages = await import(
    /* webpackChunkName: "locale-[request]" */ `./locales/${locale}.json`
    )

    // set locale and locale message
    i18n.global.setLocaleMessage(locale, messages.default)

    return nextTick()
}


const i18n = createI18n({
    legacy: false,
    locale: 'en',
    fallbackLocale: 'mn',
    localeDir: 'locales',
    messages: {
        en,
        mn,
    },
});

export default i18n;