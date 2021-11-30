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
        redirect: { name: 'user-in-projects' }
      },
      // incoming funds
      {
        path: 'projects',
        name: 'user-in-projects',
        alias: 'user',
        component: () => import(/* webpackChunkName: "user-projects" */ '../views/user/UserProjects.vue')
      },
      {
        path: 'drips/in',
        name: 'user-in-drips',
        component: () => import(/* webpackChunkName: "user-drips-in" */ '../views/user/UserDripsIn.vue')
      },
      // outgoing funds
      {
        path: 'drips/out',
        name: 'user-out-drips',
        component: () => import(/* webpackChunkName: "user-drips-out" */ '../views/user/UserDripsOut.vue')
      },
      {
        path: 'memberships',
        name: 'user-out-memberships',
        component: () => import(/* webpackChunkName: "user-memberships" */ '../views/user/UserMemberships.vue')
      },
      {
        path: 'splits/out',
        name: 'user-out-splits',
        component: () => import(/* webpackChunkName: "user-splits-out" */ '../views/user/UserSplitsOut.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
