<template>
  <div class="home-page">
    <!-- Hero Section với Slider -->
    <section class="hero-section">
      <div id="heroCarousel" class="carousel slide" data-bs-ride="carousel">
        <div class="carousel-indicators">
          <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="0" class="active"></button>
          <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="1"></button>
          <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="2"></button>
        </div>
        
        <div class="carousel-inner">
          <!-- Slide 1 - Gaming Gear -->
          <div class="carousel-item active">
            <div class="hero-slide">
              <div class="hero-bg-image" style="background-image: url('/images/627350.jpg?url');"></div>
              <div class="hero-overlay"></div>
              <div class="container h-100">
                <div class="row h-100 align-items-center">
                  <div class="col-lg-6 text-white hero-content">
                    <div class="hero-text">
                      <div class="hero-badge">
                        <span class="badge bg-danger">🔥 Hot Deal</span>
                        <span class="badge bg-warning text-dark ms-2">-50%</span>
                      </div>
                      <h1 class="display-3 fw-bold mb-3 animate__animated animate__fadeInUp">
                        Gaming Gear <br>Chính Hãng
                      </h1>
                      <p class="lead mb-4 animate__animated animate__fadeInUp animate__delay-1s">
                        Trang bị tối tân cho game thủ với giá tốt nhất
                      </p>
                      <router-link to="/products" class="btn btn-light btn-lg animate__animated animate__fadeInUp animate__delay-2s">
                        <i class="bi bi-arrow-right"></i> Mua ngay
                      </router-link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Slide 2 - Laptop Gaming -->
          <div class="carousel-item">
            <div class="hero-slide">
              <div class="hero-bg-image" style="background-image: url('/images/F_20241231200382UZaEev.JPG?url');"></div>
              <div class="hero-overlay"></div>
              <div class="container h-100">
                <div class="row h-100 align-items-center">
                  <div class="col-lg-6 text-white hero-content">
                    <div class="hero-text">
                      <div class="hero-badge">
                        <span class="badge bg-warning text-dark">🎮 Mới</span>
                        <span class="badge bg-success ms-2">Có sẵn</span>
                      </div>
                      <h1 class="display-3 fw-bold mb-3">
                        Laptop Gaming <br>Mạnh Mẽ
                      </h1>
                      <p class="lead mb-4">Hiệu năng đỉnh cao, thiết kế đột phá</p>
                      <router-link to="/products" class="btn btn-light btn-lg">
                        <i class="bi bi-arrow-right"></i> Khám phá
                      </router-link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Slide 3 - PC Gaming -->
          <div class="carousel-item">
            <div class="hero-slide">
              <div class="hero-bg-image" style="background-image: url('/images/04559c43-7fab-4e4c-844f-d9158679c426.png?url');"></div>
              <div class="hero-overlay"></div>
              <div class="container h-100">
                <div class="row h-100 align-items-center">
                  <div class="col-lg-6 text-white hero-content">
                    <div class="hero-text">
                      <div class="hero-badge">
                        <span class="badge bg-danger">⚡ Flash Sale</span>
                        <span class="badge bg-warning text-dark ms-2">Giảm sốc</span>
                      </div>
                      <h1 class="display-3 fw-bold mb-3">
                        PC Gaming <br>Cấu Hình Cao
                      </h1>
                      <p class="lead mb-4">Hiệu năng đỉnh cao, trải nghiệm mượt mà</p>
                      <router-link to="/products" class="btn btn-light btn-lg">
                        <i class="bi bi-arrow-right"></i> Xem ngay
                      </router-link>
                    </div>
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

    <!-- Brand Logos -->
    <section class="brands-section py-4 bg-white border-bottom">
      <div class="container">
        <div class="row g-3 text-center">
          <div class="col-4 col-md-2">
            <div class="brand-logo">
              <i class="bi bi-apple display-6 text-secondary"></i>
              <span>Apple</span>
            </div>
          </div>
          <div class="col-4 col-md-2">
            <div class="brand-logo">
              <i class="bi bi-laptop display-6 text-primary"></i>
              <span>Dell</span>
            </div>
          </div>
          <div class="col-4 col-md-2">
            <div class="brand-logo">
              <i class="bi bi-cpu display-6 text-success"></i>
              <span>AMD</span>
            </div>
          </div>
          <div class="col-4 col-md-2 d-none d-md-block">
            <div class="brand-logo">
              <i class="bi bi-controller display-6 text-warning"></i>
              <span>ASUS</span>
            </div>
          </div>
          <div class="col-4 col-md-2 d-none d-md-block">
            <div class="brand-logo">
              <i class="bi bi-display display-6 text-danger"></i>
              <span>MSI</span>
            </div>
          </div>
          <div class="col-4 col-md-2 d-none d-md-block">
            <div class="brand-logo">
              <i class="bi bi-hdd-stack display-6 text-info"></i>
              <span>Seagate</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section class="categories-section py-5">
      <div class="container">
        <div class="section-header text-center mb-4">
          <h2 class="fw-bold">Danh mục nổi bật</h2>
          <p class="text-muted">Khám phá các danh mục sản phẩm đa dạng</p>
        </div>
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
        <div class="section-header text-center mb-4">
          <h2 class="fw-bold">Sản phẩm nổi bật</h2>
          <p class="text-muted">Những sản phẩm được yêu thích nhất</p>
        </div>

        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary"></div>
        </div>

        <div v-else-if="featuredProducts.length > 0" class="row g-4">
          <div class="col-6 col-md-3" v-for="product in featuredProducts" :key="product._id">
            <ProductCard :product="product" />
          </div>
        </div>

        <div v-else class="text-center py-5">
          <i class="bi bi-inbox display-1 text-muted"></i>
          <p class="mt-3">Chưa có sản phẩm nổi bật</p>
        </div>

        <div class="text-center mt-4">
          <router-link to="/products" class="btn btn-outline-primary">
            Xem tất cả <i class="bi bi-arrow-right"></i>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="features-section py-5 bg-white">
      <div class="container">
        <div class="row g-4">
          <div class="col-6 col-md-3">
            <div class="feature-card">
              <i class="bi bi-truck display-5 text-primary"></i>
              <h6>Giao hàng nhanh</h6>
              <p class="small text-muted">Nhận hàng trong 24h</p>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="feature-card">
              <i class="bi bi-shield-check display-5 text-success"></i>
              <h6>Bảo hành uy tín</h6>
              <p class="small text-muted">12-24 tháng</p>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="feature-card">
              <i class="bi bi-currency-dollar display-5 text-warning"></i>
              <h6>Giá tốt nhất</h6>
              <p class="small text-muted">Cam kết giá rẻ</p>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="feature-card">
              <i class="bi bi-headset display-5 text-danger"></i>
              <h6>Hỗ trợ 24/7</h6>
              <p class="small text-muted">Tư vấn tận tâm</p>
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
const loading = ref(false);

