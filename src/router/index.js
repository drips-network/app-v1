import { createRouter, createWebHistory } from 'vue-router'
import Explore from '../views/Explore.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Explore
  },
  {
    path: '/create',
    name: 'create',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "create" */ '../views/Create.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
