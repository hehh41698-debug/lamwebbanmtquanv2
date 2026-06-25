<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div id="heroCarousel" class="carousel slide" data-bs-ride="carousel">
        <div class="carousel-indicators">
          <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="0" class="active"></button>
          <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="1"></button>
          <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="2"></button>
        </div>
        <div class="carousel-inner">
          <div class="carousel-item active">
            <div class="hero-slide" style="background: linear-gradient(135deg, #2563eb, #7c3aed);">
              <div class="container h-100">
                <div class="row h-100 align-items-center">
                  <div class="col-lg-6 text-white">
                    <h1 class="display-4 fw-bold animate__animated animate__fadeInUp">
                      Máy tính mới nhất
                    </h1>
                    <p class="lead animate__animated animate__fadeInUp animate__delay-1s">
                      Công nghệ tiên tiến với giá tốt nhất
                    </p>
                    <router-link to="/products" class="btn btn-light btn-lg animate__animated animate__fadeInUp animate__delay-2s">
                      <i class="bi bi-arrow-right"></i> Mua ngay
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="carousel-item">
            <div class="hero-slide" style="background: linear-gradient(135deg, #f59e0b, #ef4444);">
              <div class="container h-100">
                <div class="row h-100 align-items-center">
                  <div class="col-lg-6 text-white">
                    <h1 class="display-4 fw-bold">Giảm giá sốc</h1>
                    <p class="lead">Lên đến 50% cho các sản phẩm chọn lọc</p>
                    <router-link to="/products" class="btn btn-light btn-lg">
                      <i class="bi bi-arrow-right"></i> Xem ngay
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="carousel-item">
            <div class="hero-slide" style="background: linear-gradient(135deg, #10b981, #059669);">
              <div class="container h-100">
                <div class="row h-100 align-items-center">
                  <div class="col-lg-6 text-white">
                    <h1 class="display-4 fw-bold">Linh kiện chính hãng</h1>
                    <p class="lead">Chất lượng đảm bảo, bảo hành uy tín</p>
                    <router-link to="/products" class="btn btn-light btn-lg">
                      <i class="bi bi-arrow-right"></i> Khám phá
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button class="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
          <span class="carousel-control-prev-icon"></span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
          <span class="carousel-control-next-icon"></span>
        </button>
      </div>
    </section>

    <!-- Categories -->
    <section class="categories-section py-5">
      <div class="container">
        <h2 class="text-center mb-4">Danh mục nổi bật</h2>
        <div class="row g-4">
          <div class="col-6 col-md-3" v-for="category in categories" :key="category._id">
            <router-link :to="{ path: '/products', query: { category: category.slug } }" class="category-card">
              <div class="category-icon">
                <i :class="category.icon || 'bi bi-tag'"></i>
              </div>
              <h6 class="category-name">{{ category.name }}</h6>
              <span class="category-count">{{ category.productCount || 0 }} sản phẩm</span>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="products-section py-5 bg-light">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="mb-0">Sản phẩm nổi bật</h2>
          <router-link to="/products" class="btn btn-outline-primary">
            Xem tất cả <i class="bi bi-arrow-right"></i>
          </router-link>
        </div>
        <div class="row g-4">
          <div class="col-6 col-md-3" v-for="product in featuredProducts" :key="product._id">
            <ProductCard :product="product" />
          </div>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="stats-section py-5 text-white" style="background: linear-gradient(135deg, #1a202c, #2d3748);">
      <div class="container">
        <div class="row text-center g-4">
          <div class="col-6 col-md-3">
            <div class="stat-item">
              <div class="stat-number" data-count="10000">0</div>
              <div class="stat-label">Khách hàng</div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="stat-item">
              <div class="stat-number" data-count="500">0</div>
              <div class="stat-label">Sản phẩm</div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="stat-item">
              <div class="stat-number" data-count="2500">0</div>
              <div class="stat-label">Đơn hàng</div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="stat-item">
              <div class="stat-number" data-count="98">0</div>
              <div class="stat-label">Đánh giá tốt</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ProductCard from '../../components/user/ProductCard.vue';
import { useProductStore } from '../../store/product';
import { useCategoryStore } from '../../store/category';

const productStore = useProductStore();
const categoryStore = useCategoryStore();

const categories = ref([]);
const featuredProducts = ref([]);

const animateStats = () => {
  const stats = document.querySelectorAll('.stat-number');
  stats.forEach(stat => {
    const target = parseInt(stat.dataset.count);
    const duration = 2000;
    const step = Math.max(1, Math.floor(target / 60));
    let current = 0;
    
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      stat.textContent = current.toLocaleString();
    }, duration / 60);
  });
};

onMounted(async () => {
  // Load categories
  await categoryStore.fetchCategories();
  categories.value = categoryStore.categories.slice(0, 4);
  
  // Load featured products
  await productStore.fetchProducts({ isFeatured: true, limit: 8 });
  featuredProducts.value = productStore.products;
  
  // Animate stats
  setTimeout(animateStats, 500);
});
</script>

<style scoped>
.hero-section {
  margin-top: -56px;
}

.hero-slide {
  height: 500px;
  display: flex;
  align-items: center;
}

.carousel-item {
  height: 500px;
}

.carousel-control-prev,
.carousel-control-next {
  width: 50px;
}

.category-card {
  background: white;
  border-radius: 12px;
  padding: 2rem 1rem;
  text-align: center;
  text-decoration: none;
  color: #1a202c;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s;
  display: block;
  height: 100%;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  color: #2563eb;
}

.category-icon {
  font-size: 2.5rem;
  color: #2563eb;
  margin-bottom: 0.75rem;
}

.category-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.category-count {
  font-size: 0.875rem;
  color: #94a3b8;
}

.stat-item {
  padding: 1rem;
}

.stat-number {
  font-size: 3rem;
  font-weight: 700;
}

.stat-label {
  font-size: 1.1rem;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .hero-slide {
    height: 350px;
  }
  
  .stat-number {
    font-size: 2rem;
  }
}
</style>