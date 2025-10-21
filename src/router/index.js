import { createRouter, createWebHistory } from 'vue-router'
import LoginUser from '../views/LoginUser.vue'
import RegisterUser from '@/views/RegisterUser.vue'

const routes = [
  { path: '/login', component: LoginUser },
  { path: '/register', component: RegisterUser}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
  