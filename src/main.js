import Vue from 'vue'
import App from './App.vue'
import router from './router'
import VueMeta from 'vue-meta'
import FullscreenImage from './components/FullscreenImage.vue'

Vue.config.productionTip = false
Vue.use(VueMeta)
Vue.component('FullscreenImage', FullscreenImage)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
