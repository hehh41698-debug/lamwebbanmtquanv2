import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth'

// User routes
const HomePage = () => import('../views/user/HomePage.vue')
const ProductsPage = () => import('../views/user/ProductsPage.vue')
const ProductDetailPage = () => import('../views/user/ProductDetailPage.vue')
const CartPage = () => import('../views/user/CartPage.vue')
const CheckoutPage = () => import('../views/user/CheckoutPage.vue')
const LoginPage = () => import('../views/user/LoginPage.vue')
const RegisterPage = () => import('../views/user/RegisterPage.vue')
const UserDashboard = () => import('../views/user/UserDashboard.vue')

// Admin routes
const AdminDashboard = () => import('../views/admin/AdminDashboard.vue')
const AdminProducts = () => import('../views/admin/AdminProducts.vue')
const AdminOrders = () => import('../views/admin/AdminOrders.vue')
const AdminUsers = () => import('../views/admin/AdminUsers.vue')
const AdminCategories = () => import('../views/admin/AdminCategories.vue')
const AdminReviews = () => import('../views/admin/AdminReviews.vue')

const routes = [
  // Public routes
  { path: '/', name: 'Home', component: HomePage },
  { path: '/products', name: 'Products', component: ProductsPage },
  { path: '/product/:id', name: 'ProductDetail', component: ProductDetailPage },
  { path: '/login', name: 'Login', component: LoginPage },
  { path: '/register', name: 'Register', component: RegisterPage },
  
  // User routes
  { 
    path: '/cart', 
    name: 'Cart', 
    component: CartPage,
    meta: { requiresAuth: true }
  },
  { 
    path: '/checkout', 
    name: 'Checkout', 
    component: CheckoutPage,
    meta: { requiresAuth: true }
  },
  { 
    path: '/dashboard', 
    name: 'UserDashboard', 
    component: UserDashboard,
    meta: { requiresAuth: true }
  },
  
  // Admin routes
  {
    path: '/admin',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: '', name: 'AdminDashboard', component: AdminDashboard },
      { path: 'products', name: 'AdminProducts', component: AdminProducts },
      { path: 'orders', name: 'AdminOrders', component: AdminOrders },
      { path: 'users', name: 'AdminUsers', component: AdminUsers },
      { path: 'categories', name: 'AdminCategories', component: AdminCategories },
      { path: 'reviews', name: 'AdminReviews', component: AdminReviews }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (requiresAdmin && authStore.user?.role !== 'admin') {
    next('/')
  } else {
    next()
  }
})

export default router