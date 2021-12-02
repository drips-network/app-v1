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
    path: '/communities/:address',
    name: 'project', // TODO rename
    component: () => import(/* webpackChunkName: "project" */ '../views/Project.vue')
  },

  // user / address
  {
    path: '/:address',
    component: () => import(/* webpackChunkName: "user" */ '../views/User.vue'),
    children: [
      {
        path: '',
        name: 'user',
        redirect: { name: 'user-communities' }
      },
      // projects
      {
        path: 'communities',
        name: 'user-communities',
        component: () => import(/* webpackChunkName: "user-projects" */ '../views/user/UserProjects.vue')
      },
      // communities
      {
        path: 'communities/joined',
        name: 'user-communities-joined',
        component: () => import(/* webpackChunkName: "user-communities" */ '../views/user/UserMemberships.vue')
      },
      // drips
      {
        path: 'drips',
        name: 'user-drips',
        redirect: { name: 'user-drips-out' }
      },
      {
        path: 'drips/in',
        name: 'user-drips-in',
        component: () => import(/* webpackChunkName: "user-drips-in" */ '../views/user/UserDripsIn.vue')
      },
      {
        path: 'drips/out',
        name: 'user-drips-out',
        component: () => import(/* webpackChunkName: "user-drips-out" */ '../views/user/UserDripsOut.vue')
      }
      // splits
      // {
      //   path: 'splits',
      //   name: 'user-splits',
      //   component: () => import(/* webpackChunkName: "user-splits-out" */ '../views/user/UserSplitsOut.vue')
      // }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      // don't scroll to top on user tab changes...
      if (to.name.includes('user') && from.name.includes('user')) {
        return
      }
      // scroll to top
      return { top: 0 }
    }
  }
})

export default router
