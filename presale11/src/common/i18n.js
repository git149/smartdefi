import Vue from 'vue'
import VueI18n from 'vue-i18n'
Vue.use(VueI18n)
 
const messages = {
  'cn': require('./i18n/zh.js'),   
  'en': require('./i18n/en.js'),
  'tc': require('./i18n/tc.js'),
}


function getLanguage() {
  if (localStorage && localStorage.locale) {
    return localStorage.locale;
  }
  localStorage.locale = 'en'
  return 'en'
}

 
export default new VueI18n({
    locale : getLanguage() ,
    messages : messages,
})