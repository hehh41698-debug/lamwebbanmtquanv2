import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useProductStore } from './store/product'

// Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Custom CSS
import './assets/css/main.css'
import './assets/css/animations.css'
import './assets/css/admin.css'

// Vue Toastify
import Vue3Toastify from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Vue3Toastify, {
  autoClose: 3000,
  position: 'top-right',
  theme: 'light'
})

// ============================================
// INIT STORE WATCHERS SAU KHI PINIA ĐƯỢC CÀI
// ============================================
const productStore = useProductStore()
productStore.initWatchers()

app.mount('#app')