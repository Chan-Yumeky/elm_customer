import { createRouter, createWebHashHistory } from 'vue-router'
import {unauthorized} from "@/net";

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {path: '/', redirect: '/login'},
    {name: 'login', path: '/login', component: () => import('@/views/LoginPage.vue')},
    {name: 'register', path: '/register', component: () => import('@/views/RegisterPage.vue')},
    {name: 'reset', path: '/reset', component: () => import('@/views/ResetPage.vue')},
    {name: 'home', path: '/home', component: () => import('@/views/HomePage.vue')},
    {name: 'businessList', path: '/businessList', component: () => import('@/views/BusinessListPage.vue')},
    {name: 'businessInfo', path: '/businessInfo', component: () => import('@/views/BusinessInfoPage.vue')},
    {name: 'order', path: '/order', component: () => import('@/views/OrderPage.vue')},
    {name: 'mine', path: '/mine', component: () => import('@/views/MinePage.vue')},
    {name: 'payment', path: '/payment', component: () => import('@/views/PaymentPage.vue')},
    {name: 'orderList', path: '/orderList', component: () => import('@/views/OrderListPage.vue')},
  ],
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const isUnauthorized = unauthorized();
  // 如果目标页面是登录页，且用户已登录，重定向到首页
  if (to.name === 'login' && !isUnauthorized) {
    next('/home');
    return;
  }
  // 如果用户未登录且访问非登录、注册或重置页面以外的页面，则重定向到登录页
  if (isUnauthorized && typeof to.name === 'string' && !['login', 'register', 'reset'].includes(to.name)) {
    next('/login');
    return;
  }
  // 允许其他路由跳转
  next();
});

export default router
