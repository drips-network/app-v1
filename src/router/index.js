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
  },
  {
    path: '/projects/:address',
    name: 'project',
    component: () => import(/* webpackChunkName: "project" */ '../views/Project.vue')
  },
  {
    path: '/:address',
    component: () => import(/* webpackChunkName: "user" */ '../views/User.vue'),
    children: [
      {
        path: '',
        name: 'user',
        component: () => import(/* webpackChunkName: "user-projects" */ '../views/user/UserProjects.vue')
      },
      {
        path: 'funds',
        name: 'user-funds',
        component: () => import(/* webpackChunkName: "user-funds" */ '../views/user/UserFunds.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
