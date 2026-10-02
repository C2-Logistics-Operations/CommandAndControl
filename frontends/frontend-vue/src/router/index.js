import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';
import { useAuth } from '../store/auth';

const routes = [
  { path: '/login', name: 'Login', component: Login },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const { isAuth } = useAuth();
  if (to.meta.requiresAuth && !isAuth.value) {
    next('/login');
  } else {
    next();
  }
});

export default router;