const fetchCategories = async () => {
  await categoryStore.fetchCategories();
  categories.value = categoryStore.categories.slice(0, 4);
};

const fetchFeaturedProducts = async () => {
  loading.value = true;
  try {
    const result = await productStore.fetchProducts({ isFeatured: true, limit: 8 });
    if (result.success) {
      featuredProducts.value = result.data.products || [];
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCategories();
  fetchFeaturedProducts();
});
</script>

<style scoped>
.home-page {
  background: #f8fafc;
}

/* Hero Section */
.hero-section {
  margin-top: -56px;
}

.hero-slide {
  height: 600px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.hero-bg-image {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transform: scale(1.05);
  transition: transform 6s ease;
}

.hero-slide:hover .hero-bg-image {
  transform: scale(1);
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.5) 40%,
    rgba(0, 0, 0, 0.2) 70%,
    rgba(0, 0, 0, 0) 100%
  );
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  padding: 2rem 0;
}

.hero-text {
  max-width: 600px;
}

.hero-badge {
  margin-bottom: 1rem;
}

.hero-badge .badge {
  padding: 8px 18px;
  font-size: 0.9rem;
  border-radius: 20px;
  font-weight: 600;
}

/* Brands */
.brand-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  transition: all 0.3s;
  cursor: pointer;
  border-radius: 12px;
}

.brand-logo:hover {
  background: #f8fafc;
  transform: translateY(-3px);
}

.brand-logo i {
  font-size: 2rem;
  margin-bottom: 0.25rem;
}

.brand-logo span {
  font-size: 0.8rem;
  font-weight: 500;
  color: #4a5568;
}

/* Categories */
.section-header h2 {
  font-weight: 700;
  color: #1a202c;
}

.category-card {
  background: white;
  border-radius: 16px;
  padding: 2rem 1rem;
  text-align: center;
  text-decoration: none;
  color: #1a202c;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: all 0.3s;
  display: block;
  height: 100%;
}

.category-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.1);
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

/* Features */
.feature-card {
  text-align: center;
  padding: 1.5rem;
  border-radius: 16px;
  transition: all 0.3s;
}

.feature-card:hover {
  background: #f8fafc;
  transform: translateY(-3px);
}

.feature-card i {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
}

.feature-card h6 {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

/* Carousel Controls */
.carousel-control-prev,
.carousel-control-next {
  width: 50px;
  height: 50px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  margin: 0 20px;
  opacity: 1;
  backdrop-filter: blur(4px);
  z-index: 10;
}

.carousel-control-prev:hover,
.carousel-control-next:hover {
  background: rgba(0, 0, 0, 0.5);
}

.carousel-control-prev-icon,
.carousel-control-next-icon {
  width: 20px;
  height: 20px;
}

.carousel-indicators {
  z-index: 10;
}

.carousel-indicators button {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
  background: transparent;
  margin: 0 6px;
}

.carousel-indicators button.active {
  background: white;
}

/* Responsive */
@media (max-width: 992px) {
  .hero-slide {
    height: 500px;
  }
  .hero-text {
    max-width: 100%;
  }
  .hero-overlay {
    background: linear-gradient(
      135deg,
      rgba(0, 0, 0, 0.8) 0%,
      rgba(0, 0, 0, 0.5) 60%,
      rgba(0, 0, 0, 0.3) 100%
    );
  }
}

@media (max-width: 768px) {
  .hero-slide {
    height: 450px;
  }
  .hero-slide h1 {
    font-size: 2rem;
  }
  .hero-slide .lead {
    font-size: 1rem;
  }
  .hero-content {
    padding: 1rem;
  }
  .hero-badge .badge {
    padding: 4px 12px;
    font-size: 0.75rem;
  }
  .carousel-control-prev,
  .carousel-control-next {
    width: 35px;
    height: 35px;
    margin: 0 10px;
  }
  .feature-card {
    padding: 1rem;
  }
  .feature-card i {
    font-size: 2rem;
  }
}

@media (max-width: 576px) {
  .hero-slide {
    height: 350px;
  }
  .hero-slide h1 {
    font-size: 1.5rem;
  }
  .hero-slide .lead {
    font-size: 0.85rem;
  }
  .category-card {
    padding: 1.5rem 0.5rem;
  }
  .category-icon {
    font-size: 2rem;
  }
}
</style>