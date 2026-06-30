import { defineStore } from 'pinia';
import api from '../api/auth';
import { watch } from 'vue';

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    product: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0
    },
    // Thêm filters state để theo dõi
    filters: {
      category: '',
      minPrice: '',
      maxPrice: '',
      brand: '',
      minRating: '',
      sort: 'newest',
      order: 'desc'
    }
  }),

  getters: {
    featuredProducts: (state) => state.products.filter(p => p.isFeatured),
    productsByCategory: (state) => (categoryId) => {
      return state.products.filter(p => p.category === categoryId);
    },
    // Getter cho số lượng sản phẩm
    totalProducts: (state) => state.pagination.total,
    // Getter cho trang hiện tại
    currentPage: (state) => state.pagination.page,
    // Getter cho tổng số trang
    totalPages: (state) => state.pagination.totalPages,
    // Kiểm tra có sản phẩm không
    hasProducts: (state) => state.products.length > 0,
    // Lấy sản phẩm theo ID
    getProductById: (state) => (id) => {
      return state.products.find(p => p._id === id);
    },
    // Lọc sản phẩm theo giá
    productsInPriceRange: (state) => (min, max) => {
      return state.products.filter(p => p.price >= min && p.price <= max);
    },
    // Lấy các thương hiệu có sẵn
    availableBrands: (state) => {
      const brands = new Set();
      state.products.forEach(p => {
        if (p.brand) brands.add(p.brand);
      });
      return Array.from(brands).sort();
    }
  },

  actions: {
    // ============================================
    // KHỞI TẠO WATCHERS - GỌI KHI STORE ĐƯỢC TẠO
    // ============================================
    initWatchers() {
      console.log('🔍 Initializing Product Store watchers...');

      // 1. Theo dõi products - CHẠY NGAY LẬP TỨC
      const stopProductsWatch = watch(
        () => this.products,
        (newProducts, oldProducts) => {
          console.log(`📦 Products updated: ${newProducts?.length || 0} products`);
          if (newProducts?.length > 0) {
            console.log('✅ First product:', newProducts[0]?.name);
          }
          // Lưu vào localStorage để debug
          localStorage.setItem('lastProductsCount', String(newProducts?.length || 0));
        },
        { immediate: true, deep: true }
      );

      // 2. Theo dõi loading - CHẠY NGAY LẬP TỨC
      const stopLoadingWatch = watch(
        () => this.loading,
        (loading) => {
          console.log(`🔄 Loading state: ${loading ? 'Loading...' : 'Done'}`);
        },
        { immediate: true }
      );

      // 3. Theo dõi error - CHẠY NGAY LẬP TỨC
      const stopErrorWatch = watch(
        () => this.error,
        (error) => {
          if (error) {
            console.error('❌ Product Store Error:', error);
          }
        },
        { immediate: true }
      );

      // 4. Theo dõi pagination - CHẠY NGAY LẬP TỨC
      const stopPaginationWatch = watch(
        () => this.pagination,
        (newPagination) => {
          console.log(`📄 Pagination: Page ${newPagination.page}/${newPagination.totalPages}, Total: ${newPagination.total}`);
        },
        { immediate: true, deep: true }
      );

      // 5. Theo dõi filters - CHẠY NGAY LẬP TỨC
      const stopFiltersWatch = watch(
        () => this.filters,
        (newFilters) => {
          console.log('🔍 Active filters:', newFilters);
        },
        { immediate: true, deep: true }
      );

      // 6. Theo dõi product (chi tiết) - CHẠY NGAY LẬP TỨC
      const stopProductWatch = watch(
        () => this.product,
        (product) => {
          if (product) {
            console.log('📦 Product detail loaded:', product.name);
          }
        },
        { immediate: true, deep: true }
      );

      // Lưu các hàm stop để cleanup nếu cần
      this._stopWatchers = [
        stopProductsWatch,
        stopLoadingWatch,
        stopErrorWatch,
        stopPaginationWatch,
        stopFiltersWatch,
        stopProductWatch
      ];
    },

    // ============================================
    // DỌN DẸP WATCHERS
    // ============================================
    cleanupWatchers() {
      if (this._stopWatchers) {
        this._stopWatchers.forEach(stop => stop());
        this._stopWatchers = [];
        console.log('🧹 Product Store watchers cleaned up');
      }
    },

    // ============================================
    // LẤY DANH SÁCH SẢN PHẨM VỚI BỘ LỌC
    // ============================================
    async fetchProducts(params = {}) {
      this.loading = true;
      this.error = null;

      try {
        console.log('🔄 Fetching products with params:', params);

        // Cập nhật filters
        if (params.category !== undefined) this.filters.category = params.category;
        if (params.minPrice !== undefined) this.filters.minPrice = params.minPrice;
        if (params.maxPrice !== undefined) this.filters.maxPrice = params.maxPrice;
        if (params.brand !== undefined) this.filters.brand = params.brand;
        if (params.minRating !== undefined) this.filters.minRating = params.minRating;
        if (params.sort !== undefined) this.filters.sort = params.sort;
        if (params.order !== undefined) this.filters.order = params.order;

        // Xây dựng query string
        const queryParams = new URLSearchParams();
        
        // Thêm các tham số lọc
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            queryParams.append(key, params[key]);
          }
        });

        // Đảm bảo có page và limit
        if (!params.page) {
          queryParams.append('page', this.pagination.page);
        }
        if (!params.limit) {
          queryParams.append('limit', this.pagination.limit);
        }

        const url = `/products?${queryParams.toString()}`;
        console.log('📡 API URL:', url);

        const response = await api.get(url);
        console.log('📦 API Response:', response.data);

        // Cập nhật state
        this.products = response.data.products || [];
        this.pagination = {
          page: response.data.page || 1,
          limit: response.data.limit || 12,
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 1
        };

        console.log(`✅ Loaded ${this.products.length} products`);
        return { success: true, data: response.data };
      } catch (error) {
        console.error('❌ Fetch products error:', error);
        this.error = error.response?.data?.message || 'Không thể tải danh sách sản phẩm';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // ============================================
    // LỌC THEO GIÁ
    // ============================================
    async filterByPrice(minPrice, maxPrice) {
      const params = {
        minPrice: minPrice || '',
        maxPrice: maxPrice || '',
        page: 1
      };
      return await this.fetchProducts(params);
    },

    // ============================================
    // LỌC THEO THƯƠNG HIỆU
    // ============================================
    async filterByBrand(brands) {
      const params = {
        brand: brands.join(','),
        page: 1
      };
      return await this.fetchProducts(params);
    },

    // ============================================
    // LỌC THEO ĐÁNH GIÁ
    // ============================================
    async filterByRating(minRating) {
      const params = {
        minRating: minRating,
        page: 1
      };
      return await this.fetchProducts(params);
    },

    // ============================================
    // SẮP XẾP SẢN PHẨM
    // ============================================
    async sortProducts(sortBy, order = 'desc') {
      const params = {
        sort: sortBy,
        order: order,
        page: 1
      };
      return await this.fetchProducts(params);
    },

    // ============================================
    // ĐỔI TRANG
    // ============================================
    async goToPage(page) {
      if (page < 1 || page > this.pagination.totalPages) {
        return { success: false, error: 'Trang không hợp lệ' };
      }
      this.pagination.page = page;
      return await this.fetchProducts();
    },

    // ============================================
    // ĐỔI SỐ LƯỢNG SẢN PHẨM MỖI TRANG
    // ============================================
    async setLimit(limit) {
      this.pagination.limit = limit;
      this.pagination.page = 1;
      return await this.fetchProducts();
    },

    // ============================================
    // RESET BỘ LỌC
    // ============================================
    async resetFilters() {
      this.pagination.page = 1;
      this.filters = {
        category: '',
        minPrice: '',
        maxPrice: '',
        brand: '',
        minRating: '',
        sort: 'newest',
        order: 'desc'
      };
      return await this.fetchProducts({ page: 1 });
    },

    // ============================================
    // LẤY CHI TIẾT SẢN PHẨM
    // ============================================
    async fetchProductById(id) {
      this.loading = true;
      this.error = null;

      try {
        console.log('🔄 Fetching product:', id);
        const response = await api.get(`/products/${id}`);
        this.product = response.data.product;
        return { success: true, data: response.data };
      } catch (error) {
        console.error('❌ Fetch product error:', error);
        this.error = error.response?.data?.message || 'Không thể tải thông tin sản phẩm';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // ============================================
    // LẤY SẢN PHẨM THEO DANH MỤC
    // ============================================
    async fetchProductsByCategory(categoryId) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get(`/products/category/${categoryId}`);
        this.products = response.data.products || [];
        return { success: true, data: response.data };
      } catch (error) {
        console.error('❌ Fetch products by category error:', error);
        this.error = error.response?.data?.message || 'Không thể tải sản phẩm theo danh mục';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // ============================================
    // LẤY SẢN PHẨM NỔI BẬT
    // ============================================
    async fetchFeaturedProducts(limit = 8) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get(`/products/featured?limit=${limit}`);
        return { success: true, data: response.data };
      } catch (error) {
        console.error('❌ Fetch featured products error:', error);
        this.error = error.response?.data?.message || 'Không thể tải sản phẩm nổi bật';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // ============================================
    // TÌM KIẾM SẢN PHẨM
    // ============================================
    async searchProducts(keyword) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get(`/products/search?q=${encodeURIComponent(keyword)}`);
        this.products = response.data.products || [];
        return { success: true, data: response.data };
      } catch (error) {
        console.error('❌ Search products error:', error);
        this.error = error.response?.data?.message || 'Không thể tìm kiếm sản phẩm';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // ============================================
    // RESET STATE
    // ============================================
    reset() {
      this.products = [];
      this.product = null;
      this.loading = false;
      this.error = null;
      this.pagination = {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0
      };
      this.filters = {
        category: '',
        minPrice: '',
        maxPrice: '',
        brand: '',
        minRating: '',
        sort: 'newest',
        order: 'desc'
      };
      
      // Cleanup watchers nếu có
      this.cleanupWatchers();
    }
  }
});