import { createRouter, createWebHistory } from 'vue-router'
import Explore from '../views/Explore.vue'
import Landing from '../views/Landing.vue'

const routes = [
  {
    path: '/',
    name: 'landing',
    redirect: { name: 'explore' }
  },
  {
    path: '/explore',
    name: 'explore',
    component: Explore
  },
  {
    path: '/create',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "create" */ '../views/Create.vue'),
    children: [
      {
        path: '',
        name: 'create',
        component: () => import(/* webpackChunkName: "create" */ '../views/CreateIndex.vue')
      },
      {
        path: 'drips',
        name: 'create-drips',
        component: () => import(/* webpackChunkName: "create-drips" */ '../views/CreateDrips.vue')
      },
      {
        path: 'splits',
        name: 'create-splits',
        component: () => import(/* webpackChunkName: "create-drips" */ '../views/CreateSplits.vue')
      },
      {
        path: 'community',
        name: 'create-community',
        component: () => import(/* webpackChunkName: "create-community" */ '../views/CreateCommunity.vue')
      }
    ]
  },
  {
    path: '/communities/:address',
    name: 'project', // TODO rename
    component: () => import(/* webpackChunkName: "project" */ '../views/Project.vue')
  },

  // user / address
  {
    path: '/:address',
    name: 'user',
    component: () => import(/* webpackChunkName: "user" */ '../views/User2.vue'),
    children: [
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
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior (to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    } else if (savedPosition) {
      return savedPosition
    } else {
      // don't scroll to top on user tab changes...
      if (to.params.address && to.params.address === from.params.address) {
        return
      }
      // scroll to top
      return { top: 0 }
    }
  }
})

export default router
