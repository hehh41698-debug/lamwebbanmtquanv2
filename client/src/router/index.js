import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth'

// ============================================
// USER ROUTES (Public)
// ============================================
const HomePage = () => import('../views/user/HomePage.vue')
const ProductsPage = () => import('../views/user/ProductsPage.vue')
const ProductDetailPage = () => import('../views/user/ProductDetailPage.vue')
const LoginPage = () => import('../views/user/LoginPage.vue')
const RegisterPage = () => import('../views/user/RegisterPage.vue')

// ============================================
// USER ROUTES (Requires Auth)
// ============================================
const CartPage = () => import('../views/user/CartPage.vue')
const CheckoutPage = () => import('../views/user/CheckoutPage.vue')
const UserDashboard = () => import('../views/user/UserDashboard.vue')
const UserOrders = () => import('../views/user/UserOrders.vue')
const UserOrderDetail = () => import('../views/user/UserOrderDetail.vue')
const UserProfile = () => import('../views/user/UserProfile.vue')
const UserChangePassword = () => import('../views/user/UserChangePassword.vue')
const UserReviews = () => import('../views/user/UserReviews.vue')
const UserWishlist = () => import('../views/user/UserWishlist.vue')

// ============================================
// ADMIN ROUTES
// ============================================
const AdminLayout = () => import('../views/admin/AdminLayout.vue')
const AdminDashboard = () => import('../views/admin/AdminDashboard.vue')
const AdminProducts = () => import('../views/admin/AdminProducts.vue')
const AdminOrders = () => import('../views/admin/AdminOrders.vue')
const AdminUsers = () => import('../views/admin/AdminUsers.vue')
const AdminCategories = () => import('../views/admin/AdminCategories.vue')
const AdminReviews = () => import('../views/admin/AdminReviews.vue')

// ============================================
// 404 NOT FOUND
// ============================================
const NotFound = () => import('../views/NotFound.vue')

const routes = [
  // ============================================
  // PUBLIC ROUTES
  // ============================================
  { path: '/', name: 'Home', component: HomePage },
  { path: '/products', name: 'Products', component: ProductsPage },
  { path: '/product/:id', name: 'ProductDetail', component: ProductDetailPage },
  { path: '/login', name: 'Login', component: LoginPage },
  { path: '/register', name: 'Register', component: RegisterPage },
  
  // ============================================
  // USER ROUTES (Requires Authentication)
  // ============================================
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
  
  // ============================================
  // USER DASHBOARD (Requires Authentication)
  // ============================================
  {
    path: '/dashboard',
    component: UserDashboard,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'UserDashboard', component: UserDashboard },
      { path: 'orders', name: 'UserOrders', component: UserOrders },
      { path: 'orders/:id', name: 'UserOrderDetail', component: UserOrderDetail },
      { path: 'profile', name: 'UserProfile', component: UserProfile },
      { path: 'change-password', name: 'UserChangePassword', component: UserChangePassword },
      { path: 'reviews', name: 'UserReviews', component: UserReviews },
      { path: 'wishlist', name: 'UserWishlist', component: UserWishlist }
    ]
  },
  
  // ============================================
  // ADMIN ROUTES (Requires Authentication + Admin Role)
  // ============================================
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: '', name: 'AdminDashboard', component: AdminDashboard },
      { path: 'products', name: 'AdminProducts', component: AdminProducts },
      { path: 'orders', name: 'AdminOrders', component: AdminOrders },
      { path: 'users', name: 'AdminUsers', component: AdminUsers },
      { path: 'categories', name: 'AdminCategories', component: AdminCategories },
      { path: 'reviews', name: 'AdminReviews', component: AdminReviews }
    ]
  },
  
  // ============================================
  // 404 NOT FOUND
  // ============================================
  { 
    path: '/:pathMatch(.*)*', 
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// ============================================
// NAVIGATION GUARD
// ============================================
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Kiểm tra token và lấy user info nếu có
  if (authStore.token && !authStore.isAuthenticated) {
    await authStore.getCurrentUser()
  }
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)

  // Nếu cần đăng nhập mà chưa đăng nhập
  if (requiresAuth && !authStore.isAuthenticated) {
    next({ 
      path: '/login', 
      query: { redirect: to.fullPath } 
    })
  } 
  // Nếu cần admin mà không phải admin
  else if (requiresAdmin && authStore.user?.role !== 'admin') {
    next('/')
  } 
  // Nếu đã đăng nhập mà vào trang login/register -> chuyển về trang chủ
  else if ((to.path === '/login' || to.path === '/register') && authStore.isAuthenticated) {
    next('/')
  }
  else {
    next()
  }
})

export default router