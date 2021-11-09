import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './style/index.css'

const app = createApp(App)

// Register a global custom directive called `v-focus`
app.directive('autofocus', {
  // When the bound element is mounted into the DOM...
  mounted (el) {
    // Focus the element
    el.focus()
    // select the text
    el.select()
  }
})

// mount
app.use(store).use(router).mount('#app')
