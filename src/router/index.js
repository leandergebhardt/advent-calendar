import Vue from 'vue'
import VueRouter from 'vue-router'
import Calendar from '../views/Calendar.vue'
import Login from '@/components/Login.vue'
import * as Cookies from 'tiny-cookie'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Calendar',
    component: Calendar
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  }
]

for (let i = 1; i <= 24; i++) {
  const day = i.toString().padStart(2, '0')
  routes.push({
    path: '/day/' + i,
    component: () => import(`../components/days/Day${day}.vue`)
  })
}

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path.includes('/day/') === false) {
    next()
    return;
  }

  // protect every route which does not include /day/
  var allowedToPass = Cookies.getCookie('REMEMBERME')

  if (allowedToPass) {
    next()
  } else {
    next('/login')
  }
})

export default router
